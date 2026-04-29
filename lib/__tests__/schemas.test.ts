import {
  categorySchema,
  linkSchema,
  updateCategorySchema,
  updateLinkSchema,
  deleteSchema,
  type CategoryInput,
  type LinkInput,
} from '../schemas';

describe('categorySchema', () => {
  it('should validate a valid category', () => {
    const validCategory: CategoryInput = {
      name: 'Design',
      description: 'Design resources',
      icon: 'palette',
      color: '#ffffff',
    };
    const result = categorySchema.safeParse(validCategory);
    expect(result.success).toBe(true);
  });

  it('should require name field', () => {
    const invalidCategory = {
      description: 'Design resources',
    };
    const result = categorySchema.safeParse(invalidCategory);
    expect(result.success).toBe(false);
  });

  it('should reject empty name', () => {
    const invalidCategory = {
      name: '',
    };
    const result = categorySchema.safeParse(invalidCategory);
    expect(result.success).toBe(false);
  });

  it('should validate optional fields', () => {
    const validCategory: CategoryInput = {
      name: 'Design',
    };
    const result = categorySchema.safeParse(validCategory);
    expect(result.success).toBe(true);
  });

  it('should reject name longer than 100 characters', () => {
    const invalidCategory = {
      name: 'a'.repeat(101),
    };
    const result = categorySchema.safeParse(invalidCategory);
    expect(result.success).toBe(false);
  });

  it('should reject description longer than 500 characters', () => {
    const invalidCategory = {
      name: 'Design',
      description: 'a'.repeat(501),
    };
    const result = categorySchema.safeParse(invalidCategory);
    expect(result.success).toBe(false);
  });
});

describe('linkSchema', () => {
  it('should validate a valid link', () => {
    const validLink: LinkInput = {
      title: 'Google',
      url: 'https://google.com',
      description: 'Search engine',
      categoryId: '123',
    };
    const result = linkSchema.safeParse(validLink);
    expect(result.success).toBe(true);
  });

  it('should require title field', () => {
    const invalidLink = {
      url: 'https://google.com',
      categoryId: '123',
    };
    const result = linkSchema.safeParse(invalidLink);
    expect(result.success).toBe(false);
  });

  it('should require URL field', () => {
    const invalidLink = {
      title: 'Google',
      categoryId: '123',
    };
    const result = linkSchema.safeParse(invalidLink);
    expect(result.success).toBe(false);
  });

  it('should validate URL format', () => {
    const invalidLink: LinkInput = {
      title: 'Google',
      url: 'not-a-url',
      categoryId: '123',
    };
    const result = linkSchema.safeParse(invalidLink);
    expect(result.success).toBe(false);
  });

  it('should require categoryId field', () => {
    const invalidLink = {
      title: 'Google',
      url: 'https://google.com',
    };
    const result = linkSchema.safeParse(invalidLink);
    expect(result.success).toBe(false);
  });
});

describe('updateCategorySchema', () => {
  it('should require id field', () => {
    const invalidData = {
      name: 'Design',
    };
    const result = updateCategorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should validate a valid update category', () => {
    const validData = {
      id: '123',
      name: 'Design',
    };
    const result = updateCategorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('updateLinkSchema', () => {
  it('should require id field', () => {
    const invalidData = {
      title: 'Google',
      url: 'https://google.com',
      categoryId: '123',
    };
    const result = updateLinkSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should validate a valid update link', () => {
    const validData = {
      id: '123',
      title: 'Google',
      url: 'https://google.com',
      categoryId: '123',
    };
    const result = updateLinkSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('deleteSchema', () => {
  it('should require id field', () => {
    const invalidData = {};
    const result = deleteSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should validate a valid delete request', () => {
    const validData = {
      id: '123',
    };
    const result = deleteSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
