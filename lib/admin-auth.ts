import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');
  return secret;
}

function sign(value: string): string {
  return createHmac('sha256', getSessionSecret()).update(value).digest('hex');
}

function parseSessionCookie(
  value: string,
): { email: string; signature: string } | null {
  const [email, signature] = value.split(':');
  if (!email || !signature) return null;
  return { email, signature };
}

export function isAllowedAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export async function createAdminSession(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const signature = sign(normalizedEmail);
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, `${normalizedEmail}:${signature}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getCurrentAdminEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!raw) return null;

  const session = parseSessionCookie(raw);
  if (!session) return null;

  const expected = sign(session.email);
  const sigBuffer = Buffer.from(session.signature);
  const expectedBuffer = Buffer.from(expected);

  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null;
  if (!isAllowedAdminEmail(session.email)) return null;

  return session.email;
}

export async function requireAdmin(): Promise<string | null> {
  return getCurrentAdminEmail();
}

export async function validateAdminLogin(
  email: string,
  password: string,
): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD is not configured');
  }

  return isAllowedAdminEmail(email) && password === adminPassword;
}
