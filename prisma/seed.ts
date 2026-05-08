import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Parse links from a markdown table section
 */
function parseLinksFromSection(
  content: string,
): Array<{ title: string; url: string; description: string }> {
  const links: Array<{ title: string; url: string; description: string }> = [];

  // Split content into lines
  const lines = content.split('\n');

  let inTable = false;

  for (const line of lines) {
    // Check if we're starting a table (contains | and ---)
    if (line.includes('|') && line.includes('---')) {
      inTable = true;
      continue;
    }

    // Check if we're leaving the table (line doesn't start with |)
    if (inTable && !line.trim().startsWith('|')) {
      inTable = false;
      continue;
    }

    // Process table rows
    if (inTable && line.trim().startsWith('|')) {
      // Split by | and filter out empty cells
      const cells = line
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell);

      // Skip header row and empty rows
      if (cells.length >= 2 && !cells[0].startsWith('Website')) {
        const titleMatch = cells[0].match(/\[([^\]]+)\]\(([^)]+)\)/);

        if (titleMatch) {
          const title = titleMatch[1];
          const url = titleMatch[2];
          const description = cells[1] || '';

          links.push({ title, url, description });
        }
      }
    }
  }

  return links;
}

/**
 * Extract sections from markdown file
 */
function extractSections(content: string): Map<string, string> {
  const sections = new Map<string, string>();

  // Split by category headers (##)
  // Match: ## Category Name
  // Then capture everything until the next ## or end of file
  const matches = Array.from(content.matchAll(/##\s+([^\n]+)\n*/g));

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const categoryTitle = match[1].trim();

    // Find the next section start
    let nextSectionStart = content.length;
    if (i < matches.length - 1) {
      nextSectionStart = matches[i + 1].index;
    }

    // Extract section content (from end of header to start of next header)
    const sectionStart = match.index + match[0].length;
    const sectionContent = content.slice(sectionStart, nextSectionStart);

    sections.set(categoryTitle, sectionContent);
  }

  return sections;
}

/**
 * Create a unique key for a link based on title and URL
 */
function createLinkKey(title: string, url: string): string {
  return `${title}:::${url}`;
}

async function main() {
  console.log('Starting smart seed process...');

  // Read the resources.md file
  const resourcesPath = path.join(process.cwd(), 'resources.md');
  const content = fs.readFileSync(resourcesPath, 'utf-8');

  // Extract sections for each category
  const sections = extractSections(content);

  // Get all existing categories and links from database
  const existingCategories = await prisma.category.findMany({
    include: {
      links: true,
    },
  });

  // Create maps for efficient lookup
  const existingCategoryByName = new Map(
    existingCategories.map(cat => [cat.name, cat]),
  );

  // Track statistics
  let totalCategoriesAdded = 0;
  let totalCategoriesUpdated = 0;
  let totalCategoriesRemoved = 0;
  let totalLinksAdded = 0;
  let totalLinksUpdated = 0;
  let totalLinksRemoved = 0;

  // Process each category from resources.md
  for (const [categoryName, sectionContent] of sections) {
    const links = parseLinksFromSection(sectionContent);

    // Check if category exists by name
    const existingCategory = existingCategoryByName.get(categoryName);
    const description = sectionContent.match(/>\s*([^\n]+)/)?.[1] || null;

    let categoryId: string;

    if (existingCategory) {
      // Category exists - check if it needs updating
      const needsUpdate =
        existingCategory.name !== categoryName ||
        existingCategory.description !== description;

      if (needsUpdate) {
        const updatedCategory = await prisma.category.update({
          where: { id: existingCategory.id },
          data: {
            name: categoryName,
            description,
          },
        });
        categoryId = updatedCategory.id;
        totalCategoriesUpdated++;
        console.log(`Updated category: ${categoryName}`);
      } else {
        categoryId = existingCategory.id;
      }
    } else {
      // Create new category
      // Generate slug from name
      const slug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const newCategory = await prisma.category.create({
        data: {
          name: categoryName,
          slug,
          description,
          order: 0,
        },
      });
      categoryId = newCategory.id;
      totalCategoriesAdded++;
      console.log(`Added category: ${categoryName}`);
    }

    // Fetch current links for this category
    const dbCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { links: true },
    });

    const existingLinksMap = new Map(
      (dbCategory?.links || []).map(link => [
        createLinkKey(link.title, link.url),
        link,
      ]),
    );
    const newLinksMap = new Map(
      links.map(link => [createLinkKey(link.title, link.url), link]),
    );

    // Find links to add (in new but not in existing)
    for (const [key, newLink] of newLinksMap) {
      if (!existingLinksMap.has(key)) {
        await prisma.link.create({
          data: {
            title: newLink.title,
            url: newLink.url,
            description: newLink.description,
            categoryId,
          },
        });
        totalLinksAdded++;
      } else {
        // Check if link needs updating (description changed)
        const existingLink = existingLinksMap.get(key)!;
        if (existingLink.description !== newLink.description) {
          await prisma.link.update({
            where: { id: existingLink.id },
            data: { description: newLink.description },
          });
          totalLinksUpdated++;
        }
      }
    }

    // Find links to remove (in existing but not in new)
    for (const [key, existingLink] of existingLinksMap) {
      if (!newLinksMap.has(key)) {
        await prisma.link.delete({
          where: { id: existingLink.id },
        });
        totalLinksRemoved++;
      }
    }

    console.log(
      `  - Category "${categoryName}": ${links.length} links (added: ${
        [...newLinksMap].filter(([k]) => !existingLinksMap.has(k)).length
      }, updated: ${
        [...newLinksMap].filter(
          ([k]) =>
            existingLinksMap.has(k) &&
            existingLinksMap.get(k)?.description !==
              newLinksMap.get(k)?.description,
        ).length
      }, removed: ${
        [...existingLinksMap].filter(([k]) => !newLinksMap.has(k)).length
      })`,
    );
  }

  // Find categories to remove (in database but not in resources.md)
  for (const category of existingCategories) {
    if (!sections.has(category.name)) {
      // Delete all links for this category (cascade will handle this)
      await prisma.category.delete({
        where: { id: category.id },
      });
      totalCategoriesRemoved++;
      console.log(`Removed category: ${category.name}`);
    }
  }

  console.log('\nSeed completed successfully!');
  console.log(
    `Categories - Added: ${totalCategoriesAdded}, Updated: ${totalCategoriesUpdated}, Removed: ${totalCategoriesRemoved}`,
  );
  console.log(
    `Links - Added: ${totalLinksAdded}, Updated: ${totalLinksUpdated}, Removed: ${totalLinksRemoved}`,
  );
}

main()
  .catch(e => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
