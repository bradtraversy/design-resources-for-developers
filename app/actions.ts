'use server';

import {
  categorySchema,
  linkSchema,
  updateCategorySchema,
  updateLinkSchema,
  deleteSchema,
} from '@/lib/schemas';
import {
  getCategories,
  getCategoryBySlug,
  getCategoryWithLinks,
  getCategoryWithLinksCount,
  getAllCategoriesWithLinks,
  getAllCategoriesWithLinksCount,
  getAllLinksCount,
  getAllLinksPaginated,
  createCategory as createCategoryData,
  updateCategory as updateCategoryData,
  deleteCategory as deleteCategoryData,
  createLink as createLinkData,
  updateLink as updateLinkData,
  deleteLink as deleteLinkData,
  searchLinks,
  searchLinksWithCategorySlug,
  incrementLinkClicks,
} from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { getCurrentAdminEmail } from '@/lib/admin-auth';

async function ensureAdmin() {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) {
    throw new Error('Unauthorized');
  }
}
// Category Actions
export async function getCategoriesAction() {
  return getCategories();
}

export async function getCategoryBySlugAction(slug: string) {
  return getCategoryBySlug(slug);
}

export async function getCategoryWithLinksAction(
  slug: string,
  options?: { limit?: number; skip?: number },
) {
  return getCategoryWithLinks(slug, options);
}

export async function getCategoryWithLinksCountAction(slug: string) {
  return getCategoryWithLinksCount(slug);
}

export async function getAllCategoriesWithLinksAction(options?: {
  limit?: number;
  skip?: number;
}) {
  return getAllCategoriesWithLinks(options);
}

export async function getAllCategoriesWithLinksCountAction() {
  return getAllCategoriesWithLinksCount();
}

export async function getAllLinksCountAction() {
  return getAllLinksCount();
}

export async function getAllLinksPaginatedAction(options?: {
  limit?: number;
  skip?: number;
}) {
  return getAllLinksPaginated(options);
}

export async function createCategory(formData: FormData): Promise<void> {
  await ensureAdmin();
  const data = {
    name: formData.get('name') as string,
    description: formData.get('description') as string | undefined,
    icon: formData.get('icon') as string | undefined,
    color: formData.get('color') as string | undefined,
  };

  const validated = categorySchema.parse(data);
  await createCategoryData(validated);
  revalidatePath('/');
}

export async function updateCategoryAction(formData: FormData): Promise<void> {
  await ensureAdmin();
  const data = {
    id: formData.get('id') as string,
    name: formData.get('name') as string | undefined,
    description: formData.get('description') as string | undefined,
    icon: formData.get('icon') as string | undefined,
    color: formData.get('color') as string | undefined,
  };

  const validated = updateCategorySchema.parse(data);
  await updateCategoryData(validated.id, validated);
  revalidatePath('/');
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await ensureAdmin();
  const data = {
    id: formData.get('id') as string,
  };

  const validated = deleteSchema.parse(data);
  await deleteCategoryData(validated.id);
  revalidatePath('/');
}

// Link Actions
export async function createLink(formData: FormData): Promise<void> {
  await ensureAdmin();
  const data = {
    title: formData.get('title') as string,
    url: formData.get('url') as string,
    description: formData.get('description') as string | undefined,
    icon: formData.get('icon') as string | undefined,
    categoryId: formData.get('categoryId') as string,
  };

  const validated = linkSchema.parse(data);
  await createLinkData(validated);
  revalidatePath('/');
}

export async function updateLinkAction(formData: FormData): Promise<void> {
  await ensureAdmin();
  const data = {
    id: formData.get('id') as string,
    title: formData.get('title') as string | undefined,
    url: formData.get('url') as string | undefined,
    description: formData.get('description') as string | undefined,
    icon: formData.get('icon') as string | undefined,
  };

  const validated = updateLinkSchema.parse(data);
  await updateLinkData(validated.id, validated);
  revalidatePath('/');
}

export async function deleteLinkAction(formData: FormData): Promise<void> {
  await ensureAdmin();
  const data = {
    id: formData.get('id') as string,
  };

  const validated = deleteSchema.parse(data);
  await deleteLinkData(validated.id);
  revalidatePath('/');
}

export async function searchLinksAction(query: string) {
  try {
    return { success: true, data: await searchLinks(query) };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to search links' };
  }
}

export async function trackLinkClick(linkId: string) {
  await incrementLinkClicks(linkId);
}

// Autocomplete Suggestions
export async function getAutocompleteSuggestionsAction(query: string) {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, data: [] };
    }
    const suggestions = await searchLinksWithCategorySlug(query.trim());
    // Limit to 8 suggestions for autocomplete
    const limitedSuggestions = suggestions.slice(0, 8);
    return { success: true, data: limitedSuggestions };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to get suggestions' };
  }
}
