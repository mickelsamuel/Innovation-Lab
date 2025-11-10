# Innovation Lab Backend API - Comprehensive Map

## Project Overview

- **Framework**: NestJS (Node.js backend framework)
- **Database**: PostgreSQL with Prisma ORM
- **API Base URL**: `/v1` (configured in main.ts)
- **Port**: 4000 (default)
- **Documentation**: Swagger available at `/api/docs` in development

---

## Architecture Overview

### Technology Stack

- **Backend Framework**: NestJS 10.3.0
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT, NextAuth.js (for frontend), 2FA with speakeasy
- **File Storage**: AWS S3 (with local fallback)
- **Email**: Nodemailer
- **Rate Limiting**: @nestjs/throttler
- **Task Scheduling**: @nestjs/schedule
- **Logging**: pino/nestjs-pino
- **Security**: Helmet
- **Queue System**: BullMQ (temporarily disabled)

### Module Structure

```
apps/api/src/
├── app.module.ts           # Root module with all imports
├── main.ts                 # Application bootstrap
├── auth/                   # Authentication & Authorization
├── users/                  # User management
├── hackathons/             # Hackathon management
├── teams/                  # Team management
├── submissions/            # Hackathon submissions
├── challenges/             # Standalone challenges
├── judging/                # Judging system & scoring
├── gamification/           # XP, badges, leaderboards
├── files/                  # File upload & management
├── email/                  # Email service
└── common/
    ├── prisma/            # Database service
    └── health/            # Health checks
```

---

## API Endpoints

### Global Configuration

- **API Version**: v1 (URI-based versioning enabled)
- **Global Prefix**: `/v1`
- **CORS**: Configured for development (localhost:3000)
- **Rate Limiting**: Default 100 requests per minute per client
- **Validation**: Global validation pipe with whitelist enabled

---

## 1. AUTHENTICATION MODULE (`/auth`)

### Endpoints

#### POST `/v1/auth/register`

- **Summary**: Register new user
- **Authentication**: Public
- **Rate Limit**: 5 requests/minute
- **Request Body**:
  ```json
  {
    "email": "string (email format)",
    "password": "string (min 8 chars)",
    "name": "string",
    "handle": "string (unique)"
  }
  ```
- **Response**: User with JWT tokens
- **Status Codes**: 201 (success), 400 (validation error), 409 (email/handle exists)

#### POST `/v1/auth/login`

- **Summary**: User login with credentials
- **Authentication**: Public
- **Rate Limit**: 10 requests/minute
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**: User profile with access & refresh tokens
- **Status Codes**: 200 (success), 401 (invalid credentials)

#### POST `/v1/auth/refresh`

- **Summary**: Refresh access token
- **Authentication**: Public
- **Request Body**:
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response**: New access token with expiry
- **Status Codes**: 200 (success), 401 (invalid token)

#### GET `/v1/auth/me`

- **Summary**: Get current authenticated user
- **Authentication**: Bearer JWT
- **Response**: Current user details (id, email, name, handle, roles, avatar)
- **Status Codes**: 200 (success), 401 (unauthorized)

#### POST `/v1/auth/2fa/setup`

- **Summary**: Setup 2FA for user
- **Authentication**: Bearer JWT
- **Response**: Secret key and QR code for TOTP
- **Status Codes**: 200 (success), 401 (unauthorized)

#### POST `/v1/auth/2fa/enable`

- **Summary**: Enable 2FA after verification
- **Authentication**: Bearer JWT
- **Request Body**:
  ```json
  {
    "secret": "string",
    "token": "string (6-digit TOTP code)"
  }
  ```
- **Response**: Success confirmation
- **Status Codes**: 200 (success), 400 (invalid token), 401 (unauthorized)

#### POST `/v1/auth/2fa/disable`

- **Summary**: Disable 2FA
- **Authentication**: Bearer JWT
- **Response**: Success confirmation
- **Status Codes**: 200 (success), 401 (unauthorized)

#### POST `/v1/auth/forgot-password`

- **Summary**: Request password reset email
- **Authentication**: Public
- **Rate Limit**: 3 requests/minute
- **Request Body**:
  ```json
  {
    "email": "string"
  }
  ```
- **Response**: Success message (doesn't reveal if user exists)
- **Status Codes**: 200 (success)

#### POST `/v1/auth/reset-password`

- **Summary**: Reset password with token
- **Authentication**: Public
- **Rate Limit**: 5 requests/minute
- **Request Body**:
  ```json
  {
    "token": "string",
    "password": "string (min 8 chars)"
  }
  ```
- **Response**: Success confirmation
- **Status Codes**: 200 (success), 400 (invalid/expired token)

#### POST `/v1/auth/logout`

- **Summary**: Logout user
- **Authentication**: Bearer JWT
- **Response**: Success confirmation
- **Status Codes**: 200 (success), 401 (unauthorized)

---

## 2. USERS MODULE (`/users`)

**All endpoints require Authentication (Bearer JWT)**

### Endpoints

#### GET `/v1/users/me`

- **Summary**: Get current user's full profile
- **Response**: User profile with all details
- **Status Codes**: 200 (success), 401 (unauthorized)

#### PUT `/v1/users/me`

- **Summary**: Update current user profile
- **Request Body** (partial):
  ```json
  {
    "name": "string",
    "handle": "string",
    "avatarUrl": "string",
    "bio": "string",
    "organization": "string"
  }
  ```
- **Response**: Updated user profile
- **Status Codes**: 200 (success), 409 (handle taken), 401 (unauthorized)

#### PUT `/v1/users/me/password`

- **Summary**: Change user password
- **Request Body**:
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```
- **Response**: Success confirmation
- **Status Codes**: 200 (success), 400 (wrong password), 401 (unauthorized)

#### GET `/v1/users/me/stats`

- **Summary**: Get current user's statistics
- **Response**: User stats (joined hackathons, submissions, wins, etc.)
- **Status Codes**: 200 (success), 401 (unauthorized)

#### GET `/v1/users/me/activity?limit=50`

- **Summary**: Get current user's activity feed
- **Query Params**:
  - `limit` (optional): Number of activities to return (default: 50)
- **Response**: Array of recent activities
- **Status Codes**: 200 (success), 401 (unauthorized)

#### DELETE `/v1/users/me`

- **Summary**: Delete user account
- **Response**: Success confirmation
- **Status Codes**: 200 (success), 401 (unauthorized)

#### GET `/v1/users/search?q=query&limit=10`

- **Summary**: Search for users
- **Query Params**:
  - `q` (required): Search query (name or handle)
  - `limit` (optional): Max results
- **Response**: Array of matching users
- **Status Codes**: 200 (success), 401 (unauthorized)

#### GET `/v1/users/:id`

- **Summary**: Get user by ID
- **Path Params**:
  - `id`: User ID
- **Response**: User profile
- **Status Codes**: 200 (success), 404 (not found), 401 (unauthorized)

#### GET `/v1/users/handle/:handle`

- **Summary**: Get user by handle/username
- **Path Params**:
  - `handle`: User handle
- **Response**: User profile
- **Status Codes**: 200 (success), 404 (not found), 401 (unauthorized)

#### GET `/v1/users/:id/stats`

- **Summary**: Get user statistics by ID
- **Path Params**:
  - `id`: User ID
- **Response**: User statistics
- **Status Codes**: 200 (success), 404 (not found), 401 (unauthorized)

---

## 3. HACKATHONS MODULE (`/hackathons`)

### Endpoints

#### POST `/v1/hackathons`

- **Summary**: Create new hackathon
- **Authentication**: Bearer JWT
- **Required Roles**: BANK_ADMIN, ORGANIZER
- **Request Body**:
  ```json
  {
    "title": "string",
    "slug": "string (unique)",
    "description": "string",
    "coverImage": "string (URL)",
    "status": "DRAFT|UPCOMING|LIVE|JUDGING|CLOSED",
    "location": "VIRTUAL|HYBRID|ONSITE",
    "registrationOpensAt": "ISO date",
    "registrationClosesAt": "ISO date",
    "startsAt": "ISO date",
    "endsAt": "ISO date",
    "judgingEndsAt": "ISO date",
    "prizePool": "number",
    "maxTeamSize": "number",
    "allowSoloTeams": "boolean",
    "rules": "string",
    "schedule": "object",
    "metadata": "object"
  }
  ```
- **Response**: Created hackathon object
- **Status Codes**: 201 (success), 403 (forbidden), 409 (slug exists), 400 (validation error)

#### GET `/v1/hackathons?status=LIVE&page=1&limit=10`

- **Summary**: Get all hackathons with filters
- **Authentication**: Public
- **Query Params**:
  - `status` (optional): DRAFT, UPCOMING, LIVE, JUDGING, CLOSED
  - `page` (optional): Page number
  - `limit` (optional): Items per page
- **Response**: Array of hackathons
- **Status Codes**: 200 (success)

#### GET `/v1/hackathons/slug/:slug`

- **Summary**: Get hackathon by slug
- **Authentication**: Public
- **Path Params**:
  - `slug`: Hackathon slug
- **Response**: Hackathon details
- **Status Codes**: 200 (success), 404 (not found)

#### GET `/v1/hackathons/:id`

- **Summary**: Get hackathon by ID
- **Authentication**: Public
- **Path Params**:
  - `id`: Hackathon ID
- **Response**: Hackathon details
- **Status Codes**: 200 (success), 404 (not found)

#### GET `/v1/hackathons/:id/stats`

- **Summary**: Get hackathon statistics
- **Authentication**: Bearer JWT
- **Path Params**:
  - `id`: Hackathon ID
- **Response**: Stats (teams count, submissions, finalists, etc.)
- **Status Codes**: 200 (success), 404 (not found)

#### PUT `/v1/hackathons/:id`

- **Summary**: Update hackathon
- **Authentication**: Bearer JWT
- **Required Roles**: BANK_ADMIN, ORGANIZER
- **Path Params**:
  - `id`: Hackathon ID
- **Request Body**: Same fields as POST (partial update allowed)
- **Response**: Updated hackathon
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

#### DELETE `/v1/hackathons/:id`

- **Summary**: Delete hackathon
- **Authentication**: Bearer JWT
- **Required Roles**: BANK_ADMIN only
- **Path Params**:
  - `id`: Hackathon ID
- **Response**: Success confirmation
- **Status Codes**: 200 (success), 403 (forbidden), 404 (not found)

#### POST `/v1/hackathons/:id/winners`

- **Summary**: Announce winners and award XP
- **Authentication**: Bearer JWT
- **Required Roles**: BANK_ADMIN, ORGANIZER
- **Path Params**:
  - `id`: Hackathon ID
- **Request Body**:
  ```json
  {
    "winners": [
      {
        "submissionId": "string",
        "placement": 1,
        "xpReward": "number"
      }
    ]
  }
  ```
- **Response**: Success with awarded XP details
- **Status Codes**: 200 (success), 400 (bad request), 403 (forbidden), 404 (not found)

---

## 4. TEAMS MODULE (`/teams`)

### Endpoints

#### POST `/v1/teams`

- **Summary**: Create new team
- **Authentication**: Bearer JWT
- **Request Body**:
  ```json
  {
    "hackathonId": "string",
    "name": "string",
    "bio": "string (optional)",
    "lookingForMembers": "boolean (optional)"
  }
  ```
- **Response**: Created team
- **Status Codes**: 201 (success), 404 (hackathon not found), 409 (already in team)

#### GET `/v1/teams?hackathonId=xxx&lookingForMembers=true`

- **Summary**: Get teams for a hackathon
- **Authentication**: Public
- **Query Params**:
  - `hackathonId` (required): Filter by hackathon
  - `lookingForMembers` (optional): boolean
  - `search` (optional): Search by team name
  - `page` (optional): Pagination
  - `limit` (optional): Items per page
- **Response**: Array of teams
- **Status Codes**: 200 (success)

#### GET `/v1/teams/:id`

- **Summary**: Get team by ID
- **Authentication**: Public
- **Path Params**:
  - `id`: Team ID
- **Response**: Team details with members
- **Status Codes**: 200 (success), 404 (not found)

#### PUT `/v1/teams/:id`

- **Summary**: Update team (Lead only)
- **Authentication**: Bearer JWT
- **Path Params**:
  - `id`: Team ID
- **Request Body** (partial):
  ```json
  {
    "name": "string",
    "bio": "string",
    "lookingForMembers": "boolean",
    "logoUrl": "string",
    "repoUrl": "string",
    "demoUrl": "string"
  }
  ```
- **Response**: Updated team
- **Status Codes**: 200 (success), 403 (not lead), 404 (not found)

#### POST `/v1/teams/:id/members`

- **Summary**: Add member to team (Lead only)
- **Authentication**: Bearer JWT
- **Path Params**:
  - `id`: Team ID
- **Request Body**:
  ```json
  {
    "userId": "string"
  }
  ```
- **Response**: Updated team
- **Status Codes**: 200 (success), 400 (team full or user already member), 403 (not lead)

#### DELETE `/v1/teams/:id/members/:userId`

- **Summary**: Remove member from team (Lead or self)
- **Authentication**: Bearer JWT
- **Path Params**:
  - `id`: Team ID
  - `userId`: User ID to remove
- **Response**: Success confirmation
- **Status Codes**: 200 (success), 403 (insufficient permissions)

#### DELETE `/v1/teams/:id`

- **Summary**: Delete team (Lead only)
- **Authentication**: Bearer JWT
- **Path Params**:
  - `id`: Team ID
- **Response**: Success confirmation
- **Status Codes**: 200 (success), 400 (has submissions), 403 (not lead)

---

## 5. SUBMISSIONS MODULE (`/submissions`)

### Endpoints

#### POST `/v1/submissions`

- **Summary**: Create new hackathon submission
- **Authentication**: Bearer JWT
- **Request Body**:
  ```json
  {
    "hackathonId": "string",
    "teamId": "string",
    "trackId": "string (optional)",
    "title": "string",
    "abstract": "string",
    "repoUrl": "string (optional)",
    "demoUrl": "string (optional)",
    "videoUrl": "string (optional)"
  }
  ```
- **Response**: Created submission
- **Status Codes**: 201 (success), 400 (team already has submission or deadline passed), 403 (not team member)

#### GET `/v1/submissions?hackathonId=xxx&status=SUBMITTED&page=1`

- **Summary**: Get submissions for hackathon
- **Authentication**: Public
- **Query Params**:
  - `hackathonId` (required): Filter by hackathon
  - `status` (optional): DRAFT, SUBMITTED, FINAL, DISQUALIFIED
  - `page` (optional): Pagination
  - `limit` (optional): Items per page
- **Response**: Array of submissions
- **Status Codes**: 200 (success)

#### GET `/v1/submissions/:id`

- **Summary**: Get submission by ID
- **Authentication**: Public
- **Path Params**:
  - `id`: Submission ID
- **Response**: Submission details with scores
- **Status Codes**: 200 (success), 404 (not found)

#### PUT `/v1/submissions/:id`

- **Summary**: Update submission (Team member, before deadline)
- **Authentication**: Bearer JWT
- **Path Params**:
  - `id`: Submission ID
- **Request Body** (partial):
  ```json
  {
    "title": "string",
    "abstract": "string",
    "repoUrl": "string",
    "demoUrl": "string",
    "videoUrl": "string"
  }
  ```
- **Response**: Updated submission
- **Status Codes**: 200 (success), 400 (finalized or past deadline), 403 (not member)

#### POST `/v1/submissions/:id/submit`

- **Summary**: Finalize submission (Team lead only)
- **Authentication**: Bearer JWT
- **Path Params**:
  - `id`: Submission ID
- **Response**: Finalized submission
- **Status Codes**: 200 (success), 400 (already finalized or past deadline), 403 (not lead)

#### DELETE `/v1/submissions/:id`

- **Summary**: Delete submission (Team lead, before scoring)
- **Authentication**: Bearer JWT
- **Path Params**:
  - `id`: Submission ID
- **Response**: Success confirmation
- **Status Codes**: 200 (success), 400 (has scores), 403 (not lead)

---

## 6. CHALLENGES MODULE (`/challenges`)

### Endpoints

#### POST `/v1/challenges`

- **Summary**: Create new challenge
- **Authentication**: Bearer JWT
- **Required Roles**: BANK_ADMIN, ORGANIZER
- **Request Body**:
  ```json
  {
    "slug": "string (unique)",
    "title": "string",
    "problemStatement": "string",
    "rewardType": "CASH|PRIZE|INTERNSHIP|RECOGNITION",
    "rewardValue": "string",
    "categories": ["string"],
    "skills": ["string"],
    "status": "DRAFT|OPEN|REVIEW|CLOSED",
    "visibility": "PUBLIC|PRIVATE",
    "deadlineAt": "ISO date (optional)"
  }
  ```
- **Response**: Created challenge
- **Status Codes**: 201 (success), 400 (validation error), 403 (forbidden)

#### GET `/v1/challenges?status=OPEN&category=web&skill=react&search=query`

- **Summary**: Get all challenges with filters
- **Authentication**: Public
- **Query Params**:
  - `status` (optional): DRAFT, OPEN, REVIEW, CLOSED
  - `category` (optional): Filter by category
  - `skill` (optional): Filter by required skill
  - `ownerId` (optional): Filter by challenge owner
  - `search` (optional): Full-text search
- **Response**: Array of challenges
- **Status Codes**: 200 (success)

#### GET `/v1/challenges/:id`

- **Summary**: Get challenge by ID
- **Authentication**: Public
- **Path Params**:
  - `id`: Challenge ID
- **Response**: Challenge details
- **Status Codes**: 200 (success), 404 (not found)

#### GET `/v1/challenges/slug/:slug`

- **Summary**: Get challenge by slug
- **Authentication**: Public
- **Path Params**:
  - `slug`: Challenge slug
- **Response**: Challenge details
- **Status Codes**: 200 (success), 404 (not found)

#### PUT `/v1/challenges/:id`

- **Summary**: Update challenge (Owner or admin)
- **Authentication**: Bearer JWT
- **Path Params**:
  - `id`: Challenge ID
- **Request Body**: Same as POST (partial allowed)
- **Response**: Updated challenge
- **Status Codes**: 200 (success), 403 (not owner), 404 (not found)

#### DELETE `/v1/challenges/:id`

- **Summary**: Delete challenge (Owner or admin)
- **Authentication**: Bearer JWT
- **Path Params**:
  - `id`: Challenge ID
- **Response**: Success confirmation
- **Status Codes**: 200 (success), 403 (not owner), 404 (not found)

#### POST `/v1/challenges/:id/submit`

- **Summary**: Submit solution to challenge
- **Authentication**: Bearer JWT
- **Path Params**:
  - `id`: Challenge ID
- **Request Body**:
  ```json
  {
    "title": "string",
    "repoUrl": "string (optional)",
    "content": "string (optional)"
  }
  ```
- **Response**: Created submission
- **Status Codes**: 201 (success), 400 (challenge closed or duplicate), 404 (challenge not found)

#### GET `/v1/challenges/:id/submissions`

- **Summary**: Get all submissions for a challenge
- **Authentication**: Public
- **Path Params**:
  - `id`: Challenge ID
- **Response**: Array of submissions
- **Status Codes**: 200 (success), 404 (challenge not found)

#### GET `/v1/challenges/user/submissions`

- **Summary**: Get current user's challenge submissions
- **Authentication**: Bearer JWT
- **Response**: Array of user's submissions
- **Status Codes**: 200 (success), 401 (unauthorized)

#### POST `/v1/challenges/submissions/:id/review`

- **Summary**: Review challenge submission (Owner or admin)
- **Authentication**: Bearer JWT
- **Path Params**:
  - `id`: Submission ID
- **Request Body**:
  ```json
  {
    "status": "ACCEPTED|REJECTED|WINNER",
    "feedback": "string",
    "score": "number (0-100)"
  }
  ```
- **Response**: Updated submission
- **Status Codes**: 200 (success), 403 (not owner), 404 (not found)

---

## 7. JUDGING MODULE

### Judge Management Endpoints

#### POST `/v1/hackathons/:hackathonId/judges`

- **Summary**: Assign a judge to hackathon
- **Authentication**: Bearer JWT
- **Required Roles**: BANK_ADMIN, ORGANIZER
- **Path Params**:
  - `hackathonId`: Hackathon ID
- **Request Body**:
  ```json
  {
    "userId": "string"
  }
  ```
- **Response**: Created judge assignment
- **Status Codes**: 201 (success), 400 (not a judge), 409 (already assigned)

#### GET `/v1/hackathons/:hackathonId/judges`

- **Summary**: Get all judges for a hackathon
- **Authentication**: Public
- **Path Params**:
  - `hackathonId`: Hackathon ID
- **Response**: Array of judges
- **Status Codes**: 200 (success)

#### DELETE `/v1/hackathons/:hackathonId/judges/:userId`

- **Summary**: Remove judge from hackathon
- **Authentication**: Bearer JWT
- **Required Roles**: BANK_ADMIN, ORGANIZER
- **Path Params**:
  - `hackathonId`: Hackathon ID
  - `userId`: Judge user ID
- **Response**: Success confirmation
- **Status Codes**: 200 (success), 400 (judge has scores)

### Scoring Endpoints

#### POST `/v1/submissions/:submissionId/scores`

- **Summary**: Create score for submission
- **Authentication**: Bearer JWT
- **Required Roles**: JUDGE, BANK_ADMIN
- **Path Params**:
  - `submissionId`: Submission ID
- **Request Body**:
  ```json
  {
    "criterionId": "string",
    "score": "number (0-10)",
    "feedback": "string (optional)"
  }
  ```
- **Response**: Created score
- **Status Codes**: 201 (success), 400 (invalid score), 403 (not assigned judge), 409 (already scored)

#### GET `/v1/submissions/:submissionId/scores`

- **Summary**: Get all scores for submission
- **Authentication**: Public
- **Path Params**:
  - `submissionId`: Submission ID
- **Response**: Array of scores with judge feedback
- **Status Codes**: 200 (success)

#### PUT `/v1/scores/:scoreId`

- **Summary**: Update score
- **Authentication**: Bearer JWT
- **Required Roles**: JUDGE, BANK_ADMIN
- **Path Params**:
  - `scoreId`: Score ID
- **Request Body**:
  ```json
  {
    "score": "number",
    "feedback": "string"
  }
  ```
- **Response**: Updated score
- **Status Codes**: 200 (success), 403 (not your score)

#### DELETE `/v1/scores/:scoreId`

- **Summary**: Delete score
- **Authentication**: Bearer JWT
- **Required Roles**: JUDGE, BANK_ADMIN
- **Path Params**:
  - `scoreId`: Score ID
- **Response**: Success confirmation
- **Status Codes**: 200 (success), 403 (not your score)

### Judge Dashboard Endpoints

#### GET `/v1/judge/assignments?hackathonId=xxx`

- **Summary**: Get submissions assigned to judge
- **Authentication**: Bearer JWT
- **Required Roles**: JUDGE, BANK_ADMIN
- **Query Params**:
  - `hackathonId` (optional): Filter by hackathon
- **Response**: Array of submission assignments
- **Status Codes**: 200 (success)

### Rankings Endpoints

#### POST `/v1/hackathons/:hackathonId/calculate-rankings`

- **Summary**: Calculate rankings for hackathon
- **Authentication**: Bearer JWT
- **Required Roles**: BANK_ADMIN, ORGANIZER
- **Path Params**:
  - `hackathonId`: Hackathon ID
- **Response**: Rankings calculation summary
- **Status Codes**: 200 (success)

---

## 8. GAMIFICATION MODULE (`/gamification`)

### User Profile Endpoints

#### GET `/v1/gamification/profile`

- **Summary**: Get current user's gamification profile
- **Authentication**: Bearer JWT
- **Response**:
  ```json
  {
    "userId": "string",
    "xp": "number",
    "level": "number",
    "streakDays": "number",
    "vaultKeys": "number",
    "badges": ["string"]
  }
  ```
- **Status Codes**: 200 (success), 401 (unauthorized)

#### GET `/v1/gamification/profile/:userId`

- **Summary**: Get user's gamification profile by ID
- **Authentication**: Public
- **Path Params**:
  - `userId`: User ID
- **Response**: User's gamification profile
- **Status Codes**: 200 (success), 404 (user not found)

### Leaderboard Endpoints

#### GET `/v1/gamification/leaderboard?scope=GLOBAL&period=MONTH&limit=100`

- **Summary**: Get leaderboard
- **Authentication**: Public
- **Query Params**:
  - `scope` (optional): GLOBAL, HACKATHON, CHALLENGE (default: GLOBAL)
  - `period` (optional): ALLTIME, SEASON, MONTH, WEEK (default: ALLTIME)
  - `scopeId` (optional): ID if scope is HACKATHON or CHALLENGE
  - `limit` (optional): Max entries (default: 100)
- **Response**: Array of leaderboard entries with ranks
- **Status Codes**: 200 (success)

### Badge Endpoints

#### GET `/v1/gamification/badges`

- **Summary**: Get all available badges
- **Authentication**: Public
- **Response**: Array of badge definitions
- **Status Codes**: 200 (success)

#### POST `/v1/gamification/badges`

- **Summary**: Create new badge (Admin only)
- **Authentication**: Bearer JWT
- **Required Roles**: BANK_ADMIN
- **Request Body**:
  ```json
  {
    "slug": "string (unique)",
    "name": "string",
    "description": "string",
    "icon": "string (URL)",
    "xpRequired": "number",
    "rarity": "common|uncommon|rare|epic|legendary"
  }
  ```
- **Response**: Created badge
- **Status Codes**: 201 (success), 403 (forbidden)

#### POST `/v1/gamification/award-badge`

- **Summary**: Award badge to user (Admin only)
- **Authentication**: Bearer JWT
- **Required Roles**: BANK_ADMIN
- **Request Body**:
  ```json
  {
    "userId": "string",
    "badgeSlug": "string"
  }
  ```
- **Response**: Success confirmation
- **Status Codes**: 201 (success), 403 (forbidden)

### XP Events Endpoints

#### GET `/v1/gamification/xp-events?limit=50`

- **Summary**: Get current user's XP events history
- **Authentication**: Bearer JWT
- **Query Params**:
  - `limit` (optional): Max events (default: 50)
- **Response**: Array of XP events
- **Status Codes**: 200 (success), 401 (unauthorized)

#### GET `/v1/gamification/xp-events/:userId?limit=50`

- **Summary**: Get user's XP events by ID
- **Authentication**: Public
- **Path Params**:
  - `userId`: User ID
- **Query Params**:
  - `limit` (optional): Max events
- **Response**: Array of XP events
- **Status Codes**: 200 (success), 404 (user not found)

#### POST `/v1/gamification/award-xp`

- **Summary**: Award XP to user (Admin only)
- **Authentication**: Bearer JWT
- **Required Roles**: BANK_ADMIN
- **Request Body**:
  ```json
  {
    "userId": "string",
    "eventType": "string",
    "points": "number",
    "refType": "string (optional)",
    "refId": "string (optional)",
    "metadata": "object (optional)"
  }
  ```
- **Response**: Success confirmation
- **Status Codes**: 201 (success), 403 (forbidden)

### Streak Endpoints

#### POST `/v1/gamification/update-streak`

- **Summary**: Update daily login streak
- **Authentication**: Bearer JWT
- **Response**: Success confirmation
- **Status Codes**: 200 (success), 401 (unauthorized)

---

## 9. FILES MODULE (`/files`)

### Endpoints

#### POST `/v1/files/upload?type=document&entityType=submission&entityId=xxx`

- **Summary**: Upload a file
- **Authentication**: Bearer JWT
- **Content-Type**: multipart/form-data
- **Query Params**:
  - `type` (optional): image, video, document, avatar (default: document)
  - `entityId` (optional): Associated entity ID
  - `entityType` (optional): Associated entity type (submission, user, hackathon, etc.)
- **Request Form**:
  - `file`: Binary file data
- **Response**:
  ```json
  {
    "id": "string",
    "filename": "string",
    "mimetype": "string",
    "size": "number",
    "url": "string",
    "key": "string",
    "type": "string",
    "uploadedAt": "ISO date"
  }
  ```
- **Status Codes**: 201 (success), 400 (no file), 401 (unauthorized)

#### GET `/v1/files/:id`

- **Summary**: Get file metadata by ID
- **Authentication**: Public
- **Path Params**:
  - `id`: File ID
- **Response**: File metadata
- **Status Codes**: 200 (success), 404 (not found)

#### GET `/v1/files/entity/:entityType/:entityId`

- **Summary**: Get all files for an entity
- **Authentication**: Public
- **Path Params**:
  - `entityType`: Type of entity
  - `entityId`: Entity ID
- **Response**: Array of files
- **Status Codes**: 200 (success)

#### DELETE `/v1/files/:id`

- **Summary**: Delete a file
- **Authentication**: Bearer JWT
- **Path Params**:
  - `id`: File ID
- **Response**: Success confirmation
- **Status Codes**: 200 (success), 403 (not owner), 404 (not found)

#### GET `/v1/files/serve/*`

- **Summary**: Serve local files (development only)
- **Authentication**: Public
- **Response**: File content
- **Status Codes**: 200 (success), 404 (not found)

---

## 10. HEALTH CHECK MODULE

### Endpoints

#### GET `/health`

- **Summary**: Health check endpoint
- **Authentication**: Public
- **Response**: Service health status
- **Status Codes**: 200 (healthy), 503 (unhealthy)

#### GET `/health/ready`

- **Summary**: Readiness probe (Kubernetes)
- **Authentication**: Public
- **Response**: Readiness status
- **Status Codes**: 200 (ready), 503 (not ready)

#### GET `/health/live`

- **Summary**: Liveness probe (Kubernetes)
- **Authentication**: Public
- **Response**: Service uptime and status
- **Status Codes**: 200 (alive)

---

## Database Schema

### Core Models

#### User

```prisma
- id: String @id
- email: String @unique
- password: String? (hashed)
- name: String?
- handle: String? @unique
- avatarUrl: String?
- bio: String?
- organization: String?
- roles: Role[] (enum)
- totpSecret: String? (2FA)
- totpEnabled: Boolean
- emailVerified: DateTime?
- createdAt: DateTime
- updatedAt: DateTime
- lastLoginAt: DateTime?
- isActive: Boolean
- isBanned: Boolean
```

#### Roles (Enum)

- BANK_ADMIN
- ORGANIZER
- MODERATOR
- JUDGE
- MENTOR
- SPONSOR
- PROJECT_OWNER
- PARTICIPANT
- VIEWER

#### Hackathon

```prisma
- id: String @id
- slug: String @unique
- title: String
- description: String
- coverImage: String?
- status: HackathonStatus (DRAFT, UPCOMING, LIVE, JUDGING, CLOSED)
- location: HackathonLocation (VIRTUAL, HYBRID, ONSITE)
- registrationOpensAt: DateTime?
- registrationClosesAt: DateTime?
- startsAt: DateTime
- endsAt: DateTime
- judgingEndsAt: DateTime?
- prizePool: Decimal?
- maxTeamSize: Int
- allowSoloTeams: Boolean
- rules: String?
- schedule: Json?
- metadata: Json?
```

#### Team

```prisma
- id: String @id
- hackathonId: String
- name: String
- bio: String?
- logoUrl: String?
- repoUrl: String?
- demoUrl: String?
- members: TeamMember[] (many-to-many via TeamMember)
- submissions: Submission[]
```

#### Submission (Hackathon)

```prisma
- id: String @id
- hackathonId: String
- teamId: String
- trackId: String?
- title: String
- abstract: String
- repoUrl: String?
- demoUrl: String?
- videoUrl: String?
- status: SubmissionStatus (DRAFT, SUBMITTED, FINAL, DISQUALIFIED)
- submittedAt: DateTime?
- finalizedAt: DateTime?
- scoreAggregate: Decimal?
- rank: Int?
```

#### Challenge

```prisma
- id: String @id
- slug: String @unique
- title: String
- problemStatement: String
- ownerId: String
- rewardType: RewardType? (CASH, PRIZE, INTERNSHIP, RECOGNITION)
- rewardValue: String?
- categories: String[]
- skills: String[]
- status: ChallengeStatus (DRAFT, OPEN, REVIEW, CLOSED)
- visibility: ChallengeVisibility (PUBLIC, PRIVATE)
- deadlineAt: DateTime?
- createdAt: DateTime
- updatedAt: DateTime
```

#### ChallengeSubmission

```prisma
- id: String @id
- challengeId: String
- userId: String? (either user or team)
- teamId: String?
- title: String
- repoUrl: String?
- content: String
- status: ChallengeSubmissionStatus (SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED, WINNER)
- score: Decimal?
- feedback: String?
```

#### Judge

```prisma
- id: String @id
- userId: String
- hackathonId: String
- bio: String?
- scores: Score[]
```

#### Score

```prisma
- id: String @id
- submissionId: String
- judgeId: String
- criterionId: String
- score: Int
- feedback: String?
- createdAt: DateTime
- updatedAt: DateTime
```

#### GamificationProfile

```prisma
- userId: String @id
- xp: Int (default: 0)
- level: Int (default: 1)
- streakDays: Int
- vaultKeys: Int
- badges: String[]
- lastActivityAt: DateTime?
```

#### File

```prisma
- id: String @id
- filename: String
- mimetype: String
- size: Int
- key: String (storage path)
- url: String (public URL)
- type: String (image, video, document, avatar)
- uploadedById: String
- entityId: String? (associated entity)
- entityType: String?
- createdAt: DateTime
- deletedAt: DateTime? (soft delete)
```

---

## Frontend API Client SDK

**Location**: `/apps/web/src/lib/`

The frontend uses a custom API client library (not a third-party SDK) for all backend communication.

### Core API Utilities

#### `api.ts`

- **API_URL**: `process.env.NEXT_PUBLIC_API_URL || http://localhost:4000/v1`
- **apiFetch()**: Generic fetch wrapper with error handling and JWT support
- **ApiError**: Custom error class with status and data
- **buildQueryString()**: Query param builder from object

### Service Client Functions

#### `auth.ts` - NextAuth Configuration

- Authentication uses NextAuth.js (not REST API)
- **Providers**:
  - Credentials (email/password)
  - Azure AD (Microsoft Entra ID)
- **Adapter**: PrismaAdapter
- **Session Strategy**: JWT
- **Session Duration**: 30 days

#### `hackathons.ts`

```typescript
- getHackathons(filters): Promise<Hackathon[]>
- getHackathonById(id): Promise<Hackathon>
- getHackathonBySlug(slug): Promise<Hackathon>
- getHackathonStats(id): Promise<Stats>
```

#### `teams.ts`

```typescript
- getTeams(filters): Promise<Team[]>
- getTeamById(id): Promise<Team>
- createTeam(data, token): Promise<Team>
- updateTeam(id, data, token): Promise<Team>
- addTeamMember(teamId, data, token): Promise<Team>
- removeTeamMember(teamId, userId, token): Promise<void>
- deleteTeam(id, token): Promise<void>
```

#### `submissions.ts`

```typescript
- getSubmissions(filters): Promise<Submission[]>
- getSubmissionById(id): Promise<Submission>
- createSubmission(data, token): Promise<Submission>
- updateSubmission(id, data, token): Promise<Submission>
- finalizeSubmission(id, token): Promise<Submission>
- deleteSubmission(id, token): Promise<void>
```

#### `challenges.ts`

```typescript
- getChallenges(filters): Promise<Challenge[]>
- getChallengeById(id): Promise<Challenge>
- getChallengeBySlug(slug): Promise<Challenge>
- createChallenge(data, token): Promise<Challenge>
- updateChallenge(id, data, token): Promise<Challenge>
- deleteChallenge(id, token): Promise<void>
- submitSolution(challengeId, data, token): Promise<ChallengeSubmission>
- getChallengeSubmissions(challengeId): Promise<ChallengeSubmission[]>
- getUserSubmissions(token): Promise<ChallengeSubmission[]>
- reviewSubmission(submissionId, data, token): Promise<ChallengeSubmission>
- Utilities: getStatusVariant(), getSubmissionStatusVariant(), isAcceptingSubmissions(), formatDeadline()
```

#### `judging.ts`

```typescript
- assignJudge(hackathonId, userId, token): Promise<Judge>
- getJudges(hackathonId): Promise<Judge[]>
- removeJudge(hackathonId, userId, token): Promise<void>
- createScore(submissionId, data, token): Promise<Score>
- getScores(submissionId): Promise<Score[]>
- updateScore(scoreId, data, token): Promise<Score>
- deleteScore(scoreId, token): Promise<void>
- getJudgeAssignments(token, hackathonId?): Promise<JudgeAssignment[]>
- calculateRankings(hackathonId, token): Promise<RankingsSummary>
```

#### `gamification.ts`

```typescript
- getMyGamificationProfile(token): Promise<GamificationProfile>
- getUserGamificationProfile(userId): Promise<GamificationProfile>
- getLeaderboard(filters): Promise<LeaderboardEntry[]>
- getAllBadges(): Promise<Badge[]>
- getMyXpEvents(token, limit): Promise<XpEvent[]>
- getUserXpEvents(userId, limit): Promise<XpEvent[]>
- updateDailyStreak(token): Promise<void>
- Utilities: getLevelName(), getRarityColor(), getEventTypeName(), calculateProgressPercentage(), formatXp()
```

#### `files.ts`

```typescript
- uploadFile(file, token, options): Promise<FileUploadResponse>
- getFileById(id): Promise<FileUploadResponse>
- getFilesByEntity(entityType, entityId): Promise<FileUploadResponse[]>
- deleteFile(id, token): Promise<void>
- Utilities: formatFileSize(), getFileTypeFromMime(), validateFileSize(), validateFileType()
```

#### `utils.ts` - General Utilities

```typescript
- cn(): Tailwind class merger
- formatDate(): Date formatting
- formatCurrency(): Currency formatting (CAD)
- timeUntil(): Time calculation
- truncate(): Text truncation
- getInitials(): Name initials
- sleep(): Promise-based delay
- generateId(): Random ID generator
- prefersReducedMotion(): Animation preference
- safeJsonParse(): Safe JSON parsing
```

---

## Authentication & Authorization

### Authentication Methods

1. **Credentials (Email/Password)**
   - Backend: JWT-based
   - Frontend: NextAuth.js with Credentials provider

2. **Social (OAuth2)**
   - Azure AD / Microsoft Entra ID
   - Frontend: NextAuth.js with Azure AD provider

3. **2FA (Two-Factor Authentication)**
   - Backend: TOTP-based using speakeasy
   - Setup: `/auth/2fa/setup` → `/auth/2fa/enable`
   - Disable: `/auth/2fa/disable`

### Authorization (Role-Based)

All protected endpoints use role-based access control (RBAC):

- **BANK_ADMIN**: Full system access
- **ORGANIZER**: Can create/manage hackathons
- **JUDGE**: Can score submissions
- **MENTOR**: Can mentor participants
- **PARTICIPANT**: Can participate in hackathons
- **VIEWER**: Read-only access

### Token Management

- **Access Token**: JWT token in Authorization header
- **Refresh Token**: Used to get new access token
- **Storage**: localStorage (frontend)
- **Format**: Bearer {token}

---

## Error Handling

### Error Response Format

```json
{
  "status": 400,
  "message": "Descriptive error message",
  "data": {
    "field": ["error details"]
  }
}
```

### Common Status Codes

- **200**: Success
- **201**: Created
- **204**: No content
- **400**: Bad request / Validation error
- **401**: Unauthorized
- **403**: Forbidden / Insufficient permissions
- **404**: Not found
- **409**: Conflict (duplicate email, slug, etc.)
- **500**: Server error
- **503**: Service unavailable

---

## Rate Limiting

Global rate limiting applied:

- **Default Limit**: 100 requests per minute per client
- **TTL**: 60 seconds (configurable)
- **Specific Limits**:
  - `/auth/register`: 5 requests/minute
  - `/auth/login`: 10 requests/minute
  - `/auth/forgot-password`: 3 requests/minute
  - `/auth/reset-password`: 5 requests/minute

---

## Global Configuration

### Environment Variables Required

```
NODE_ENV=development
API_PORT=4000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret
LOG_LEVEL=info
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### Optional Environment Variables

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_BUCKET_NAME
AWS_REGION
SENDGRID_API_KEY
STRIPE_API_KEY
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
MICROSOFT_TENANT_ID
REDIS_HOST
REDIS_PORT
```

---

## Summary of Available Features

### By Module

#### Authentication & Security

- Email/password authentication
- Social login (Azure AD)
- 2FA setup/enable/disable
- Password reset flow
- Logout
- JWT refresh

#### User Management

- User profile retrieval/update
- Password change
- User statistics
- Activity feed
- User search
- Account deletion

#### Hackathons

- Create/read/update/delete hackathons
- Filter by status, date range
- Hackathon statistics
- Announce winners with XP rewards

#### Teams

- Create teams for hackathons
- Add/remove team members
- Team management (lead-only actions)
- Search for teams looking for members

#### Submissions

- Create/update/delete submissions
- Finalize submissions (team lead)
- Filter submissions by status
- Track submission scores

#### Challenges

- Create/read/update/delete challenges
- Filter challenges by status, category, skills
- Submit solutions to challenges
- Review submissions (owner/admin)

#### Judging

- Assign judges to hackathons
- Create/update/delete scores
- Calculate rankings
- Judge dashboard with assignments

#### Gamification

- User XP and leveling system
- Badge system with rarities
- Daily streak tracking
- Global/hackathon/challenge leaderboards
- XP event history
- Award XP and badges (admin)

#### Files

- Upload files with progress tracking
- Store metadata and public URLs
- Retrieve files by ID or entity
- Delete files (owner/admin)
- Support for images, videos, documents, avatars

#### Health Checks

- Service health status
- Readiness probe (Kubernetes)
- Liveness probe (Kubernetes)

---

## API Documentation

- **Swagger/OpenAPI**: Available at `/api/docs` in development mode
- **All endpoints documented** with request/response examples
- **Tags**: auth, users, hackathons, teams, submissions, challenges, gamification, files, admin

---

## Notes for Frontend Integration

1. **All authenticated endpoints** require Bearer JWT token in Authorization header
2. **All POST/PUT** endpoints expect `application/json` content type (except file uploads)
3. **File uploads** use `multipart/form-data`
4. **Pagination**: Use `page` and `limit` query parameters where supported
5. **Filtering**: Most list endpoints support query parameter filters
6. **CORS**: Ensure frontend origin is in CORS_ORIGINS environment variable
7. **Error handling**: Always check `status` and `message` fields in error responses
8. **Token expiry**: Implement token refresh logic using the refresh endpoint
9. **Rate limiting**: Implement exponential backoff for rate-limited requests
10. **Timestamps**: All dates are ISO 8601 format
