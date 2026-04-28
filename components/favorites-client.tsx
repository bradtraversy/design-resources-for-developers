'use client';

import { useEffect, useState } from 'react';
import { Heart, Trash2, ArrowRight, LayoutGrid, List } from 'lucide-react';
import Link from 'next/link';
import { LinkCard } from '@/components/link-card';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/lib/hooks/use-favorites';
import { getAllCategoriesWithLinksAction } from '@/app/actions';
import type { Link as LinkType, CategoryWithLinks } from '@/lib/types';
import { cn } from '@/lib/utils';

const FAVORITES_STORAGE_KEY = 'design-resources-favorites';

interface StoredFavorite {
  id: string;
  addedAt: number;
}

function getStoredFavorites(): StoredFavorite[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

type ViewMode = 'grid' | 'list';

export function FavoritesClient() {
  const [, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteLinks, setFavoriteLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { clearAllFavorites } = useFavorites();

  useEffect(() => {
    async function loadFavorites() {
      const stored = getStoredFavorites();
      setFavoriteIds(new Set(stored.map(f => f.id)));

      if (stored.length === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch all categories with links to find the favorites
      try {
        const categories: CategoryWithLinks[] =
          await getAllCategoriesWithLinksAction({});

        const allLinks: LinkType[] = [];
        categories.forEach(cat => {
          allLinks.push(...cat.links);
        });

        const favoritedLinks = allLinks.filter(link =>
          stored.some(f => f.id === link.id),
        );

        setFavoriteLinks(favoritedLinks);
      } catch (error) {
        console.error('Failed to load favorites:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadFavorites();
  }, []);

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all favorites?')) {
      clearAllFavorites();
      setFavoriteIds(new Set());
      setFavoriteLinks([]);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-slate-50 dark:bg-slate-950'>
        <div className='container mx-auto px-4 py-8 md:py-12 max-w-7xl'>
          <div className='animate-pulse space-y-6'>
            <div className='h-8 bg-slate-200 dark:bg-slate-800 rounded w-48' />
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className='h-32 bg-slate-200 dark:bg-slate-800 rounded-lg'
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
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
        {/* Header */}
        <header className='mb-8 space-y-4 animate-fade-in'>
          <div className='flex items-center gap-3'>
            <div className='p-3 rounded-xl bg-red-100 dark:bg-red-900/30'>
              <Heart className='w-8 h-8 text-red-500 fill-current' />
            </div>
            <div>
              <h1 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100'>
                Favorites
              </h1>
              <p className='text-slate-500 dark:text-slate-400 mt-1'>
                Your saved design resources
              </p>
            </div>
          </div>

          {favoriteLinks.length > 0 && (
            <div className='flex items-center justify-between gap-4 flex-wrap'>
              <span className='text-sm text-slate-500 dark:text-slate-400'>
                {favoriteLinks.length}{' '}
                {favoriteLinks.length === 1 ? 'resource' : 'resources'} saved
              </span>
              <div className='flex items-center gap-2'>
                {/* View Toggle */}
                <div
                  className={cn(
                    'flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
                  )}
                  role='group'
                  aria-label='View toggle'
                >
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'gap-1.5 px-3 h-8',
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-slate-700 shadow-sm'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-700',
                    )}
                    aria-pressed={viewMode === 'grid'}
                    aria-label='Grid view'
                  >
                    <LayoutGrid className='w-4 h-4' />
                    <span className='hidden sm:inline text-sm'>Grid</span>
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'gap-1.5 px-3 h-8',
                      viewMode === 'list'
                        ? 'bg-white dark:bg-slate-700 shadow-sm'
                        : 'hover:bg-slate-200 dark:hover:bg-slate-700',
                    )}
                    aria-pressed={viewMode === 'list'}
                    aria-label='List view'
                  >
                    <List className='w-4 h-4' />
                    <span className='hidden sm:inline text-sm'>List</span>
                  </Button>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleClearAll}
                  className='text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950'
                >
                  <Trash2 className='w-4 h-4 mr-2' />
                  Clear all
                </Button>
              </div>
            </div>
          )}
        </header>

        {/* Content */}
        {favoriteLinks.length === 0 ? (
          <div className='text-center py-16 animate-fade-in'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4'>
              <Heart className='w-8 h-8 text-slate-400' />
            </div>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2'>
              No favorites yet
            </h2>
            <p className='text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6'>
              Start exploring and save your favorite design resources by
              clicking the heart icon on any resource card.
            </p>
            <Link
              href='/'
              className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100 h-10 px-4 py-2'
            >
              <ArrowRight className='w-4 h-4 mr-2' />
              Browse resources
            </Link>
          </div>
        ) : (
          <div
            className={cn(
              'stagger-children',
              viewMode === 'list'
                ? 'flex flex-col gap-2'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
            )}
          >
            {favoriteLinks.map((link, index) => (
              <LinkCard
                key={link.id}
                link={link}
                index={index}
                view={viewMode}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className='border-t border-slate-200 dark:border-slate-800 mt-16 animate-fade-in'
        style={{ animationDelay: '300ms' }}
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
