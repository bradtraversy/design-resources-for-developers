'use server';

import { redirect } from 'next/navigation';
import {
  createAdminSession,
  clearAdminSession,
  validateAdminLogin,
} from '@/lib/admin-auth';

export async function adminLoginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/admin/login?error=missing');
  }

  let isValid = false;

  try {
    isValid = await validateAdminLogin(email, password);
  } catch {
    redirect('/admin/login?error=config');
  }
  if (!isValid) {
    redirect('/admin/login?error=invalid');
  }

  await createAdminSession(email);
  redirect('/admin');
}

export async function adminLogoutAction() {
  await clearAdminSession();
  redirect('/admin/login');
}
