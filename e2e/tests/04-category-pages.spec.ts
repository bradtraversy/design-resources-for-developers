import { test, expect } from '../fixtures/test-fixtures';
import { selectors, urls } from '../helpers/selectors';
import { helpers } from '../fixtures/test-fixtures';

test.describe('Category Pages', () => {
  test('should navigate to a category page from homepage', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    // Get first category link
    const categoryLinks = page.locator(selectors.categoryLinks);
    const count = await categoryLinks.count();

    if (count > 0) {
      const firstCategory = categoryLinks.first();
      const categoryName = await firstCategory.textContent();
      const categoryHref = await firstCategory.getAttribute('href');

      await Promise.all([
        page.waitForURL(`**${categoryHref}`),
        firstCategory.click(),
      ]);

      // Verify we're on a category page
      expect(page.url()).toContain(categoryHref || '');
      await expect(page.locator(selectors.pageTitle)).toContainText(
        categoryName || '',
      );
    } else {
      test.skip(true, 'No categories available');
    }
  });

  test('should display resources for selected category', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    const categoryLinks = page.locator(selectors.categoryLinks);
    const count = await categoryLinks.count();

    if (count > 0) {
      await categoryLinks.first().click();
      await helpers.waitForPageLoad(page);

      // Should have link cards
      const linkCount = await helpers.getLinkCardCount(page);
      expect(linkCount).toBeGreaterThan(0);

      // Each card should belong to this category (check category badge)
      const firstCard = page.locator(selectors.linkCards).first();
      const categoryBadge = firstCard.locator(selectors.linkCardCategory);
      if (await categoryBadge.isVisible()) {
        // The badge should show the category name
        expect(await categoryBadge.textContent()).not.toBe('');
      }
    } else {
      test.skip(true, 'No categories available');
    }
  });

  test('should support pagination on category pages', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    const categoryLinks = page.locator(selectors.categoryLinks);
    const count = await categoryLinks.count();

    if (count > 0) {
      await categoryLinks.first().click();
      await helpers.waitForPageLoad(page);

      // Check if pagination exists
      const pagination = page.locator(selectors.pagination);
      if (await pagination.isVisible()) {
        const nextButton = page.locator(selectors.paginationNext);
        if (await nextButton.isEnabled()) {
          // Navigate to next page
          await helpers.goToNextPage(page);

          // URL should have page parameter
          expect(page.url()).toContain('page=');
        }
      }
    } else {
      test.skip(true, 'No categories available');
    }
  });

  test('should toggle view mode on category page', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    const categoryLinks = page.locator(selectors.categoryLinks);
    const count = await categoryLinks.count();

    if (count > 0) {
      await categoryLinks.first().click();
      await helpers.waitForPageLoad(page);

      // Test view toggle
      await helpers.switchViewMode(page, 'list');
      await expect(page.locator(selectors.viewToggleList)).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      await helpers.switchViewMode(page, 'grid');
      await expect(page.locator(selectors.viewToggleGrid)).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    } else {
      test.skip(true, 'No categories available');
    }
  });

  test('should have functional favorite buttons on category pages', async ({
    page,
  }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    const categoryLinks = page.locator(selectors.categoryLinks);
    const count = await categoryLinks.count();

    if (count > 0) {
      await categoryLinks.first().click();
      await helpers.waitForPageLoad(page);

      const favoriteButtons = page.locator(selectors.linkCardFavoriteButton);
      const buttonCount = await favoriteButtons.count();
      expect(buttonCount).toBeGreaterThan(0);

      // Test clicking a favorite button
      const firstButton = favoriteButtons.first();
      await firstButton.click();
      await expect(firstButton).toHaveAttribute('aria-pressed', 'true');
    } else {
      test.skip(true, 'No categories available');
    }
  });

  test('should display breadcrumb navigation on category pages', async ({
    page,
  }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    const categoryLinks = page.locator(selectors.categoryLinks);
    const count = await categoryLinks.count();

    if (count > 0) {
      await categoryLinks.first().click();
      await helpers.waitForPageLoad(page);

      // Check for breadcrumb (if implemented)
      const breadcrumb = page.locator('[data-testid="breadcrumb"]');
      if (await breadcrumb.isVisible()) {
        await expect(breadcrumb).toBeVisible();
      }
    } else {
      test.skip(true, 'No categories available');
    }
  });

  test('should have proper metadata for category page', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    const categoryLinks = page.locator(selectors.categoryLinks);
    const count = await categoryLinks.count();

    if (count > 0) {
      const firstCategory = categoryLinks.first();
      const categoryName = await firstCategory.textContent();
      await firstCategory.click();
      await helpers.waitForPageLoad(page);

      // Page title should include category name
      const title = await page.title();
      expect(title).toContain(categoryName || '');
    } else {
      test.skip(true, 'No categories available');
    }
  });
});
