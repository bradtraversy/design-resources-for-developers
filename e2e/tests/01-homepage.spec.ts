import { test, expect } from '../fixtures/test-fixtures';
import { selectors, urls } from '../helpers/selectors';
import { helpers } from '../fixtures/test-fixtures';

test.describe('Homepage', () => {
  test('should load the homepage with all resources', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    // Check page title
    await expect(page).toHaveTitle(/Design Resources for Developers/);

    // Check site header is present
    await expect(page.locator(selectors.siteHeader)).toBeVisible();

    // Check category navigation is present
    await expect(page.locator(selectors.categoryNav)).toBeVisible();

    // Check link cards are displayed
    const linkCards = page.locator(selectors.linkCards);
    const count = await linkCards.count();
    expect(count).toBeGreaterThan(0);

    // Check pagination is present if there are enough links
    const pagination = page.locator(selectors.pagination);
    if (await pagination.isVisible()) {
      expect(await pagination.count()).toBe(1);
    }
  });

  test('should display resources in grid view by default', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    // Grid view should be active (default)
    const gridButton = page.locator(selectors.viewToggleGrid);
    await expect(gridButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should toggle between grid and list view', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    // Initially grid view
    await expect(page.locator(selectors.viewToggleGrid)).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Switch to list view
    await helpers.switchViewMode(page, 'list');
    await expect(page.locator(selectors.viewToggleList)).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Switch back to grid view
    await helpers.switchViewMode(page, 'grid');
    await expect(page.locator(selectors.viewToggleGrid)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('should navigate to next page using pagination', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    // Check if pagination exists (only if there are enough items)
    const pagination = page.locator(selectors.pagination);
    if (await pagination.isVisible()) {
      const nextButton = page.locator(selectors.paginationNext);
      if (await nextButton.isEnabled()) {
        // Get first card title before navigation
        const firstCardTitle = await page
          .locator(selectors.linkCardTitle)
          .first()
          .textContent();

        // Navigate to next page
        await helpers.goToNextPage(page);

        // Verify we're on page 2 (URL should have ?page=2)
        expect(page.url()).toContain('page=2');

        // Verify content changed (first card should be different)
        const newFirstCardTitle = await page
          .locator(selectors.linkCardTitle)
          .first()
          .textContent();
        expect(newFirstCardTitle).not.toBe(firstCardTitle);
      }
    } else {
      test.skip(true, 'No pagination needed for current dataset');
    }
  });

  test('should filter resources by category', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    // Get all category links
    const categoryLinks = page.locator(selectors.categoryLinks);
    const categoryCount = await categoryLinks.count();

    if (categoryCount > 0) {
      // Click on the first category
      const firstCategory = categoryLinks.first();
      const categoryName = await firstCategory.textContent();
      await firstCategory.click();
      await helpers.waitForPageLoad(page);

      // Verify we're on a category page
      expect(page.url()).toContain('/');
      expect(page.url()).not.toBe(urls.home);

      // Verify page title contains category name
      await expect(page.locator(selectors.pageTitle)).toContainText(
        categoryName || '',
      );
    }
  });

  test('should have functional favorite buttons on each card', async ({
    page,
  }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    const favoriteButtons = page.locator(selectors.linkCardFavoriteButton);
    const buttonCount = await favoriteButtons.count();

    expect(buttonCount).toBeGreaterThan(0);

    // Test clicking a favorite button
    const firstButton = favoriteButtons.first();
    await firstButton.click();

    // Check for toast notification or visual feedback
    // The button state should change
    await expect(firstButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should display link card with required information', async ({
    page,
  }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    const firstCard = page.locator(selectors.linkCards).first();

    // Each card should have a title
    await expect(firstCard.locator(selectors.linkCardTitle)).toBeVisible();

    // Description might be optional, so we just check the element exists

    // Each card should have a favorite button
    await expect(
      firstCard.locator(selectors.linkCardFavoriteButton),
    ).toBeAttached();
  });
});
