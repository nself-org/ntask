import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('shows login page by default when unauthenticated', async ({ page }) => {
    await page.goto('/');
    // Should redirect to login or show login form
    await expect(
      page
        .locator('text=Sign in')
        .or(page.locator('text=Login'))
        .or(page.locator('[data-testid="auth-form"]')),
    ).toBeVisible({ timeout: 10000 });
  });

  test('login form is accessible', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page
      .locator('input[type="email"]')
      .or(page.locator('input[name="email"]'));
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput.or(passwordInput)).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page
      .locator('input[type="email"]')
      .or(page.locator('input[name="email"]'));
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid@example.com');
      await passwordInput.fill('wrongpassword');
      await submitButton.click();
      await expect(
        page.locator('text=Invalid').or(page.locator('[role="alert"]')),
      ).toBeVisible({ timeout: 5000 });
    }
  });
});
