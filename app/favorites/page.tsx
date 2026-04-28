import type { Metadata } from 'next';
import { FavoritesClient } from '@/components/favorites-client';

export const metadata: Metadata = {
  title: 'Favorites - Design Resources for Developers',
  description:
    'Your saved design resources - browse and manage your favorite design resources',
  alternates: {
    canonical:
      'https://design-resources-for-developers-tau.vercel.app/favorites',
  },
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
