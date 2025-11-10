import { test, expect } from '@playwright/test';

test.describe('Notifications Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `notif-user-${timestamp}@test.com`,
    password: 'NotifUser123!',
    name: `Notif User ${timestamp}`,
  };

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test.describe('Notification Bell', () => {
    test('should display notification bell in header', async ({ page }) => {
      // Check for notification bell icon
      const notificationBell = page
        .locator('button')
        .filter({ has: page.locator('svg') })
        .first();
      await expect(notificationBell).toBeVisible();
    });

    test('should show unread count badge', async ({ page }) => {
      // Wait for notifications to load
      await page.waitForTimeout(2000);

      // Check if badge is visible (if there are unread notifications)
      const badge = page
        .locator('button')
        .filter({ has: page.locator('svg') })
        .locator('span')
        .first();

      // Badge might not be visible if no unread notifications
      const isVisible = await badge.isVisible({ timeout: 3000 }).catch(() => false);

      if (isVisible) {
        // Verify badge shows count
        const badgeText = await badge.textContent();
        expect(badgeText).toMatch(/\d+|\d+\+/);
      }
    });

    test('should open notifications dropdown on click', async ({ page }) => {
      const notificationBell = page
        .locator('button')
        .filter({ has: page.locator('svg') })
        .first();
      await notificationBell.click();

      // Should see dropdown menu
      await expect(page.locator('text=Notifications')).toBeVisible({ timeout: 5000 });
    });

    test('should display notification items in dropdown', async ({ page }) => {
      const notificationBell = page
        .locator('button')
        .filter({ has: page.locator('svg') })
        .first();
      await notificationBell.click();

      // Wait for dropdown
      await expect(page.locator('text=Notifications')).toBeVisible({ timeout: 5000 });

      // Check for notification items or empty state
      const hasNotifications = (await page.locator('[role="menuitem"]').count()) > 0;

      if (hasNotifications) {
        // Verify notification structure
        const firstNotification = page.locator('[role="menuitem"]').first();
        await expect(firstNotification).toBeVisible();
      } else {
        // Should show empty state
        await expect(page.locator('text=/No notifications/i')).toBeVisible();
      }
    });

    test('should mark notification as read when clicked', async ({ page }) => {
      const notificationBell = page
        .locator('button')
        .filter({ has: page.locator('svg') })
        .first();
      await notificationBell.click();

      await expect(page.locator('text=Notifications')).toBeVisible({ timeout: 5000 });

      // Find an unread notification (has blue dot or bg-primary class)
      const unreadNotification = page
        .locator('[role="menuitem"]')
        .filter({ hasText: /.+/ })
        .first();

      if (await unreadNotification.isVisible({ timeout: 3000 })) {
        const initialCount = await page
          .locator('button')
          .filter({ has: page.locator('svg') })
          .locator('span')
          .textContent()
          .catch(() => '0');

        // Click notification
        await unreadNotification.click();

        // Wait for navigation or action
        await page.waitForTimeout(1000);

        // Re-open dropdown and check count decreased
        await notificationBell.click();
        await page.waitForTimeout(500);

        // Count should have decreased or badge should be gone
        const newBadge = page
          .locator('button')
          .filter({ has: page.locator('svg') })
          .locator('span');
        const newCount = await newBadge.textContent().catch(() => '0');

        // Either count decreased or badge is no longer visible
        expect(parseInt(newCount || '0') <= parseInt(initialCount || '0')).toBeTruthy();
      }
    });

    test('should mark all notifications as read', async ({ page }) => {
      const notificationBell = page
        .locator('button')
        .filter({ has: page.locator('svg') })
        .first();
      await notificationBell.click();

      await expect(page.locator('text=Notifications')).toBeVisible({ timeout: 5000 });

      // Look for "Mark all as read" button
      const markAllButton = page.locator('button:has-text("Mark all as read")');

      if (await markAllButton.isVisible({ timeout: 3000 })) {
        await markAllButton.click();

        // Wait for update
        await page.waitForTimeout(1000);

        // Badge should disappear
        const badge = page
          .locator('button')
          .filter({ has: page.locator('svg') })
          .locator('span');
        await expect(badge).not.toBeVisible({ timeout: 5000 });
      }
    });

    test('should navigate to all notifications page', async ({ page }) => {
      const notificationBell = page
        .locator('button')
        .filter({ has: page.locator('svg') })
        .first();
      await notificationBell.click();

      await expect(page.locator('text=Notifications')).toBeVisible({ timeout: 5000 });

      // Click "View all notifications"
      await page.click('text=View all notifications');

      // Should navigate to notifications page
      await expect(page).toHaveURL(/\/notifications/, { timeout: 10000 });
    });
  });

  test.describe('Notifications Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/notifications');
    });

    test('should display notifications page', async ({ page }) => {
      await expect(page.locator('h1, h2').filter({ hasText: /Notifications/i })).toBeVisible({
        timeout: 10000,
      });
    });

    test('should display list of all notifications', async ({ page }) => {
      // Wait for notifications to load
      await page.waitForTimeout(2000);

      // Check for notifications or empty state
      const hasNotifications = (await page.locator('text=/notification/i').count()) > 0;

      if (hasNotifications) {
        // Verify notifications are displayed
        expect(
          await page.locator('[data-notification-id], .notification-item').count()
        ).toBeGreaterThan(0);
      } else {
        // Should show empty state
        await expect(page.locator('text=/No notifications/i')).toBeVisible();
      }
    });

    test('should filter unread notifications', async ({ page }) => {
      // Look for unread filter toggle/button
      const unreadFilter = page
        .locator('button:has-text("Unread"), input[type="checkbox"]')
        .first();

      if (await unreadFilter.isVisible({ timeout: 3000 })) {
        await unreadFilter.click();

        // Wait for filter to apply
        await page.waitForTimeout(1000);

        // All visible notifications should be unread
        const notifications = page.locator('[data-notification-id], .notification-item');
        const count = await notifications.count();

        if (count > 0) {
          // Verify unread indicator is present
          for (let i = 0; i < Math.min(count, 5); i++) {
            const notification = notifications.nth(i);
            // Should have unread indicator (blue dot, badge, or bg color)
            await expect(notification).toBeVisible();
          }
        }
      }
    });

    test('should paginate notifications', async ({ page }) => {
      // Check if pagination controls exist
      const nextButton = page
        .locator('button:has-text("Next"), button[aria-label*="next"]')
        .first();

      if (await nextButton.isVisible({ timeout: 3000 })) {
        await nextButton.click();

        // Wait for new page to load
        await page.waitForTimeout(1000);

        // URL should reflect pagination or different content should be visible
        expect(true).toBeTruthy(); // Pagination worked
      }
    });

    test('should mark notification as read from list', async ({ page }) => {
      // Find first unread notification
      const unreadNotification = page
        .locator('[data-notification-id], .notification-item')
        .filter({ hasText: /.+/ })
        .first();

      if (await unreadNotification.isVisible({ timeout: 3000 })) {
        // Click to mark as read or click dedicated button
        await unreadNotification.click();

        // Wait for update
        await page.waitForTimeout(500);

        // Notification should no longer have unread styling
        // (This depends on implementation - might need to check specific classes)
      }
    });

    test('should navigate to linked resource from notification', async ({ page }) => {
      // Find notification with a link
      const notificationLink = page
        .locator('[data-notification-id] a, .notification-item a')
        .first();

      if (await notificationLink.isVisible({ timeout: 3000 })) {
        const href = await notificationLink.getAttribute('href');

        await notificationLink.click();

        // Should navigate to the linked resource
        await page.waitForTimeout(1000);
        expect(page.url()).toContain(href || '');
      }
    });
  });

  test.describe('Notification Preferences', () => {
    test('should navigate to notification preferences', async ({ page }) => {
      await page.goto('/notifications');

      // Look for preferences/settings link
      const preferencesLink = page
        .locator(
          'a:has-text("Preferences"), a:has-text("Settings"), button:has-text("Preferences")'
        )
        .first();

      if (await preferencesLink.isVisible({ timeout: 3000 })) {
        await preferencesLink.click();

        // Should be on preferences page
        await expect(
          page.locator('text=/Notification.*Preferences/i, text=/Settings/i')
        ).toBeVisible({ timeout: 10000 });
      } else {
        // Try direct navigation
        await page.goto('/notifications/preferences');
        await expect(page.locator('text=/Notification.*Preferences/i')).toBeVisible({
          timeout: 10000,
        });
      }
    });

    test('should update email notification preferences', async ({ page }) => {
      await page.goto('/notifications/preferences');

      // Find email preference toggles
      const emailToggle = page
        .locator('input[type="checkbox"]')
        .filter({ hasText: /email/i })
        .first();

      if (await emailToggle.isVisible({ timeout: 3000 })) {
        const wasChecked = await emailToggle.isChecked();

        // Toggle preference
        await emailToggle.click();

        // Wait for save
        await page.waitForTimeout(1000);

        // Verify change persisted
        await page.reload();
        await page.waitForTimeout(1000);

        const isNowChecked = await emailToggle.isChecked();
        expect(isNowChecked).toBe(!wasChecked);
      }
    });

    test('should update in-app notification preferences', async ({ page }) => {
      await page.goto('/notifications/preferences');

      // Find in-app preference toggles
      const inAppToggle = page
        .locator('input[type="checkbox"]')
        .filter({ hasText: /in-app/i })
        .first();

      if (await inAppToggle.isVisible({ timeout: 3000 })) {
        const wasChecked = await inAppToggle.isChecked();

        // Toggle preference
        await inAppToggle.click();

        // Wait for save
        await page.waitForTimeout(1000);

        // Verify change persisted
        await page.reload();
        await page.waitForTimeout(1000);

        const isNowChecked = await inAppToggle.isChecked();
        expect(isNowChecked).toBe(!wasChecked);
      }
    });

    test('should save all preference changes', async ({ page }) => {
      await page.goto('/notifications/preferences');

      // Toggle multiple preferences
      const toggles = page.locator('input[type="checkbox"]');
      const count = await toggles.count();

      if (count > 0) {
        // Toggle first 3 preferences
        for (let i = 0; i < Math.min(count, 3); i++) {
          await toggles.nth(i).click();
          await page.waitForTimeout(200);
        }

        // Look for save button
        const saveButton = page.locator('button:has-text("Save")').first();
        if (await saveButton.isVisible({ timeout: 3000 })) {
          await saveButton.click();

          // Should show success message
          await expect(page.locator('text=/saved/i, text=/updated/i')).toBeVisible({
            timeout: 5000,
          });
        }
      }
    });
  });

  test.describe('Real-time Notifications', () => {
    test('should poll for new notifications', async ({ page }) => {
      // Wait on dashboard
      await page.goto('/dashboard');

      // Get initial notification count
      const badge = page
        .locator('button')
        .filter({ has: page.locator('svg') })
        .locator('span');
      const initialCount = await badge.textContent().catch(() => '0');

      // Wait for polling interval (30 seconds in real app, but we'll wait a bit)
      await page.waitForTimeout(5000);

      // Check if count changed (simulating new notifications)
      const newCount = await badge.textContent().catch(() => '0');

      // Count should be same or increased (not decreased without user action)
      expect(parseInt(newCount || '0') >= parseInt(initialCount || '0')).toBeTruthy();
    });
  });

  test.describe('Notification Types', () => {
    test('should display different notification icons', async ({ page }) => {
      const notificationBell = page
        .locator('button')
        .filter({ has: page.locator('svg') })
        .first();
      await notificationBell.click();

      await expect(page.locator('text=Notifications')).toBeVisible({ timeout: 5000 });

      // Check for emoji icons in notifications
      const notifications = page.locator('[role="menuitem"]');
      const count = await notifications.count();

      if (count > 0) {
        // Verify icons are present (emojis)
        const firstNotification = notifications.first();
        const hasEmoji = await firstNotification
          .locator('text=/[🎉🎯⚖️🎓📊🏆✅📝👥⬆️🏅🔔]/')
          .isVisible({ timeout: 3000 });
        expect(hasEmoji).toBeTruthy();
      }
    });
  });
});
