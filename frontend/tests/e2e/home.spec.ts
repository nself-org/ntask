import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/ɳApp/);
  });

  test('should display the app header', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should show backend status cards', async ({ page }) => {
    await page.goto('/');

    const statusCards = page.locator('[data-testid="status-card"]');
    const count = await statusCards.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    const loginLink = page.getByRole('link', { name: /login/i });
    await loginLink.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('should show environment indicator', async ({ page }) => {
    await page.goto('/');

    const envIndicator = page.locator('[data-testid="env-indicator"]');
    await expect(envIndicator).toBeVisible();
  });
});
