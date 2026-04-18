import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '../generated/prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Prisma client
const prisma = new PrismaClient();

// Categories from the Table of Contents in resources.md
const CATEGORIES = [
  {
    name: 'UI Graphics',
    description:
      'Websites and resources with modern UI components in different formats such as PSD, Sketch, Figma, etc.',
    slug: 'ui-graphics',
    order: 1,
  },
  {
    name: 'Fonts',
    description: 'Websites that offer free fonts as well as font-based tools',
    slug: 'fonts',
    order: 2,
  },
  {
    name: 'Colors',
    description:
      'Websites and resources that help with choices related to colors',
    slug: 'colors',
    order: 3,
  },
  {
    name: 'Icons',
    description: 'Resources for Icons including png, svg and more',
    slug: 'icons',
    order: 4,
  },
  {
    name: 'Logos',
    description: 'Resources for Logos',
    slug: 'logos',
    order: 5,
  },
  {
    name: 'Favicons',
    description: 'Resources for Favicons',
    slug: 'favicons',
    order: 6,
  },
  {
    name: 'Icon Fonts',
    description: 'Resources for Icon Fonts',
    slug: 'icon-fonts',
    order: 7,
  },
  {
    name: 'Stock Photos',
    description: 'Resources for Stock Photos',
    slug: 'stock-photos',
    order: 8,
  },
  {
    name: 'Stock Videos',
    description: 'Resources for Stock Videos',
    slug: 'stock-videos',
    order: 9,
  },
  {
    name: 'Stock Music & Sound Effects',
    description: 'Resources for Stock Music & Sound Effects',
    slug: 'stock-music--sound-effects',
    order: 10,
  },
  {
    name: 'Vectors & Clip Art',
    description: 'Resources for Vectors & Clip Art',
    slug: 'vectors--clip-art',
    order: 11,
  },
  {
    name: 'Product & Image Mockups',
    description: 'Resources for Product & Image Mockups',
    slug: 'product--image-mockups',
    order: 12,
  },
  {
    name: 'HTML & CSS Templates',
    description: 'Resources for HTML & CSS Templates',
    slug: 'html--css-templates',
    order: 13,
  },
  {
    name: 'CSS Frameworks',
    description: 'Resources for CSS Frameworks',
    slug: 'css-frameworks',
    order: 14,
  },
  {
    name: 'CSS Methodologies',
    description: 'Resources for CSS Methodologies',
    slug: 'css-methodologies',
    order: 15,
  },
  {
    name: 'CSS Animations',
    description: 'Resources for CSS Animations',
    slug: 'css-animations',
    order: 16,
  },
  {
    name: 'Javascript Animation Libraries',
    description: 'Resources for Javascript Animation Libraries',
    slug: 'javascript-animation-libraries',
    order: 17,
  },
  {
    name: 'Javascript Chart Libraries',
    description: 'Resources for Javascript Chart Libraries',
    slug: 'javascript-chart-libraries',
    order: 18,
  },
  {
    name: 'UI Components & Kits',
    description: 'Resources for UI Components & Kits',
    slug: 'ui-components--kits',
    order: 19,
  },
  {
    name: 'React UI Libraries',
    description: 'Resources for React UI Libraries',
    slug: 'react-ui-libraries',
    order: 20,
  },
  {
    name: 'Vue UI Libraries',
    description: 'Resources for Vue UI Libraries',
    slug: 'vue-ui-libraries',
    order: 21,
  },
  {
    name: 'Angular UI Libraries',
    description: 'Resources for Angular UI Libraries',
    slug: 'angular-ui-libraries',
    order: 22,
  },
  {
    name: 'Svelte UI Libraries',
    description: 'Resources for Svelte UI Libraries',
    slug: 'svelte-ui-libraries',
    order: 23,
  },
  {
    name: 'React Native UI Libraries',
    description: 'Resources for React Native UI Libraries',
    slug: 'react-native-ui-libraries',
    order: 24,
  },
  {
    name: 'Design Systems & Style Guides',
    description: 'Resources for Design Systems & Style Guides',
    slug: 'design-systems--style-guides',
    order: 25,
  },
  {
    name: 'Online Design Tools',
    description: 'Resources for Online Design Tools',
    slug: 'online-design-tools',
    order: 26,
  },
  {
    name: 'Downloadable Design Software',
    description: 'Resources for Downloadable Design Software',
    slug: 'downloadable-design-software',
    order: 27,
  },
  {
    name: 'Design Inspiration',
    description: 'Resources for Design Inspiration',
    slug: 'design-inspiration',
    order: 28,
  },
  {
    name: 'Image Compression',
    description: 'Resources for Image Compression',
    slug: 'image-compression',
    order: 29,
  },
  {
    name: 'Chrome Extensions',
    description: 'Resources for Chrome Extensions',
    slug: 'chrome-extensions',
    order: 30,
  },
  {
    name: 'Firefox Extensions',
    description: 'Resources for Firefox Extensions',
    slug: 'firefox-extensions',
    order: 31,
  },
  {
    name: 'AI Graphic Design Tools',
    description: 'Resources for AI Graphic Design Tools',
    slug: 'ai-graphic-design-tools',
    order: 32,
  },
  { name: 'Others', description: 'Other resources', slug: 'others', order: 33 },
];

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

async function main() {
  console.log('Starting seed process...');

  // Read the resources.md file
  const resourcesPath = path.join(process.cwd(), 'resources.md');
  const content = fs.readFileSync(resourcesPath, 'utf-8');

  // Extract sections for each category
  const sections = extractSections(content);

  // Create categories and links
  let totalLinks = 0;

  for (const category of CATEGORIES) {
    console.log(`Creating category: ${category.name}`);

    // Get section content for this category
    const sectionContent = sections.get(category.name) || '';
    const links = parseLinksFromSection(sectionContent);

    // Create category
    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        order: category.order,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        order: category.order,
      },
    });

    console.log(
      `  - Created/updated category: ${createdCategory.name} (${links.length} links)`,
    );

    // Delete existing links for this category
    await prisma.link.deleteMany({
      where: { categoryId: createdCategory.id },
    });

    // Create links for this category
    if (links.length > 0) {
      const linkData = links.map(link => ({
        title: link.title,
        url: link.url,
        description: link.description,
        categoryId: createdCategory.id,
      }));

      await prisma.link.createMany({
        data: linkData,
      });

      console.log(`  - Added ${links.length} links`);
      totalLinks += links.length;
    }
  }

  console.log(`\nSeed completed successfully!`);
  console.log(`Total categories: ${CATEGORIES.length}`);
  console.log(`Total links: ${totalLinks}`);
}

main()
  .catch(e => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
