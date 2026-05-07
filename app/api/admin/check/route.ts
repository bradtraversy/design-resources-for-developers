import { NextResponse } from 'next/server';
import { getCurrentAdminEmail } from '@/lib/admin-auth';

export async function GET() {
  const adminEmail = await getCurrentAdminEmail();
  if (adminEmail) {
    return NextResponse.json({ authenticated: true, email: adminEmail });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
