# Notification System Integration Guide

This guide shows how to integrate the notification system into your existing services.

## Setup

1. Import the NotificationsService and EmailService:

```typescript
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { NotificationType } from '@prisma/client';
```

2. Inject them into your service constructor:

```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly notificationsService: NotificationsService,
  private readonly emailService: EmailService,
) {}
```

3. Make sure your module imports NotificationsModule:

```typescript
@Module({
  imports: [PrismaModule, NotificationsModule, EmailModule],
  // ...
})
```

## Example: Hackathon Registration

```typescript
async registerForHackathon(userId: string, hackathonId: string, teamId: string) {
  // Your registration logic here
  const hackathon = await this.prisma.hackathon.findUnique({
    where: { id: hackathonId }
  });

  const team = await this.prisma.team.findUnique({
    where: { id: teamId }
  });

  const user = await this.prisma.user.findUnique({
    where: { id: userId }
  });

  // Create in-app notification
  await this.notificationsService.createNotification({
    userId,
    type: NotificationType.HACKATHON_REGISTRATION,
    title: 'Registration Confirmed!',
    message: `You've successfully registered for ${hackathon.title}`,
    data: { hackathonId, teamId },
    link: `/hackathons/${hackathon.slug}`,
  });

  // Send email if user has email notifications enabled
  const shouldEmail = await this.notificationsService.shouldSendEmail(
    userId,
    NotificationType.HACKATHON_REGISTRATION
  );

  if (shouldEmail) {
    await this.emailService.sendHackathonRegistrationEmail(
      user.email,
      user.name,
      hackathon.title,
      hackathon.slug,
      team.name,
      hackathon.startsAt.toISOString(),
      hackathon.endsAt.toISOString(),
      hackathon.location,
    );
  }
}
```

## Example: Submission Received

```typescript
async submitProject(submissionData: SubmitProjectDto) {
  // Your submission logic
  const submission = await this.prisma.submission.create({
    data: submissionData,
    include: {
      team: {
        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      },
      hackathon: true
    }
  });

  // Notify all team members
  const notifications = submission.team.members.map(member => ({
    userId: member.userId,
    type: NotificationType.SUBMISSION_RECEIVED,
    title: 'Submission Received!',
    message: `Your submission "${submission.title}" has been received`,
    data: { submissionId: submission.id },
    link: `/hackathons/${submission.hackathon.slug}/submissions`,
  }));

  await this.notificationsService.createBulkNotifications(notifications);

  // Send emails to team members who have it enabled
  for (const member of submission.team.members) {
    const shouldEmail = await this.notificationsService.shouldSendEmail(
      member.userId,
      NotificationType.SUBMISSION_RECEIVED
    );

    if (shouldEmail) {
      await this.emailService.sendSubmissionReceivedEmail(
        member.user.email,
        member.user.name,
        submission.hackathon.title,
        submission.hackathon.slug,
        submission.title,
        submission.team.name,
        submission.submittedAt.toISOString(),
        submission.hackathon.judgingEndsAt?.toISOString() || 'TBD',
      );
    }
  }
}
```

## Example: Judge Assignment

```typescript
async assignJudge(userId: string, hackathonId: string) {
  // Your judge assignment logic
  const judge = await this.prisma.judge.create({
    data: {
      userId,
      hackathonId,
    },
    include: {
      user: true,
      hackathon: {
        include: {
          submissions: true,
          judges: true,
        }
      }
    }
  });

  // Create in-app notification
  await this.notificationsService.createNotification({
    userId,
    type: NotificationType.JUDGE_ASSIGNED,
    title: 'You\'ve Been Assigned as a Judge!',
    message: `You're now a judge for ${judge.hackathon.title}`,
    data: { hackathonId, judgeId: judge.id },
    link: `/hackathons/${judge.hackathon.slug}/judging`,
  });

  // Send email
  const shouldEmail = await this.notificationsService.shouldSendEmail(
    userId,
    NotificationType.JUDGE_ASSIGNED
  );

  if (shouldEmail) {
    await this.emailService.sendJudgeAssignedEmail(
      judge.user.email,
      judge.user.name,
      judge.hackathon.title,
      judge.hackathon.slug,
      judge.hackathon.description,
      judge.hackathon.submissions.length,
      judge.hackathon.judges.length,
      judge.hackathon.endsAt.toISOString(),
      judge.hackathon.judgingEndsAt?.toISOString() || 'TBD',
    );
  }
}
```

## Example: Challenge Reviewed

```typescript
async reviewChallengeSubmission(submissionId: string, feedback: string, status: string, score?: number) {
  const submission = await this.prisma.challengeSubmission.update({
    where: { id: submissionId },
    data: {
      feedback,
      status,
      score,
    },
    include: {
      user: true,
      challenge: true,
    }
  });

  // Notify the submitter
  await this.notificationsService.createNotification({
    userId: submission.userId,
    type: NotificationType.CHALLENGE_REVIEWED,
    title: 'Your Submission Has Been Reviewed',
    message: `Your solution for "${submission.challenge.title}" has been reviewed`,
    data: { submissionId, challengeId: submission.challengeId, status, score },
    link: `/challenges/${submission.challenge.slug}/my-submission`,
  });

  // Send email
  const shouldEmail = await this.notificationsService.shouldSendEmail(
    submission.userId,
    NotificationType.CHALLENGE_REVIEWED
  );

  if (shouldEmail) {
    await this.emailService.sendChallengeReviewedEmail(
      submission.user.email,
      submission.user.name,
      submission.challenge.title,
      submission.challenge.slug,
      status,
      feedback,
      score,
    );
  }
}
```

## Example: Level Up (Gamification)

```typescript
async awardXp(userId: string, points: number, eventType: string, metadata?: any) {
  // Update XP and check for level up
  const profile = await this.prisma.gamificationProfile.update({
    where: { userId },
    data: {
      xp: { increment: points }
    },
    include: {
      user: true
    }
  });

  const newLevel = this.calculateLevel(profile.xp);

  if (newLevel > profile.level) {
    // Level up!
    await this.prisma.gamificationProfile.update({
      where: { userId },
      data: { level: newLevel }
    });

    // Notify user
    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.LEVEL_UP,
      title: `Level Up! You're now Level ${newLevel}`,
      message: `Congratulations! You've reached Level ${newLevel}`,
      data: { level: newLevel, previousLevel: profile.level },
      link: '/leaderboard',
    });

    // Send email
    const shouldEmail = await this.notificationsService.shouldSendEmail(
      userId,
      NotificationType.LEVEL_UP
    );

    if (shouldEmail) {
      const levelName = this.getLevelName(newLevel);
      await this.emailService.sendLevelUpEmail(
        profile.user.email,
        profile.user.name,
        newLevel,
        levelName,
      );
    }
  }
}
```

## Best Practices

1. **Always check preferences before sending emails**:
   ```typescript
   const shouldEmail = await this.notificationsService.shouldSendEmail(userId, notificationType);
   if (shouldEmail) {
     await this.emailService.sendEmail(...);
   }
   ```

2. **Use bulk notifications for multiple users**:
   ```typescript
   const notifications = users.map(user => ({
     userId: user.id,
     type: NotificationType.WINNER_ANNOUNCEMENT,
     // ...
   }));
   await this.notificationsService.createBulkNotifications(notifications);
   ```

3. **Provide meaningful links**:
   Always include a `link` property that takes users to the relevant page.

4. **Keep messages concise**:
   In-app notifications should be brief. Save detailed information for the linked page.

5. **Handle errors gracefully**:
   ```typescript
   try {
     await this.notificationsService.createNotification(...);
   } catch (error) {
     this.logger.error('Failed to create notification', error);
     // Don't let notification failures break your main logic
   }
   ```

6. **Use async/await properly**:
   For non-critical notifications, consider using fire-and-forget patterns or background jobs.

## Available Notification Types

- `HACKATHON_REGISTRATION`
- `SUBMISSION_RECEIVED`
- `JUDGE_ASSIGNED`
- `MENTOR_ASSIGNED`
- `JUDGING_COMPLETE`
- `WINNER_ANNOUNCEMENT`
- `CHALLENGE_SUBMISSION`
- `CHALLENGE_REVIEWED`
- `CHALLENGE_ACCEPTED`
- `CHALLENGE_WINNER`
- `TEAM_INVITATION`
- `TEAM_INVITATION_ACCEPTED`
- `LEVEL_UP`
- `BADGE_UNLOCKED`

## Email Templates

All email templates are located in `/apps/api/src/email/templates/` and use simple HTML with variable replacement.

Variables are replaced using `{{variableName}}` syntax.

## Cleanup

The system includes automatic cleanup of old read notifications:

```typescript
// In your cron job or scheduled task
await this.notificationsService.cleanupOldNotifications(30); // Delete read notifications older than 30 days
```
