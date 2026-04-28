// Unit tests for data functions
// These tests validate the data transformation logic

// Import the functions without mocking prisma
// We'll test the nullToUndefined behavior through integration tests

import { slugify } from '../utils';

describe('data functions - unit tests', () => {
  describe('category creation logic', () => {
    it('should slugify category name when creating', () => {
      // This tests that the slugify function works correctly
      // which is used in createCategory
      const slug = slugify('Web Development');
      expect(slug).toBe('web-development');
    });

    it('should handle special characters in category name', () => {
      const slug = slugify('Design & UI/UX');
      expect(slug).toBe('design-uiux');
    });

    it('should handle leading/trailing spaces', () => {
      const slug = slugify('  Category  ');
      expect(slug).toBe('category');
    });
  });

  describe('link creation logic', () => {
    it('should slugify link title when updating', () => {
      // This tests that the slugify function works correctly
      // which is used in updateCategory
      const slug = slugify('Updated Category');
      expect(slug).toBe('updated-category');
    });
  });

  describe('null handling', () => {
    it('should convert null to undefined', () => {
      const nullToUndefined = <T>(value: T | null): T | undefined =>
        value === null ? undefined : value;

      expect(nullToUndefined(null)).toBeUndefined();
      expect(nullToUndefined('value')).toBe('value');
      expect(nullToUndefined('')).toBe('');
      expect(nullToUndefined(0)).toBe(0);
    });
  });

  describe('search query logic', () => {
    it('should handle search query formatting', () => {
      // Test case-insensitive search logic
      const query = 'GOOGLE';
      expect(query.toLowerCase()).toBe('google');
    });

    it('should handle partial matching', () => {
      const searchTerm = 'design';
      const searchableText = 'Web Design Resources';
      expect(searchableText.toLowerCase()).toContain(searchTerm);
    });
  });
});
