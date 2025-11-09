import { test, expect } from '@playwright/test';

test.describe('Admin Flows', () => {
  const timestamp = Date.now();
  const adminUser = {
    email: `admin-${timestamp}@test.com`,
    password: 'Admin123!',
  };

  const hackathonData = {
    title: `Test Hackathon ${timestamp}`,
    slug: `test-hackathon-${timestamp}`,
    description: 'A comprehensive test hackathon for E2E testing',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
  };

  const challengeData = {
    title: `Test Challenge ${timestamp}`,
    slug: `test-challenge-${timestamp}`,
    description: 'A comprehensive test challenge for E2E testing',
    difficulty: 'MEDIUM',
    points: 100,
  };

  test.beforeEach(async ({ page }) => {
    // Assume admin user is pre-created or create via API
    await page.goto('/login');
    await page.fill('input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test.describe('Hackathon Management', () => {
    test('should create a new hackathon', async ({ page }) => {
      // Navigate to create hackathon page
      await page.goto('/admin/hackathons/create');
      await expect(page).toHaveURL('/admin/hackathons/create');

      // Fill in hackathon form
      await page.fill('input[name="title"]', hackathonData.title);
      await page.fill('input[name="slug"]', hackathonData.slug);
      await page.fill('textarea[name="description"]', hackathonData.description);

      // Set dates
      await page.fill('input[name="startDate"]', hackathonData.startDate.split('T')[0]);
      await page.fill('input[name="endDate"]', hackathonData.endDate.split('T')[0]);

      // Set additional fields
      await page.fill('input[name="maxTeamSize"]', '5');
      await page.fill('input[name="minTeamSize"]', '1');

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to hackathon list or detail page
      await expect(page).toHaveURL(/\/admin\/hackathons/, { timeout: 15000 });

      // Verify hackathon appears in list
      await expect(page.locator(`text=${hackathonData.title}`)).toBeVisible({ timeout: 10000 });
    });

    test('should update existing hackathon', async ({ page }) => {
      // Navigate to hackathons list
      await page.goto('/admin/hackathons');

      // Find and click edit button for the test hackathon
      const editButton = page.locator(`text=${hackathonData.title}`).locator('..').locator('button:has-text("Edit")').first();
      await editButton.click({ timeout: 10000 });

      // Update description
      const updatedDescription = 'Updated description for E2E testing';
      await page.fill('textarea[name="description"]', updatedDescription);

      // Submit update
      await page.click('button[type="submit"]');

      // Verify update
      await expect(page.locator(`text=${updatedDescription}`)).toBeVisible({ timeout: 10000 });
    });

    test('should assign judges to hackathon', async ({ page }) => {
      // Navigate to hackathon judges page
      await page.goto(`/admin/hackathons/${hackathonData.slug}/judges`);

      // Search for a judge
      await page.fill('input[placeholder*="Search"]', 'judge');
      await page.click('button:has-text("Search")');

      // Wait for search results
      await page.waitForSelector('text=/user.*found/i', { timeout: 10000 });

      // Assign first judge if available
      const assignButton = page.locator('button:has-text("Assign")').first();
      if (await assignButton.isVisible({ timeout: 5000 })) {
        await assignButton.click();

        // Verify success message
        await expect(page.locator('text=/Judge assigned successfully/i')).toBeVisible({ timeout: 10000 });
      }
    });

    test('should assign mentors to hackathon', async ({ page }) => {
      // Navigate to hackathon mentors page
      await page.goto(`/admin/hackathons/${hackathonData.slug}/mentors`);

      // Search for a mentor
      await page.fill('input[placeholder*="Search"]', 'mentor');
      await page.click('button:has-text("Search")');

      // Wait for search results
      await page.waitForSelector('text=/user.*found/i', { timeout: 10000 });

      // Assign first mentor if available
      const assignButton = page.locator('button:has-text("Assign")').first();
      if (await assignButton.isVisible({ timeout: 5000 })) {
        await assignButton.click();

        // Verify success message
        await expect(page.locator('text=/Mentor assigned successfully/i')).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('Challenge Management', () => {
    test('should create a new challenge', async ({ page }) => {
      // Navigate to create challenge page
      await page.goto('/admin/challenges/create');
      await expect(page).toHaveURL('/admin/challenges/create');

      // Fill in challenge form
      await page.fill('input[name="title"]', challengeData.title);
      await page.fill('input[name="slug"]', challengeData.slug);
      await page.fill('textarea[name="description"]', challengeData.description);

      // Select difficulty
      await page.click('button[role="combobox"]:has-text("Select difficulty")');
      await page.click(`text=${challengeData.difficulty}`);

      // Set points
      await page.fill('input[name="points"]', challengeData.points.toString());

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to challenge list or detail page
      await expect(page).toHaveURL(/\/admin\/challenges/, { timeout: 15000 });

      // Verify challenge appears in list
      await expect(page.locator(`text=${challengeData.title}`)).toBeVisible({ timeout: 10000 });
    });

    test('should update existing challenge', async ({ page }) => {
      // Navigate to challenges list
      await page.goto('/admin/challenges');

      // Find and click edit button for the test challenge
      const editButton = page.locator(`text=${challengeData.title}`).locator('..').locator('button:has-text("Edit")').first();
      await editButton.click({ timeout: 10000 });

      // Update points
      const updatedPoints = 150;
      await page.fill('input[name="points"]', updatedPoints.toString());

      // Submit update
      await page.click('button[type="submit"]');

      // Verify update
      await expect(page.locator(`text=${updatedPoints}`)).toBeVisible({ timeout: 10000 });
    });

    test('should publish/unpublish challenge', async ({ page }) => {
      // Navigate to challenges list
      await page.goto('/admin/challenges');

      // Find the test challenge
      const challengeCard = page.locator(`text=${challengeData.title}`).locator('..');

      // Toggle publish status
      const publishButton = challengeCard.locator('button:has-text("Publish"), button:has-text("Unpublish")').first();
      const initialText = await publishButton.textContent();

      await publishButton.click();

      // Verify status changed
      await expect(publishButton).not.toHaveText(initialText || '', { timeout: 10000 });
    });
  });

  test.describe('Batch Operations', () => {
    test('should assign multiple judges to hackathon', async ({ page }) => {
      await page.goto(`/admin/hackathons/${hackathonData.slug}/judges`);

      // Search for judges
      await page.fill('input[placeholder*="Search"]', 'judge');
      await page.click('button:has-text("Search")');

      // Assign first 3 judges if available
      const assignButtons = page.locator('button:has-text("Assign")');
      const count = await assignButtons.count();
      const toAssign = Math.min(count, 3);

      for (let i = 0; i < toAssign; i++) {
        await assignButtons.nth(i).click();
        await page.waitForTimeout(1000); // Wait for assignment to complete
      }

      // Verify all judges are assigned
      await page.goto(`/admin/hackathons/${hackathonData.slug}/judges`);
      await expect(page.locator('text=/Assigned Judges/i')).toBeVisible();
    });
  });

  test.describe('Validation and Error Handling', () => {
    test('should show validation errors for invalid hackathon data', async ({ page }) => {
      await page.goto('/admin/hackathons/create');

      // Try to submit without required fields
      await page.click('button[type="submit"]');

      // Should show validation errors
      await expect(page.locator('text=/required/i').first()).toBeVisible({ timeout: 5000 });
    });

    test('should prevent duplicate hackathon slugs', async ({ page }) => {
      await page.goto('/admin/hackathons/create');

      // Try to create hackathon with existing slug
      await page.fill('input[name="title"]', 'Duplicate Test');
      await page.fill('input[name="slug"]', hackathonData.slug);
      await page.fill('textarea[name="description"]', 'Test description');

      await page.click('button[type="submit"]');

      // Should show error about duplicate slug
      await expect(page.locator('text=/already exists/i, text=/duplicate/i').first()).toBeVisible({ timeout: 10000 });
    });

    test('should validate date ranges for hackathons', async ({ page }) => {
      await page.goto('/admin/hackathons/create');

      await page.fill('input[name="title"]', 'Invalid Date Test');
      await page.fill('input[name="slug"]', `invalid-date-${timestamp}`);

      // Set end date before start date
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      await page.fill('input[name="startDate"]', tomorrow.toISOString().split('T')[0]);
      await page.fill('input[name="endDate"]', today.toISOString().split('T')[0]);

      await page.click('button[type="submit"]');

      // Should show error about invalid date range
      await expect(page.locator('text=/end date.*after.*start date/i, text=/invalid.*date/i').first()).toBeVisible({ timeout: 10000 });
    });
  });
});
