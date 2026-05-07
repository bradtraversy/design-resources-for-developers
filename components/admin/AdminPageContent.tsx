'use client';

import { useState } from 'react';
import { Category, Link } from '@/lib/types';
import { AdminSearchInput } from '@/components/admin/AdminSearchInput';
import {
  AddCategoryForm,
  AddLinkForm,
  Categories,
  Links,
} from '@/components/admin/AdminForms';

interface AdminPageContentProps {
  categories: Category[];
  links: Link[];
}

export function AdminPageContent({ categories, links }: AdminPageContentProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const trimmedSearchTerm = searchTerm.trim();

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(trimmedSearchTerm.toLowerCase()),
  );

  const filteredLinks = links.filter(
    link =>
      link.title.toLowerCase().includes(trimmedSearchTerm.toLowerCase()) ||
      link.url.toLowerCase().includes(trimmedSearchTerm.toLowerCase()) ||
      link.description?.toLowerCase().includes(trimmedSearchTerm.toLowerCase()),
  );

  return (
    <>
      <div className='mb-6'>
        <AdminSearchInput
          placeholder='Search categories and links...'
          className='w-full max-w-md'
          onSearch={query => setSearchTerm(query)}
        />
      </div>

      <section className='mb-10'>
        <h2 className='mb-2 text-xl font-semibold'>Add Category</h2>
        <AddCategoryForm />
      </section>

      <section className='mb-10'>
        <h2 className='mb-2 text-xl font-semibold'>Update Category</h2>
        <Categories categories={filteredCategories} />
      </section>

      <section className='mb-10'>
        <h2 className='mb-2 text-xl font-semibold'>Add Link</h2>
        <AddLinkForm categories={categories} />
      </section>

      <section>
        <h2 className='mb-2 text-xl font-semibold'>Existing Links</h2>
        <Links categories={categories} links={filteredLinks} />
      </section>
    </>
  );
}
