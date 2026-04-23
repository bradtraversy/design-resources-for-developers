import { Category, Link, CategoryWithLinks } from './types';
import { slugify } from './utils';
import { prisma } from './db';
import { Prisma } from '@prisma/client';

// Helper to convert null to undefined for optional string fields
function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

// Category operations
export async function getCategories(): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
  });
  return categories.map(c => ({
    ...c,
    description: nullToUndefined(c.description),
    icon: nullToUndefined(c.icon),
    color: nullToUndefined(c.color),
  }));
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const category = await prisma.category.findUnique({
    where: { slug },
  });
  if (!category) return null;
  return {
    ...category,
    description: nullToUndefined(category.description),
    icon: nullToUndefined(category.icon),
    color: nullToUndefined(category.color),
  };
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const category = await prisma.category.findUnique({
    where: { id },
  });
  if (!category) return null;
  return {
    ...category,
    description: nullToUndefined(category.description),
    icon: nullToUndefined(category.icon),
    color: nullToUndefined(category.color),
  };
}

export async function getCategoryWithLinks(
  slug: string,
  options?: { limit?: number; skip?: number },
): Promise<CategoryWithLinks | null> {
  const { limit, skip } = options || {};
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      links: {
        take: limit,
        skip,
      },
    },
  });
  if (!category) return null;
  return {
    ...category,
    description: nullToUndefined(category.description),
    icon: nullToUndefined(category.icon),
    color: nullToUndefined(category.color),
    links: category.links.map(l => ({
      ...l,
      description: nullToUndefined(l.description),
      icon: nullToUndefined(l.icon),
    })),
  };
}

export async function getCategoryWithLinksCount(slug: string): Promise<number> {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { _count: { select: { links: true } } },
  });
  return category?._count?.links ?? 0;
}

export async function getAllCategoriesWithLinks(options?: {
  limit?: number;
  skip?: number;
}): Promise<CategoryWithLinks[]> {
  const { limit, skip } = options || {};
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      links: {
        take: limit,
        skip,
      },
    },
  });
  return categories.map(c => ({
    ...c,
    description: nullToUndefined(c.description),
    icon: nullToUndefined(c.icon),
    color: nullToUndefined(c.color),
    links: c.links.map(l => ({
      ...l,
      description: nullToUndefined(l.description),
      icon: nullToUndefined(l.icon),
    })),
  }));
}

export async function getAllCategoriesWithLinksCount(): Promise<number> {
  const count = await prisma.category.count();
  return count;
}

export async function getAllLinksCount(): Promise<number> {
  const count = await prisma.link.count();
  return count;
}

export async function getAllLinksPaginated(options?: {
  limit?: number;
  skip?: number;
}): Promise<Link[]> {
  const { limit, skip } = options || {};
  const links = await prisma.link.findMany({
    take: limit,
    skip,
    orderBy: { createdAt: 'desc' },
  });
  return links.map(l => ({
    ...l,
    description: nullToUndefined(l.description),
    icon: nullToUndefined(l.icon),
  }));
}

export async function createCategory(data: {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}): Promise<Category> {
  // Get the highest order number
  const lastCategory = await prisma.category.findFirst({
    orderBy: { order: 'desc' },
  });
  const newOrder = lastCategory ? lastCategory.order + 1 : 1;

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      icon: data.icon,
      color: data.color,
      order: newOrder,
    },
  });
  return {
    ...category,
    description: nullToUndefined(category.description),
    icon: nullToUndefined(category.icon),
    color: nullToUndefined(category.color),
  };
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
  const updateData: Prisma.CategoryUpdateInput = { ...data };
  if (data.name) {
    updateData.slug = slugify(data.name);
  }

  const category = await prisma.category.update({
    where: { id },
    data: updateData,
  });
  return {
    ...category,
    description: nullToUndefined(category.description),
    icon: nullToUndefined(category.icon),
    color: nullToUndefined(category.color),
  };
}

export async function deleteCategory(id: string): Promise<boolean> {
  await prisma.category.delete({
    where: { id },
  });
  return true;
}

// Link operations
export async function getLinksByCategory(categoryId: string): Promise<Link[]> {
  const links = await prisma.link.findMany({
    where: { categoryId },
  });
  return links.map(l => ({
    ...l,
    description: nullToUndefined(l.description),
    icon: nullToUndefined(l.icon),
  }));
}

export async function getLinkById(id: string): Promise<Link | null> {
  const link = await prisma.link.findUnique({
    where: { id },
  });
  if (!link) return null;
  return {
    ...link,
    description: nullToUndefined(link.description),
    icon: nullToUndefined(link.icon),
  };
}

export async function createLink(data: {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  categoryId: string;
}): Promise<Link> {
  const link = await prisma.link.create({
    data: {
      title: data.title,
      url: data.url,
      description: data.description,
      icon: data.icon,
      categoryId: data.categoryId,
    },
  });
  return {
    ...link,
    description: nullToUndefined(link.description),
    icon: nullToUndefined(link.icon),
  };
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
  const link = await prisma.link.update({
    where: { id },
    data,
  });
  return {
    ...link,
    description: nullToUndefined(link.description),
    icon: nullToUndefined(link.icon),
  };
}

export async function deleteLink(id: string): Promise<boolean> {
  await prisma.link.delete({
    where: { id },
  });
  return true;
}

export async function incrementLinkClicks(id: string): Promise<void> {
  await prisma.link.update({
    where: { id },
    data: {
      clicks: { increment: 1 },
    },
  });
}

export async function searchLinks(query: string): Promise<Link[]> {
  const links = await prisma.link.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
  });
  return links.map(l => ({
    ...l,
    description: nullToUndefined(l.description),
    icon: nullToUndefined(l.icon),
  }));
}

export async function searchLinksWithCategorySlug(
  query: string,
): Promise<(Link & { categorySlug?: string })[]> {
  const links = await prisma.link.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      category: {
        select: { slug: true },
      },
    },
  });
  return links.map(l => ({
    ...l,
    description: nullToUndefined(l.description),
    icon: nullToUndefined(l.icon),
    categorySlug: l.category?.slug,
  }));
}
