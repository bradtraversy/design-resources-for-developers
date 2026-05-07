import { redirect } from 'next/navigation';
import { getCurrentAdminEmail } from '@/lib/admin-auth';
import { getCategories, getAllLinksPaginated } from '@/lib/data';
import {
  AddCategoryForm,
  AddLinkForm,
  Categories,
  Links,
} from '@/components/admin/AdminForms';
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

      <section className='mb-10'>
        <h2 className='mb-2 text-xl font-semibold'>Add Category</h2>
        <AddCategoryForm />
      </section>

      <section className='mb-10'>
        <h2 className='mb-2 text-xl font-semibold'>Add Link</h2>
        <AddLinkForm categories={categories} />
      </section>

      <section className='mb-10'>
        <h2 className='mb-2 text-xl font-semibold'>Existing Categories</h2>
        <Categories categories={categories} />
      </section>

      <section>
        <h2 className='mb-2 text-xl font-semibold'>Existing Links</h2>
        <Links categories={categories} links={links} />
      </section>
    </main>
  );
}
