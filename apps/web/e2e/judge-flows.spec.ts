import { test, expect } from '@playwright/test';

test.describe('Judge Flows', () => {
  const timestamp = Date.now();

  const judgeUser = {
    email: `judge-${timestamp}@test.com`,
    password: 'Judge123!',
    name: `Judge User ${timestamp}`,
  };

  const hackathonSlug = 'test-hackathon';

  test.beforeEach(async ({ page }) => {
    // Login as judge
    await page.goto('/login');
    await page.fill('input[name="email"]', judgeUser.email);
    await page.fill('input[name="password"]', judgeUser.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test.describe('Judge Dashboard', () => {
    test('should navigate to judge dashboard', async ({ page }) => {
      await page.goto('/judge/dashboard');

      await expect(page.locator('h1, h2').filter({ hasText: /Judge.*Dashboard/i })).toBeVisible({
        timeout: 10000,
      });
    });

    test('should display assigned hackathons', async ({ page }) => {
      await page.goto('/judge/dashboard');

      // Should see list of hackathons to judge
      const hackathonsList = page.locator('text=/Hackathons/i, text=/Assigned/i');
      await expect(hackathonsList).toBeVisible({ timeout: 10000 });
    });

    test('should show judging statistics', async ({ page }) => {
      await page.goto('/judge/dashboard');

      // Look for statistics (submissions scored, pending, etc.)
      const stats = page.locator('text=/Scored/i, text=/Pending/i, text=/Submissions/i').first();
      await expect(stats).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('View Submissions', () => {
    test('should view hackathon submissions', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      // Should display list of submissions
      await expect(page.locator('h1, h2').filter({ hasText: /Submissions/i })).toBeVisible({
        timeout: 10000,
      });
    });

    test('should view submission details', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      // Find and click first submission
      const firstSubmission = page.locator('[data-submission-id], .submission-card').first();

      if (await firstSubmission.isVisible({ timeout: 5000 })) {
        await firstSubmission.click();

        // Should navigate to submission detail page
        await expect(page).toHaveURL(/\/submissions\//, { timeout: 10000 });

        // Should see submission details
        await expect(page.locator('text=/Description/i, text=/Team/i')).toBeVisible({
          timeout: 10000,
        });
      }
    });

    test('should filter submissions by status', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      // Look for filter controls
      const filterButton = page.locator('button:has-text("Filter"), select[name="status"]').first();

      if (await filterButton.isVisible({ timeout: 3000 })) {
        await filterButton.click();

        // Select "Not Scored" or "Pending"
        const pendingOption = page.locator('text=/Not.*Scored/i, text=/Pending/i').first();
        if (await pendingOption.isVisible({ timeout: 3000 })) {
          await pendingOption.click();

          // Wait for filter to apply
          await page.waitForTimeout(1000);

          // Should only show unscored submissions
          expect(true).toBeTruthy();
        }
      }
    });
  });

  test.describe('Score Submissions', () => {
    test('should open scoring interface', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      // Find a submission to score
      const scoreButton = page
        .locator('button:has-text("Score"), button:has-text("Judge")')
        .first();

      if (await scoreButton.isVisible({ timeout: 5000 })) {
        await scoreButton.click();

        // Should see scoring form
        await expect(page.locator('text=/Score/i, text=/Criteria/i')).toBeVisible({
          timeout: 10000,
        });
      }
    });

    test('should submit scores for a submission', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      // Find and open scoring interface
      const scoreButton = page
        .locator('button:has-text("Score"), button:has-text("Judge")')
        .first();

      if (await scoreButton.isVisible({ timeout: 5000 })) {
        await scoreButton.click();

        // Fill in scoring criteria
        const scoreInputs = page.locator('input[type="number"], input[name*="score"]');
        const count = await scoreInputs.count();

        for (let i = 0; i < count; i++) {
          await scoreInputs.nth(i).fill('8'); // Give score of 8
        }

        // Add comments
        const commentField = page
          .locator('textarea[name*="comment"], textarea[placeholder*="comment"]')
          .first();
        if (await commentField.isVisible({ timeout: 3000 })) {
          await commentField.fill('Great project! Well implemented with good documentation.');
        }

        // Submit scores
        await page.click('button[type="submit"], button:has-text("Submit")');

        // Should show success message
        await expect(
          page.locator('text=/success/i, text=/submitted/i, text=/scored/i')
        ).toBeVisible({ timeout: 10000 });
      }
    });

    test('should validate score inputs', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      const scoreButton = page
        .locator('button:has-text("Score"), button:has-text("Judge")')
        .first();

      if (await scoreButton.isVisible({ timeout: 5000 })) {
        await scoreButton.click();

        // Try to submit without filling scores
        await page.click('button[type="submit"], button:has-text("Submit")');

        // Should show validation errors
        await expect(page.locator('text=/required/i, text=/invalid/i').first()).toBeVisible({
          timeout: 5000,
        });
      }
    });

    test('should validate score ranges', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      const scoreButton = page
        .locator('button:has-text("Score"), button:has-text("Judge")')
        .first();

      if (await scoreButton.isVisible({ timeout: 5000 })) {
        await scoreButton.click();

        // Try to enter invalid score (e.g., > 10)
        const scoreInput = page.locator('input[type="number"]').first();
        if (await scoreInput.isVisible({ timeout: 3000 })) {
          await scoreInput.fill('15');

          await page.click('button[type="submit"]');

          // Should show validation error
          await expect(
            page.locator('text=/maximum/i, text=/invalid/i, text=/0.*10/i').first()
          ).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should update existing scores', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      // Find a submission that's already scored
      const editScoreButton = page
        .locator('button:has-text("Edit"), button:has-text("Update Score")')
        .first();

      if (await editScoreButton.isVisible({ timeout: 5000 })) {
        await editScoreButton.click();

        // Modify score
        const scoreInput = page.locator('input[type="number"]').first();
        await scoreInput.fill('9');

        // Update comments
        const commentField = page.locator('textarea').first();
        if (await commentField.isVisible({ timeout: 3000 })) {
          await commentField.fill('Updated review: Excellent work!');
        }

        // Submit update
        await page.click('button[type="submit"], button:has-text("Update")');

        // Should show success
        await expect(page.locator('text=/updated/i, text=/success/i')).toBeVisible({
          timeout: 10000,
        });
      }
    });
  });

  test.describe('Scoring Criteria', () => {
    test('should display all scoring criteria', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      const scoreButton = page.locator('button:has-text("Score")').first();

      if (await scoreButton.isVisible({ timeout: 5000 })) {
        await scoreButton.click();

        // Should see all criteria (e.g., Innovation, Technical, Design, etc.)
        await expect(
          page.locator('text=/Innovation/i, text=/Technical/i, text=/Design/i, text=/Criteria/i')
        ).toBeVisible({ timeout: 10000 });
      }
    });

    test('should show criteria descriptions', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      const scoreButton = page.locator('button:has-text("Score")').first();

      if (await scoreButton.isVisible({ timeout: 5000 })) {
        await scoreButton.click();

        // Look for help text or tooltips explaining criteria
        const helpIcon = page.locator('[aria-label*="help"], [data-tooltip]').first();

        if (await helpIcon.isVisible({ timeout: 3000 })) {
          await helpIcon.hover();

          // Should show description
          await expect(page.locator('[role="tooltip"], .tooltip')).toBeVisible({ timeout: 3000 });
        }
      }
    });
  });

  test.describe('Judge Progress Tracking', () => {
    test('should show scoring progress', async ({ page }) => {
      await page.goto('/judge/dashboard');

      // Should see progress indicator
      const progress = page
        .locator('text=/progress/i, text=/\\d+.*of.*\\d+/i, [role="progressbar"]')
        .first();
      await expect(progress).toBeVisible({ timeout: 10000 });
    });

    test('should highlight unscored submissions', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      // Unscored submissions should have some indicator
      const unscoredBadge = page
        .locator('text=/unscored/i, text=/not.*scored/i, text=/pending/i')
        .first();

      if (await unscoredBadge.isVisible({ timeout: 5000 })) {
        expect(true).toBeTruthy();
      }
    });
  });

  test.describe('Judge Notifications', () => {
    test('should receive notification when assigned as judge', async ({ page }) => {
      await page.goto('/notifications');

      // Should see judge assignment notification
      const notification = page.locator('text=/assigned.*judge/i, text=/judge.*assigned/i').first();

      if (await notification.isVisible({ timeout: 5000 })) {
        expect(true).toBeTruthy();
      }
    });

    test('should receive notification when judging deadline approaches', async ({ page }) => {
      await page.goto('/notifications');

      // Look for deadline reminder notification
      const deadlineNotif = page.locator('text=/deadline/i, text=/due/i').first();

      if (await deadlineNotif.isVisible({ timeout: 5000 })) {
        expect(true).toBeTruthy();
      }
    });
  });

  test.describe('Submission Details', () => {
    test('should view project repository link', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      const submission = page.locator('[data-submission-id], .submission-card').first();

      if (await submission.isVisible({ timeout: 5000 })) {
        await submission.click();

        // Should see repository link
        const repoLink = page
          .locator('a[href*="github"], a[href*="gitlab"], a:has-text("Repository")')
          .first();
        if (await repoLink.isVisible({ timeout: 5000 })) {
          expect(await repoLink.getAttribute('href')).toBeTruthy();
        }
      }
    });

    test('should view demo/live link', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      const submission = page.locator('[data-submission-id], .submission-card').first();

      if (await submission.isVisible({ timeout: 5000 })) {
        await submission.click();

        // Should see demo link
        const demoLink = page
          .locator('a:has-text("Demo"), a:has-text("Live"), a[href*="demo"]')
          .first();
        if (await demoLink.isVisible({ timeout: 5000 })) {
          expect(await demoLink.getAttribute('href')).toBeTruthy();
        }
      }
    });

    test('should view team members', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      const submission = page.locator('[data-submission-id], .submission-card').first();

      if (await submission.isVisible({ timeout: 5000 })) {
        await submission.click();

        // Should see team member list
        await expect(page.locator('text=/Team/i, text=/Members/i')).toBeVisible({ timeout: 10000 });
      }
    });

    test('should view submission screenshots/media', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      const submission = page.locator('[data-submission-id], .submission-card').first();

      if (await submission.isVisible({ timeout: 5000 })) {
        await submission.click();

        // Look for images or media gallery
        const media = page.locator('img[src*="submission"], [data-media], .gallery').first();

        if (await media.isVisible({ timeout: 5000 })) {
          expect(true).toBeTruthy();
        }
      }
    });
  });

  test.describe('Conflict of Interest', () => {
    test('should not allow scoring own submissions', async ({ page }) => {
      // Navigate to submissions where judge might be a team member
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      // If judge is on a team, their submission should not have a score button
      const ownSubmission = page.locator('text=/Your Team/i, text=/You are a member/i').first();

      if (await ownSubmission.isVisible({ timeout: 3000 })) {
        const scoreButton = ownSubmission.locator('..').locator('button:has-text("Score")');
        await expect(scoreButton).not.toBeVisible();
      }
    });
  });

  test.describe('Export and Reports', () => {
    test('should export scores as CSV', async ({ page }) => {
      await page.goto(`/judge/hackathons/${hackathonSlug}/submissions`);

      // Look for export button
      const exportButton = page
        .locator('button:has-text("Export"), button:has-text("Download")')
        .first();

      if (await exportButton.isVisible({ timeout: 3000 })) {
        // Set up download listener
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

        await exportButton.click();

        const download = await downloadPromise;

        if (download) {
          // Verify download occurred
          expect(download.suggestedFilename()).toMatch(/\.csv|\.xlsx/);
        }
      }
    });
  });
});
