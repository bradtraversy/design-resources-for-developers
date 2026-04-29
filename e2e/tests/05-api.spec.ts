import { test, expect } from '../fixtures/test-fixtures';
import { selectors, urls } from '../helpers/selectors';
import { helpers } from '../fixtures/test-fixtures';

test.describe('API Endpoints', () => {
  test('should fetch suggestions API with valid query', async ({ page }) => {
    // Test the suggestions endpoint
    const response = await page.request.get('/api/suggestions?q=design');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('suggestions');
    expect(Array.isArray(data.suggestions)).toBeTruthy();
  });

  test('should return empty suggestions for short query', async ({ page }) => {
    const response = await page.request.get('/api/suggestions?q=de');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    // Query less than 2 chars should return empty
    expect(data.suggestions).toEqual([]);
  });

  test('should return empty suggestions for non-matching query', async ({
    page,
  }) => {
    const response = await page.request.get(
      '/api/suggestions?q=xyznonexistent123456',
    );
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data.suggestions)).toBeTruthy();
    expect(data.suggestions.length).toBe(0);
  });

  test('should handle missing query parameter', async ({ page }) => {
    const response = await page.request.get('/api/suggestions');
    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should return suggestions with correct structure', async ({ page }) => {
    const response = await page.request.get('/api/suggestions?q=ui');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    if (data.suggestions.length > 0) {
      const suggestion = data.suggestions[0];
      // Suggestions should have at least an id and name
      expect(suggestion).toHaveProperty('id');
      expect(suggestion).toHaveProperty('name');
    }
  });

  test('should support different query lengths', async ({ page }) => {
    // Test with 3 character query (minimum valid)
    const response = await page.request.get('/api/suggestions?q=abc');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('suggestions');
  });
});

test.describe('Search Integration via UI', () => {
  test('should display search results from UI', async ({ page }) => {
    await page.goto(urls.search);
    await helpers.waitForPageLoad(page);

    // Perform search
    await page.fill(selectors.searchInput, 'react');
    await page.press(selectors.searchInput, 'Enter');
    await helpers.waitForPageLoad(page);

    // Verify results appear
    const count = await helpers.getLinkCardCount(page);
    expect(count).toBeGreaterThan(0);
  });

  test('should show no results message for invalid search', async ({
    page,
  }) => {
    await page.goto(urls.search);
    await helpers.waitForPageLoad(page);

    await page.fill(selectors.searchInput, 'xyznonexistent123456');
    await page.press(selectors.searchInput, 'Enter');
    await helpers.waitForPageLoad(page);

    const noResults = page.locator('text=No results found');
    await expect(noResults).toBeVisible();
  });
});
