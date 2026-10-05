#!/usr/bin/env python3

import argparse
import json
import re
import subprocess
import sys
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit


TRUSTED_ASSOCIATIONS = {"OWNER", "MEMBER", "COLLABORATOR"}
TITLE_PATTERN = re.compile(r"^\[([^\[\]\r\n]+)\] -> \[([^\[\]\r\n]+)\]$")
ENTRY_PATTERN = re.compile(
    r"^\|\s*\[([^\]]+)\]\((https?://[^)]+)\)\s*\|\s*(\S.*?)\s*\|\s*$",
    re.IGNORECASE,
)
LINK_PATTERN = re.compile(r"^Link:\s*(https://\S+)\s*$", re.MULTILINE)
OWNERSHIP_PATTERN = re.compile(
    r"^Is this your product\?\s*(Yes|No)(?!\s*/)(?:\s+\S.*?)?\s*$",
    re.IGNORECASE | re.MULTILINE,
)
HEADING_PATTERN = re.compile(r"^##\s+(.+?)\s*$")


class ValidationError(Exception):
    pass


@dataclass(frozen=True)
class Entry:
    line: str
    line_index: int
    name: str
    url: str
    section: str


def run_git(*args: str) -> str:
    result = subprocess.run(
        ["git", *args],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise ValidationError(result.stderr.strip() or "Git command failed.")
    return result.stdout


def read_at_ref(ref: str, path: str) -> str:
    return run_git("show", f"{ref}:{path}")


def normalize_text(value: str) -> str:
    return " ".join(value.casefold().split())


def normalize_url(value: str) -> str:
    parsed = urlsplit(value.strip())
    host = (parsed.hostname or "").casefold()
    if host.startswith("www."):
        host = host[4:]
    port = f":{parsed.port}" if parsed.port else ""
    path = parsed.path.rstrip("/")
    return f"{host}{port}{path}".casefold()


def parse_entries(content: str) -> list[Entry]:
    entries = []
    section = ""
    for line_index, line in enumerate(content.splitlines()):
        heading = HEADING_PATTERN.match(line)
        if heading:
            section = heading.group(1).strip()
            continue

        match = ENTRY_PATTERN.match(line)
        if match:
            entries.append(
                Entry(
                    line=line,
                    line_index=line_index,
                    name=match.group(1).strip(),
                    url=match.group(2).strip(),
                    section=section,
                )
            )
    return entries


def sponsor_block(content: str) -> str:
    marker = "\n<hr>"
    marker_index = content.find(marker)
    if marker_index == -1:
        raise ValidationError("The README is missing the sponsor block boundary.")
    return content[: marker_index + len(marker)]


def remove_once(lines: list[str], target: str) -> list[str]:
    remaining = list(lines)
    try:
        remaining.remove(target)
    except ValueError as error:
        raise ValidationError("Could not isolate the resource change.") from error
    return remaining


def checked_items(body: str) -> list[str]:
    return [
        normalize_text(match.group(1))
        for match in re.finditer(r"^-\s*\[[xX]\]\s*(.+?)\s*$", body, re.MULTILINE)
    ]


def require_confirmations(body: str) -> None:
    items = checked_items(body)
    required_phrases = (
        "one resource",
        "genuinely free",
        "searched the readme",
        "warp sponsor",
    )
    missing = [phrase for phrase in required_phrases if not any(phrase in item for item in items)]
    if missing:
        raise ValidationError(
            "Complete every pull request checklist item. Missing confirmations: "
            + ", ".join(missing)
            + "."
        )


def entry_changes(base_content: str, candidate_content: str) -> tuple[Entry | None, Entry]:
    base_entries = parse_entries(base_content)
    candidate_entries = parse_entries(candidate_content)
    base_lines = Counter(entry.line for entry in base_entries)
    candidate_lines = Counter(entry.line for entry in candidate_entries)

    added_lines = list((candidate_lines - base_lines).elements())
    removed_lines = list((base_lines - candidate_lines).elements())

    if len(added_lines) != 1 or len(removed_lines) > 1:
        raise ValidationError("A contribution must add or correct exactly one resource entry.")

    added = next(entry for entry in candidate_entries if entry.line == added_lines[0])
    removed = None
    if removed_lines:
        removed = next(entry for entry in base_entries if entry.line == removed_lines[0])
        same_name = normalize_text(removed.name) == normalize_text(added.name)
        same_url = normalize_url(removed.url) == normalize_url(added.url)
        if not same_name and not same_url:
            raise ValidationError("A correction must retain either the resource name or its URL.")

    base_all_lines = base_content.splitlines()
    candidate_all_lines = candidate_content.splitlines()
    if removed:
        base_all_lines = remove_once(base_all_lines, removed.line)
    candidate_all_lines = remove_once(candidate_all_lines, added.line)
    if base_all_lines != candidate_all_lines:
        raise ValidationError("Only the single resource entry may change.")

    return removed, added


def validate_resource(
    base_content: str,
    candidate_content: str,
    title: str,
    body: str,
) -> None:
    title_match = TITLE_PATTERN.match(title.strip())
    if not title_match:
        raise ValidationError("Use the pull request title format [Resource name] -> [Section name].")

    removed, added = entry_changes(base_content, candidate_content)
    if normalize_text(title_match.group(1)) != normalize_text(added.name):
        raise ValidationError("The resource name in the pull request title must match the README entry.")
    if normalize_text(title_match.group(2)) != normalize_text(added.section):
        raise ValidationError("The section in the pull request title must match the README section.")

    link_match = LINK_PATTERN.search(body)
    if not link_match:
        raise ValidationError("Add a direct HTTPS URL using the format Link: https://example.com/.")
    if normalize_url(link_match.group(1)) != normalize_url(added.url):
        raise ValidationError("The Link URL in the pull request must match the README entry.")

    if not OWNERSHIP_PATTERN.search(body):
        raise ValidationError("Answer Is this your product? with Yes or No.")

    require_confirmations(body)

    excluded_line = removed.line if removed else None
    for existing in parse_entries(base_content):
        if excluded_line and existing.line == excluded_line:
            continue
        if normalize_text(existing.name) == normalize_text(added.name):
            raise ValidationError(f"The resource name is already listed: {existing.name}.")
        if normalize_url(existing.url) == normalize_url(added.url):
            raise ValidationError(f"The resource URL is already listed: {existing.url}.")


def validate(base_ref: str, head_ref: str, event_path: Path) -> None:
    event = json.loads(event_path.read_text(encoding="utf-8"))
    pull_request = event["pull_request"]
    association = pull_request.get("author_association", "NONE")
    title = pull_request.get("title", "")
    body = pull_request.get("body") or ""

    changed_files = [
        path for path in run_git("diff", "--name-only", base_ref, head_ref).splitlines() if path
    ]
    if not changed_files:
        raise ValidationError("The pull request does not contain any changed files.")

    base_readme = read_at_ref(base_ref, "readme.md")
    candidate_readme = read_at_ref(head_ref, "readme.md")
    if sponsor_block(base_readme) != sponsor_block(candidate_readme):
        raise ValidationError("The repository banner and Warp sponsor section must remain unchanged.")
    if "headerimage.png" in changed_files:
        raise ValidationError("The repository banner image must remain unchanged.")

    if changed_files != ["readme.md"]:
        if association in TRUSTED_ASSOCIATIONS:
            print("Trusted maintainer repository maintenance detected.")
            return
        raise ValidationError("Resource contributions may change only readme.md.")

    base_entry_lines = Counter(entry.line for entry in parse_entries(base_readme))
    candidate_entry_lines = Counter(entry.line for entry in parse_entries(candidate_readme))
    if association in TRUSTED_ASSOCIATIONS and base_entry_lines == candidate_entry_lines:
        print("Trusted maintainer README maintenance detected.")
        return

    validate_resource(base_readme, candidate_readme, title, body)

    print("Contribution follows the repository's mechanical submission rules.")
    print("A maintainer must still verify that the resource is genuinely free and appropriate.")


def validate_merge(merge_ref: str, expected_head: str, event_path: Path) -> None:
    commit_and_parents = run_git("rev-list", "--parents", "-n", "1", merge_ref).split()
    if len(commit_and_parents) != 3:
        raise ValidationError("The proposed merge ref is not a two-parent merge commit.")

    _, base_ref, actual_head = commit_and_parents
    if actual_head != expected_head:
        raise ValidationError("The proposed merge ref does not match the pull request head commit.")

    validate(base_ref, merge_ref, event_path)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--merge", required=True)
    parser.add_argument("--expected-head", required=True)
    parser.add_argument("--event", type=Path, required=True)
    args = parser.parse_args()

    try:
        validate_merge(args.merge, args.expected_head, args.event)
    except (ValidationError, KeyError, json.JSONDecodeError) as error:
        print(f"Contribution validation failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
