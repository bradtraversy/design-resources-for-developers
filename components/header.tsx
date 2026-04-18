'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FavoritesButton } from '@/components/favorites-button';
import { Autocomplete } from '@/components/autocomplete';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <div className='hidden md:block flex-1 max-w-xl mx-4'>
            <Autocomplete placeholder='Search all resources...' />
          </div>

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
            <Autocomplete placeholder='Search all resources...' />
          </div>
        )}
      </div>
    </header>
  );
}
