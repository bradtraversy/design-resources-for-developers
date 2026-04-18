import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  icon: z.string().max(50, 'Icon must be less than 50 characters').optional(),
  color: z.string().max(20, 'Color must be less than 20 characters').optional(),
});

export const linkSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  url: z.string().url('Please enter a valid URL').min(1, 'URL is required'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  icon: z.string().max(100, 'Icon must be less than 100 characters').optional(),
  categoryId: z.string().min(1, 'Category is required'),
});

export const updateCategorySchema = categorySchema.extend({
  id: z.string().min(1, 'ID is required'),
});

export const updateLinkSchema = linkSchema.extend({
  id: z.string().min(1, 'ID is required'),
});

export const deleteSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type LinkInput = z.infer<typeof linkSchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type DeleteInput = z.infer<typeof deleteSchema>;
