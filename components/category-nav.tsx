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
      className='flex flex-wrap gap-2 justify-center'
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
              'group relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
              'hover:scale-105 active:scale-95',
              isActive
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700',
            )}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className='relative z-10 flex items-center gap-2'>
              {category.icon && (
                <span className='opacity-70 group-hover:opacity-100 transition-opacity'>
                  ●
                </span>
              )}
              {category.name}
            </span>
            <span
              className={cn(
                'absolute inset-0 rounded-full transition-all duration-300',
                'bg-gradient-to-r from-transparent via-white/10 to-transparent',
                'opacity-0 group-hover:opacity-100',
                isActive ? 'from-white/5' : 'from-transparent',
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
