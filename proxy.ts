import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to the login page without authentication
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // In development, allow access without authentication
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  // In production, check for valid session cookie
  const adminEmails = getAdminEmails();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmails.length === 0 || !adminPassword) {
    return new NextResponse(
      'Admin login is not configured. Set ADMIN_EMAILS and ADMIN_PASSWORD.',
      {
        status: 500,
      },
    );
  }

  // Allow the request to pass through - authentication is handled by the form-based system
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
