import { test as base, expect, Page } from '@playwright/test';
import { selectors, urls } from '../helpers/selectors';

// Extend Playwright's test context with custom properties
type MyFixtures = object;

export const test = base.extend<MyFixtures>({
  // Define custom fixtures here
});

export { expect, selectors, urls };
export type { Page };

// Helper functions for common operations
export const helpers = {
  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(page: Page) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Small buffer for animations
  },

  /**
   * Navigate to a page and wait for it to load
   */
  async navigateTo(page: Page, path: string) {
    await page.goto(path);
    await this.waitForPageLoad(page);
  },

  /**
   * Get all link cards on the page
   */
  async getLinkCards(page: Page) {
    return await page.locator(selectors.linkCards).all();
  },

  /**
   * Get the number of link cards displayed
   */
  async getLinkCardCount(page: Page) {
    return await page.locator(selectors.linkCards).count();
  },

  /**
   * Toggle favorite status on a link card
   */
  async toggleFavorite(page: Page, cardIndex: number = 0) {
    const favoriteButton = page
      .locator(selectors.linkCardFavoriteButton)
      .nth(cardIndex);
    await favoriteButton.click();
  },

  /**
   * Search for a query
   */
  async search(page: Page, query: string) {
    await page.fill(selectors.searchInput, query);
    await page.press(selectors.searchInput, 'Enter');
    await this.waitForPageLoad(page);
  },

  /**
   * Switch view mode (grid/list)
   */
  async switchViewMode(page: Page, mode: 'grid' | 'list') {
    if (mode === 'grid') {
      await page.click(selectors.viewToggleGrid);
    } else {
      await page.click(selectors.viewToggleList);
    }
    await page.waitForTimeout(300); // Wait for view transition
  },

  /**
   * Navigate to next page
   */
  async goToNextPage(page: Page) {
    await page.click(selectors.paginationNext);
    await this.waitForPageLoad(page);
  },

  /**
   * Navigate to previous page
   */
  async goToPreviousPage(page: Page) {
    await page.click(selectors.paginationPrevious);
    await this.waitForPageLoad(page);
  },
};
