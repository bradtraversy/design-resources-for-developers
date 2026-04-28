'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';

interface CategoryNavProps {
  categories: Category[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className='flex flex-wrap justify-center gap-2 md:gap-3'
      role='navigation'
      aria-label='Category navigation'
    >
      {categories.map((category, index) => {
        const href = `/${category.slug}`;
        const isActive = pathname === href || pathname === `${href}/`;

        return (
          <Link
            key={category.id}
            href={href}
            className={cn(
              'group relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ease-out',
              'hover:scale-105 active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2',
              isActive
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 scale-105'
                : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-300 dark:hover:border-slate-600',
            )}
            style={{
              animationDelay: `${index * 60}ms`,
            }}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className='relative z-10 flex items-center gap-2'>
              {category.icon && (
                <span
                  className={cn(
                    'flex items-center justify-center w-4 h-4 text-sm transition-transform duration-300 group-hover:scale-110',
                    isActive
                      ? 'text-white'
                      : 'text-cyan-500 dark:text-cyan-400',
                  )}
                >
                  {category.icon}
                </span>
              )}
              <span className='font-medium tracking-tight'>
                {category.name}
              </span>
            </span>

            {/* Active indicator glow */}
            {isActive && (
              <span className='absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/50 to-blue-500/50 blur-xl opacity-50 animate-pulse' />
            )}

            {/* Hover shine effect */}
            <span
              className={cn(
                'absolute inset-0 rounded-full overflow-hidden',
                'after:absolute after:inset-0 after:-translate-x-full',
                'after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent',
                'group-hover:after:translate-x-full after:transition-transform after:duration-500',
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
