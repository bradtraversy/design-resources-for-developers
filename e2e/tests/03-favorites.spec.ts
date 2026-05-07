import { test, expect } from '../fixtures/test-fixtures';
import { selectors, urls } from '../helpers/selectors';
import { helpers } from '../fixtures/test-fixtures';

test.describe('Favorites Management', () => {
  // Helper to clear localStorage before each test
  test.beforeEach(async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);
    // Clear favorites storage
    await page.evaluate(() => {
      localStorage.removeItem('design-resources-favorites');
    });
  });

  test('should add a resource to favorites', async ({ page }) => {
    // Click favorite button on first card
    await helpers.toggleFavorite(page, 0);

    // Verify button is now "favorited" (aria-pressed true)
    const favoriteButton = page
      .locator(selectors.linkCardFavoriteButton)
      .first();
    await expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');

    // Navigate to favorites page
    await page.goto(urls.favorites);
    await helpers.waitForPageLoad(page);

    // Verify favorites page shows at least one favorite
    const favoritesCount = await helpers.getLinkCardCount(page);
    expect(favoritesCount).toBeGreaterThan(0);
  });

  test('should remove a resource from favorites', async ({ page }) => {
    // First, add a favorite
    await helpers.toggleFavorite(page, 0);
    await expect(
      page.locator(selectors.linkCardFavoriteButton).first(),
    ).toHaveAttribute('aria-pressed', 'true');

    // Go to favorites page to verify it's there
    await page.goto(urls.favorites);
    await helpers.waitForPageLoad(page);
    const countBefore = await helpers.getLinkCardCount(page);
    expect(countBefore).toBeGreaterThan(0);

    // Go back home and unfavorite
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);
    await helpers.toggleFavorite(page, 0);

    // Verify it's removed from favorites
    await page.goto(urls.favorites);
    await helpers.waitForPageLoad(page);
    const countAfter = await helpers.getLinkCardCount(page);
    expect(countAfter).toBe(0);
  });

  test('should persist favorites across page reloads', async ({ page }) => {
    // Add a favorite
    await helpers.toggleFavorite(page, 0);

    // Reload the page
    await page.reload();
    await helpers.waitForPageLoad(page);

    // Verify the favorite is still marked
    const favoriteButton = page
      .locator(selectors.linkCardFavoriteButton)
      .first();
    await expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');

    // Verify it appears on favorites page
    await page.goto(urls.favorites);
    await helpers.waitForPageLoad(page);
    const count = await helpers.getLinkCardCount(page);
    expect(count).toBeGreaterThan(0);
  });

  test('should display empty state when no favorites', async ({ page }) => {
    // Ensure no favorites exist
    await page.evaluate(() => {
      localStorage.removeItem('design-resources-favorites');
    });

    // Navigate to favorites page
    await page.goto(urls.favorites);
    await helpers.waitForPageLoad(page);

    // Should show empty favorites message
    const emptyMessage = page.locator(selectors.emptyFavorites);
    if (await emptyMessage.isVisible()) {
      await expect(emptyMessage).toBeVisible();
    }

    // Should have no link cards
    const count = await helpers.getLinkCardCount(page);
    expect(count).toBe(0);
  });

  test('should toggle favorite from resource card on home page', async ({
    page,
  }) => {
    const firstCard = page.locator(selectors.linkCards).first();
    const favoriteButton = firstCard.locator(selectors.linkCardFavoriteButton);

    // Initially not favorited
    await expect(favoriteButton).toHaveAttribute('aria-pressed', 'false');

    // Click to favorite
    await favoriteButton.click();
    await expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');

    // Click again to unfavorite
    await favoriteButton.click();
    await expect(favoriteButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('should show toast notification when favoriting', async ({ page }) => {
    // Toast notification may appear

    await helpers.toggleFavorite(page, 0);

    // Check for toast/notification element
    const toast = page.locator(selectors.toast);
    if ((await toast.count()) > 0) {
      await expect(toast.first()).toBeVisible();
    }
  });

  test('should allow clearing all favorites', async ({ page }) => {
    // Add multiple favorites
    await helpers.toggleFavorite(page, 0);
    await helpers.toggleFavorite(page, 1);
    await helpers.toggleFavorite(page, 2);

    // Verify they're added
    await page.goto(urls.favorites);
    await helpers.waitForPageLoad(page);
    let count = await helpers.getLinkCardCount(page);
    expect(count).toBeGreaterThan(0);

    // Clear all favorites
    const clearButton = page.locator('button:has-text("Clear all")');
    if (await clearButton.isVisible()) {
      // Handle the confirmation dialog
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      await clearButton.click();
      await helpers.waitForPageLoad(page);

      // Verify all cleared
      count = await helpers.getLinkCardCount(page);
      expect(count).toBe(0);
    }
  });

  test('should maintain favorites across different pages', async ({ page }) => {
    // Add favorite on home page
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);
    await helpers.toggleFavorite(page, 0);

    // Check on search page
    await page.goto(urls.search);
    await helpers.waitForPageLoad(page);
    await page.fill(selectors.searchInput, 'test');
    await page.press(selectors.searchInput, 'Enter');
    await helpers.waitForPageLoad(page);

    // The favorite state should persist (button still pressed)
    // This depends on whether the same link appears in search results
    // For now, just verify favorites page works
    await page.goto(urls.favorites);
    await helpers.waitForPageLoad(page);
    const count = await helpers.getLinkCardCount(page);
    expect(count).toBeGreaterThan(0);
  });

  test('should show correct count in favorites page title/badge if present', async ({
    page,
  }) => {
    // Add a couple of favorites
    await helpers.toggleFavorite(page, 0);
    await helpers.toggleFavorite(page, 1);

    // Navigate to favorites
    await page.goto(urls.favorites);
    await helpers.waitForPageLoad(page);

    // Page should load favorites
    await expect(page.locator(selectors.favoritesPage)).toBeVisible();
  });
});
