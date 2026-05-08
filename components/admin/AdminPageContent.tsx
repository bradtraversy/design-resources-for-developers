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
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { BulkImportForm } from '@/components/admin/BulkImportForm';
import { SubmissionsReview } from '@/components/admin/SubmissionsReview';

interface AdminPageContentProps {
  categories: Category[];
  links: Link[];
}

export function AdminPageContent({ categories, links }: AdminPageContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<
    'manage' | 'import' | 'submissions' | 'analytics'
  >('manage');

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
      <div className='mb-6 flex flex-wrap gap-2 border-b pb-4'>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 rounded ${
            activeTab === 'manage' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Manage
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 rounded ${
            activeTab === 'import' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Bulk Import
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded ${
            activeTab === 'submissions'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200'
          }`}
        >
          Submissions
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded ${
            activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'manage' && (
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
      )}

      {activeTab === 'import' && (
        <section className='mb-10'>
          <h2 className='mb-4 text-xl font-semibold'>Bulk Import Resources</h2>
          <BulkImportForm />
        </section>
      )}

      {activeTab === 'submissions' && (
        <section className='mb-10'>
          <h2 className='mb-4 text-xl font-semibold'>Review Submissions</h2>
          <SubmissionsReview />
        </section>
      )}

      {activeTab === 'analytics' && (
        <section className='mb-10'>
          <AnalyticsDashboard />
        </section>
      )}
    </>
  );
}
