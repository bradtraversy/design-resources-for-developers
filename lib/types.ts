export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  categoryId: string;
  clicks: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithLinks extends Category {
  links: Link[];
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface CreateLinkInput {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  categoryId: string;
}

export interface UpdateLinkInput extends Partial<CreateLinkInput> {
  id: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

// Resource Submission types
export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ResourceSubmission {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  category?: string;
  submitter?: string;
  email?: string;
  status: SubmissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResourceSubmissionInput {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  category?: string;
  submitter?: string;
  email?: string;
}

// Analytics types
export interface PopularResource {
  id: string;
  title: string;
  url: string;
  clicks: number;
  categoryName: string;
}

export interface PopularCategory {
  id: string;
  name: string;
  slug: string;
  linkCount: number;
  totalClicks: number;
}

export interface TrendData {
  date: string;
  clicks: number;
  submissions: number;
}

export type TimeRange = 'daily' | 'weekly' | 'monthly';

// Bulk Import types
export interface ImportResource {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  category: string;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}
