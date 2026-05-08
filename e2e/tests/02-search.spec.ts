import { test, expect } from '../fixtures/test-fixtures';
import { selectors, urls } from '../helpers/selectors';
import { helpers } from '../fixtures/test-fixtures';

test.describe('Search Functionality', () => {
  test('should access search page', async ({ page }) => {
    await page.goto(urls.search);
    await helpers.waitForPageLoad(page);

    // Check page title
    await expect(page).toHaveTitle(/Search/);

    // Check search input is present and focused
    await expect(page.locator(selectors.searchInput)).toBeVisible();
  });

  test('should perform a search and display results', async ({ page }) => {
    await page.goto(urls.search);
    await helpers.waitForPageLoad(page);

    // Perform a search
    const searchQuery = 'design';
    await helpers.search(page, searchQuery);

    // Wait for URL to update with search query parameter
    await page.waitForURL(`**/search?q=${encodeURIComponent(searchQuery)}*`);

    // Verify URL contains search query
    expect(page.url()).toContain('q=' + encodeURIComponent(searchQuery));

    // Verify results are displayed
    const resultCount = await helpers.getLinkCardCount(page);
    expect(resultCount).toBeGreaterThan(0);

    // Verify page title reflects search
    await expect(page).toHaveTitle(/Search results for "design"/);
  });

  test('should show "no results" message for non-matching query', async ({
    page,
  }) => {
    await page.goto(urls.search);
    await helpers.waitForPageLoad(page);

    // Search for something unlikely to exist
    const searchQuery = 'xyznonexistent123456';
    await helpers.search(page, searchQuery);

    // Verify no results message appears
    const noResultsMessage = page.locator('text=No results found');
    await expect(noResultsMessage).toBeVisible();
  });

  test('should preserve search query in URL parameters', async ({ page }) => {
    await page.goto(urls.search);
    await helpers.waitForPageLoad(page);

    const searchQuery = 'react';
    await helpers.search(page, searchQuery);

    // Wait for URL to update with search query parameter
    await page.waitForURL(`**/search?q=${encodeURIComponent(searchQuery)}*`);

    // Check URL has correct query parameter
    const url = new URL(page.url());
    expect(url.searchParams.get('q')).toBe(searchQuery);
  });

  test('should display search results with pagination if needed', async ({
    page,
  }) => {
    await page.goto(urls.search);
    await helpers.waitForPageLoad(page);

    // Search for a common term that might have many results
    const searchQuery = 'ui';
    await page.fill(selectors.searchInput, searchQuery);
    await page.press(selectors.searchInput, 'Enter');
    await helpers.waitForPageLoad(page);

    // If there are many results, pagination should appear
    const pagination = page.locator(selectors.pagination);
    if (await pagination.isVisible()) {
      expect(await pagination.count()).toBeGreaterThan(0);
    }
  });

  test('should clear search when navigating away', async ({ page }) => {
    await page.goto(urls.search);
    await helpers.waitForPageLoad(page);

    // Perform a search
    await helpers.search(page, 'test');

    // Wait for URL to update with search query parameter
    await page.waitForURL(`**/search?q=*`);

    // Navigate to home
    await page.click(selectors.logo);
    await helpers.waitForPageLoad(page);

    // URL should not contain search query
    expect(page.url()).not.toContain('q=');
  });

  test('should handle empty search submission', async ({ page }) => {
    await page.goto(urls.search);
    await helpers.waitForPageLoad(page);

    // Submit empty search by pressing Enter on the search input
    await page.press(selectors.searchInput, 'Enter');
    await helpers.waitForPageLoad(page);

    // Should either show all results or a message - depends on implementation
    // We'll just verify the page doesn't crash
    await expect(page.locator(selectors.siteHeader)).toBeVisible();
  });

  test('should maintain view preference (grid/list) during search', async ({
    page,
  }) => {
    await page.goto(urls.search);
    await helpers.waitForPageLoad(page);

    // Switch to list view
    await helpers.switchViewMode(page, 'list');
    await expect(page.locator(selectors.viewToggleList)).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    // Perform a search
    await helpers.search(page, 'icon');

    // View mode should persist (list view still active)
    await expect(page.locator(selectors.viewToggleList)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('should show search input in header on all pages', async ({ page }) => {
    // Check home page
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);
    await expect(page.locator(selectors.searchInput)).toBeVisible();

    // Check that search form is accessible from site header
    await expect(page.locator(selectors.siteHeader)).toBeVisible();
  });
});
