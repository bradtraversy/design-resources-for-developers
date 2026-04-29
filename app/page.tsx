import { Suspense } from 'react';
import type { Metadata } from 'next';
import {
  getCategoriesAction,
  getAllLinksPaginatedAction,
  getAllLinksCountAction,
  getAllCategoriesWithLinksCountAction,
} from './actions';
import { CategoryNav } from '@/components/category-nav';
import { ViewToggle } from '@/components/view-toggle';
import { LinkCard } from '@/components/link-card';
import { LinkGridSkeleton, NavSkeleton } from '@/components/skeletons';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export const metadata: Metadata = {
  title: 'Design Resources for Developers',
  description:
    'Discover the best design resources for your web and mobile projects',
  alternates: {
    canonical: 'https://design-resources-for-developers-tau.vercel.app/',
  },
};

async function CategoriesNav() {
  const categories = await getCategoriesAction();
  return <CategoryNav categories={categories} />;
}

const ITEMS_PER_PAGE = 12;

type ViewMode = 'grid' | 'list';

interface HomePageProps {
  searchParams: Promise<{
    page?: string;
    view?: string;
  }>;
}

async function LinksByCategory({
  page,
  view,
}: {
  page: number;
  view: ViewMode;
}) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const links = await getAllLinksPaginatedAction({
    limit: ITEMS_PER_PAGE,
    skip,
  });
  const totalLinks = await getAllLinksCountAction();
  const totalPages = Math.ceil(totalLinks / ITEMS_PER_PAGE);

  if (links.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-slate-500 dark:text-slate-400'>
          No links found. Add some links to get started!
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-12'>
      {/* All links display on home page */}
      <section className='space-y-6'>
        <header className='space-y-2'>
          <h2 className='text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-slate-100'>
            All Resources
          </h2>
          <p className='text-slate-500 dark:text-slate-400 max-w-2xl'>
            Browse all design resources across all categories
          </p>
        </header>

        <div
          className={cn(
            'stagger-children',
            view === 'list'
              ? 'flex flex-col gap-2'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
          )}
        >
          {links.map((link, index) => (
            <LinkCard key={link.id} link={link} index={index} view={view} />
          ))}
        </div>

        {links.length === 0 && (
          <p className='text-slate-400 dark:text-slate-500 text-center py-8'>
            No links available yet.
          </p>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className='mt-8'>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={`/?page=${page - 1}`} />
              </PaginationItem>
            )}

            {/* First page */}
            <PaginationItem>
              <PaginationLink href='/?page=1' isActive={page === 1}>
                1
              </PaginationLink>
            </PaginationItem>

            {/* Ellipsis if needed */}
            {page > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Previous page */}
            {page > 2 && (
              <PaginationItem>
                <PaginationLink href={`/?page=${page - 1}`}>
                  {page - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Current page (if not first or last) */}
            {page !== 1 && page !== totalPages && (
              <PaginationItem>
                <PaginationLink href={`/?page=${page}`} isActive>
                  {page}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Next page */}
            {page < totalPages - 1 && (
              <PaginationItem>
                <PaginationLink href={`/?page=${page + 1}`}>
                  {page + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis if needed */}
            {page < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Last page */}
            {totalPages > 1 && (
              <PaginationItem>
                <PaginationLink
                  href={`/?page=${totalPages}`}
                  isActive={page === totalPages}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={`/?page=${page + 1}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

function ViewToggleWrapper() {
  return <ViewToggle className='hidden sm:block' />;
}

async function StatsDisplay() {
  const [totalCategories, totalLinks] = await Promise.all([
    getAllCategoriesWithLinksCountAction(),
    getAllLinksCountAction(),
  ]);

  return (
    <div className='flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400'>
      <div className='flex items-center gap-2'>
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
          />
        </svg>
        <span>
          <strong className='text-slate-700 dark:text-slate-300'>
            {totalCategories}
          </strong>{' '}
          {totalCategories === 1 ? 'category' : 'categories'}
        </span>
      </div>
      <div className='flex items-center gap-2'>
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
          />
        </svg>
        <span>
          <strong className='text-slate-700 dark:text-slate-300'>
            {totalLinks}
          </strong>{' '}
          {totalLinks === 1 ? 'resource' : 'resources'}
        </span>
      </div>
    </div>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { page, view } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 1;
  const validPage = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
  const currentView = (view as ViewMode) || 'grid';

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
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight'>
            <span className='gradient-text'>Design Resources</span>
          </h1>
          <p className='text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto'>
            A curated collection of design resources for developers
          </p>
          <StatsDisplay />
        </header>

        {/* Category Navigation with Suspense */}
        <div className='mb-8 animate-fade-in'>
          <Suspense fallback={<NavSkeleton />}>
            <CategoriesNav />
          </Suspense>
        </div>

        {/* View Toggle */}
        <div className='flex justify-end mb-6 animate-fade-in'>
          <ViewToggleWrapper />
        </div>

        {/* Links Grid/List */}
        <Suspense fallback={<LinkGridSkeleton />}>
          <LinksByCategory page={validPage} view={currentView} />
        </Suspense>
      </main>
    </div>
  );
}
