import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch


MODULE_PATH = Path(__file__).with_name("validate_contribution.py")
SPEC = importlib.util.spec_from_file_location("validate_contribution", MODULE_PATH)
VALIDATOR = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = VALIDATOR
SPEC.loader.exec_module(VALIDATOR)


BASE = """![Repository Banner](headerimage.png)

<div>
Warp sponsor
</div>
<hr>

## Icons

| Website | Description |
| --- | --- |
| [Existing](https://example.com/) | Existing resource |
"""


BODY = """Link: https://new.example.com/

Is this your product? No

- [x] I am adding or correcting only one resource.
- [x] I confirm this resource is genuinely free to use and is not only a trial.
- [x] I searched the README by name and URL and did not find this resource already listed.
- [x] I did not modify the repository banner or Warp sponsor section.
"""


class ContributionValidationTests(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.temporary_directory.cleanup()

    def event_path(self, association="NONE", title="[New Resource] -> [Icons]", body=BODY):
        path = Path(self.temporary_directory.name) / "event.json"
        path.write_text(
            json.dumps(
                {
                    "pull_request": {
                        "author_association": association,
                        "title": title,
                        "body": body,
                    }
                }
            ),
            encoding="utf-8",
        )
        return path

    def test_accepts_one_new_resource(self):
        candidate = BASE + "| [New Resource](https://new.example.com/) | New resource |\n"

        VALIDATOR.validate_resource(
            base_content=BASE,
            candidate_content=candidate,
            title="[New Resource] -> [Icons]",
            body=BODY,
        )

    def test_rejects_duplicate_url_with_different_scheme_and_www(self):
        candidate = BASE + "| [Copy](http://www.example.com) | Duplicate |\n"
        body = BODY.replace("https://new.example.com/", "https://example.com/")

        with self.assertRaisesRegex(VALIDATOR.ValidationError, "already listed"):
            VALIDATOR.validate_resource(BASE, candidate, "[Copy] -> [Icons]", body)

    def test_rejects_the_unchanged_product_ownership_placeholder(self):
        candidate = BASE + "| [New Resource](https://new.example.com/) | New resource |\n"
        body = BODY.replace("Is this your product? No", "Is this your product? Yes / No")

        with self.assertRaisesRegex(VALIDATOR.ValidationError, "Yes or No"):
            VALIDATOR.validate_resource(BASE, candidate, "[New Resource] -> [Icons]", body)

    def test_accepts_a_product_ownership_explanation(self):
        candidate = BASE + "| [New Resource](https://new.example.com/) | New resource |\n"
        body = BODY.replace(
            "Is this your product? No",
            "Is this your product? Yes - submitted on behalf of the product.",
        )

        VALIDATOR.validate_resource(BASE, candidate, "[New Resource] -> [Icons]", body)

    def test_accepts_a_correction_to_the_same_resource(self):
        candidate = BASE.replace(
            "| [Existing](https://example.com/) | Existing resource |",
            "| [Existing](https://better.example.com/) | Corrected resource |",
        )
        body = BODY.replace("https://new.example.com/", "https://better.example.com/")

        VALIDATOR.validate_resource(BASE, candidate, "[Existing] -> [Icons]", body)

    def test_accepts_a_resource_after_the_base_advances(self):
        current_base = BASE + "| [Base Addition](https://base.example.com/) | New on base |\n"
        proposed_merge = current_base + "| [New Resource](https://new.example.com/) | New resource |\n"

        VALIDATOR.validate_resource(
            current_base,
            proposed_merge,
            "[New Resource] -> [Icons]",
            BODY,
        )

    def test_rejects_unrelated_readme_changes(self):
        candidate = BASE.replace("Warp sponsor", "Different sponsor")
        candidate += "| [New Resource](https://new.example.com/) | New resource |\n"

        with self.assertRaisesRegex(VALIDATOR.ValidationError, "Only the single resource"):
            VALIDATOR.validate_resource(BASE, candidate, "[New Resource] -> [Icons]", BODY)

    def test_sponsor_block_detects_changes(self):
        changed = BASE.replace("Warp sponsor", "Different sponsor")

        self.assertNotEqual(VALIDATOR.sponsor_block(BASE), VALIDATOR.sponsor_block(changed))

    def test_top_level_validation_accepts_a_resource(self):
        candidate = BASE + "| [New Resource](https://new.example.com/) | New resource |\n"

        with (
            patch.object(VALIDATOR, "run_git", return_value="readme.md\n"),
            patch.object(VALIDATOR, "read_at_ref", side_effect=[BASE, candidate]),
        ):
            VALIDATOR.validate("base", "candidate", self.event_path())

    def test_top_level_validation_rejects_a_sponsor_change(self):
        candidate = BASE.replace("Warp sponsor", "Different sponsor")

        with (
            patch.object(VALIDATOR, "run_git", return_value="readme.md\n"),
            patch.object(VALIDATOR, "read_at_ref", side_effect=[BASE, candidate]),
            self.assertRaisesRegex(VALIDATOR.ValidationError, "Warp sponsor"),
        ):
            VALIDATOR.validate("base", "candidate", self.event_path())

    def test_top_level_validation_allows_trusted_readme_maintenance(self):
        candidate = BASE.replace("## Icons", "Intro text\n\n## Icons")

        with (
            patch.object(VALIDATOR, "run_git", return_value="readme.md\n"),
            patch.object(VALIDATOR, "read_at_ref", side_effect=[BASE, candidate]),
        ):
            VALIDATOR.validate(
                "base",
                "candidate",
                self.event_path(association="OWNER", title="Update README", body=""),
            )

    def test_top_level_validation_rejects_banner_image_changes(self):
        with (
            patch.object(VALIDATOR, "run_git", return_value="headerimage.png\n"),
            patch.object(VALIDATOR, "read_at_ref", side_effect=[BASE, BASE]),
            self.assertRaisesRegex(VALIDATOR.ValidationError, "banner image"),
        ):
            VALIDATOR.validate("base", "candidate", self.event_path())

    def test_merge_validation_uses_the_fetched_merges_base_parent(self):
        with (
            patch.object(
                VALIDATOR,
                "run_git",
                return_value="merge-sha current-base expected-head\n",
            ),
            patch.object(VALIDATOR, "validate") as validate,
        ):
            event_path = self.event_path()
            VALIDATOR.validate_merge("merge-ref", "expected-head", event_path)

        validate.assert_called_once_with("current-base", "merge-ref", event_path)

    def test_merge_validation_rejects_a_different_head_commit(self):
        with (
            patch.object(
                VALIDATOR,
                "run_git",
                return_value="merge-sha current-base different-head\n",
            ),
            self.assertRaisesRegex(VALIDATOR.ValidationError, "head commit"),
        ):
            VALIDATOR.validate_merge("merge-ref", "expected-head", self.event_path())


if __name__ == "__main__":
    unittest.main()
