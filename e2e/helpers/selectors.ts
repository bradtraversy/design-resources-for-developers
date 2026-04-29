/**
 * Common selectors for the Design Resources for Developers app
 */

export const selectors = {
  // Navigation - Site header (sticky top header with unique classes)
  siteHeader: 'header.sticky',
  logo: 'header a[href="/"]',
  categoryNav: '[data-testid="category-nav"]',
  categoryLinks: '[data-testid="category-nav"] a',
  viewToggleGrid: 'button[aria-label="Grid view"]',
  viewToggleList: 'button[aria-label="List view"]',

  // Search
  searchInput: 'input[name="q"]',
  searchButton: 'button[type="submit"]',
  searchForm: 'form[role="search"]',
  searchResults: '[data-testid="search-results"]',

  // Links/Resources
  linkCards: '[data-testid="link-card"]',
  linkCardTitle: '[data-testid="link-card-title"]',
  linkCardDescription: '[data-testid="link-card-description"]',
  linkCardCategory: '[data-testid="link-card-category"]',
  linkCardFavoriteButton: '[data-testid="favorite-button"]',

  // Pagination
  pagination: '[data-testid="pagination"]',
  paginationNext: 'a[aria-label="Next"]',
  paginationPrevious: 'a[aria-label="Previous"]',
  paginationPage: 'a[aria-label*="Page"]',

  // Favorites page
  favoritesPage: '[data-testid="favorites-page"]',
  emptyFavorites: '[data-testid="empty-favorites"]',

  // Notifications/Toasts
  toast: '[role="alert"]',

  // General
  pageTitle: 'h1',
  loadingSpinner: '[data-testid="loading"]',
  errorMessage: '[role="alert"]',
};

export const urls = {
  home: '/',
  search: '/search',
  favorites: '/favorites',
};
