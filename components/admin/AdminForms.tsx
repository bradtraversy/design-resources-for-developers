'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Category, Link } from '@/lib/types';
import {
  createCategory,
  updateCategoryAction,
  deleteCategoryAction,
  createLink,
  updateLinkAction,
  deleteLinkAction,
} from '@/app/actions';

interface CategoriesProps {
  categories: Category[];
}

interface LinksProps {
  categories: Category[];
  links: Link[];
}

interface AddLinkFormProps {
  categories: Category[];
}

function FormButton({
  children,
  isPending,
  className,
}: {
  children: React.ReactNode;
  isPending: boolean;
  className?: string;
}) {
  return (
    <button
      type='submit'
      disabled={isPending}
      className={`rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50 ${
        className || ''
      }`}
    >
      {isPending ? 'Processing...' : children}
    </button>
  );
}

export function Categories({ categories }: CategoriesProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateCategoryAction(formData);
      if (result.success) {
        toast.success('Category updated successfully');
      } else {
        toast.error(result.error || 'Failed to update category');
      }
    });
  };

  const handleDelete = async (formData: FormData) => {
    startTransition(async () => {
      const result = await deleteCategoryAction(formData);
      if (result.success) {
        toast.success('Category deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete category');
      }
    });
  };

  return (
    <div className='space-y-4'>
      {categories.map(category => (
        <div key={category.id} className='rounded border p-4'>
          <form
            action={handleUpdate}
            className='grid gap-2 md:grid-cols-2 mb-2'
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
            <FormButton isPending={isPending}>Update</FormButton>
          </form>
          <form action={handleDelete} className='mt-2'>
            <input type='hidden' name='id' value={category.id} />
            <button
              type='submit'
              disabled={isPending}
              className='rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50'
            >
              {isPending ? 'Processing...' : 'Delete'}
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Links({ categories, links }: LinksProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateLinkAction(formData);
      if (result.success) {
        toast.success('Link updated successfully');
      } else {
        toast.error(result.error || 'Failed to update link');
      }
    });
  };

  const handleDelete = async (formData: FormData) => {
    startTransition(async () => {
      const result = await deleteLinkAction(formData);
      if (result.success) {
        toast.success('Link deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete link');
      }
    });
  };

  return (
    <div className='space-y-4'>
      {links.map(link => (
        <div key={link.id} className='rounded border p-4'>
          <form
            action={handleUpdate}
            className='grid gap-2 md:grid-cols-2 mb-2'
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
            <FormButton isPending={isPending}>Update</FormButton>
          </form>
          <form action={handleDelete} className='mt-2'>
            <input type='hidden' name='id' value={link.id} />
            <button
              type='submit'
              disabled={isPending}
              className='rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50'
            >
              {isPending ? 'Processing...' : 'Delete'}
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}

export function AddCategoryForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createCategory(formData);
      if (result.success) {
        toast.success('Category created successfully');
      } else {
        toast.error(result.error || 'Failed to create category');
      }
    });
  };

  return (
    <form
      action={handleSubmit}
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
      <FormButton isPending={isPending} className='md:col-span-2'>
        Create Category
      </FormButton>
    </form>
  );
}

export function AddLinkForm({ categories }: AddLinkFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createLink(formData);
      if (result.success) {
        toast.success('Link created successfully');
      } else {
        toast.error(result.error || 'Failed to create link');
      }
    });
  };

  return (
    <form
      action={handleSubmit}
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
      <FormButton isPending={isPending} className='md:col-span-2'>
        Create Link
      </FormButton>
    </form>
  );
}
