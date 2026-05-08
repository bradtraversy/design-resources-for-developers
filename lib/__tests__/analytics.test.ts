// Mock the db module before importing analytics
jest.mock('../db', () => ({
  prisma: {
    link: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() },
    category: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    resourceSubmission: {
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
  getPopularResources,
  getPopularCategories,
  getTrendData,
  createResourceSubmission,
  getResourceSubmissions,
  updateResourceSubmissionStatus,
  deleteResourceSubmission,
  bulkImportResources,
  getPendingSubmissionsCount,
} from '../analytics';

describe('analytics functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPopularResources', () => {
    it('should return top resources by clicks', async () => {
      const mockLinks = [
        {
          id: '1',
          title: 'Popular Link',
          url: 'https://popular.com',
          clicks: 100,
          category: { name: 'Design' },
        },
        {
          id: '2',
          title: 'Less Popular',
          url: 'https://less.com',
          clicks: 50,
          category: { name: 'Dev' },
        },
      ];
      mockPrisma.link.findMany.mockResolvedValue(mockLinks);

      const result = await getPopularResources(10);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Popular Link');
      expect(result[0].clicks).toBe(100);
    });
  });

  describe('getPopularCategories', () => {
    it('should return categories with link counts and total clicks', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Design',
          slug: 'design',
          order: 1,
          links: [{ clicks: 10 }, { clicks: 20 }],
        },
        {
          id: '2',
          name: 'Development',
          slug: 'dev',
          order: 2,
          links: [{ clicks: 5 }],
        },
      ];
      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await getPopularCategories(10);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Design');
      expect(result[0].linkCount).toBe(2);
      expect(result[0].totalClicks).toBe(30);
    });
  });

  describe('getTrendData', () => {
    it('should return trend data for last 7 days by default', async () => {
      mockPrisma.link.findMany.mockResolvedValue([]);
      mockPrisma.resourceSubmission.findMany.mockResolvedValue([]);

      const result = await getTrendData('weekly');

      expect(result).toHaveLength(7);
    });

    it('should return 30 days of data for monthly range', async () => {
      mockPrisma.link.findMany.mockResolvedValue([]);
      mockPrisma.resourceSubmission.findMany.mockResolvedValue([]);
      const result = await getTrendData('monthly');
      expect(result).toHaveLength(30);
    });
  });

  describe('createResourceSubmission', () => {
    it('should create a new submission with default PENDING status', async () => {
      const mockSubmission = {
        id: '123',
        title: 'New Submission',
        url: 'https://new.com',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.resourceSubmission.create.mockResolvedValue(mockSubmission);

      const result = await createResourceSubmission({
        title: 'New Submission',
        url: 'https://new.com',
        description: 'A new resource',
      });

      expect(mockPrisma.resourceSubmission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'New Submission',
          url: 'https://new.com',
          status: 'PENDING',
        }),
      });
      expect(result.status).toBe('PENDING');
    });
  });

  describe('getResourceSubmissions', () => {
    it('should return all submissions when no status filter', async () => {
      const mockSubmissions = [
        {
          id: '1',
          title: 'Sub 1',
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Sub 2',
          status: 'APPROVED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrisma.resourceSubmission.findMany.mockResolvedValue(mockSubmissions);

      const result = await getResourceSubmissions();

      expect(result).toHaveLength(2);
    });

    it('should filter submissions by status', async () => {
      await getResourceSubmissions('PENDING');
      expect(mockPrisma.resourceSubmission.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateResourceSubmissionStatus', () => {
    it('should update submission status', async () => {
      const updated = {
        id: '123',
        status: 'APPROVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.resourceSubmission.update.mockResolvedValue(updated);
      const result = await updateResourceSubmissionStatus('123', 'APPROVED');
      expect(result?.status).toBe('APPROVED');
    });

    it('should return null if submission not found', async () => {
      mockPrisma.resourceSubmission.update.mockResolvedValue(null);
      const result = await updateResourceSubmissionStatus('999', 'APPROVED');
      expect(result).toBeNull();
    });
  });

  describe('deleteResourceSubmission', () => {
    it('should delete submission and return true', async () => {
      mockPrisma.resourceSubmission.delete.mockResolvedValue({});
      const result = await deleteResourceSubmission('123');
      expect(result).toBe(true);
    });
  });

  describe('bulkImportResources', () => {
    it('should import multiple resources and create categories as needed', async () => {
      // First resource: category not found, create it
      mockPrisma.category.findFirst.mockResolvedValueOnce(null);
      mockPrisma.category.create.mockResolvedValueOnce({
        id: 'cat1',
        name: 'Category A',
        slug: 'category-a',
        order: 1,
      });
      // Second resource: category not found, create it
      mockPrisma.category.findFirst.mockResolvedValueOnce(null);
      mockPrisma.category.create.mockResolvedValueOnce({
        id: 'cat2',
        name: 'Category B',
        slug: 'category-b',
        order: 1,
      });
      // link.create needs to resolve for both resources
      mockPrisma.link.create.mockResolvedValue({});

      const resources = [
        {
          title: 'Resource 1',
          url: 'https://res1.com',
          category: 'Category A',
        },
        {
          title: 'Resource 2',
          url: 'https://res2.com',
          category: 'Category B',
        },
      ];

      const result = await bulkImportResources(resources);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should reuse existing categories', async () => {
      mockPrisma.category.findFirst.mockResolvedValueOnce({
        id: 'existing',
        name: 'Existing Cat',
        slug: 'existing-cat',
        order: 1,
      });
      mockPrisma.link.create.mockResolvedValue({});

      const resources = [
        {
          title: 'Resource 1',
          url: 'https://res1.com',
          category: 'Existing Cat',
        },
      ];

      await bulkImportResources(resources);
      expect(mockPrisma.category.create).not.toHaveBeenCalled();
    });

    it('should handle partial failures', async () => {
      // First resource: findFirst fails (DB error)
      mockPrisma.category.findFirst.mockRejectedValueOnce(
        new Error('DB error'),
      );
      // Second resource: succeeds
      mockPrisma.category.findFirst.mockResolvedValueOnce({
        id: 'cat1',
        name: 'Valid',
        slug: 'valid',
        order: 1,
      });
      mockPrisma.link.create.mockResolvedValue({});

      const resources = [
        { title: 'Good', url: 'https://good.com', category: 'Valid' },
        { title: 'Bad', url: 'https://bad.com', category: 'Invalid' },
      ];

      const result = await bulkImportResources(resources);

      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('getPendingSubmissionsCount', () => {
    it('should return count of pending submissions', async () => {
      mockPrisma.resourceSubmission.count.mockResolvedValue(5);
      const count = await getPendingSubmissionsCount();
      expect(count).toBe(5);
    });
  });
});
