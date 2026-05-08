import React from 'react';
import { render, screen } from '@testing-library/react';
import { FavoritesButton } from '../favorites-button';
import { useFavorites } from '@/lib/hooks/use-favorites';

// Mock the useFavorites hook
jest.mock('@/lib/hooks/use-favorites');

const mockUseFavorites = useFavorites as jest.MockedFunction<
  typeof useFavorites
>;

describe('FavoritesButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without badge when no favorites', () => {
    mockUseFavorites.mockReturnValue({
      favoriteIds: new Set(),
      favoritesCount: 0,
      isFavorite: jest.fn(),
      toggleFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      clearAllFavorites: jest.fn(),
    });

    render(<FavoritesButton />);

    const link = screen.getByRole('link', { name: /favorites/i });
    expect(link).toBeInTheDocument();
    // Badge should not be present when count is 0
    expect(screen.queryByText(/^[0-9]+$/)).not.toBeInTheDocument();
  });

  it('should render badge with count when favorites exist', () => {
    mockUseFavorites.mockReturnValue({
      favoriteIds: new Set(['1', '2', '3']),
      favoritesCount: 3,
      isFavorite: jest.fn(),
      toggleFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      clearAllFavorites: jest.fn(),
    });

    render(<FavoritesButton />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should display 9+ when count exceeds 9', () => {
    mockUseFavorites.mockReturnValue({
      favoriteIds: new Set(Array.from({ length: 15 }, (_, i) => String(i))),
      favoritesCount: 15,
      isFavorite: jest.fn(),
      toggleFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      clearAllFavorites: jest.fn(),
    });

    render(<FavoritesButton />);

    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('should have correct aria-label', () => {
    mockUseFavorites.mockReturnValue({
      favoriteIds: new Set(),
      favoritesCount: 0,
      isFavorite: jest.fn(),
      toggleFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      clearAllFavorites: jest.fn(),
    });

    render(<FavoritesButton />);

    const link = screen.getByRole('link', { name: 'Favorites' });
    expect(link).toHaveAttribute('href', '/favorites');
  });

  it('should display count in aria-label when favorites exist', () => {
    mockUseFavorites.mockReturnValue({
      favoriteIds: new Set(['1']),
      favoritesCount: 1,
      isFavorite: jest.fn(),
      toggleFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      clearAllFavorites: jest.fn(),
    });

    render(<FavoritesButton />);

    const link = screen.getByRole('link', { name: 'Favorites (1)' });
    expect(link).toBeInTheDocument();
  });
});
