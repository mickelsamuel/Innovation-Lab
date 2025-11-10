# Notification System

Complete guide to the email and in-app notification system in Innovation Lab, covering setup, implementation, and integration.

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Implementation](#implementation)
- [API Reference](#api-reference)
- [Integration](#integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

A comprehensive notification system providing both email and in-app notifications with granular user preferences.

### Features

- **14 Notification Types**: Covering hackathons, challenges, teams, and gamification
- **Email Templates**: Gaming-themed HTML emails with NBC/Vaultix branding
- **In-App Notifications**: Real-time polling with bell icon badge
- **User Preferences**: Granular control (email + in-app toggles per type)
- **Auto-Cleanup**: Old read notifications deleted after 30 days
- **Mobile Responsive**: Works seamlessly on all devices

### Notification Types

#### Hackathon Notifications

1. `HACKATHON_REGISTRATION` - User registers for a hackathon
2. `SUBMISSION_RECEIVED` - Team submits a project
3. `JUDGE_ASSIGNED` - User is assigned as a judge
4. `MENTOR_ASSIGNED` - User is assigned as a mentor
5. `JUDGING_COMPLETE` - Judging is finished
6. `WINNER_ANNOUNCEMENT` - Winners are announced

#### Challenge Notifications

7. `CHALLENGE_SUBMISSION` - User submits a challenge solution
8. `CHALLENGE_REVIEWED` - Challenge solution is reviewed
9. `CHALLENGE_ACCEPTED` - Challenge solution is accepted
10. `CHALLENGE_WINNER` - User wins a challenge

#### Team Notifications

11. `TEAM_INVITATION` - User is invited to join a team
12. `TEAM_INVITATION_ACCEPTED` - Someone accepts your invitation

#### Gamification Notifications

13. `LEVEL_UP` - User levels up
14. `BADGE_UNLOCKED` - User unlocks a badge

---

## Quick Start

### Step 1: Install Dependencies (30 seconds)

```bash
# Install frontend dependencies
cd apps/web
pnpm add date-fns @radix-ui/react-scroll-area @radix-ui/react-switch
```

### Step 2: Database Setup (1 minute)

Sync the updated Prisma schema with your database:

```bash
cd packages/database

# Option 1: Push to development database
npx prisma db push

# Option 2: Create a migration
npx prisma migrate dev --name add_notification_preferences

# Generate Prisma client
npx prisma generate
```

### Step 3: Configure Environment (30 seconds)

Ensure email configuration in `apps/api/.env`:

```bash
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@innovationlab.com
FRONTEND_URL=http://localhost:3000
```

**Gmail Setup**:

- Use an App Password, not your regular password
- Enable "Less secure app access" or use App Passwords
- [Generate App Password](https://myaccount.google.com/apppasswords)

### Step 4: Test the System (2 minutes)

Start the application:

```bash
# From root directory
./start.sh
```

Access the notification system:

1. Navigate to http://localhost:3000
2. Log in to your account
3. Look for the bell icon in the header
4. Click it to see the notification dropdown
5. Click "View all notifications" to visit `/notifications`
6. Test the Settings tab to update preferences

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  NotificationBell Component                                 │
│  ├─ Auto-polling every 30 seconds                          │
│  ├─ Unread count badge                                      │
│  ├─ Dropdown with recent notifications                      │
│  └─ Mark as read functionality                              │
│                                                             │
│  Notifications Page (/notifications)                        │
│  ├─ All Notifications tab                                   │
│  ├─ Unread tab                                              │
│  └─ Settings tab (preferences)                              │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API Calls (JWT auth)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    BACKEND (NestJS)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  NotificationsService                                       │
│  ├─ createNotification()                                    │
│  ├─ createBulkNotifications()                               │
│  ├─ getUserNotifications()                                  │
│  ├─ getUnreadCount()                                        │
│  ├─ markAsRead() / markAllAsRead()                          │
│  ├─ getUserPreferences()                                    │
│  ├─ updatePreferences()                                     │
│  ├─ shouldSendEmail()                                       │
│  └─ cleanupOldNotifications()                               │
│                                                             │
│  EmailService                                               │
│  ├─ sendHackathonRegistrationEmail()                        │
│  ├─ sendSubmissionReceivedEmail()                           │
│  ├─ sendJudgeAssignedEmail()                                │
│  ├─ sendMentorAssignedEmail()                               │
│  ├─ sendJudgingCompleteEmail()                              │
│  ├─ sendChallengeSubmissionEmail()                          │
│  ├─ sendChallengeReviewedEmail()                            │
│  ├─ sendTeamInvitationAcceptedEmail()                       │
│  └─ (8 more existing email methods)                         │
│                                                             │
│  Integration with Services                                  │
│  ├─ HackathonsService    → registration notifications       │
│  ├─ SubmissionsService   → submission notifications         │
│  ├─ JudgingService       → judging notifications            │
│  ├─ ChallengesService    → challenge notifications          │
│  ├─ TeamsService         → team notifications               │
│  ├─ InvitationsService   → invitation notifications         │
│  └─ GamificationService  → achievement notifications        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ Prisma ORM
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Notification Table                                         │
│  ├─ id, userId, type                                        │
│  ├─ title, message, link                                    │
│  ├─ readAt, createdAt                                       │
│  └─ Indexes: userId, readAt                                 │
│                                                             │
│  NotificationPreferences Table                              │
│  ├─ userId (unique)                                         │
│  ├─ 14 email toggles (emailHackathonRegistration, etc.)    │
│  ├─ 14 in-app toggles (inAppHackathonRegistration, etc.)   │
│  └─ All default to true                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### User Experience Flow

#### Receiving a Notification

```
1. Backend Event Triggered (e.g., user registers for hackathon)
   └─ HackathonsService.registerForHackathon()

2. NotificationsService.createNotification()
   ├─ Check user preferences
   ├─ Create in-app notification (if enabled)
   └─ Send email (if enabled)

3. Frontend Auto-Polls (every 30 seconds)
   └─ GET /notifications/unread-count

4. Bell Icon Updates
   └─ Shows unread count badge

5. User Clicks Bell
   └─ Dropdown shows 10 most recent notifications

6. User Clicks Notification
   ├─ Navigates to relevant page
   └─ Marks notification as read
```

#### Managing Preferences

```
1. User clicks bell → "View all notifications"
2. Navigates to /notifications
3. Clicks "Settings" tab
4. Toggles email/in-app for each notification type
5. Changes save instantly
6. Future notifications respect new preferences
```

---

## Implementation

### Backend Implementation

#### 1. Database Schema

**Location**: `packages/database/prisma/schema.prisma`

**Notification Model**:

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  message   String   @db.Text
  link      String?
  readAt    DateTime?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([readAt])
}

enum NotificationType {
  HACKATHON_REGISTRATION
  SUBMISSION_RECEIVED
  JUDGE_ASSIGNED
  MENTOR_ASSIGNED
  JUDGING_COMPLETE
  WINNER_ANNOUNCEMENT
  CHALLENGE_SUBMISSION
  CHALLENGE_REVIEWED
  CHALLENGE_ACCEPTED
  CHALLENGE_WINNER
  TEAM_INVITATION
  TEAM_INVITATION_ACCEPTED
  LEVEL_UP
  BADGE_UNLOCKED
}
```

**NotificationPreferences Model**:

```prisma
model NotificationPreferences {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Email preferences (14 toggles)
  emailHackathonRegistration    Boolean @default(true)
  emailSubmissionReceived       Boolean @default(true)
  emailJudgeAssigned            Boolean @default(true)
  emailMentorAssigned           Boolean @default(true)
  emailJudgingComplete          Boolean @default(true)
  emailWinnerAnnouncement       Boolean @default(true)
  emailChallengeSubmission      Boolean @default(true)
  emailChallengeReviewed        Boolean @default(true)
  emailChallengeAccepted        Boolean @default(true)
  emailChallengeWinner          Boolean @default(true)
  emailTeamInvitation           Boolean @default(true)
  emailTeamInvitationAccepted   Boolean @default(true)
  emailLevelUp                  Boolean @default(true)
  emailBadgeUnlocked            Boolean @default(true)

  // In-app preferences (14 toggles)
  inAppHackathonRegistration    Boolean @default(true)
  inAppSubmissionReceived       Boolean @default(true)
  inAppJudgeAssigned            Boolean @default(true)
  inAppMentorAssigned           Boolean @default(true)
  inAppJudgingComplete          Boolean @default(true)
  inAppWinnerAnnouncement       Boolean @default(true)
  inAppChallengeSubmission      Boolean @default(true)
  inAppChallengeReviewed        Boolean @default(true)
  inAppChallengeAccepted        Boolean @default(true)
  inAppChallengeWinner          Boolean @default(true)
  inAppTeamInvitation           Boolean @default(true)
  inAppTeamInvitationAccepted   Boolean @default(true)
  inAppLevelUp                  Boolean @default(true)
  inAppBadgeUnlocked            Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### 2. Notifications Service

**Location**: `apps/api/src/notifications/notifications.service.ts`

**Key Methods**:

```typescript
// Create a single notification
async createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
})

// Create multiple notifications (bulk)
async createBulkNotifications(notifications: Array<{...}>)

// Get user notifications with pagination
async getUserNotifications(
  userId: string,
  unreadOnly?: boolean,
  limit = 20,
  offset = 0
)

// Mark notification as read
async markAsRead(notificationId: string, userId: string)

// Mark all as read
async markAllAsRead(userId: string)

// Get unread count
async getUnreadCount(userId: string)

// Get or create user preferences
async getUserPreferences(userId: string)

// Update preferences
async updatePreferences(
  userId: string,
  updates: Partial<NotificationPreferences>
)

// Check if email should be sent
async shouldSendEmail(userId: string, type: NotificationType)

// Cleanup old read notifications (30+ days)
async cleanupOldNotifications()
```

#### 3. Notifications Controller

**Location**: `apps/api/src/notifications/notifications.controller.ts`

**API Endpoints**:

| Method  | Endpoint                       | Description                   |
| ------- | ------------------------------ | ----------------------------- |
| `GET`   | `/notifications`               | Get notifications (paginated) |
| `GET`   | `/notifications/unread-count`  | Get unread count              |
| `GET`   | `/notifications/preferences`   | Get user preferences          |
| `PATCH` | `/notifications/preferences`   | Update preferences            |
| `POST`  | `/notifications/:id/read`      | Mark as read                  |
| `POST`  | `/notifications/mark-all-read` | Mark all as read              |

#### 4. Email Templates

**Location**: `apps/api/src/email/templates/`

**Template Files** (16 total):

**New Templates** (8):

1. `hackathon-registration-confirmed.html`
2. `submission-received.html`
3. `judge-assigned.html`
4. `mentor-assigned.html`
5. `judging-complete.html`
6. `challenge-submission-received.html`
7. `challenge-reviewed.html`
8. `team-invitation-accepted.html`

**Existing Templates** (8):

- `welcome.html`
- `password-reset.html`
- `password-changed.html`
- `team-invitation.html`
- `challenge-accepted.html`
- `challenge-winner.html`
- `winner-announcement.html`
- `level-up.html`
- `badge-unlocked.html`

**Template Features**:

- Gaming-themed design
- NBC/Vaultix branding
- Red/gradient color scheme (#E4002B)
- Variable replacement: `{{variableName}}`
- Responsive HTML/CSS
- Call-to-action buttons

**Template Example**:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{title}}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background: #0f0f1e; color: #fff;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #E4002B;">{{title}}</h1>
      <p>{{message}}</p>
      <a
        href="{{actionUrl}}"
        style="background: linear-gradient(135deg, #E4002B 0%, #8B0000 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;"
      >
        {{actionText}}
      </a>
    </div>
  </body>
</html>
```

#### 5. Email Service

**Location**: `apps/api/src/email/email.service.ts`

**New Methods**:

```typescript
async sendHackathonRegistrationEmail(to, hackathonName, hackathonLink)
async sendSubmissionReceivedEmail(to, projectName, submissionLink)
async sendJudgeAssignedEmail(to, hackathonName, dashboardLink)
async sendMentorAssignedEmail(to, hackathonName, dashboardLink)
async sendJudgingCompleteEmail(to, projectName, score, leaderboardLink)
async sendChallengeSubmissionEmail(to, challengeName, submissionLink)
async sendChallengeReviewedEmail(to, challengeName, feedback, reviewLink)
async sendTeamInvitationAcceptedEmail(to, inviteeName, teamName, dashboardLink)
```

### Frontend Implementation

#### 1. API Client

**Location**: `apps/web/src/lib/notifications.ts`

```typescript
import { getAuthHeader } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  unreadCount: number;
}

export interface NotificationPreferences {
  // Email preferences
  emailHackathonRegistration: boolean;
  emailSubmissionReceived: boolean;
  // ... 12 more email fields

  // In-app preferences
  inAppHackathonRegistration: boolean;
  inAppSubmissionReceived: boolean;
  // ... 12 more in-app fields
}

export async function getNotifications(
  unreadOnly = false,
  limit = 20,
  offset = 0
): Promise<NotificationsResponse> {
  const headers = await getAuthHeader();
  const params = new URLSearchParams({
    unreadOnly: String(unreadOnly),
    limit: String(limit),
    offset: String(offset),
  });

  const response = await fetch(`${API_URL}/notifications?${params}`, {
    headers,
  });

  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
}

export async function getUnreadCount(): Promise<{ count: number }> {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_URL}/notifications/unread-count`, {
    headers,
  });

  if (!response.ok) throw new Error('Failed to fetch unread count');
  return response.json();
}

export async function markAsRead(notificationId: string): Promise<void> {
  const headers = await getAuthHeader();
  await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: 'POST',
    headers,
  });
}

export async function markAllAsRead(): Promise<void> {
  const headers = await getAuthHeader();
  await fetch(`${API_URL}/notifications/mark-all-read`, {
    method: 'POST',
    headers,
  });
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_URL}/notifications/preferences`, {
    headers,
  });

  if (!response.ok) throw new Error('Failed to fetch preferences');
  return response.json();
}

export async function updateNotificationPreferences(
  updates: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const headers = await getAuthHeader();
  const response = await fetch(`${API_URL}/notifications/preferences`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) throw new Error('Failed to update preferences');
  return response.json();
}
```

#### 2. NotificationBell Component

**Location**: `apps/web/src/components/layout/NotificationBell.tsx`

**Features**:

- Bell icon with unread count badge
- Dropdown with 10 most recent notifications
- Auto-polling every 30 seconds
- Mark as read functionality
- Notification icons based on type
- Relative timestamps (e.g., "2 hours ago")
- Links to relevant pages
- Gaming-themed UI with pulse animation

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  type Notification,
} from '@/lib/notifications';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(false, 10, 0);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { count } = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-0 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No notifications yet</div>
          ) : (
            notifications.map(notification => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-4 cursor-pointer ${
                  !notification.readAt ? 'bg-accent/50' : ''
                }`}
                onClick={() => {
                  handleMarkAsRead(notification.id);
                  if (notification.link) {
                    window.location.href = notification.link;
                  }
                }}
              >
                <div className="font-medium">{notification.title}</div>
                <div className="text-sm text-muted-foreground">{notification.message}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-center justify-center"
          onClick={() => (window.location.href = '/notifications')}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### 3. Notifications Page

**Location**: `apps/web/src/app/notifications/page.tsx`

**Features**:

- Three tabs: All, Unread, Settings
- Full notification list (50 most recent)
- Filter by read/unread status
- Mark all as read
- Click notification to navigate and mark as read
- Comprehensive preferences panel
- Real-time preference updates
- Empty states

---

## API Reference

### Get Notifications

```http
GET /notifications?unreadOnly=true&limit=20&offset=0
Authorization: Bearer {token}
```

**Response**:

```json
{
  "notifications": [
    {
      "id": "clxxxxx",
      "type": "HACKATHON_REGISTRATION",
      "title": "Registration Confirmed!",
      "message": "You've registered for Summer Hackathon 2025",
      "link": "/hackathons/summer-2025",
      "readAt": null,
      "createdAt": "2025-11-08T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  },
  "unreadCount": 15
}
```

### Get Unread Count

```http
GET /notifications/unread-count
Authorization: Bearer {token}
```

**Response**:

```json
{
  "count": 15
}
```

### Mark as Read

```http
POST /notifications/{notificationId}/read
Authorization: Bearer {token}
```

### Mark All as Read

```http
POST /notifications/mark-all-read
Authorization: Bearer {token}
```

### Get Preferences

```http
GET /notifications/preferences
Authorization: Bearer {token}
```

**Response**:

```json
{
  "id": "clxxxxx",
  "userId": "user-123",
  "emailHackathonRegistration": true,
  "emailSubmissionReceived": true,
  // ... 12 more email fields
  "inAppHackathonRegistration": true,
  "inAppSubmissionReceived": true,
  // ... 12 more in-app fields
  "createdAt": "2025-11-08T10:00:00Z",
  "updatedAt": "2025-11-08T10:00:00Z"
}
```

### Update Preferences

```http
PATCH /notifications/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "emailHackathonRegistration": false,
  "inAppLevelUp": true
}
```

---

## Integration

### Example 1: Hackathon Registration

```typescript
// apps/api/src/hackathons/hackathons.service.ts

@Injectable()
export class HackathonsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService
  ) {}

  async registerForHackathon(userId: string, hackathonId: string) {
    // Register user
    const registration = await this.prisma.registration.create({
      data: { userId, hackathonId },
    });

    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
    });

    // Create in-app notification
    await this.notificationsService.createNotification({
      userId,
      type: NotificationType.HACKATHON_REGISTRATION,
      title: 'Registration Confirmed!',
      message: `You've successfully registered for ${hackathon.title}`,
      link: `/hackathons/${hackathon.slug}`,
    });

    // Send email if enabled in preferences
    const shouldSendEmail = await this.notificationsService.shouldSendEmail(
      userId,
      NotificationType.HACKATHON_REGISTRATION
    );

    if (shouldSendEmail) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      await this.emailService.sendHackathonRegistrationEmail(
        user.email,
        hackathon.title,
        `${process.env.FRONTEND_URL}/hackathons/${hackathon.slug}`
      );
    }

    return registration;
  }
}
```

### Example 2: Team Invitation Accepted

```typescript
// apps/api/src/invitations/invitations.service.ts

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService
  ) {}

  async acceptInvitation(invitationId: string, userId: string) {
    // Accept invitation logic...
    const invitation = await this.prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.ACCEPTED },
      include: {
        invitedBy: true,
        invitee: true,
        team: true,
      },
    });

    // Notify the person who sent the invitation
    await this.notificationsService.createNotification({
      userId: invitation.invitedById,
      type: NotificationType.TEAM_INVITATION_ACCEPTED,
      title: `${invitation.invitee.name} joined your team!`,
      message: `${invitation.invitee.name} accepted your invitation to ${invitation.team.name}`,
      link: '/dashboard',
    });

    // Send email if enabled
    if (
      await this.notificationsService.shouldSendEmail(
        invitation.invitedById,
        NotificationType.TEAM_INVITATION_ACCEPTED
      )
    ) {
      await this.emailService.sendTeamInvitationAcceptedEmail(
        invitation.invitedBy.email,
        invitation.invitee.name,
        invitation.team.name,
        `${process.env.FRONTEND_URL}/dashboard`
      );
    }

    return invitation;
  }
}
```

### Example 3: Level Up

```typescript
// apps/api/src/gamification/gamification.service.ts

@Injectable()
export class GamificationService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService
  ) {}

  async awardXP(userId: string, xp: number, reason: string) {
    // Update user XP
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: xp } },
    });

    // Check for level up
    const newLevel = this.calculateLevel(user.xp);
    const oldLevel = this.calculateLevel(user.xp - xp);

    if (newLevel > oldLevel) {
      // Create notification
      await this.notificationsService.createNotification({
        userId,
        type: NotificationType.LEVEL_UP,
        title: `Level ${newLevel} Unlocked!`,
        message: `Congratulations! You've reached Level ${newLevel}`,
        link: '/leaderboard',
      });

      // Send email if enabled
      if (await this.notificationsService.shouldSendEmail(userId, NotificationType.LEVEL_UP)) {
        await this.emailService.sendLevelUpEmail(
          user.email,
          newLevel,
          `${process.env.FRONTEND_URL}/leaderboard`
        );
      }
    }

    return user;
  }

  private calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100));
  }
}
```

### Bulk Notifications

For notifying multiple users (e.g., all hackathon participants):

```typescript
// Notify all hackathon participants
const participants = await this.prisma.registration.findMany({
  where: { hackathonId },
  include: { user: true },
});

await this.notificationsService.createBulkNotifications(
  participants.map(p => ({
    userId: p.userId,
    type: NotificationType.WINNER_ANNOUNCEMENT,
    title: 'Winners Announced!',
    message: `The winners of ${hackathon.title} have been announced`,
    link: `/hackathons/${hackathon.slug}/leaderboard`,
  }))
);

// Send emails to users who have email enabled
for (const participant of participants) {
  if (
    await this.notificationsService.shouldSendEmail(
      participant.userId,
      NotificationType.WINNER_ANNOUNCEMENT
    )
  ) {
    await this.emailService.sendWinnerAnnouncementEmail(
      participant.user.email,
      hackathon.title,
      `${process.env.FRONTEND_URL}/hackathons/${hackathon.slug}/leaderboard`
    );
  }
}
```

---

## Troubleshooting

### Email Not Sending

**Problem**: Emails not being delivered

**Solutions**:

1. Check environment variables are set correctly
2. For Gmail:
   - Use an App Password (not regular password)
   - Enable "Less secure app access" or use App Passwords
   - Generate at: https://myaccount.google.com/apppasswords
3. Check API logs for email errors:
   ```bash
   # Check logs
   docker logs innovation-lab-api
   ```
4. Test email service:
   ```bash
   # Test endpoint
   curl -X POST http://localhost:4000/v1/email/test \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Notifications Not Appearing

**Problem**: Notifications not showing in frontend

**Solutions**:

1. Verify user has notifications enabled in preferences
2. Test API endpoint:
   ```bash
   curl http://localhost:4000/v1/notifications \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
3. Check browser console for errors
4. Ensure JWT token is valid
5. Clear browser cache and reload

### Database Schema Issues

**Problem**: Prisma errors about missing tables/columns

**Solutions**:

```bash
cd packages/database

# Regenerate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or create a migration
npx prisma migrate dev --name fix_notifications
```

### Polling Not Working

**Problem**: Unread count not updating automatically

**Solutions**:

1. Check NotificationBell component is mounted
2. Verify user is authenticated
3. Check browser network tab for API calls every 30 seconds
4. Adjust polling interval in NotificationBell.tsx if needed:
   ```typescript
   // Change from 30000 (30 seconds) to desired interval
   const interval = setInterval(fetchUnreadCount, 15000); // 15 seconds
   ```

### Performance Issues

**Problem**: Slow notification loading or high database load

**Solutions**:

1. Enable database indexes (already included in schema)
2. Adjust pagination limits:
   ```typescript
   // Reduce from 50 to 20
   const data = await getNotifications(false, 20, 0);
   ```
3. Schedule cleanup job to remove old notifications:
   ```typescript
   // In a cron job or scheduled task
   await notificationsService.cleanupOldNotifications();
   ```
4. Consider Redis caching for unread counts:
   ```typescript
   // Cache unread count in Redis for 60 seconds
   const cacheKey = `unread_count:${userId}`;
   let count = await redis.get(cacheKey);
   if (!count) {
     count = await getUnreadCount();
     await redis.set(cacheKey, count, 'EX', 60);
   }
   ```

---

## Best Practices

### Performance

1. **Use Bulk Operations**: For notifying multiple users, use `createBulkNotifications()`
2. **Schedule Cleanup**: Run `cleanupOldNotifications()` daily via cron job
3. **Paginate**: Use pagination for large notification lists
4. **Cache**: Consider Redis for unread counts in high-traffic scenarios
5. **Indexes**: Ensure database indexes on `userId` and `readAt`

### Security

1. **JWT Auth**: All endpoints require authentication
2. **User Isolation**: Users can only access their own notifications
3. **Input Validation**: All inputs validated via DTOs
4. **SQL Injection**: Protected via Prisma ORM
5. **Rate Limiting**: Consider adding rate limits to notification endpoints

### User Experience

1. **Timely Notifications**: Send immediately after events
2. **Clear Messages**: Use concise, actionable notification text
3. **Relevant Links**: Include links to relevant pages
4. **Respect Preferences**: Always check preferences before sending
5. **Unobtrusive**: Use polling instead of WebSockets to reduce complexity

### Development

1. **Test Emails**: Use Mailhog or similar for testing locally
2. **Mock Notifications**: Create test notifications for UI development
3. **Error Handling**: Always wrap notification calls in try-catch
4. **Logging**: Log notification creation for debugging
5. **Documentation**: Keep integration examples up to date

---

## Production Deployment

### Checklist

- [ ] Environment variables configured
- [ ] Database schema migrated
- [ ] Email service credentials set up
- [ ] Cleanup cron job scheduled
- [ ] Rate limiting configured
- [ ] Monitoring/logging enabled
- [ ] Email templates tested
- [ ] Performance tested (load testing)
- [ ] Security audit completed
- [ ] User acceptance testing done

### Environment Variables

```bash
# Production .env
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-production-email@example.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@innovation-lab.com
FRONTEND_URL=https://innovation-lab.com
```

### Cron Job for Cleanup

Set up a daily cron job to clean old notifications:

```bash
# crontab -e
0 2 * * * curl -X POST http://localhost:4000/v1/notifications/cleanup \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Or use a task scheduler in your application:

```typescript
// In main.ts or app.module.ts
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationCleanupService {
  constructor(private notificationsService: NotificationsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCleanup() {
    await this.notificationsService.cleanupOldNotifications();
  }
}
```

---

## Future Enhancements

Potential improvements for the notification system:

- [ ] WebSocket support for instant notifications (replace polling)
- [ ] Push notifications (browser/mobile)
- [ ] Notification categories/grouping
- [ ] Notification history/archive
- [ ] Email digests (daily/weekly summaries)
- [ ] SMS notifications for critical events
- [ ] Slack/Teams integration
- [ ] Custom notification sounds
- [ ] Notification templates for admins
- [ ] A/B testing for notification messaging

---

**Last Updated**: November 2025
