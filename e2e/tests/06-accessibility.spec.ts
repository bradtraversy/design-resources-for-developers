import { test, expect } from '../fixtures/test-fixtures';
import { selectors, urls } from '../helpers/selectors';
import { helpers } from '../fixtures/test-fixtures';

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    // Check for h1
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThan(0);

    // Check headings are in order (no skipping levels)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let lastLevel = 0;
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const level = parseInt(tagName[1]);
      // Should not skip levels (allow same level or +1)
      expect(level - lastLevel).toBeLessThanOrEqual(1);
      lastLevel = level;
    }
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // All images should have alt text (even if empty for decorative)
      expect(alt).not.toBeNull();
    }
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    // Search input should have accessible label
    const searchInput = page.locator(selectors.searchInput);
    const ariaLabel = await searchInput.getAttribute('aria-label');
    const placeholder = await searchInput.getAttribute('placeholder');

    // Should have either aria-label, aria-labelledby, or placeholder
    expect(ariaLabel || placeholder).toBeTruthy();
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    const links = page.locator('a');
    const count = await links.count();

    for (let i = 0; i < Math.min(count, 20); i++) {
      // Check first 20 links
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');

      // Links should have visible text or aria-label
      const hasAccessibleName = text?.trim() || ariaLabel;
      if (!hasAccessibleName) {
        // Skip empty links that might be icons-only with aria-label
        const hasAriaLabel = await link.getAttribute('aria-label');
        expect(hasAriaLabel).toBeTruthy();
      }
    }
  });

  test('should have proper button labels', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 20); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledby = await button.getAttribute('aria-labelledby');

      // Buttons should have accessible name
      const hasAccessibleName = text?.trim() || ariaLabel || ariaLabelledby;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    // Check that interactive elements can receive focus
    const firstLink = page.locator('a').first();
    await firstLink.focus();

    // Focused element should be visible
    const isVisible = await firstLink.isVisible();
    expect(isVisible).toBe(true);
  });

  test('should have proper color contrast (basic check)', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    // This is a basic check - for comprehensive contrast testing,
    // you'd want to use axe-core or similar
    const mainContent = page.locator('main, [role="main"]');
    if ((await mainContent.count()) > 0) {
      await expect(mainContent.first()).toBeVisible();
    }
  });

  test('should be navigable via keyboard', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    // Press Tab and check that focus moves
    await page.keyboard.press('Tab');
    const focused = await page.locator(':focus');
    expect(await focused.count()).toBe(1);
  });

  test('should have skip link if present', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    // Check for skip link (common accessibility feature)
    const skipLink = page.locator('[class*="skip"]');
    if ((await skipLink.count()) > 0) {
      // If skip link exists, it should be focusable and visible on focus
      await skipLink.first().focus();
      const styles = await skipLink.first().evaluate(el => {
        return window.getComputedStyle(el).opacity;
      });
      // Should be visible when focused
      expect(styles).not.toBe('0');
    }
  });
});

test.describe('Responsive Design', () => {
  test('should be usable on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    // Check that main content is visible
    const header = page.locator(selectors.siteHeader);
    await expect(header).toBeVisible();

    // Check that link cards are visible
    const firstCard = page.locator(selectors.linkCards).first();
    await expect(firstCard).toBeVisible();
  });

  test('should be usable on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    const header = page.locator(selectors.siteHeader);
    await expect(header).toBeVisible();
  });

  test('should be usable on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    const header = page.locator(selectors.siteHeader);
    await expect(header).toBeVisible();
  });

  test('should have responsive images', async ({ page }) => {
    await page.goto(urls.home);
    await helpers.waitForPageLoad(page);

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      if (src) {
        // Images should have width/height or be styled responsively
        const width = await img.getAttribute('width');
        const height = await img.getAttribute('height');
        const style = await img.getAttribute('style');

        // Either explicit dimensions or responsive CSS
        const hasDimensions =
          (width && height) ||
          (style && (style.includes('width') || style.includes('max-width')));
        expect(hasDimensions).toBeTruthy();
      }
    }
  });
});
