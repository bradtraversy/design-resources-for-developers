import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeBasicAuth(header: string) {
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'basic' || !token) return null;

  try {
    const decoded = atob(token);
    const sep = decoded.indexOf(':');
    if (sep === -1) return null;
    return {
      username: decoded.slice(0, sep),
      password: decoded.slice(sep + 1),
    };
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;

  // Avoid hard-failing with opaque login errors when admin auth env vars are missing.
  // In development we allow access to simplify local setup.
  if (!expectedUser || !expectedPass) {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse(
        'Admin login is not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD.',
        {
          status: 500,
        },
      );
    }

    return NextResponse.next();
  }

  const auth = decodeBasicAuth(request.headers.get('authorization') ?? '');
  if (
    auth &&
    auth.username === expectedUser &&
    auth.password === expectedPass
  ) {
    return NextResponse.next();
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Area"',
    },
  });
}

export const config = {
  matcher: ['/admin/:path*'],
};
