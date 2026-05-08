import { renderHook, act } from '@testing-library/react';
import { useFavorites, resetFavoritesStore } from '../use-favorites';
import type { Link } from '@/lib/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useFavorites', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    resetFavoritesStore();
  });

  it('should initialize with empty favorites', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favoritesCount).toBe(0);
    expect(result.current.favoriteIds.size).toBe(0);
  });

  it('should add a favorite', () => {
    const { result } = renderHook(() => useFavorites());
    const testLink: Link = {
      id: '123',
      title: 'Test',
      url: 'https://test.com',
      categoryId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      clicks: 0,
      isFeatured: false,
    };

    act(() => {
      result.current.toggleFavorite(testLink);
    });

    expect(result.current.favoritesCount).toBe(1);
    expect(result.current.isFavorite('123')).toBe(true);
  });

  it('should remove a favorite', () => {
    const { result } = renderHook(() => useFavorites());
    const testLink: Link = {
      id: '123',
      title: 'Test',
      url: 'https://test.com',
      categoryId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      clicks: 0,
      isFeatured: false,
    };

    act(() => {
      result.current.toggleFavorite(testLink);
    });
    expect(result.current.favoritesCount).toBe(1);

    act(() => {
      result.current.removeFavorite('123');
    });

    expect(result.current.favoritesCount).toBe(0);
    expect(result.current.isFavorite('123')).toBe(false);
  });

  it('should toggle favorite off when already favorited', () => {
    const { result } = renderHook(() => useFavorites());
    const testLink: Link = {
      id: '123',
      title: 'Test',
      url: 'https://test.com',
      categoryId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      clicks: 0,
      isFeatured: false,
    };

    act(() => {
      result.current.toggleFavorite(testLink);
    });
    expect(result.current.favoritesCount).toBe(1);

    act(() => {
      result.current.toggleFavorite(testLink);
    });

    expect(result.current.favoritesCount).toBe(0);
  });

  it('should clear all favorites', () => {
    const { result } = renderHook(() => useFavorites());
    const links: Link[] = [
      {
        id: '1',
        title: 'Link 1',
        url: 'https://1.com',
        categoryId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        clicks: 0,
        isFeatured: false,
      },
      {
        id: '2',
        title: 'Link 2',
        url: 'https://2.com',
        categoryId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        clicks: 0,
        isFeatured: false,
      },
      {
        id: '3',
        title: 'Link 3',
        url: 'https://3.com',
        categoryId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        clicks: 0,
        isFeatured: false,
      },
    ];

    // Add each link in a separate act block to ensure state updates
    act(() => {
      result.current.toggleFavorite(links[0]);
    });
    expect(result.current.favoritesCount).toBe(1);

    act(() => {
      result.current.toggleFavorite(links[1]);
    });
    expect(result.current.favoritesCount).toBe(2);

    act(() => {
      result.current.toggleFavorite(links[2]);
    });
    expect(result.current.favoritesCount).toBe(3);

    act(() => {
      result.current.clearAllFavorites();
    });

    expect(result.current.favoritesCount).toBe(0);
  });

  it('should persist favorites to localStorage', () => {
    const { result } = renderHook(() => useFavorites());
    const testLink: Link = {
      id: '123',
      title: 'Test',
      url: 'https://test.com',
      categoryId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      clicks: 0,
      isFeatured: false,
    };

    act(() => {
      result.current.toggleFavorite(testLink);
    });

    const stored = JSON.parse(
      localStorageMock.getItem('design-resources-favorites') || '[]',
    );
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('123');
  });

  it('should load favorites from localStorage on mount', () => {
    const existingFavorites = [{ id: '456', addedAt: Date.now() }];
    localStorageMock.setItem(
      'design-resources-favorites',
      JSON.stringify(existingFavorites),
    );

    const { result } = renderHook(() => useFavorites());

    expect(result.current.favoritesCount).toBe(1);
    expect(result.current.isFavorite('456')).toBe(true);
  });
});
