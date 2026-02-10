import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should display register form', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
  });

  test('should show validation errors for empty login', async ({ page }) => {
    await page.goto('/login');

    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();

    const errorMessages = page.locator('[role="alert"]');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');

    const registerLink = page.getByRole('link', { name: /sign up/i });
    await registerLink.click();

    await expect(page).toHaveURL(/\/register/);

    const loginLink = page.getByRole('link', { name: /sign in/i });
    await loginLink.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('should display forgot password link', async ({ page }) => {
    await page.goto('/login');

    const forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    await expect(forgotPasswordLink).toBeVisible();

    await forgotPasswordLink.click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});
