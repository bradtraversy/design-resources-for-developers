// Mock the db module before importing data
jest.mock('../db', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    link: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { prisma } from '../db';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;

import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getLinkById,
  createLink,
  incrementLinkClicks,
  searchLinks,
} from '../data';

describe('data functions - integration tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should fetch all categories and convert null to undefined', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Design',
          slug: 'design',
          description: null,
          icon: null,
          color: null,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Development',
          slug: 'dev',
          description: 'Dev resources',
          icon: 'code',
          color: '#fff',
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await getCategories();

      expect(result).toHaveLength(2);
      expect(result[0].description).toBeUndefined();
      expect(result[0].icon).toBeUndefined();
      expect(result[0].color).toBeUndefined();
    });
  });

  describe('getCategoryBySlug', () => {
    it('should return category by slug', async () => {
      const mockCategory = {
        id: '1',
        name: 'Design',
        slug: 'design',
        description: null,
        icon: null,
        color: null,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);
      const result = await getCategoryBySlug('design');
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Design');
    });

    it('should return null if category not found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      const result = await getCategoryBySlug('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('createCategory', () => {
    it('should create category with auto-generated slug and order', async () => {
      const lastCategory = { id: '1', order: 1 };
      mockPrisma.category.findFirst.mockResolvedValueOnce(lastCategory);
      const newCategory = {
        id: '2',
        name: 'New Category',
        slug: 'new-category',
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.category.create.mockResolvedValueOnce(newCategory);
      const result = await createCategory({ name: 'New Category' });
      expect(mockPrisma.category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'New Category',
            slug: 'new-category',
            order: 2,
          }),
        }),
      );
      expect(result.slug).toBe('new-category');
    });

    it('should set order to 1 if no categories exist', async () => {
      mockPrisma.category.findFirst.mockResolvedValueOnce(null);
      const newCategory = {
        id: '1',
        name: 'First Category',
        slug: 'first-category',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.category.create.mockResolvedValueOnce(newCategory);
      await createCategory({ name: 'First Category' });
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ order: 1 }),
      });
    });
  });

  describe('updateCategory', () => {
    it('should update category and regenerate slug if name changes', async () => {
      const updatedCategory = {
        id: '123',
        name: 'Updated Name',
        slug: 'updated-name',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.category.update.mockResolvedValue(updatedCategory);
      const result = await updateCategory('123', { name: 'Updated Name' });
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: expect.objectContaining({
          name: 'Updated Name',
          slug: 'updated-name',
        }),
      });
      expect(result?.slug).toBe('updated-name');
    });

    it('should not update id even if provided', async () => {
      mockPrisma.category.update.mockResolvedValue({
        id: '123',
        name: 'Design',
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateCategory('123', { id: '456', name: 'Design' } as any);
      const callArgs = mockPrisma.category.update.mock.calls[0][0];
      expect(callArgs.data).not.toHaveProperty('id');
    });

    it('should return null if category not found', async () => {
      mockPrisma.category.update.mockResolvedValue(null);
      const result = await updateCategory('nonexistent', { name: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('deleteCategory', () => {
    it('should delete category and return true', async () => {
      mockPrisma.category.delete.mockResolvedValue({});
      const result = await deleteCategory('123');
      expect(result).toBe(true);
      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: '123' },
      });
    });
  });

  describe('getLinkById', () => {
    it('should return link by id', async () => {
      const mockLink = {
        id: '123',
        title: 'Test',
        url: 'https://test.com',
        categoryId: '1',
        description: null,
        icon: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.link.findUnique.mockResolvedValue(mockLink);
      const result = await getLinkById('123');
      expect(result?.title).toBe('Test');
    });

    it('should return null if link not found', async () => {
      mockPrisma.link.findUnique.mockResolvedValue(null);
      const result = await getLinkById('999');
      expect(result).toBeNull();
    });
  });

  describe('createLink', () => {
    it('should create a new link', async () => {
      const newLink = {
        id: '1',
        title: 'New Link',
        url: 'https://new.com',
        categoryId: '1',
        description: null,
        icon: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.link.create.mockResolvedValue(newLink);
      const result = await createLink({
        title: 'New Link',
        url: 'https://new.com',
        categoryId: '1',
      });
      expect(result.title).toBe('New Link');
    });
  });

  describe('incrementLinkClicks', () => {
    it('should increment click count', async () => {
      mockPrisma.link.update.mockResolvedValue({});
      await incrementLinkClicks('123');
      expect(mockPrisma.link.update).toHaveBeenCalledWith({
        where: { id: '123' },
        data: { clicks: { increment: 1 } },
      });
    });
  });

  describe('searchLinks', () => {
    it('should search links by title and description', async () => {
      mockPrisma.link.findMany.mockResolvedValue([]);
      await searchLinks('google');
      expect(mockPrisma.link.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                title: { contains: 'google', mode: 'insensitive' },
              }),
              expect.objectContaining({
                description: { contains: 'google', mode: 'insensitive' },
              }),
            ]),
          }),
        }),
      );
    });
  });
});
