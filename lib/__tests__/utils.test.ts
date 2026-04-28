import { slugify, cn, generateId } from '../utils';

describe('utils', () => {
  describe('slugify', () => {
    it('should convert text to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should trim whitespace', () => {
      expect(slugify('  hello  ')).toBe('hello');
    });

    it('should remove special characters', () => {
      expect(slugify('Hello@World!')).toBe('helloworld');
    });

    it('should replace spaces with hyphens', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should replace underscores with hyphens', () => {
      expect(slugify('Hello_World')).toBe('hello-world');
    });

    it('should remove leading and trailing hyphens', () => {
      expect(slugify('  -hello-  ')).toBe('hello');
    });

    it('should handle multiple consecutive spaces', () => {
      expect(slugify('Hello    World')).toBe('hello-world');
    });

    it('should handle empty string', () => {
      expect(slugify('')).toBe('');
    });

    it('should handle non-ASCII characters by removing them', () => {
      expect(slugify('Hello 世界')).toBe('hello');
    });
  });

  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar');
      expect(result).toBe('foo bar');
    });

    it('should handle falsy values', () => {
      const result = cn('foo', false && 'bar', 'baz');
      expect(result).toBe('foo baz');
    });

    it('should handle conditional classes', () => {
      const result = cn('foo', true && 'bar', false && 'baz');
      expect(result).toBe('foo bar');
    });

    it('should handle arrays', () => {
      const result = cn(['foo', 'bar']);
      expect(result).toBe('foo bar');
    });

    it('should handle objects', () => {
      const result = cn({ foo: true, bar: false });
      expect(result).toBe('foo');
    });
  });

  describe('generateId', () => {
    it('should generate a string', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique ids', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should only contain alphanumeric characters', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });
  });
});
