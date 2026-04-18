'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useFavorites } from '@/lib/hooks/use-favorites';

export function FavoritesButton() {
  const { favoritesCount } = useFavorites();

  return (
    <Link
      href='/favorites'
      className='inline-flex items-center justify-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative'
      aria-label={`Favorites${
        favoritesCount > 0 ? ` (${favoritesCount})` : ''
      }`}
      title='Favorites'
    >
      <Heart className='w-5 h-5 text-slate-600 dark:text-slate-300' />
      {favoritesCount > 0 && (
        <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white'>
          {favoritesCount > 9 ? '9+' : favoritesCount}
        </span>
      )}
    </Link>
  );
}
