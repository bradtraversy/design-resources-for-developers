'use client';

import { useSyncExternalStore } from 'react';
import { useCallback } from 'react';
import type { Link } from '@/lib/types';

const FAVORITES_STORAGE_KEY = 'design-resources-favorites';
const EMPTY_SET = new Set<string>();

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

function setStoredFavorites(favorites: StoredFavorite[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }
}

// External store for favorites
function createFavoritesStore() {
  let favorites: Set<string> = new Set();
  const listeners: Set<() => void> = new Set();

  if (typeof window !== 'undefined') {
    const stored = getStoredFavorites();
    favorites = new Set(stored.map(f => f.id));
  }

  const getSnapshot = () => favorites;
  const getServerSnapshot = () => EMPTY_SET;

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const notify = () => {
    listeners.forEach(listener => listener());
  };

  const toggle = (link: Link) => {
    if (favorites.has(link.id)) {
      favorites.delete(link.id);
      const stored = getStoredFavorites().filter(f => f.id !== link.id);
      setStoredFavorites(stored);
    } else {
      favorites.add(link.id);
      const stored = getStoredFavorites();
      if (!stored.find(f => f.id === link.id)) {
        stored.push({
          id: link.id,
          addedAt: Date.now(),
        });
        setStoredFavorites(stored);
      }
    }
    notify();
  };

  const remove = (linkId: string) => {
    if (favorites.has(linkId)) {
      favorites.delete(linkId);
      const stored = getStoredFavorites().filter(f => f.id !== linkId);
      setStoredFavorites(stored);
      notify();
    }
  };

  const clear = () => {
    favorites = new Set();
    setStoredFavorites([]);
    notify();
  };

  const has = (linkId: string) => favorites.has(linkId);
  const size = () => favorites.size;

  return {
    getSnapshot,
    getServerSnapshot,
    subscribe,
    toggle,
    remove,
    clear,
    has,
    size,
  };
}

const favoritesStore =
  typeof window !== 'undefined' ? createFavoritesStore() : null;

// Stable references for server-side rendering
const noopSubscribe = () => () => {};
const emptySnapshot = () => EMPTY_SET;

export function useFavorites() {
  const subscribeFn = favoritesStore ? favoritesStore.subscribe : noopSubscribe;
  const snapshotFn = favoritesStore
    ? favoritesStore.getSnapshot
    : emptySnapshot;
  const serverSnapshotFn = favoritesStore
    ? favoritesStore.getServerSnapshot
    : emptySnapshot;

  const favorites = useSyncExternalStore(
    subscribeFn,
    snapshotFn,
    serverSnapshotFn,
  );

  const isFavorite = useCallback((linkId: string) => {
    return favoritesStore?.has(linkId) ?? false;
  }, []);

  const toggleFavorite = useCallback((link: Link) => {
    favoritesStore?.toggle(link);
  }, []);

  const removeFavorite = useCallback((linkId: string) => {
    favoritesStore?.remove(linkId);
  }, []);

  const clearAllFavorites = useCallback(() => {
    favoritesStore?.clear();
  }, []);

  const favoritesCount = favoritesStore?.size() ?? 0;

  return {
    favoriteIds: favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearAllFavorites,
    favoritesCount,
  };
}
