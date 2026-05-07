'use client';

import { useState, useTransition } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

// Category Update Modal Component
function CategoryUpdateModal({
  category,
  onUpdate,
}: {
  category: Category;
  onUpdate: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleUpdate = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateCategoryAction(formData);
      if (result.success) {
        toast.success('Category updated successfully');
        setOpen(false);
        onUpdate();
      } else {
        toast.error(result.error || 'Failed to update category');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          Update
        </Button>
      </DialogTrigger>
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle>Update Category</DialogTitle>
        </DialogHeader>
        <form action={handleUpdate} className='grid gap-4'>
          <input type='hidden' name='id' value={category.id} />
          <div>
            <label className='block text-sm font-medium mb-1'>Name</label>
            <input
              name='name'
              defaultValue={category.name}
              required
              className='w-full rounded border px-3 py-2'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Description
            </label>
            <input
              name='description'
              defaultValue={category.description ?? ''}
              className='w-full rounded border px-3 py-2'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Icon</label>
            <input
              name='icon'
              defaultValue={category.icon ?? ''}
              placeholder='Emoji or image URL (e.g., https://example.com/icon.png)'
              className='w-full rounded border px-3 py-2'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Color</label>
            <input
              name='color'
              defaultValue={category.color ?? ''}
              className='w-full rounded border px-3 py-2'
            />
          </div>
          <Button type='submit' disabled={isPending}>
            {isPending ? 'Processing...' : 'Update Category'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Category Delete Modal Component
function CategoryDeleteModal({
  category,
  onDelete,
}: {
  category: Category;
  onDelete: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('id', category.id);
      const result = await deleteCategoryAction(formData);
      if (result.success) {
        toast.success('Category deleted successfully');
        setOpen(false);
        onDelete();
      } else {
        toast.error(result.error || 'Failed to delete category');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='destructive' size='sm'>
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
        </DialogHeader>
        <div className='py-4'>
          <p>
            Are you sure you want to delete the category{' '}
            <strong>{category.name}</strong>?
          </p>
          <p className='text-sm text-gray-500 mt-2'>
            This action cannot be undone.
          </p>
        </div>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Processing...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Categories({ categories }: CategoriesProps) {
  const [, startTransition] = useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      // Refresh the page to get updated data
      window.location.reload();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      // Refresh the page to get updated data
      window.location.reload();
    });
  };

  return (
    <div className='space-y-4'>
      {categories.map(category => (
        <div key={category.id} className='rounded border p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold'>{category.name}</h3>
              {category.description && (
                <p className='text-sm text-gray-600'>{category.description}</p>
              )}
            </div>
            <div className='flex gap-2'>
              <CategoryUpdateModal
                category={category}
                onUpdate={handleUpdate}
              />
              <CategoryDeleteModal
                category={category}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Link Update Modal Component
function LinkUpdateModal({
  link,
  categories,
  onUpdate,
}: {
  link: Link;
  categories: Category[];
  onUpdate: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleUpdate = async (formData: FormData) => {
    startTransition(async () => {
      const result = await updateLinkAction(formData);
      if (result.success) {
        toast.success('Link updated successfully');
        setOpen(false);
        onUpdate();
      } else {
        toast.error(result.error || 'Failed to update link');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          Update
        </Button>
      </DialogTrigger>
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle>Update Link</DialogTitle>
        </DialogHeader>
        <form action={handleUpdate} className='grid gap-4'>
          <input type='hidden' name='id' value={link.id} />
          <div>
            <label className='block text-sm font-medium mb-1'>Title</label>
            <input
              name='title'
              defaultValue={link.title}
              required
              className='w-full rounded border px-3 py-2'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>URL</label>
            <input
              name='url'
              defaultValue={link.url}
              required
              className='w-full rounded border px-3 py-2'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>
              Description
            </label>
            <input
              name='description'
              defaultValue={link.description ?? ''}
              className='w-full rounded border px-3 py-2'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Icon</label>
            <input
              name='icon'
              defaultValue={link.icon ?? ''}
              placeholder='Emoji or image URL (e.g., https://example.com/icon.png)'
              className='w-full rounded border px-3 py-2'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Category</label>
            <select
              name='categoryId'
              defaultValue={link.categoryId}
              required
              className='w-full rounded border px-3 py-2'
            >
              <option value=''>Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <Button type='submit' disabled={isPending}>
            {isPending ? 'Processing...' : 'Update Link'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Link Delete Modal Component
function LinkDeleteModal({
  link,
  onDelete,
}: {
  link: Link;
  onDelete: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('id', link.id);
      const result = await deleteLinkAction(formData);
      if (result.success) {
        toast.success('Link deleted successfully');
        setOpen(false);
        onDelete();
      } else {
        toast.error(result.error || 'Failed to delete link');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='destructive' size='sm'>
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className='bg-white'>
        <DialogHeader>
          <DialogTitle>Delete Link</DialogTitle>
        </DialogHeader>
        <div className='py-4'>
          <p>
            Are you sure you want to delete the link{' '}
            <strong>{link.title}</strong>?
          </p>
          <p className='text-sm text-gray-500 mt-2'>
            This action cannot be undone.
          </p>
        </div>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Processing...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Links({ categories, links }: LinksProps) {
  const [, startTransition] = useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      // Refresh the page to get updated data
      window.location.reload();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      // Refresh the page to get updated data
      window.location.reload();
    });
  };

  return (
    <div className='space-y-4'>
      {links.map(link => (
        <div key={link.id} className='rounded border p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold'>{link.title}</h3>
              <p className='text-sm text-gray-600'>{link.url}</p>
              {link.description && (
                <p className='text-sm text-gray-500'>{link.description}</p>
              )}
            </div>
            <div className='flex gap-2'>
              <LinkUpdateModal
                link={link}
                categories={categories}
                onUpdate={handleUpdate}
              />
              <LinkDeleteModal link={link} onDelete={handleDelete} />
            </div>
          </div>
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
        placeholder='Emoji or image URL (e.g., https://example.com/icon.png)'
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
        placeholder='Emoji or image URL (e.g., https://example.com/icon.png)'
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
