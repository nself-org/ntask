import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('home page loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Filter out known network errors (auth requests that fail in test env)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('fetch') &&
        !e.includes('network') &&
        !e.includes('graphql'),
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('settings page is accessible', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('text=Settings').or(page.locator('h1, h2')),
    ).toBeVisible({ timeout: 5000 });
  });

  test('404 page renders for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-xyz');
    // Next.js custom 404 or 404 status
    const is404 =
      response?.status() === 404 ||
      (await page
        .locator('text=404')
        .or(page.locator('text=Not found'))
        .isVisible());
    expect(is404).toBeTruthy();
  });

  test('meta tags are present for SEO', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description).toBeTruthy();
  });
});
