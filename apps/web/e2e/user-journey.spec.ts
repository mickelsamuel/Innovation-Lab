import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  const timestamp = Date.now();
  const testUser = {
    name: `E2E User ${timestamp}`,
    email: `e2e-${timestamp}@test.com`,
    handle: `e2euser${timestamp}`,
    password: 'E2ETest123!',
    organization: 'E2E Test Organization',
  };

  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('User can complete registration flow', async ({ page }) => {
    // Navigate to registration page
    await page.click('text=Sign Up');
    await expect(page).toHaveURL(/\/register/);

    // Fill in registration form
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="handle"]', testUser.handle);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.fill('input[name="organization"]', testUser.organization);

    // Accept terms
    await page.check('input[name="acceptTerms"]');

    // Submit registration
    await page.click('button[type="submit"]');

    // Should redirect to login page or show success message
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('User can login and view dashboard', async ({ page }) => {
    // First register the user
    await page.goto('/register');
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="handle"]', testUser.handle);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.fill('input[name="organization"]', testUser.organization);
    await page.check('input[name="acceptTerms"]');
    await page.click('button[type="submit"]');

    // Now login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Verify user is logged in
    await expect(page.locator(`text=${testUser.name}`)).toBeVisible();
  });

  test('User can view hackathons', async ({ page }) => {
    // Navigate to hackathons page
    await page.goto('/hackathons');

    // Page should load successfully
    await expect(page).toHaveURL('/hackathons');

    // Should show hackathons title
    await expect(page.locator('h1, h2').filter({ hasText: /hackathon/i })).toBeVisible();
  });

  test('User can view leaderboard', async ({ page }) => {
    // Navigate to leaderboard
    await page.goto('/leaderboard');

    // Page should load successfully
    await expect(page).toHaveURL('/leaderboard');

    // Should show leaderboard content
    await expect(
      page.locator('h1, h2').filter({ hasText: /leaderboard|hall of fame/i })
    ).toBeVisible();
  });

  test('User can view challenges', async ({ page }) => {
    // Navigate to challenges
    await page.goto('/challenges');

    // Page should load successfully
    await expect(page).toHaveURL('/challenges');

    // Should show challenges content
    await expect(page.locator('h1, h2').filter({ hasText: /challenge/i })).toBeVisible();
  });

  test('Complete user journey: Register → Login → View Profile → Browse Hackathons', async ({
    page,
  }) => {
    // Step 1: Register
    await page.goto('/register');
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="handle"]', testUser.handle);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.fill('input[name="organization"]', testUser.organization);
    await page.check('input[name="acceptTerms"]');
    await page.click('button[type="submit"]');

    // Verify registration success
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // Step 2: Login
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Verify login success
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Step 3: View Profile
    // Click on profile link or avatar
    await page.click(`text=${testUser.name}`);
    // Should show profile information
    await expect(page.locator(`text=${testUser.email}`)).toBeVisible({ timeout: 5000 });

    // Step 4: Browse Hackathons
    await page.goto('/hackathons');
    await expect(page).toHaveURL('/hackathons');

    // Step 5: Check gamification stats
    // User should have welcome XP
    const xpElement = page.locator('text=/XP|Level/i');
    await expect(xpElement).toBeVisible({ timeout: 5000 });
  });

  test('User cannot access protected routes without authentication', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('Registration form validates inputs', async ({ page }) => {
    await page.goto('/register');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=/required|must be/i')).toBeVisible({ timeout: 3000 });

    // Test invalid email
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/valid email/i')).toBeVisible({ timeout: 3000 });

    // Test password mismatch
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Different123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=/match|same/i')).toBeVisible({ timeout: 3000 });
  });

  test('Login form validates inputs', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=/required/i')).toBeVisible({ timeout: 3000 });

    // Test with invalid credentials
    await page.fill('input[name="email"]', 'nonexistent@test.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/invalid|incorrect/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Hackathon Features', () => {
  test('User can view hackathon details', async ({ page }) => {
    // This assumes seeded data exists
    await page.goto('/hackathons');

    // Click on first hackathon (if any)
    const firstHackathon = page.locator('a[href^="/hackathons/"]').first();

    if (await firstHackathon.isVisible()) {
      await firstHackathon.click();

      // Should navigate to hackathon detail page
      await expect(page).toHaveURL(/\/hackathons\/.+/);

      // Should show hackathon information
      await expect(page.locator('h1')).toBeVisible();
    }
  });
});

test.describe('Responsive Design', () => {
  test('Site works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Page should load
    await expect(page).toHaveURL('/');

    // Navigation should be accessible (might be in hamburger menu)
    await expect(page.locator('nav, button[aria-label*="menu"]')).toBeVisible();
  });

  test('Site works on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');

    // Page should load
    await expect(page).toHaveURL('/');

    // Content should be visible
    await expect(page.locator('main, [role="main"]')).toBeVisible();
  });
});
