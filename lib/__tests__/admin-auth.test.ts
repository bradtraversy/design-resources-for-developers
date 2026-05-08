import {
  getCurrentAdminEmail,
  clearAdminSession,
  isAllowedAdminEmail,
} from '../admin-auth';

// Mock next/headers cookies
const mockCookieStore = new Map<string, string>();
const mockCookies = {
  get: (name: string) => {
    const value = mockCookieStore.get(name);
    return value ? { name, value } : null;
  },
  set: jest.fn((name: string, value: string) => {
    mockCookieStore.set(name, value);
  }),
  delete: jest.fn((name: string) => {
    mockCookieStore.delete(name);
  }),
};

jest.mock('next/headers', () => ({
  cookies: () => mockCookies,
}));

const originalEnv = process.env;

beforeEach(() => {
  mockCookieStore.clear();
  jest.clearAllMocks();
  process.env = {
    ...originalEnv,
    ADMIN_EMAILS: 'admin@example.com,superadmin@example.com',
    ADMIN_SESSION_SECRET: 'test-secret-key',
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('admin-auth', () => {
  describe('isAllowedAdminEmail', () => {
    it('should return true for allowed admin emails', () => {
      expect(isAllowedAdminEmail('admin@example.com')).toBe(true);
      expect(isAllowedAdminEmail('ADMIN@EXAMPLE.COM')).toBe(true);
      expect(isAllowedAdminEmail('  admin@example.com  ')).toBe(true);
    });

    it('should return false for non-admin emails', () => {
      expect(isAllowedAdminEmail('user@example.com')).toBe(false);
      expect(isAllowedAdminEmail('')).toBe(false);
    });
  });

  describe('getCurrentAdminEmail', () => {
    it('should return admin email from valid signed cookie', async () => {
      const email = 'admin@example.com';
      const { createHmac } = await import('crypto');
      const signature = createHmac('sha256', 'test-secret-key')
        .update(email)
        .digest('hex');
      const cookieValue = `${email}:${signature}`;
      mockCookieStore.set('admin_session', cookieValue);

      const result = await getCurrentAdminEmail();
      expect(result).toBe('admin@example.com');
    });

    it('should return null if cookie is missing', async () => {
      const result = await getCurrentAdminEmail();
      expect(result).toBeNull();
    });

    it('should return null if signature is invalid', async () => {
      mockCookieStore.set(
        'admin_session',
        'admin@example.com:invalidsignature',
      );
      const result = await getCurrentAdminEmail();
      expect(result).toBeNull();
    });

    it('should return null if email is not in allowed list', async () => {
      const email = 'user@example.com';
      const { createHmac } = await import('crypto');
      const signature = createHmac('sha256', 'test-secret-key')
        .update(email)
        .digest('hex');
      mockCookieStore.set('admin_session', `${email}:${signature}`);
      const result = await getCurrentAdminEmail();
      expect(result).toBeNull();
    });

    it('should return null if cookie format is invalid', async () => {
      mockCookieStore.set('admin_session', 'invalidformat');
      const result = await getCurrentAdminEmail();
      expect(result).toBeNull();
    });
  });

  describe('clearAdminSession', () => {
    it('should clear the admin session', async () => {
      mockCookieStore.set('admin_session', 'dummy');
      await clearAdminSession();
      expect(mockCookieStore.has('admin_session')).toBe(false);
      expect(mockCookies.delete).toHaveBeenCalledWith('admin_session');
    });
  });
});
