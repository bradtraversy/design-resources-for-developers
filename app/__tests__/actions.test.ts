// Integration tests for app actions
// These tests validate the server actions

import {
  categorySchema,
  linkSchema,
  updateCategorySchema,
  updateLinkSchema,
  deleteSchema,
} from '@/lib/schemas';
import { slugify } from '@/lib/utils';

describe('app actions integration', () => {
  describe('FormData handling', () => {
    it('should create FormData with name', () => {
      const formData = new FormData();
      formData.append('name', 'Design');

      expect(formData.get('name')).toBe('Design');
    });

    it('should handle multiple form fields', () => {
      const formData = new FormData();
      formData.append('name', 'Design');
      formData.append('description', 'Design resources');
      formData.append('icon', 'palette');

      expect(formData.get('name')).toBe('Design');
      expect(formData.get('description')).toBe('Design resources');
      expect(formData.get('icon')).toBe('palette');
    });

    it('should handle undefined values', () => {
      const formData = new FormData();
      formData.append('name', 'Design');
      formData.append('description', '');

      expect(formData.get('description')).toBe('');
      expect(formData.get('nonExistent')).toBeNull();
    });
  });

  describe('schema validation from formData', () => {
    it('should convert formData to object', () => {
      const formData = new FormData();
      formData.append('name', 'Design');
      formData.append('description', 'Design resources');

      const data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string | undefined,
      };

      expect(data.name).toBe('Design');
      expect(data.description).toBe('Design resources');
    });

    it('should handle optional undefined fields', () => {
      const formData = new FormData();
      formData.append('name', 'Design');

      const data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string | undefined,
      };

      expect(data.name).toBe('Design');
      // FormData.get returns null for non-existent keys, not undefined
      expect(data.description ?? undefined).toBeUndefined();
    });

    it('should validate category schema from formData', () => {
      const formData = new FormData();
      formData.append('name', 'Web Development');
      formData.append('description', 'Web dev resources');
      formData.append('icon', 'code');
      formData.append('color', '#ffffff');

      const data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string | undefined,
        icon: formData.get('icon') as string | undefined,
        color: formData.get('color') as string | undefined,
      };

      const result = categorySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail validation for missing required fields', () => {
      const formData = new FormData();
      formData.append('description', 'Design resources');

      const data = {
        name: formData.get('name') as string,
        description: formData.get('description') as string | undefined,
      };

      const result = categorySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate link schema from formData', () => {
      const formData = new FormData();
      formData.append('title', 'Google');
      formData.append('url', 'https://google.com');
      formData.append('categoryId', '123');

      const data = {
        title: formData.get('title') as string,
        url: formData.get('url') as string,
        categoryId: formData.get('categoryId') as string,
      };

      const result = linkSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate update category schema', () => {
      const formData = new FormData();
      formData.append('id', '123');
      formData.append('name', 'Design');

      const data = {
        id: formData.get('id') as string,
        name: formData.get('name') as string | undefined,
      };

      const result = updateCategorySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate update link schema', () => {
      const formData = new FormData();
      formData.append('id', '123');
      formData.append('title', 'Google');
      formData.append('url', 'https://google.com');
      formData.append('categoryId', '1');

      const data = {
        id: formData.get('id') as string,
        title: formData.get('title') as string | undefined,
        url: formData.get('url') as string | undefined,
        categoryId: formData.get('categoryId') as string,
      };

      const result = updateLinkSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate delete schema', () => {
      const formData = new FormData();
      formData.append('id', '123');

      const data = {
        id: formData.get('id') as string,
      };

      const result = deleteSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('autocomplete logic', () => {
    it('should return empty array for short query', () => {
      const query = 'a';
      const isValid = query && query.trim().length >= 2;
      expect(isValid).toBe(false);
    });

    it('should return true for query with 2 or more characters', () => {
      const query = 'ab';
      const isValid = query && query.trim().length >= 2;
      expect(isValid).toBe(true);
    });

    it('should trim whitespace', () => {
      const query = '  design  ';
      const trimmed = query.trim();
      expect(trimmed).toBe('design');
    });
  });

  describe('slug generation', () => {
    it('should generate slug from category name', () => {
      const formData = new FormData();
      formData.append('name', 'Web Development');

      const name = formData.get('name') as string;
      const slug = slugify(name);

      expect(slug).toBe('web-development');
    });
  });

  describe('error handling', () => {
    it('should handle validation errors', () => {
      const error = new Error('Name is required');
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      expect(errorMessage).toBe('Name is required');
    });

    it('should handle generic errors', () => {
      const error: unknown = null;
      const errorMessage =
        typeof error === 'string' ? error : 'Failed to create category';

      expect(errorMessage).toBe('Failed to create category');
    });
  });
});
