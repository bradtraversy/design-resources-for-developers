import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getCategoryBySlugAction,
  getCategoryWithLinksAction,
  getCategoryWithLinksCountAction,
} from '../actions';
import { CategoryNav } from '@/components/category-nav';
import { LinkCard } from '@/components/link-card';
import { SearchInput } from '@/components/search-input';
import { LinkGridSkeleton, NavSkeleton } from '@/components/skeletons';
import { getCategoriesAction } from '../actions';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 9;

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlugAction(slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} - Design Resources`,
    description:
      category.description ||
      `Browse ${category.name} design resources for developers`,
  };
}

async function CategoriesNav() {
  const categories = await getCategoriesAction();
  return <CategoryNav categories={categories} />;
}

async function CategoryContent({ slug, page }: { slug: string; page: number }) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const category = await getCategoryWithLinksAction(slug, {
    limit: ITEMS_PER_PAGE,
    skip,
  });
  const totalLinks = await getCategoryWithLinksCountAction(slug);
  const totalPages = Math.ceil(totalLinks / ITEMS_PER_PAGE);

  if (!category) {
    notFound();
  }

  return (
    <div className='space-y-8'>
      <header className='space-y-4 text-center animate-fade-in'>
        <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight'>
          <span className='gradient-text'>{category.name}</span>
        </h1>
        {category.description && (
          <p className='text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto'>
            {category.description}
          </p>
        )}
      </header>

      {/* Search */}
      <div className='max-w-md mx-auto'>
        <SearchInput placeholder={`Search in ${category.name}...`} />
      </div>

      {/* Links Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children'>
        {category.links.map((link, index) => (
          <LinkCard key={link.id} link={link} index={index} />
        ))}
      </div>

      {category.links.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-slate-500 dark:text-slate-400'>
            No links found in this category yet.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className='mt-8'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`/${slug}${page > 1 ? `?page=${page - 1}` : ''}`}
                aria-disabled={page <= 1}
                className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {/* First page */}
            <PaginationItem>
              <PaginationLink href={`/${slug}?page=1`} isActive={page === 1}>
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
                <PaginationLink href={`/${slug}?page=${page - 1}`}>
                  {page - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Current page */}
            {page !== 1 && page !== totalPages && (
              <PaginationItem>
                <PaginationLink href={`/${slug}?page=${page}`} isActive>
                  {page}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Next page */}
            {page < totalPages - 1 && (
              <PaginationItem>
                <PaginationLink href={`/${slug}?page=${page + 1}`}>
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
                  href={`/${slug}?page=${totalPages}`}
                  isActive={page === totalPages}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                href={`/${slug}${page < totalPages ? `?page=${page + 1}` : ''}`}
                aria-disabled={page >= totalPages}
                className={
                  page >= totalPages ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

async function LoadingState() {
  return <LinkGridSkeleton count={6} />;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 1;
  const validPage = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;

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
        <div className='mb-12'>
          <Suspense fallback={<NavSkeleton />}>
            <CategoriesNav />
          </Suspense>
        </div>

        {/* Category Content */}
        <Suspense fallback={<LoadingState />}>
          <CategoryContent slug={slug} page={validPage} />
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
