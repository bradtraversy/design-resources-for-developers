import { Category, Link, CategoryWithLinks } from './types';
import { generateId, slugify } from './utils';

// In-memory data store (simulates database)
// This will be replaced with actual Prisma queries when database is connected
let categories: Category[] = [];
let links: Link[] = [];

// Initialize with sample data from readme categories
function initializeData() {
  if (categories.length > 0) return;

  const categoryData = [
    {
      name: 'UI Graphics',
      slug: 'ui-graphics',
      description:
        'Websites and resources with modern UI components in different formats',
      icon: 'palette',
      color: '#8B5CF6',
      order: 1,
    },
    {
      name: 'Fonts',
      slug: 'fonts',
      description: 'Websites that offer free fonts as well as font-based tools',
      icon: 'type',
      color: '#EC4899',
      order: 2,
    },
    {
      name: 'Colors',
      slug: 'colors',
      description:
        'Websites and resources that help with choices related to colors',
      icon: 'droplet',
      color: '#F59E0B',
      order: 3,
    },
    {
      name: 'Icons',
      slug: 'icons',
      description: 'Resources for icons in various formats and styles',
      icon: 'star',
      color: '#10B981',
      order: 4,
    },
    {
      name: 'Logos',
      slug: 'logos',
      description: 'Websites to find or create logos',
      icon: 'badge',
      color: '#3B82F6',
      order: 5,
    },
    {
      name: 'Favicons',
      slug: 'favicons',
      description: 'Tools and resources for favicons',
      icon: 'circle',
      color: '#6366F1',
      order: 6,
    },
    {
      name: 'Stock Photos',
      slug: 'stock-photos',
      description: 'High-quality stock photos for your projects',
      icon: 'image',
      color: '#14B8A6',
      order: 7,
    },
    {
      name: 'Stock Videos',
      slug: 'stock-videos',
      description: 'Stock videos for commercial and personal projects',
      icon: 'video',
      color: '#F97316',
      order: 8,
    },
    {
      name: 'Vectors & Clip Art',
      slug: 'vectors-clip-art',
      description: 'Vector graphics and clip art resources',
      icon: 'pen-tool',
      color: '#84CC16',
      order: 9,
    },
    {
      name: 'Product & Image Mockups',
      slug: 'product-image-mockups',
      description: 'Mockup templates for product and image presentations',
      icon: 'box',
      color: '#06B6D4',
      order: 10,
    },
    {
      name: 'HTML & CSS Templates',
      slug: 'html-css-templates',
      description: 'Free and paid HTML and CSS templates',
      icon: 'code',
      color: '#8B5CF6',
      order: 11,
    },
    {
      name: 'CSS Frameworks',
      slug: 'css-frameworks',
      description: 'Popular CSS frameworks for modern web design',
      icon: 'layers',
      color: '#10B981',
      order: 12,
    },
    {
      name: 'Design Inspiration',
      slug: 'design-inspiration',
      description: 'Websites for design inspiration and ideas',
      icon: 'lightbulb',
      color: '#F59E0B',
      order: 13,
    },
  ];

  categories = categoryData.map(cat => ({
    id: generateId(),
    ...cat,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  // Sample links for a few categories
  const sampleLinks: Omit<Link, 'id' | 'createdAt' | 'updatedAt'>[] = [
    // UI Graphics links
    {
      title: 'SVG Sine Waves',
      url: 'https://www.sinwaver.com/',
      description: 'Export perfect sine waves as SVG',
      categoryId: categories[0].id,
      clicks: 0,
      isFeatured: true,
    },
    {
      title: 'UI Design Daily',
      url: 'https://uidesigndaily.com/',
      description: 'Awesome UI Components of all types',
      categoryId: categories[0].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: '100 Daily UI',
      url: 'https://100dailyui.webflow.io/',
      description: 'Free Figma library',
      categoryId: categories[0].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Humaaans',
      url: 'https://www.humaaans.com/',
      description: 'Cool illustrations of people',
      categoryId: categories[0].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Drawkit.io',
      url: 'https://www.drawkit.io/',
      description: 'Illustrations for designers',
      categoryId: categories[0].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Undraw.co',
      url: 'https://undraw.co/',
      description: 'Open-source illustrations',
      categoryId: categories[0].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Boring Avatars',
      url: 'https://boringavatars.com/',
      description: 'SVG random avatars',
      categoryId: categories[0].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Hero Patterns',
      url: 'http://www.heropatterns.com/',
      description: 'Repeatable SVG background patterns',
      categoryId: categories[0].id,
      clicks: 0,
      isFeatured: false,
    },

    // Fonts links
    {
      title: 'Google Fonts',
      url: 'https://fonts.google.com/',
      description: 'Library of around 1000 free licensed font families',
      categoryId: categories[1].id,
      clicks: 0,
      isFeatured: true,
    },
    {
      title: 'DaFont',
      url: 'https://www.dafont.com/',
      description: 'Archive of freely downloadable fonts',
      categoryId: categories[1].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Font Squirrel',
      url: 'https://www.fontsquirrel.com/',
      description: 'High quality free fonts',
      categoryId: categories[1].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Fontjoy',
      url: 'https://fontjoy.com/',
      description: 'Generate font pairing in one click',
      categoryId: categories[1].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Befonts',
      url: 'https://befonts.com/',
      description: 'High quality fonts for free',
      categoryId: categories[1].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Fontshare',
      url: 'https://www.fontshare.com/',
      description: 'Free fonts service from ITF',
      categoryId: categories[1].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Bunny Fonts',
      url: 'https://fonts.bunny.net/',
      description: 'Privacy-focused Google Fonts alternative',
      categoryId: categories[1].id,
      clicks: 0,
      isFeatured: false,
    },

    // Colors links
    {
      title: 'Coolors',
      url: 'https://coolors.co',
      description: 'Create the perfect palette',
      categoryId: categories[2].id,
      clicks: 0,
      isFeatured: true,
    },
    {
      title: 'Color Brewer 2',
      url: 'https://colorbrewer2.org/',
      description: 'Color palette generator',
      categoryId: categories[2].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Colormind.io',
      url: 'http://colormind.io',
      description: 'Color palette generator',
      categoryId: categories[2].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'ColorSpace',
      url: 'https://mycolor.space/',
      description: 'Generate nice color palettes',
      categoryId: categories[2].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Adobe Color',
      url: 'https://color.adobe.com/create',
      description: 'Create color palettes',
      categoryId: categories[2].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Gradient Hunt',
      url: 'https://gradienthunt.com/',
      description: 'Gradient inspiration',
      categoryId: categories[2].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Web Gradients',
      url: 'https://webgradients.com/',
      description: 'Good CSS gradients',
      categoryId: categories[2].id,
      clicks: 0,
      isFeatured: false,
    },

    // Icons links
    {
      title: 'Lucide',
      url: 'https://lucide.dev/',
      description: 'Beautiful & consistent icons',
      categoryId: categories[3].id,
      clicks: 0,
      isFeatured: true,
    },
    {
      title: 'Heroicons',
      url: 'https://heroicons.com/',
      description: 'Icon set from Tailwind CSS',
      categoryId: categories[3].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Phosphor Icons',
      url: 'https://phosphoricons.com/',
      description: 'Flexible icon family',
      categoryId: categories[3].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Feather Icons',
      url: 'https://feathericons.com/',
      description: 'Simply beautiful icons',
      categoryId: categories[3].id,
      clicks: 0,
      isFeatured: false,
    },
    {
      title: 'Font Awesome',
      url: 'https://fontawesome.com/',
      description: 'Vector icons and frameworks',
      categoryId: categories[3].id,
      clicks: 0,
      isFeatured: false,
    },
  ];

  links = sampleLinks.map(link => ({
    ...link,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

// Initialize on module load
initializeData();

// Category operations
export async function getCategories(): Promise<Category[]> {
  initializeData();
  return [...categories].sort((a, b) => a.order - b.order);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  initializeData();
  return categories.find(c => c.slug === slug) || null;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  initializeData();
  return categories.find(c => c.id === id) || null;
}

export async function getCategoryWithLinks(
  slug: string,
): Promise<CategoryWithLinks | null> {
  initializeData();
  const category = categories.find(c => c.slug === slug);
  if (!category) return null;

  const categoryLinks = links.filter(l => l.categoryId === category.id);
  return { ...category, links: categoryLinks };
}

export async function getAllCategoriesWithLinks(): Promise<
  CategoryWithLinks[]
> {
  initializeData();
  return categories
    .sort((a, b) => a.order - b.order)
    .map(category => ({
      ...category,
      links: links.filter(l => l.categoryId === category.id),
    }));
}

export async function createCategory(data: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}): Promise<Category> {
  initializeData();
  const newCategory: Category = {
    id: generateId(),
    name: data.name,
    slug: slugify(data.name),
    description: data.description,
    icon: data.icon,
    color: data.color,
    order: categories.length + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  categories.push(newCategory);
  return newCategory;
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  }>,
): Promise<Category | null> {
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return null;

  const updated = {
    ...categories[index],
    ...data,
    updatedAt: new Date(),
  };
  if (data.name) {
    updated.slug = slugify(data.name);
  }
  categories[index] = updated;
  return updated;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const index = categories.findIndex(c => c.id === id);
  if (index === -1) return false;

  // Also delete all links in this category
  links = links.filter(l => l.categoryId !== id);
  categories.splice(index, 1);
  return true;
}

// Link operations
export async function getLinksByCategory(categoryId: string): Promise<Link[]> {
  initializeData();
  return links.filter(l => l.categoryId === categoryId);
}

export async function getLinkById(id: string): Promise<Link | null> {
  initializeData();
  return links.find(l => l.id === id) || null;
}

export async function createLink(data: {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  categoryId: string;
}): Promise<Link> {
  initializeData();
  const newLink: Link = {
    id: generateId(),
    ...data,
    clicks: 0,
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  links.push(newLink);
  return newLink;
}

export async function updateLink(
  id: string,
  data: Partial<{
    title: string;
    url: string;
    description?: string;
    icon?: string;
  }>,
): Promise<Link | null> {
  const index = links.findIndex(l => l.id === id);
  if (index === -1) return null;

  const updated = {
    ...links[index],
    ...data,
    updatedAt: new Date(),
  };
  links[index] = updated;
  return updated;
}

export async function deleteLink(id: string): Promise<boolean> {
  const index = links.findIndex(l => l.id === id);
  if (index === -1) return false;

  links.splice(index, 1);
  return true;
}

export async function incrementLinkClicks(id: string): Promise<void> {
  const index = links.findIndex(l => l.id === id);
  if (index !== -1) {
    links[index].clicks += 1;
  }
}

export async function searchLinks(query: string): Promise<Link[]> {
  initializeData();
  const lowerQuery = query.toLowerCase();
  return links.filter(
    l =>
      l.title.toLowerCase().includes(lowerQuery) ||
      l.description?.toLowerCase().includes(lowerQuery),
  );
}
