import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { searchLinksAction, getCategoriesAction } from '../actions';
import { LinkCard } from '@/components/link-card';
import { LinkGridSkeleton, NavSkeleton } from '@/components/skeletons';
import { CategoryNav } from '@/components/category-nav';
import { ViewToggle } from '@/components/view-toggle';
import type { Link as LinkType } from '@/lib/types';
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

type ViewMode = 'grid' | 'list';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    view?: string;
  }>;
}

const ITEMS_PER_PAGE = 9;

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() || '';
  return {
    title: `Search results for "${query}" - Design Resources`,
    description: `Search results for "${query}" among curated design resources`,
  };
}

async function CategoriesNav() {
  const categories = await getCategoriesAction();
  return <CategoryNav categories={categories} />;
}

async function SearchResults({
  query,
  page,
  view,
}: {
  query: string;
  page: number;
  view: ViewMode;
}) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const [result, categories] = await Promise.all([
    searchLinksAction(query),
    getCategoriesAction(),
  ]);

  if (!result.success) {
    return (
      <div className='text-center py-12'>
        <p className='text-red-500 dark:text-red-400'>
          Error searching: {result.error}
        </p>
      </div>
    );
  }

  const allLinks = result.data;
  const totalLinks = allLinks?.length ?? 0;
  const totalPages = Math.ceil(totalLinks / ITEMS_PER_PAGE);
  const paginatedLinks = allLinks?.slice(skip, skip + ITEMS_PER_PAGE) ?? [];

  if (!paginatedLinks || paginatedLinks.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-slate-500 dark:text-slate-400'>
          No results found for &quot;{query}&quot;. Try a different search term.
        </p>
      </div>
    );
  }

  // Create a map of categoryId to category name
  const categoryMap = categories.reduce((acc, category) => {
    acc[category.id] = category.name;
    return acc;
  }, {} as Record<string, string>);

  // Group links by category for better organization
  const linksByCategory = paginatedLinks.reduce((acc, link) => {
    if (!acc[link.categoryId]) {
      acc[link.categoryId] = {
        categoryId: link.categoryId,
        categoryName: categoryMap[link.categoryId] || 'Unknown Category',
        links: [],
      };
    }
    acc[link.categoryId].links.push(link);
    return acc;
  }, {} as Record<string, { categoryId: string; categoryName: string; links: LinkType[] }>);

  return (
    <div className='space-y-8'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100'>
          Search Results
        </h1>
        <p className='mt-2 text-slate-500 dark:text-slate-400'>
          Found {totalLinks} result{totalLinks !== 1 ? 's' : ''} for &quot;
          {query}&quot; — Page {page} of {totalPages}
        </p>
      </div>

      {Object.values(linksByCategory).map(
        ({ categoryId, categoryName, links: categoryLinks }) => (
          <section key={categoryId} className='space-y-4'>
            <h2 className='text-xl font-semibold text-slate-800 dark:text-slate-200'>
              {categoryName}
            </h2>
            <div
              className={cn(
                'stagger-children',
                view === 'list'
                  ? 'flex flex-col gap-2'
                  : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
              )}
            >
              {categoryLinks.map((link, index) => (
                <LinkCard key={link.id} link={link} index={index} view={view} />
              ))}
            </div>
          </section>
        ),
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className='mt-8'>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href={`/search?q=${query}&page=${page - 1}`}
                />
              </PaginationItem>
            )}

            {/* First page */}
            <PaginationItem>
              <PaginationLink
                href={`/search?q=${query}&page=1`}
                isActive={page === 1}
              >
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
                <PaginationLink href={`/search?q=${query}&page=${page - 1}`}>
                  {page - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Current page */}
            {page !== 1 && page !== totalPages && (
              <PaginationItem>
                <PaginationLink
                  href={`/search?q=${query}&page=${page}`}
                  isActive
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Next page */}
            {page < totalPages - 1 && (
              <PaginationItem>
                <PaginationLink href={`/search?q=${query}&page=${page + 1}`}>
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
                  href={`/search?q=${query}&page=${totalPages}`}
                  isActive={page === totalPages}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            {page < totalPages && (
              <PaginationItem>
                <PaginationNext href={`/search?q=${query}&page=${page + 1}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

function LoadingState() {
  return <LinkGridSkeleton count={6} />;
}

function ViewToggleWrapper() {
  return <ViewToggle className='hidden sm:block' />;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page, view } = await searchParams;
  const query = q?.trim();
  const currentPage = page ? parseInt(page, 10) : 1;
  const validPage = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;
  const currentView = (view as ViewMode) || 'grid';

  if (!query) {
    notFound();
  }

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
        {/* Category Navigation */}
        <div className='mb-8'>
          <Suspense fallback={<NavSkeleton />}>
            <CategoriesNav />
          </Suspense>
        </div>

        {/* View Toggle */}
        <div className='flex justify-end mb-4'>
          <Suspense fallback={null}>
            <ViewToggleWrapper />
          </Suspense>
        </div>

        {/* Search Results */}
        <Suspense fallback={<LoadingState />}>
          <SearchResults query={query} page={validPage} view={currentView} />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className='border-t border-slate-200 dark:border-slate-800 mt-16'>
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
