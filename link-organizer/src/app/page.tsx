import { Suspense } from 'react';
import type { Metadata } from 'next';
import {
  getCategoriesAction,
  getAllCategoriesWithLinksAction,
} from './actions';
import { CategoryNav } from '@/components/category-nav';
import { LinkCard } from '@/components/link-card';
import {
  LinkGridSkeleton,
  PageSkeleton,
  NavSkeleton,
} from '@/components/skeletons';

export const metadata: Metadata = {
  title: 'Design Resources for Developers',
  description:
    'Discover the best design resources for your web and mobile projects',
};

async function CategoriesNav() {
  const categories = await getCategoriesAction();
  return <CategoryNav categories={categories} />;
}

async function LinksByCategory() {
  const categoriesWithLinks = await getAllCategoriesWithLinksAction();

  if (categoriesWithLinks.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-slate-500 dark:text-slate-400'>
          No categories found. Add some categories to get started!
        </p>
      </div>
    );
  }

  // Get the first (default) category for the home page
  const defaultCategory = categoriesWithLinks[0];

  return (
    <div className='space-y-12'>
      {/* Single category display on home - UI Graphics */}
      <section className='space-y-6'>
        <header className='space-y-2'>
          <h2 className='text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100'>
            {defaultCategory.name}
          </h2>
          {defaultCategory.description && (
            <p className='text-slate-500 dark:text-slate-400 max-w-2xl'>
              {defaultCategory.description}
            </p>
          )}
        </header>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children'>
          {defaultCategory.links.map((link, index) => (
            <LinkCard key={link.id} link={link} index={index} />
          ))}
        </div>

        {defaultCategory.links.length === 0 && (
          <p className='text-slate-400 dark:text-slate-500 text-center py-8'>
            No links in this category yet.
          </p>
        )}
      </section>
    </div>
  );
}

function LoadingState() {
  return <PageSkeleton />;
}

export default function HomePage() {
  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
      {/* Background pattern */}
      <div
        className='fixed inset-0 -z-10 opacity-30 dark:opacity-10'
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <main className='container mx-auto px-4 py-8 md:py-12 lg:py-16 max-w-7xl'>
        {/* Header */}
        <header className='text-center mb-12 space-y-4 animate-fade-in'>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight'>
            <span className='gradient-text'>Design Resources</span>
          </h1>
          <p className='text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto'>
            A curated collection of design resources for developers
          </p>
        </header>

        {/* Category Navigation with Suspense */}
        <div className='mb-12'>
          <Suspense fallback={<NavSkeleton />}>
            <CategoriesNav />
          </Suspense>
        </div>

        {/* Links Display */}
        <Suspense fallback={<LinkGridSkeleton />}>
          <LinksByCategory />
        </Suspense>
      </main>

      {/* Footer */}
      <footer
        className='border-t border-slate-200 dark:border-slate-800 mt-16 animate-fade-in'
        style={{ animationDelay: '500ms' }}
      >
        <div className='container mx-auto px-4 py-8 max-w-7xl'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              © {new Date().getFullYear()} Design Resources for Developers
            </p>
            <p className='text-sm text-slate-400 dark:text-slate-500'>
              Curated with ❤️ for the developer community
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
