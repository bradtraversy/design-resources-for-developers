import { redirect } from 'next/navigation';
import { getCurrentAdminEmail } from '@/lib/admin-auth';
import { getCategories, getAllLinksPaginated } from '@/lib/data';
import { AdminPageContent } from '@/components/admin/AdminPageContent';
import { adminLogoutAction } from './actions';

export default async function AdminPage() {
  const adminEmail = await getCurrentAdminEmail();
  if (!adminEmail) redirect('/admin/login');

  const categories = await getCategories();
  const links = await getAllLinksPaginated({ limit: 500, skip: 0 });

  return (
    <main className='mx-auto max-w-5xl p-6'>
      <div className='mb-8 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Admin Dashboard</h1>
        <form action={adminLogoutAction}>
          <button className='rounded border px-3 py-2 text-sm'>
            Logout ({adminEmail})
          </button>
        </form>
      </div>

      <AdminPageContent categories={categories} links={links} />
    </main>
  );
}
