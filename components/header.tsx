'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FavoritesButton } from '@/components/favorites-button';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      });
    }
  };

  const handleClear = () => {
    setQuery('');
    router.push('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm',
        className,
      )}
    >
      <div className='container mx-auto px-4 py-3 max-w-7xl'>
        <div className='flex items-center justify-between gap-4'>
          {/* Logo/Brand */}
          <div className='flex items-center gap-2 shrink-0'>
            <Link
              href='/'
              className='flex items-center gap-2 hover:opacity-80 transition-opacity'
            >
              <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center'>
                <Search className='w-4 h-4 text-white' />
              </div>
              <span className='font-bold text-lg text-slate-900 dark:text-slate-100 hidden sm:block'>
                Design Resources
              </span>
            </Link>
          </div>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className='hidden md:flex relative flex-1 max-w-xl mx-4'
            role='search'
          >
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
              <Input
                type='search'
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='Search all resources...'
                className='pl-10 pr-10'
                aria-label='Global search'
              />
              {query && (
                <button
                  type='button'
                  onClick={handleClear}
                  className='absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
                  aria-label='Clear search'
                >
                  <X className='w-3 h-3 text-slate-400' />
                </button>
              )}
            </div>
            <Button
              type='submit'
              size='sm'
              disabled={!query.trim() || isPending}
              className='ml-2 shrink-0'
            >
              {isPending ? 'Searching...' : 'Search'}
            </Button>
          </form>

          {/* Right Side Actions */}
          <div className='flex items-center gap-1'>
            {/* Desktop Favorites Button */}
            <div className='hidden md:block'>
              <FavoritesButton />
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant='ghost'
              size='icon'
              className='md:hidden'
              onClick={toggleMobileMenu}
              aria-label='Toggle search'
            >
              <Search className='w-5 h-5' />
            </Button>

            {/* Mobile Favorites Button */}
            <div className='md:hidden'>
              <FavoritesButton />
            </div>
          </div>
        </div>

        {/* Mobile Search Panel */}
        {isMobileMenuOpen && (
          <div className='md:hidden mt-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800'>
            <form onSubmit={handleSearch} role='search'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
                <Input
                  type='search'
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder='Search all resources...'
                  className='pl-10 pr-10'
                  aria-label='Global search'
                  autoFocus
                />
                {query && (
                  <button
                    type='button'
                    onClick={handleClear}
                    className='absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
                    aria-label='Clear search'
                  >
                    <X className='w-3 h-3 text-slate-400' />
                  </button>
                )}
              </div>
              <Button
                type='submit'
                size='sm'
                disabled={!query.trim() || isPending}
                className='mt-2 w-full'
              >
                {isPending ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
