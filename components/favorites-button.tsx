'use client';
/* eslint-disable react-hooks/rules-of-hooks */

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useFavorites } from '@/lib/hooks/use-favorites';
import { useEffect, useState } from 'react';

export function FavoritesButton() {
  const { favoritesCount } = useFavorites();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/rules-of-hooks
  }, []);

  // During SSR and initial hydration, don't show the badge to avoid mismatch
  const displayCount = mounted ? favoritesCount : 0;

  return (
    <Link
      href='/favorites'
      className='inline-flex items-center justify-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative'
      aria-label={`Favorites${displayCount > 0 ? ` (${displayCount})` : ''}`}
      title='Favorites'
    >
      <Heart className='w-5 h-5 text-slate-600 dark:text-slate-300' />
      {displayCount > 0 && (
        <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white'>
          {displayCount > 9 ? '9+' : displayCount}
        </span>
      )}
    </Link>
  );
}
