import {
  createCategory,
  updateCategoryAction,
  deleteCategoryAction,
  createLink as createLinkAction,
  updateLinkAction,
  deleteLinkAction,
  searchLinksAction,
  searchLinksByCategoryAction,
  getAutocompleteSuggestionsAction,
  trackLinkClick,
} from '../actions';
import { getCurrentAdminEmail } from '@/lib/admin-auth';

// Mock @/lib/db first to prevent Prisma from throwing an error
jest.mock('@/lib/db', () => ({
  prisma: {
    category: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    link: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock dependencies
jest.mock('@/lib/data', () => ({
  __esModule: true,
  getCategories: jest.fn(),
  getCategoryBySlug: jest.fn(),
  getCategoryWithLinks: jest.fn(),
  getCategoryWithLinksCount: jest.fn(),
  getAllCategoriesWithLinks: jest.fn(),
  getAllCategoriesWithLinksCount: jest.fn(),
  getAllLinksCount: jest.fn(),
  getAllLinksPaginated: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
  createLink: jest.fn(),
  updateLink: jest.fn(),
  deleteLink: jest.fn(),
  searchLinks: jest.fn(),
  searchLinksByCategory: jest.fn(),
  searchLinksWithCategorySlug: jest.fn(),
  incrementLinkClicks: jest.fn(),
  SortOrder: 'newest',
}));
jest.mock('@/lib/admin-auth');
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import * as data from '@/lib/data';
const mockData = data as jest.Mocked<typeof data>;
const mockGetCurrentAdminEmail = getCurrentAdminEmail as jest.MockedFunction<
  typeof getCurrentAdminEmail
>;

describe('Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentAdminEmail.mockResolvedValue('admin@example.com');
  });

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      mockData.createCategory.mockResolvedValue({
        id: '1',
        name: 'Test',
        slug: 'test',
        description: 'Test category',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const formData = new FormData();
      formData.append('name', 'Test');
      formData.append('description', 'Test category');

      const result = await createCategory(formData);

      // Debug: log the result to understand what's happening
      if (!result.success) {
        console.log('createCategory result:', result);
      }

      expect(result.success).toBe(true);
      expect(mockData.createCategory).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test', description: 'Test category' }),
      );
    });

    it('should return error if validation fails', async () => {
      const formData = new FormData();
      formData.append('name', ''); // invalid - empty name

      const result = await createCategory(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error if not admin', async () => {
      mockGetCurrentAdminEmail.mockResolvedValue(null);
      const formData = new FormData();
      formData.append('name', 'Test');

      const result = await createCategory(formData);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('updateCategoryAction', () => {
    it('should update a category successfully', async () => {
      mockData.updateCategory.mockResolvedValue({
        id: '123',
        name: 'Updated',
        slug: 'updated',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const formData = new FormData();
      formData.append('id', '123');
      formData.append('name', 'Updated');

      const result = await updateCategoryAction(formData);

      expect(result.success).toBe(true);
      expect(mockData.updateCategory).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({ name: 'Updated' }),
      );
    });

    it('should return error if id is missing', async () => {
      const formData = new FormData();
      formData.append('name', 'Updated');

      const result = await updateCategoryAction(formData);
      expect(result.success).toBe(false);
    });
  });

  describe('deleteCategoryAction', () => {
    it('should delete a category successfully', async () => {
      mockData.deleteCategory.mockResolvedValue(true);

      const formData = new FormData();
      formData.append('id', '123');

      const result = await deleteCategoryAction(formData);

      expect(result.success).toBe(true);
      expect(mockData.deleteCategory).toHaveBeenCalledWith('123');
    });
  });

  describe('createLink', () => {
    it('should create a link successfully', async () => {
      mockData.createLink.mockResolvedValue({
        id: '1',
        title: 'Test Link',
        url: 'https://test.com',
        categoryId: '1',
        clicks: 0,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const formData = new FormData();
      formData.append('title', 'Test Link');
      formData.append('url', 'https://test.com');
      formData.append('categoryId', '1');

      const result = await createLinkAction(formData);

      expect(result.success).toBe(true);
      expect(mockData.createLink).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Link',
          url: 'https://test.com',
          categoryId: '1',
        }),
      );
    });

    it('should return error if required fields missing', async () => {
      const formData = new FormData();
      formData.append('title', 'Test');

      const result = await createLinkAction(formData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateLinkAction', () => {
    it('should update a link successfully', async () => {
      mockData.updateLink.mockResolvedValue({
        id: '123',
        title: 'Updated Link',
        url: 'https://updated.com',
        categoryId: '1',
        clicks: 0,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const formData = new FormData();
      formData.append('id', '123');
      formData.append('title', 'Updated Link');
      formData.append('url', 'https://updated.com');
      formData.append('categoryId', '1');

      const result = await updateLinkAction(formData);

      expect(result.success).toBe(true);
      expect(mockData.updateLink).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({ title: 'Updated Link' }),
      );
    });
  });

  describe('deleteLinkAction', () => {
    it('should delete a link successfully', async () => {
      mockData.deleteLink.mockResolvedValue(true);

      const formData = new FormData();
      formData.append('id', '123');

      const result = await deleteLinkAction(formData);

      expect(result.success).toBe(true);
    });
  });

  describe('searchLinksAction', () => {
    it('should return search results', async () => {
      const mockResults = [
        {
          id: '1',
          title: 'Google',
          url: 'https://google.com',
          categoryId: '1',
          clicks: 0,
          isFeatured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockData.searchLinks.mockResolvedValue(mockResults);

      const result = await searchLinksAction('google');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResults);
    });

    it('should return error on failure', async () => {
      mockData.searchLinks.mockRejectedValue(new Error('Search failed'));

      const result = await searchLinksAction('google');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Search failed');
    });
  });

  describe('searchLinksByCategoryAction', () => {
    it('should return search results for category', async () => {
      const mockResults = [
        {
          id: '1',
          title: 'React',
          url: 'https://react.dev',
          categoryId: '1',
          clicks: 0,
          isFeatured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockData.searchLinksByCategory.mockResolvedValue(mockResults);

      const result = await searchLinksByCategoryAction('react', 'frontend');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResults);
      expect(mockData.searchLinksByCategory).toHaveBeenCalledWith(
        'react',
        'frontend',
      );
    });
  });

  describe('getAutocompleteSuggestionsAction', () => {
    it('should return suggestions for valid query', async () => {
      const mockSuggestions = [
        {
          id: '1',
          title: 'Google',
          url: 'https://google.com',
          categoryId: '1',
          clicks: 0,
          isFeatured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          categorySlug: 'search',
        },
        {
          id: '2',
          title: 'GitHub',
          url: 'https://github.com',
          categoryId: '1',
          clicks: 0,
          isFeatured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          categorySlug: 'dev',
        },
      ];
      mockData.searchLinksWithCategorySlug.mockResolvedValue(mockSuggestions);

      const result = await getAutocompleteSuggestionsAction('goo');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should limit suggestions to 8', async () => {
      const manySuggestions = Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        title: `Item ${i}`,
        url: `https://${i}.com`,
        categoryId: '1',
        clicks: 0,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        categorySlug: 'test',
      }));
      mockData.searchLinksWithCategorySlug.mockResolvedValue(manySuggestions);

      const result = await getAutocompleteSuggestionsAction('item');

      expect(result.data).toHaveLength(8);
    });

    it('should return empty array for short query', async () => {
      const result = await getAutocompleteSuggestionsAction('a');
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(mockData.searchLinksWithCategorySlug).not.toHaveBeenCalled();
    });
  });

  describe('trackLinkClick', () => {
    it('should increment link clicks', async () => {
      mockData.incrementLinkClicks.mockResolvedValue(undefined);

      await trackLinkClick('123');

      expect(mockData.incrementLinkClicks).toHaveBeenCalledWith('123');
    });
  });
});
