'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FavoritesButton } from '@/components/favorites-button';
import { Autocomplete } from '@/components/autocomplete';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300 bg-white/78 backdrop-blur-xl border-b border-slate-200/50 dark:bg-slate-950/78 dark:border-slate-800/60',
          isScrolled &&
            'bg-white/88 backdrop-blur-xl border-b border-slate-200/70 shadow-sm dark:bg-slate-950/88 dark:border-slate-800/70 dark:shadow-sm',
          className,
        )}
      >
        <div className='container mx-auto px-4 py-3 max-w-7xl'>
          <div className='flex items-center justify-between gap-4'>
            {/* Logo/Brand - Bold Typography */}
            <div className='flex items-center gap-3 shrink-0'>
              <Link
                href='/'
                className='flex items-center gap-3 hover:opacity-80 transition-all duration-300 group'
                aria-label='Design Resources for Developers'
              >
                <div className='relative'>
                  <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300'>
                    <svg
                      className='w-5 h-5 text-white'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <polygon points='12 2 2 7 12 12 22 7 12 2' />
                      <polyline points='2 17 12 22 22 17' />
                      <polyline points='2 12 12 17 22 12' />
                    </svg>
                  </div>
                  <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-gradient-to-tr from-cyan-400 to-pink-500 animate-pulse' />
                </div>
                <span className='font-display font-bold text-xl tracking-tight text-foreground hidden sm:block'>
                  Design
                  <span className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600'>
                    Resources
                  </span>
                </span>
              </Link>
            </div>

            {/* Desktop Search - Glass Card */}
            <div className='hidden md:block flex-1 max-w-xl mx-4'>
              <div className='glass-strong rounded-xl px-1 py-1.5'>
                <Autocomplete
                  placeholder='Search all resources...'
                  onSearch={query => {
                    if (query.trim()) {
                      router.push(
                        `/search?q=${encodeURIComponent(query.trim())}`,
                      );
                    }
                  }}
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className='flex items-center gap-1.5'>
              {/* Desktop Favorites Button */}
              <div className='hidden md:block'>
                <FavoritesButton />
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant='ghost'
                size='icon'
                className='md:hidden relative'
                onClick={toggleMobileMenu}
                aria-label='Toggle search'
              >
                {isMobileMenuOpen ? (
                  <X className='w-5 h-5' />
                ) : (
                  <Search className='w-5 h-5' />
                )}
              </Button>

              {/* Mobile Favorites Button */}
              <div className='md:hidden'>
                <FavoritesButton />
              </div>
            </div>
          </div>

          {/* Mobile Search Panel - Glass Effect */}
          {isMobileMenuOpen && (
            <div className='md:hidden mt-3 p-3 animate-fade-in'>
              <div className='glass-strong rounded-xl p-1.5'>
                <Autocomplete
                  placeholder='Search all resources...'
                  onSearch={query => {
                    if (query.trim()) {
                      router.push(
                        `/search?q=${encodeURIComponent(query.trim())}`,
                      );
                      setIsMobileMenuOpen(false);
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
