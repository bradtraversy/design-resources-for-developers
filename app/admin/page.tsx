import { redirect } from 'next/navigation';
import { getCurrentAdminEmail } from '@/lib/admin-auth';
import { getCategories, getAllLinksPaginated } from '@/lib/data';
import {
  createCategory,
  updateCategoryAction,
  deleteCategoryAction,
  createLink,
  updateLinkAction,
  deleteLinkAction,
} from '@/app/actions';
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
        <form
          action={async FormData => {
            await createCategory(FormData);
          }}
          className='grid gap-2 rounded border p-4 md:grid-cols-2'
        >
          <input
            name='name'
            placeholder='Name'
            required
            className='rounded border px-3 py-2'
          />
          <input
            name='description'
            placeholder='Description'
            className='rounded border px-3 py-2'
          />
          <input
            name='icon'
            placeholder='Icon'
            className='rounded border px-3 py-2'
          />
          <input
            name='color'
            placeholder='Color'
            className='rounded border px-3 py-2'
          />
          <button className='rounded bg-black px-4 py-2 text-white md:col-span-2'>
            Create Category
          </button>
        </form>
      </section>

      <section className='mb-10'>
        <h2 className='mb-2 text-xl font-semibold'>Existing Categories</h2>
        <div className='space-y-4'>
          {categories.map(category => (
            <div key={category.id} className='rounded border p-4'>
              <form
                action={async formData => {
                  await updateCategoryAction(formData);
                }}
                className='grid gap-2 md:grid-cols-2'
              >
                <input type='hidden' name='id' value={category.id} />
                <input
                  name='name'
                  defaultValue={category.name}
                  required
                  className='rounded border px-3 py-2'
                />
                <input
                  name='description'
                  defaultValue={category.description ?? ''}
                  className='rounded border px-3 py-2'
                />
                <input
                  name='icon'
                  defaultValue={category.icon ?? ''}
                  className='rounded border px-3 py-2'
                />
                <input
                  name='color'
                  defaultValue={category.color ?? ''}
                  className='rounded border px-3 py-2'
                />
                <button className='rounded bg-blue-600 px-4 py-2 text-white'>
                  Update
                </button>
              </form>
              <form
                action={async formData => {
                  await deleteCategoryAction(formData);
                }}
                className='mt-2'
              >
                <input type='hidden' name='id' value={category.id} />
                <button className='rounded bg-red-600 px-4 py-2 text-white'>
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className='mb-10'>
        <h2 className='mb-2 text-xl font-semibold'>Add Link</h2>
        <form
          action={async FormData => {
            await createLink(FormData);
          }}
          className='grid gap-2 rounded border p-4 md:grid-cols-2'
        >
          <input
            name='title'
            placeholder='Title'
            required
            className='rounded border px-3 py-2'
          />
          <input
            name='url'
            placeholder='URL'
            required
            className='rounded border px-3 py-2'
          />
          <input
            name='description'
            placeholder='Description'
            className='rounded border px-3 py-2'
          />
          <input
            name='icon'
            placeholder='Icon'
            className='rounded border px-3 py-2'
          />
          <select
            name='categoryId'
            required
            className='rounded border px-3 py-2 md:col-span-2'
          >
            <option value=''>Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button className='rounded bg-black px-4 py-2 text-white md:col-span-2'>
            Create Link
          </button>
        </form>
      </section>

      <section>
        <h2 className='mb-2 text-xl font-semibold'>Existing Links</h2>
        <div className='space-y-4'>
          {links.map(link => (
            <div key={link.id} className='rounded border p-4'>
              <form
                action={async FormData => {
                  await updateLinkAction(FormData);
                }}
                className='grid gap-2 md:grid-cols-2'
              >
                <input type='hidden' name='id' value={link.id} />
                <input
                  name='title'
                  defaultValue={link.title}
                  required
                  className='rounded border px-3 py-2'
                />
                <input
                  name='url'
                  defaultValue={link.url}
                  required
                  className='rounded border px-3 py-2'
                />
                <input
                  name='description'
                  defaultValue={link.description ?? ''}
                  className='rounded border px-3 py-2'
                />
                <input
                  name='icon'
                  defaultValue={link.icon ?? ''}
                  className='rounded border px-3 py-2'
                />
                <button className='rounded bg-blue-600 px-4 py-2 text-white'>
                  Update
                </button>
              </form>
              <form
                action={async FormData => {
                  await deleteLinkAction(FormData);
                }}
                className='mt-2'
              >
                <input type='hidden' name='id' value={link.id} />
                <button className='rounded bg-red-600 px-4 py-2 text-white'>
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
