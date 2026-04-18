'use client';

import { useState, useCallback } from 'react';
import type { Link } from '@/lib/types';

const FAVORITES_STORAGE_KEY = 'design-resources-favorites';

interface StoredFavorite {
  id: string;
  addedAt: number;
}

// Helper functions for localStorage
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

// Initialize state from localStorage
function getInitialFavorites(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      const parsed: StoredFavorite[] = JSON.parse(stored);
      return new Set(parsed.map(f => f.id));
    }
  } catch {
    // Ignore parse errors
  }
  return new Set();
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] =
    useState<Set<string>>(getInitialFavorites);

  const isFavorite = useCallback(
    (linkId: string) => {
      return favoriteIds.has(linkId);
    },
    [favoriteIds],
  );

  const toggleFavorite = useCallback((link: Link) => {
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(link.id)) {
        newSet.delete(link.id);
        const stored = getStoredFavorites().filter(f => f.id !== link.id);
        setStoredFavorites(stored);
      } else {
        newSet.add(link.id);
        const stored = getStoredFavorites();
        stored.push({ id: link.id, addedAt: Date.now() });
        setStoredFavorites(stored);
      }
      return newSet;
    });
  }, []);

  const removeFavorite = useCallback((linkId: string) => {
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(linkId);
      const stored = getStoredFavorites().filter(f => f.id !== linkId);
      setStoredFavorites(stored);
      return newSet;
    });
  }, []);

  const clearAllFavorites = useCallback(() => {
    setFavoriteIds(new Set());
    setStoredFavorites([]);
  }, []);

  const favoritesCount = favoriteIds.size;

  return {
    favoriteIds,
    favoritesCount,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearAllFavorites,
  };
}
