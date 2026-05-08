import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LinkCard } from '../link-card';
import { useFavorites } from '@/lib/hooks/use-favorites';
import type { Link as LinkType } from '@/lib/types';

// Mock the useFavorites hook
jest.mock('@/lib/hooks/use-favorites');

const mockUseFavorites = useFavorites as jest.MockedFunction<
  typeof useFavorites
>;

const mockLink: LinkType = {
  id: '123',
  title: 'Test Link',
  url: 'https://test.com',
  description: 'A test link description',
  categoryId: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
  clicks: 0,
  isFeatured: false,
};

describe('LinkCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
    // Mock window.open
    window.open = jest.fn();
  });

  it('should render link title and description', () => {
    mockUseFavorites.mockReturnValue({
      favoriteIds: new Set(),
      favoritesCount: 0,
      isFavorite: jest.fn(() => false),
      toggleFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      clearAllFavorites: jest.fn(),
    });

    render(<LinkCard link={mockLink} />);

    expect(screen.getByTestId('link-card-title')).toHaveTextContent(
      'Test Link',
    );
    expect(screen.getByTestId('link-card-description')).toHaveTextContent(
      'A test link description',
    );
  });

  it('should render favorite button', () => {
    mockUseFavorites.mockReturnValue({
      favoriteIds: new Set(),
      favoritesCount: 0,
      isFavorite: jest.fn(() => false),
      toggleFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      clearAllFavorites: jest.fn(),
    });

    render(<LinkCard link={mockLink} />);

    expect(screen.getByTestId('favorite-button')).toBeInTheDocument();
  });

  it('should call toggleFavorite when favorite button clicked', () => {
    const toggleFavorite = jest.fn();
    mockUseFavorites.mockReturnValue({
      favoriteIds: new Set(),
      favoritesCount: 0,
      isFavorite: jest.fn(() => false),
      toggleFavorite,
      removeFavorite: jest.fn(),
      clearAllFavorites: jest.fn(),
    });

    render(<LinkCard link={mockLink} />);
    fireEvent.click(screen.getByTestId('favorite-button'));

    expect(toggleFavorite).toHaveBeenCalledWith(mockLink);
  });

  it('should show filled heart when favorited', () => {
    mockUseFavorites.mockReturnValue({
      favoriteIds: new Set(['123']),
      favoritesCount: 1,
      isFavorite: jest.fn(() => true),
      toggleFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      clearAllFavorites: jest.fn(),
    });

    render(<LinkCard link={mockLink} />);

    const button = screen.getByTestId('favorite-button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('should open preview dialog on card click', async () => {
    mockUseFavorites.mockReturnValue({
      favoriteIds: new Set(),
      favoritesCount: 0,
      isFavorite: jest.fn(() => false),
      toggleFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      clearAllFavorites: jest.fn(),
    });

    render(<LinkCard link={mockLink} />);

    const card = screen.getByTestId('link-card');
    fireEvent.click(card);

    // Wait for the dialog to open - check for the "Open Resource" button which is only in the dialog
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /open resource/i }),
      ).toBeInTheDocument();
    });
  });

  it('should copy link URL to clipboard when copy button clicked', async () => {
    mockUseFavorites.mockReturnValue({
      favoriteIds: new Set(),
      favoritesCount: 0,
      isFavorite: jest.fn(() => false),
      toggleFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      clearAllFavorites: jest.fn(),
    });

    render(<LinkCard link={mockLink} />);

    const copyButton = screen.getByRole('button', { name: /copy link/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'https://test.com',
      );
    });
  });

  it('should track link click when open resource button clicked', async () => {
    mockUseFavorites.mockReturnValue({
      favoriteIds: new Set(),
      favoritesCount: 0,
      isFavorite: jest.fn(() => false),
      toggleFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      clearAllFavorites: jest.fn(),
    });

    // Mock trackLinkClick
    const mockTrackLinkClick = jest.fn();
    jest.mock('@/app/actions', () => ({
      trackLinkClick: mockTrackLinkClick,
    }));

    render(<LinkCard link={mockLink} />);

    // Open the preview dialog by clicking the card
    const card = screen.getByTestId('link-card');
    fireEvent.click(card);

    // Wait for dialog to open and click the open resource button
    const openButton = await screen.findByRole('button', {
      name: /open resource/i,
    });
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        'https://test.com',
        '_blank',
        'noopener,noreferrer',
      );
    });
  });

  it('should render icon when icon is an emoji', () => {
    const linkWithEmoji = { ...mockLink, icon: '🚀' };
    mockUseFavorites.mockReturnValue({
      favoriteIds: new Set(),
      favoritesCount: 0,
      isFavorite: jest.fn(() => false),
      toggleFavorite: jest.fn(),
      removeFavorite: jest.fn(),
      clearAllFavorites: jest.fn(),
    });

    render(<LinkCard link={linkWithEmoji} />);

    expect(screen.getByText('🚀')).toBeInTheDocument();
  });
});
