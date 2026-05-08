import { prisma } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function exportData() {
  console.log('Exporting database data...');

  const categories = await prisma.category.findMany({
    include: {
      links: true,
    },
  });

  // Convert to plain objects to avoid Prisma-specific properties
  const plainCategories = categories.map(category => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
    color: category.color,
    order: category.order,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
    links: category.links.map(link => ({
      id: link.id,
      title: link.title,
      url: link.url,
      description: link.description,
      icon: link.icon,
      categoryId: link.categoryId,
      clicks: link.clicks,
      isFeatured: link.isFeatured,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
    })),
  }));

  const data = {
    categories: plainCategories,
    exportedAt: new Date().toISOString(),
  };

  const filePath = path.resolve(process.cwd(), 'db-backup.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Data exported successfully to ${filePath}`);
  console.log(
    `Exported ${plainCategories.length} categories and ${plainCategories.reduce(
      (sum, cat) => sum + cat.links.length,
      0,
    )} links`,
  );
}

async function importData(filePath: string, clear: boolean = false) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  console.log(`Importing data from ${filePath}...`);

  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  if (!data.categories || !Array.isArray(data.categories)) {
    throw new Error('Invalid backup file format: missing categories array');
  }

  if (clear) {
    console.log('Clearing existing data...');
    await prisma.link.deleteMany({});
    await prisma.category.deleteMany({});
    console.log('Existing data cleared');
  }

  // Import categories
  for (const categoryData of data.categories) {
    // Check if category already exists (by id or slug)
    let existingCategory = null;
    if (categoryData.id) {
      existingCategory = await prisma.category.findUnique({
        where: { id: categoryData.id },
      });
    }

    if (!existingCategory && categoryData.slug) {
      existingCategory = await prisma.category.findFirst({
        where: { slug: categoryData.slug },
      });
    }

    const linksData = categoryData.links || [];
    delete categoryData.links;

    const category = existingCategory
      ? await prisma.category.update({
          where: { id: existingCategory.id },
          data: {
            ...categoryData,
            // Remove id from update data as it's immutable
            id: undefined,
          },
        })
      : await prisma.category.create({
          data: categoryData,
        });

    // Import links for this category
    for (const linkData of linksData) {
      linkData.categoryId = category.id;

      let existingLink = null;
      if (linkData.id) {
        existingLink = await prisma.link.findUnique({
          where: { id: linkData.id },
        });
      }

      if (!existingLink && linkData.url) {
        existingLink = await prisma.link.findFirst({
          where: { url: linkData.url, categoryId: category.id },
        });
      }

      if (existingLink) {
        await prisma.link.update({
          where: { id: existingLink.id },
          data: {
            ...linkData,
            // Remove id from update data as it's immutable
            id: undefined,
          },
        });
      } else {
        await prisma.link.create({
          data: linkData,
        });
      }
    }
  }

  console.log('Data imported successfully');
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'export') {
  exportData()
    .catch(async error => {
      console.error('Export failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} else if (command === 'import') {
  const fileArg = args.find(arg => arg.startsWith('--file='));
  const filePath = fileArg ? fileArg.split('=')[1] : './db-backup.json';
  const clear = args.includes('--clear');

  importData(filePath, clear)
    .catch(async error => {
      console.error('Import failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} else {
  console.error('Invalid command. Use "export" or "import".');
  console.log('Usage:');
  console.log('  npx ts-node scripts/db-export-import.ts export');
  console.log(
    '  npx ts-node scripts/db-export-import.ts import --file=./db-backup.json [--clear]',
  );
  process.exit(1);
}
