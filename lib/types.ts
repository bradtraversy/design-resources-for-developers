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
