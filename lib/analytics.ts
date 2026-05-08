import {
  PopularResource,
  PopularCategory,
  TrendData,
  TimeRange,
  ResourceSubmission,
  ImportResource,
  ImportResult,
} from './types';
import { prisma } from './db';

// Analytics functions
export async function getPopularResources(
  limit: number = 10,
): Promise<PopularResource[]> {
  const links = await prisma.link.findMany({
    take: limit,
    orderBy: { clicks: 'desc' },
    include: {
      category: {
        select: { name: true },
      },
    },
  });

  return links.map(link => ({
    id: link.id,
    title: link.title,
    url: link.url,
    clicks: link.clicks,
    categoryName: link.category?.name || 'Unknown',
  }));
}

export async function getPopularCategories(
  limit: number = 10,
): Promise<PopularCategory[]> {
  const categories = await prisma.category.findMany({
    take: limit,
    orderBy: { order: 'asc' },
    include: {
      links: {
        select: { clicks: true },
      },
    },
  });

  return categories.map(category => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    linkCount: category.links.length,
    totalClicks: category.links.reduce((sum, link) => sum + link.clicks, 0),
  }));
}

export async function getTrendData(
  timeRange: TimeRange = 'weekly',
): Promise<TrendData[]> {
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case 'daily':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
      break;
    case 'monthly':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
      break;
    case 'weekly':
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
      break;
  }

  // Get all links with their click counts
  const links = await prisma.link.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      clicks: true,
      createdAt: true,
    },
  });

  // Get all submissions
  const submissions = await prisma.resourceSubmission.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      createdAt: true,
    },
  });

  // Aggregate by date
  const dateMap = new Map<string, { clicks: number; submissions: number }>();

  // Initialize all dates
  const days = timeRange === 'monthly' ? 30 : 7;
  for (let i = 0; i < days; i++) {
    const date = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    dateMap.set(dateStr, { clicks: 0, submissions: 0 });
  }

  // Add click data
  links.forEach(link => {
    const dateStr = link.createdAt.toISOString().split('T')[0];
    const existing = dateMap.get(dateStr);
    if (existing) {
      existing.clicks += link.clicks;
    }
  });

  // Add submission data
  submissions.forEach(submission => {
    const dateStr = submission.createdAt.toISOString().split('T')[0];
    const existing = dateMap.get(dateStr);
    if (existing) {
      existing.submissions += 1;
    }
  });

  return Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    clicks: data.clicks,
    submissions: data.submissions,
  }));
}

// Resource Submission functions
export async function createResourceSubmission(data: {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  category?: string;
  submitter?: string;
  email?: string;
}): Promise<ResourceSubmission> {
  const submission = await prisma.resourceSubmission.create({
    data: {
      title: data.title,
      url: data.url,
      description: data.description,
      icon: data.icon,
      category: data.category,
      submitter: data.submitter,
      email: data.email,
      status: 'PENDING',
    },
  });

  return {
    ...submission,
    description: submission.description ?? undefined,
    icon: submission.icon ?? undefined,
    category: submission.category ?? undefined,
    submitter: submission.submitter ?? undefined,
    email: submission.email ?? undefined,
  };
}

export async function getResourceSubmissions(
  status?: 'PENDING' | 'APPROVED' | 'REJECTED',
): Promise<ResourceSubmission[]> {
  const submissions = await prisma.resourceSubmission.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
  });

  return submissions.map(s => ({
    ...s,
    description: s.description ?? undefined,
    icon: s.icon ?? undefined,
    category: s.category ?? undefined,
    submitter: s.submitter ?? undefined,
    email: s.email ?? undefined,
  }));
}

export async function getResourceSubmissionById(
  id: string,
): Promise<ResourceSubmission | null> {
  const submission = await prisma.resourceSubmission.findUnique({
    where: { id },
  });

  if (!submission) return null;

  return {
    ...submission,
    description: submission.description ?? undefined,
    icon: submission.icon ?? undefined,
    category: submission.category ?? undefined,
    submitter: submission.submitter ?? undefined,
    email: submission.email ?? undefined,
  };
}

export async function updateResourceSubmissionStatus(
  id: string,
  status: 'PENDING' | 'APPROVED' | 'REJECTED',
): Promise<ResourceSubmission | null> {
  const submission = await prisma.resourceSubmission.update({
    where: { id },
    data: { status },
  });

  if (!submission) {
    return null;
  }

  return {
    ...submission,
    description: submission.description ?? undefined,
    icon: submission.icon ?? undefined,
    category: submission.category ?? undefined,
    submitter: submission.submitter ?? undefined,
    email: submission.email ?? undefined,
  };
}

export async function deleteResourceSubmission(id: string): Promise<boolean> {
  await prisma.resourceSubmission.delete({
    where: { id },
  });
  return true;
}

// Bulk Import functions
export async function bulkImportResources(
  resources: ImportResource[],
): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  for (const resource of resources) {
    try {
      // Find or create category
      let category = await prisma.category.findFirst({
        where: {
          name: {
            equals: resource.category,
            mode: 'insensitive',
          },
        },
      });

      if (!category) {
        // Simplified: assign default order
        const newOrder = 1;

        category = await prisma.category.create({
          data: {
            name: resource.category,
            slug: resource.category.toLowerCase().replace(/\s+/g, '-'),
            order: newOrder,
          },
        });
      }

      // Create link
      await prisma.link.create({
        data: {
          title: resource.title,
          url: resource.url,
          description: resource.description,
          icon: resource.icon,
          categoryId: category.id,
        },
      });

      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push(
        `Failed to import "${resource.title}": ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  return result;
}

export async function getPendingSubmissionsCount(): Promise<number> {
  return prisma.resourceSubmission.count({
    where: { status: 'PENDING' },
  });
}
