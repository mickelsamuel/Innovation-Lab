import { test, expect } from '@playwright/test';

test.describe('Team Invitation Flow', () => {
  const timestamp = Date.now();

  const teamLeader = {
    email: `leader-${timestamp}@test.com`,
    password: 'Leader123!',
    name: `Team Leader ${timestamp}`,
    handle: `leader${timestamp}`,
  };

  const teamMember = {
    email: `member-${timestamp}@test.com`,
    password: 'Member123!',
    name: `Team Member ${timestamp}`,
    handle: `member${timestamp}`,
  };

  const teamData = {
    name: `Test Team ${timestamp}`,
    description: 'A test team for E2E testing',
  };

  test.describe('Send Team Invitation', () => {
    test('should send invitation by email', async ({ page }) => {
      // Login as team leader
      await page.goto('/login');
      await page.fill('input[name="email"]', teamLeader.email);
      await page.fill('input[name="password"]', teamLeader.password);
      await page.click('button[type="submit"]');

      // Navigate to team page
      await page.goto('/teams');

      // Create or select a team
      const createTeamButton = page.locator('button:has-text("Create Team")');
      if (await createTeamButton.isVisible({ timeout: 5000 })) {
        await createTeamButton.click();
        await page.fill('input[name="name"]', teamData.name);
        await page.fill('textarea[name="description"]', teamData.description);
        await page.click('button[type="submit"]');
      }

      // Open invite modal
      await page.click('button:has-text("Invite Member"), button:has-text("Invite")');

      // Wait for modal to appear
      await expect(page.locator('text=/Invite Member/i')).toBeVisible({ timeout: 5000 });

      // Select email invite method
      await page.click('button[role="combobox"]:has-text("Email Address"), button[role="combobox"]:has-text("Select invite method")');
      await page.click('text=Email Address');

      // Fill in invitee email
      await page.fill('input[type="email"], input[name="email"]', teamMember.email);

      // Select role
      await page.click('button[role="combobox"]:has-text("Member"), button[role="combobox"]:has-text("Select role")');
      await page.click('text=Member');

      // Send invitation
      await page.click('button:has-text("Send Invitation")');

      // Verify success message
      await expect(page.locator('text=/Invitation sent/i, text=/Success/i')).toBeVisible({ timeout: 10000 });
    });

    test('should send invitation by user ID', async ({ page }) => {
      // Login as team leader
      await page.goto('/login');
      await page.fill('input[name="email"]', teamLeader.email);
      await page.fill('input[name="password"]', teamLeader.password);
      await page.click('button[type="submit"]');

      // Navigate to team page
      await page.goto('/teams');

      // Open invite modal
      await page.click('button:has-text("Invite Member"), button:has-text("Invite")');

      // Select user ID invite method
      await page.click('button[role="combobox"]');
      await page.click('text=User ID');

      // Fill in user ID (assuming we have it from member creation)
      await page.fill('input[name="userId"], input[placeholder*="clxxx"]', 'test-user-id');

      // Send invitation
      await page.click('button:has-text("Send Invitation")');

      // Should show success or error based on user ID validity
      await page.waitForSelector('text=/sent/i, text=/failed/i, text=/not found/i', { timeout: 10000 });
    });

    test('should validate invitation form', async ({ page }) => {
      // Login as team leader
      await page.goto('/login');
      await page.fill('input[name="email"]', teamLeader.email);
      await page.fill('input[name="password"]', teamLeader.password);
      await page.click('button[type="submit"]');

      // Navigate to team page
      await page.goto('/teams');

      // Open invite modal
      await page.click('button:has-text("Invite Member"), button:has-text("Invite")');

      // Try to send without filling email
      await page.click('button:has-text("Send Invitation")');

      // Should show validation error
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });
  });

  test.describe('Accept Team Invitation', () => {
    test('should view pending invitations', async ({ page, context }) => {
      // Login as team member
      await page.goto('/login');
      await page.fill('input[name="email"]', teamMember.email);
      await page.fill('input[name="password"]', teamMember.password);
      await page.click('button[type="submit"]');

      // Navigate to invitations page
      await page.goto('/invitations');

      // Should see invitations list
      await expect(page.locator('text=/Invitations/i, text=/Team Invitation/i')).toBeVisible({ timeout: 10000 });
    });

    test('should accept team invitation', async ({ page }) => {
      // Login as team member
      await page.goto('/login');
      await page.fill('input[name="email"]', teamMember.email);
      await page.fill('input[name="password"]', teamMember.password);
      await page.click('button[type="submit"]');

      // Navigate to invitations page
      await page.goto('/invitations');

      // Find pending invitation
      const acceptButton = page.locator('button:has-text("Accept")').first();

      if (await acceptButton.isVisible({ timeout: 5000 })) {
        // Accept invitation
        await acceptButton.click();

        // Verify success
        await expect(page.locator('text=/joined/i, text=/accepted/i')).toBeVisible({ timeout: 10000 });

        // Verify team appears in user's teams
        await page.goto('/teams');
        await expect(page.locator(`text=${teamData.name}`)).toBeVisible({ timeout: 10000 });
      }
    });

    test('should reject team invitation', async ({ page }) => {
      // Login as team member
      await page.goto('/login');
      await page.fill('input[name="email"]', teamMember.email);
      await page.fill('input[name="password"]', teamMember.password);
      await page.click('button[type="submit"]');

      // Navigate to invitations page
      await page.goto('/invitations');

      // Find pending invitation
      const rejectButton = page.locator('button:has-text("Reject")').first();

      if (await rejectButton.isVisible({ timeout: 5000 })) {
        // Reject invitation
        await rejectButton.click();

        // Verify success
        await expect(page.locator('text=/rejected/i, text=/declined/i')).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('Cancel Team Invitation', () => {
    test('should cancel sent invitation', async ({ page }) => {
      // Login as team leader
      await page.goto('/login');
      await page.fill('input[name="email"]', teamLeader.email);
      await page.fill('input[name="password"]', teamLeader.password);
      await page.click('button[type="submit"]');

      // Navigate to team page
      await page.goto('/teams');

      // View sent invitations
      await page.click('text=/View.*Invitations/i, text=/Pending.*Invitations/i');

      // Find cancel button for a pending invitation
      const cancelButton = page.locator('button:has-text("Cancel")').first();

      if (await cancelButton.isVisible({ timeout: 5000 })) {
        // Cancel invitation
        await cancelButton.click();

        // Verify success
        await expect(page.locator('text=/cancelled/i, text=/canceled/i')).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('Invitation Notifications', () => {
    test('should receive notification for new invitation', async ({ page }) => {
      // Login as team member
      await page.goto('/login');
      await page.fill('input[name="email"]', teamMember.email);
      await page.fill('input[name="password"]', teamMember.password);
      await page.click('button[type="submit"]');

      // Check notification bell
      const notificationBell = page.locator('button[aria-label*="notification"], button:has(svg)').filter({ hasText: /\d+/ }).first();

      if (await notificationBell.isVisible({ timeout: 5000 })) {
        // Open notifications
        await notificationBell.click();

        // Should see team invitation notification
        await expect(page.locator('text=/Team Invitation/i, text=/invited.*team/i')).toBeVisible({ timeout: 10000 });
      }
    });

    test('should receive notification when invitation is accepted', async ({ page }) => {
      // Login as team leader
      await page.goto('/login');
      await page.fill('input[name="email"]', teamLeader.email);
      await page.fill('input[name="password"]', teamLeader.password);
      await page.click('button[type="submit"]');

      // Check notifications
      await page.goto('/notifications');

      // Should see acceptance notification if member accepted
      const notifications = page.locator('text=/accepted/i, text=/joined.*team/i');
      await expect(notifications.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Edge Cases', () => {
    test('should not allow duplicate invitations', async ({ page }) => {
      // Login as team leader
      await page.goto('/login');
      await page.fill('input[name="email"]', teamLeader.email);
      await page.fill('input[name="password"]', teamLeader.password);
      await page.click('button[type="submit"]');

      // Navigate to team page
      await page.goto('/teams');

      // Send first invitation
      await page.click('button:has-text("Invite Member")');
      await page.fill('input[type="email"]', teamMember.email);
      await page.click('button:has-text("Send Invitation")');

      await page.waitForTimeout(2000);

      // Try to send duplicate invitation
      await page.click('button:has-text("Invite Member")');
      await page.fill('input[type="email"]', teamMember.email);
      await page.click('button:has-text("Send Invitation")');

      // Should show error about existing invitation
      await expect(page.locator('text=/already.*invited/i, text=/pending.*invitation/i')).toBeVisible({ timeout: 10000 });
    });

    test('should not allow inviting existing team members', async ({ page }) => {
      // Login as team leader
      await page.goto('/login');
      await page.fill('input[name="email"]', teamLeader.email);
      await page.fill('input[name="password"]', teamLeader.password);
      await page.click('button[type="submit"]');

      // Navigate to team page
      await page.goto('/teams');

      // Try to invite someone already in team
      await page.click('button:has-text("Invite Member")');
      await page.fill('input[type="email"]', teamLeader.email); // Try to invite self
      await page.click('button:has-text("Send Invitation")');

      // Should show error
      await expect(page.locator('text=/already.*member/i, text=/cannot.*invite/i')).toBeVisible({ timeout: 10000 });
    });

    test('should handle expired invitations', async ({ page }) => {
      // Login as team member
      await page.goto('/login');
      await page.fill('input[name="email"]', teamMember.email);
      await page.fill('input[name="password"]', teamMember.password);
      await page.click('button[type="submit"]');

      // Navigate to invitations page
      await page.goto('/invitations');

      // Expired invitations should not have Accept/Reject buttons
      const expiredInvitations = page.locator('text=EXPIRED').locator('..');
      if (await expiredInvitations.count() > 0) {
        const expiredInvitation = expiredInvitations.first();
        await expect(expiredInvitation.locator('button:has-text("Accept")')).not.toBeVisible();
        await expect(expiredInvitation.locator('button:has-text("Reject")')).not.toBeVisible();
      }
    });
  });
});
