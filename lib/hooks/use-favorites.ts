'use client';

import { useSyncExternalStore, useCallback, useEffect } from 'react';
import type { Link } from '@/lib/types';

const FAVORITES_STORAGE_KEY = 'design-resources-favorites';

interface StoredFavorite {
  id: string;
  addedAt: number;
}

// Module-level store (shared across all hook instances)
let favorites: StoredFavorite[] = [];
const subscribers = new Set<() => void>();
let initialized = false;

// Cache empty array for server snapshot to avoid infinite loop
const emptyFavorites: StoredFavorite[] = [];

function getFavorites(): StoredFavorite[] {
  return favorites;
}

function setFavorites(newFavorites: StoredFavorite[]): void {
  favorites = newFavorites;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }
  // Notify all subscribers
  subscribers.forEach(sub => sub());
}

function subscribe(callback: () => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function getSnapshot(): StoredFavorite[] {
  return getFavorites();
}

function getServerSnapshot(): StoredFavorite[] {
  // On server, return cached empty array
  return emptyFavorites;
}

export function useFavorites() {
  const storedFavorites = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Initialize from localStorage on mount (client only)
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialized) {
      initialized = true;
      try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
          const parsed: StoredFavorite[] = JSON.parse(stored);
          setFavorites(parsed);
        } else {
          setFavorites([]);
        }
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const favoriteIds = new Set(storedFavorites.map(f => f.id));
  const favoritesCount = storedFavorites.length;

  const isFavorite = useCallback(
    (linkId: string) => {
      return favoriteIds.has(linkId);
    },
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    (link: Link) => {
      const hasId = storedFavorites.some(f => f.id === link.id);
      const newFavorites = hasId
        ? storedFavorites.filter(f => f.id !== link.id)
        : [...storedFavorites, { id: link.id, addedAt: Date.now() }];
      setFavorites(newFavorites);
    },
    [storedFavorites],
  );

  const removeFavorite = useCallback(
    (linkId: string) => {
      const newFavorites = storedFavorites.filter(f => f.id !== linkId);
      setFavorites(newFavorites);
    },
    [storedFavorites],
  );

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favoriteIds,
    favoritesCount,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearAllFavorites,
  };
}
