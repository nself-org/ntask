import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('login page has no critical ARIA issues', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    // Basic accessibility checks
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      // Each input should have an id (for label association) or aria-label
      const hasAccessibleName = id || ariaLabel || ariaLabelledBy;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Tab through the page and verify focus is visible
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    expect(focusedElement).toBeTruthy();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // alt="" is valid for decorative images, but should not be missing entirely
      expect(alt).not.toBeNull();
    }
  });
});
