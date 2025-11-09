# Analytics Dashboard

Comprehensive analytics system for Innovation Lab providing real-time insights into platform performance, user engagement, hackathon metrics, and challenge analytics.

---

## Table of Contents

- [Overview](#overview)
- [Quick Access](#quick-access)
- [Platform Analytics](#platform-analytics)
- [Hackathon Analytics](#hackathon-analytics)
- [Challenge Analytics](#challenge-analytics)
- [Export Features](#export-features)
- [API Reference](#api-reference)

---

## Overview

The analytics dashboard provides administrators and organizers with data-driven insights to monitor platform health, track event success, and identify areas for improvement.

### Features

- **Real-Time Data**: Fresh metrics on every page load
- **Beautiful Visualizations**: Gaming-themed charts and graphs
- **Export Capabilities**: CSV, PDF, and PNG exports
- **Time Range Filtering**: Week, month, quarter, year, all time
- **Role-Based Access**: Admin and organizer permissions
- **Responsive Design**: Works on all devices

### Technology Stack

**Backend**:
- NestJS Analytics Module
- Prisma ORM for efficient queries
- Parallel data fetching

**Frontend**:
- Recharts for visualizations
- jsPDF for PDF generation
- date-fns for date manipulation

---

## Quick Access

### Navigation

Analytics accessible via admin sidebar:
- **Icon**: BarChart3
- **Path**: `/admin/analytics`
- **Permissions**: BANK_ADMIN, ORGANIZER roles

### Available Dashboards

1. **Platform Overview** (`/admin/analytics`)
   - Overall platform statistics
   - Growth trends
   - User engagement

2. **Hackathon Analytics** (`/admin/hackathons/[id]/analytics`)
   - Registration funnel
   - Submission timeline
   - Judge progress

3. **Challenge Analytics** (`/admin/challenges/[slug]/analytics`)
   - Submission trends
   - Performance metrics
   - Top performers

---

## Platform Analytics

**Path**: `/admin/analytics`

### Key Performance Indicators

**User Metrics**:
- Total registered users
- Active users (last 30 days)
- New registrations (this month)

**Event Metrics**:
- Active hackathons
- Total challenges
- Ongoing challenges

**Activity Metrics**:
- Total submissions
- Teams formed
- Active participants

**Department Metrics**:
- Top 10 departments by participation
- Department distribution

### Visualizations

#### 1. Growth Trends Chart

**Type**: Area Chart with Gradients

**Metrics**:
- User registrations over time
- Hackathon creations over time
- Challenge submissions over time
- Team formations over time

**Features**:
- Selectable time range (week/month/quarter/year/all)
- Smooth curves with animations
- Gaming-themed purple/cyan gradients
- Interactive tooltips

#### 2. Activity by Day of Week

**Type**: Bar Chart

**Data**: Number of actions per day (Mon-Sun)

**Use Case**: Identify peak activity days for scheduling events

#### 3. Activity by Hour of Day

**Type**: Line Chart

**Data**: User activity distribution across 24 hours

**Use Case**: Optimize notifications and event timing

#### 4. Department Distribution

**Type**: Pie Chart

**Data**: Participation breakdown by department (top 10)

**Use Case**: Understand organizational engagement

### Engagement Metrics Section

**Active Users**:
- Daily active users
- Weekly active users
- Monthly active users

**Participation Rate**:
- Percentage of registered users participating in events
- Trend indicator (up/down)

**Average Submissions**:
- Mean submissions per user
- Per hackathon metrics

### Export Options

- **Export to CSV**: All tabular data
- **Export to PDF**: Full dashboard report
- **Export Charts**: PNG images

---

## Hackathon Analytics

**Path**: `/admin/hackathons/[id]/analytics`

### Key Performance Indicators

**Registration Metrics**:
- Total registrations
- Teams formed (percentage of registrations)
- Submissions received (percentage of teams)
- Average team size

**Completion Metrics**:
- Completion rate (submissions/registrations)
- Judge progress percentage
- Time to first submission

### Visualizations

#### 1. Registration Funnel

**Type**: Horizontal Bar Chart

**Stages**:
1. **Registered**: Total users registered
2. **Formed Team**: Users who joined/created teams
3. **Submitted**: Teams that submitted projects
4. **Judged**: Submissions that have been scored

**Use Case**: Identify drop-off points in participant journey

#### 2. Submission Timeline

**Type**: Line Chart

**Data**: Cumulative submissions over hackathon duration

**Features**:
- Shows submission pace
- Helps plan submission deadlines
- Identifies last-minute rushes

#### 3. Department Distribution

**Type**: Pie Chart

**Data**: Participants by department

**Use Case**: Track cross-departmental collaboration

#### 4. Score Distribution

**Type**: Bar Chart

**Ranges**:
- 0-20: Low scores
- 21-40: Below average
- 41-60: Average
- 61-80: Above average
- 81-100: Excellent

**Use Case**: Evaluate overall project quality

### Judge Progress Panel

**Displays**:
- Judges assigned
- Total submissions to score
- Submissions scored
- Progress percentage
- Status indicator (Complete/In Progress)

### Top Teams Leaderboard

**Type**: Ranked Table

**Columns**:
- Rank (with medal icons for top 3)
- Team name
- Score
- Members count
- Submission date

**Medals**:
- 1st place: Gold
- 2nd place: Silver
- 3rd place: Bronze

---

## Challenge Analytics

**Path**: `/admin/challenges/[slug]/analytics`

### Key Performance Indicators

**Submission Metrics**:
- Total attempts
- Unique submissions
- Acceptance rate (percentage)
- Average score

**Performance Metrics**:
- Average review time
- Completion rate
- Success rate
- Trend indicators

### Visualizations

#### 1. Submission Trend

**Type**: Dual Area Chart

**Lines**:
- Total submissions (all attempts)
- Accepted submissions

**Use Case**: Monitor challenge difficulty and success rates

#### 2. Performance Metrics

**Type**: Progress Bars

**Metrics**:
- **Acceptance Rate**: Percentage of accepted submissions
  - Color: Green (>70%), Yellow (40-70%), Red (<40%)

- **Average Score**: Mean score of all submissions
  - Scale: 0-100

- **Completion Rate**: Percentage who completed challenge
  - Target: 80%+

- **Average Review Time**: Mean time to review submissions
  - Target: <24 hours

### Submission Status Cards

**Total Attempts**:
- Count of all submission attempts
- Icon: FileText

**Accepted Submissions**:
- Count of approved solutions
- Icon: CheckCircle (green)

**Rejected Submissions**:
- Count of declined solutions
- Icon: XCircle (red)

### Top Performers Leaderboard

**Type**: Ranked List

**Displays**:
- Rank number
- User name/avatar
- Score achieved
- Submission date
- Status badge (Accepted/Rejected)

---

## Export Features

### Export to CSV

**Available For**:
- All data tables
- Leaderboards
- Statistics summaries

**Process**:
1. Click "Export" button
2. Select "Export to CSV"
3. File downloads automatically
4. Filename format: `{type}_{date}_{time}.csv`

**Example**:
```csv
Name,Score,Rank,Status
Team Alpha,95,1,Judged
Team Beta,88,2,Judged
Team Gamma,82,3,Judged
```

### Export to PDF

**Available For**:
- Full dashboard reports
- Tables with multiple columns

**Process**:
1. Click "Export" button
2. Select "Export to PDF"
3. PDF generates with auto-formatted tables
4. Filename format: `{title}_report_{date}.pdf`

**Features**:
- Professional formatting
- Auto-sized tables
- Page breaks
- Headers and footers

### Export Chart as PNG

**Available For**:
- All chart visualizations

**Process**:
1. Right-click on chart
2. Select "Save as PNG"
3. Image downloads at high resolution
4. Filename format: `{chart_type}_{date}.png`

---

## API Reference

### Base URL

```
http://localhost:4000/v1/analytics
```

### Endpoints

#### Get Platform Statistics

```http
GET /analytics/platform
Authorization: Bearer {token}
```

**Response**:
```json
{
  "users": {
    "total": 1500,
    "active": 450,
    "newThisMonth": 120
  },
  "hackathons": {
    "total": 25,
    "active": 3,
    "upcoming": 5
  },
  "challenges": {
    "total": 80,
    "active": 15,
    "completed": 65
  },
  "teams": {
    "total": 200,
    "averageSize": 4.2
  },
  "submissions": {
    "total": 350,
    "thisMonth": 45
  },
  "departments": [
    { "name": "Engineering", "count": 450 },
    { "name": "Finance", "count": 300 },
    ...
  ]
}
```

#### Get Growth Metrics

```http
GET /analytics/growth?timeRange=month
Authorization: Bearer {token}
```

**Query Parameters**:
- `timeRange`: `week` | `month` | `quarter` | `year` | `all`

**Response**:
```json
{
  "timeRange": "month",
  "dataPoints": [
    {
      "date": "2025-10-01",
      "users": 100,
      "hackathons": 2,
      "challenges": 10,
      "submissions": 25
    },
    ...
  ],
  "growth": {
    "users": 15.5,
    "hackathons": 20.0,
    "challenges": 10.2,
    "submissions": 30.1
  }
}
```

#### Get Engagement Metrics

```http
GET /analytics/engagement
Authorization: Bearer {token}
```

**Response**:
```json
{
  "activeUsers": {
    "daily": 120,
    "weekly": 450,
    "monthly": 890
  },
  "participationRate": 59.3,
  "averageSubmissions": 2.3,
  "activityByDay": [
    { "day": "Monday", "count": 150 },
    { "day": "Tuesday", "count": 180 },
    ...
  ],
  "activityByHour": [
    { "hour": 0, "count": 5 },
    { "hour": 1, "count": 2 },
    ...
  ]
}
```

#### Get Top Contributors

```http
GET /analytics/users/top?limit=10
Authorization: Bearer {token}
```

**Query Parameters**:
- `limit`: Number of users to return (default: 10)

**Response**:
```json
{
  "contributors": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "xp": 5000,
      "level": 25,
      "submissions": 15,
      "wins": 3
    },
    ...
  ]
}
```

#### Get Hackathon Analytics

```http
GET /analytics/hackathons/{hackathonId}
Authorization: Bearer {token}
```

**Response**:
```json
{
  "id": "hack-123",
  "title": "Summer Hackathon 2025",
  "registrations": 150,
  "teamsFormed": 45,
  "submissions": 38,
  "completionRate": 84.4,
  "averageTeamSize": 3.3,
  "funnel": {
    "registered": 150,
    "formedTeam": 45,
    "submitted": 38,
    "judged": 30
  },
  "submissionTimeline": [
    { "date": "2025-11-01", "count": 2 },
    { "date": "2025-11-02", "count": 5 },
    ...
  ],
  "departmentDistribution": [
    { "department": "Engineering", "count": 60 },
    { "department": "Finance", "count": 40 },
    ...
  ],
  "scoreDistribution": {
    "0-20": 2,
    "21-40": 5,
    "41-60": 12,
    "61-80": 15,
    "81-100": 4
  },
  "judgeProgress": {
    "totalJudges": 5,
    "totalSubmissions": 38,
    "submissionsScored": 30,
    "progress": 78.9
  },
  "topTeams": [
    {
      "id": "team-1",
      "name": "Team Alpha",
      "score": 95,
      "members": 4,
      "submittedAt": "2025-11-08T10:00:00Z"
    },
    ...
  ]
}
```

#### Get Challenge Analytics

```http
GET /analytics/challenges/{challengeId}
Authorization: Bearer {token}
```

**Response**:
```json
{
  "id": "challenge-123",
  "title": "API Design Challenge",
  "slug": "api-design",
  "totalAttempts": 75,
  "uniqueSubmissions": 60,
  "acceptedSubmissions": 45,
  "rejectedSubmissions": 15,
  "acceptanceRate": 75.0,
  "averageScore": 78.5,
  "completionRate": 80.0,
  "averageReviewTime": 18.5,
  "submissionTrend": [
    {
      "date": "2025-10-01",
      "total": 10,
      "accepted": 7
    },
    ...
  ],
  "topPerformers": [
    {
      "id": "user-1",
      "name": "Jane Smith",
      "score": 98,
      "submittedAt": "2025-11-01T14:00:00Z",
      "status": "ACCEPTED"
    },
    ...
  ]
}
```

#### Get Department Statistics

```http
GET /analytics/departments
Authorization: Bearer {token}
```

**Response**:
```json
{
  "departments": [
    {
      "name": "Engineering",
      "userCount": 450,
      "hackathonParticipation": 180,
      "challengeParticipation": 300,
      "submissions": 250,
      "wins": 45
    },
    ...
  ]
}
```

---

## Chart Configuration

### Gaming Theme Colors

All charts use consistent gaming-inspired colors:

```typescript
export const chartColors = {
  primary: '#8b5cf6',      // Purple
  secondary: '#06b6d4',    // Cyan
  success: '#10b981',      // Emerald
  warning: '#f59e0b',      // Amber
  error: '#ef4444',        // Red
  info: '#3b82f6',         // Blue
  purple: '#a855f7',       // Purple variant
  pink: '#ec4899',         // Pink
  indigo: '#6366f1',       // Indigo
  teal: '#14b8a6',         // Teal
};
```

### Chart Defaults

```typescript
export const chartDefaults = {
  // Area Chart
  areaChart: {
    fillOpacity: 0.3,
    strokeWidth: 2,
    animationDuration: 1000,
  },

  // Line Chart
  lineChart: {
    strokeWidth: 2,
    dot: { r: 4 },
    activeDot: { r: 6 },
  },

  // Bar Chart
  barChart: {
    barSize: 40,
    radius: [8, 8, 0, 0], // Rounded top corners
  },

  // Pie Chart
  pieChart: {
    innerRadius: '50%',   // Donut chart
    outerRadius: '80%',
    paddingAngle: 2,
  },

  // Grid
  grid: {
    stroke: '#374151',
    strokeDasharray: '3 3',
  },

  // Tooltip
  tooltip: {
    contentStyle: {
      backgroundColor: '#1e293b',
      border: '1px solid #475569',
      borderRadius: '8px',
      color: '#fff',
    },
  },
};
```

---

## Performance Considerations

### Backend Optimizations

1. **Parallel Queries**: Use `Promise.all()` to fetch data simultaneously
2. **Efficient Aggregations**: Leverage Prisma's `groupBy` and `aggregate`
3. **Date Filtering**: Index on `createdAt` columns
4. **Caching**: Consider Redis for frequently accessed metrics

### Frontend Optimizations

1. **Lazy Loading**: Load chart components on demand
2. **Memoization**: Cache computed chart data
3. **Debouncing**: Limit filter updates
4. **Responsive Charts**: Use percentage widths for flexibility

---

## Future Enhancements

Planned improvements:

- [ ] Real-time WebSocket updates
- [ ] Scheduled email reports
- [ ] Custom dashboard widgets
- [ ] Advanced filtering (department, date range, status)
- [ ] Comparison views (hackathon vs hackathon)
- [ ] Predictive analytics (ML-based)
- [ ] User behavior heatmaps
- [ ] A/B testing insights
- [ ] Mobile app with analytics
- [ ] Custom metric builder for admins

---

**Last Updated**: November 2025
