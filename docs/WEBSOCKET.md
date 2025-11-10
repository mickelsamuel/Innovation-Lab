# WebSocket Real-Time Features

Complete guide to WebSocket implementation in Innovation Lab for real-time features including live leaderboards, notifications, and user presence tracking.

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Implementation](#implementation)
- [API Reference](#api-reference)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Overview

The WebSocket implementation provides bi-directional real-time communication between the server and clients using Socket.io.

### Features

- **Live Updates**: Hackathons, submissions, scores, leaderboards
- **Team Collaboration**: Real-time team member tracking
- **Notifications**: Instant push notifications
- **User Presence**: Online/offline status tracking
- **Auto-Reconnect**: Resilient connection with exponential backoff
- **Secure**: JWT authentication required
- **Scalable**: Ready for horizontal scaling with Redis

### Technology Stack

- **Backend**: NestJS + Socket.io
- **Frontend**: Next.js + Socket.io-client
- **Authentication**: JWT tokens
- **Transport**: WebSocket with polling fallback

---

## Quick Start

### Step 1: Configure Environment (30 seconds)

Add to `apps/web/.env.local`:

```bash
NEXT_PUBLIC_WS_URL=http://localhost:4000
# Production: wss://api.innovation-lab.com
```

Backend needs no additional configuration - WebSocket runs on same port as API (4000).

### Step 2: Add WebSocket Provider (1 minute)

Update your root layout to include the WebSocket provider:

```tsx
// apps/web/src/app/layout.tsx
import { WebSocketProvider } from '@/providers/websocket-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <SessionProvider>
          <WebSocketProvider>{children}</WebSocketProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

### Step 3: Use Real-Time Components (2 minutes)

#### Add Notification Bell to Header

```tsx
// apps/web/src/components/layout/header.tsx
import { NotificationBell } from '@/components/realtime';

export function Header() {
  return (
    <header>
      <nav>
        <NotificationBell />
      </nav>
    </header>
  );
}
```

#### Add Live Leaderboard

```tsx
// apps/web/src/app/hackathons/[slug]/leaderboard/page.tsx
import { LiveLeaderboard } from '@/components/realtime';

export default async function LeaderboardPage({ params }) {
  const submissions = await fetchSubmissions(params.slug);
  const hackathonId = await getHackathonId(params.slug);

  return <LiveLeaderboard hackathonId={hackathonId} initialData={submissions} />;
}
```

That's it! Your app now has real-time features.

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  WebSocketProvider (Context)                                │
│  ├─ Auto-connect on auth                                   │
│  ├─ JWT authentication                                      │
│  ├─ Auto-reconnect with backoff                            │
│  └─ Room management                                         │
│                                                             │
│  Real-Time Components                                       │
│  ├─ NotificationBell      ├─ LiveLeaderboard              │
│  ├─ OnlineIndicator       ├─ LiveSubmissionCounter         │
│  └─ LiveTeamMembers       └─ OnlineUsersCount              │
│                                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Socket.io (WebSocket/Polling)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    BACKEND (NestJS)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  WebSocketGateway (/ws namespace)                          │
│  ├─ JWT authentication via handshake                        │
│  ├─ Connection/disconnection handling                       │
│  ├─ Room-based messaging                                    │
│  └─ Heartbeat ping/pong                                     │
│                                                             │
│  WebSocketService                                           │
│  ├─ broadcastToHackathon()  ├─ broadcastToTeam()          │
│  ├─ sendToUser()            ├─ sendToUsers()               │
│  ├─ emitNewSubmission()     ├─ emitSubmissionScored()      │
│  ├─ emitLeaderboardUpdate() └─ emitTeamUpdate()            │
│  └─ Online user tracking                                    │
│                                                             │
│  Integration with Services                                  │
│  ├─ SubmissionsService  → emits submission:new             │
│  ├─ JudgingService      → emits submission:scored           │
│  ├─ TeamsService        → emits team:update                 │
│  └─ NotificationsService → emits notification:new           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Room-Based Messaging

WebSocket uses Socket.io rooms for efficient message routing:

```
User Personal Rooms (1:1 messaging)
└─ user:userId1  →  [Socket1, Socket2]  (multi-device support)

Hackathon Rooms (broadcast to all participants)
└─ hackathon:hackathonId  →  [Socket1, Socket3, ...]

Team Rooms (team-specific updates)
└─ team:teamId  →  [Socket1, Socket2]
```

Messages are only sent to users in the relevant room, ensuring efficient bandwidth usage.

### Connection Lifecycle

```
1. DISCONNECTED
   └─ User logs in

2. CONNECTING
   ├─ JWT validation
   └─ Handshake

3. CONNECTED
   ├─ Join user room (user:userId)
   ├─ Track as online
   ├─ Heartbeat active
   └─ Ready to send/receive events

4. RECONNECTING (on disconnect)
   ├─ Exponential backoff
   ├─ Max 5 attempts
   └─ Auto-reconnect
```

### Authentication Flow

```
1. User logs in via HTTP → JWT token stored in session

2. WebSocket connection initiated
   └─ Extract token from:
      ├─ Authorization header
      ├─ Handshake auth
      └─ Query parameter

3. Validate token (JwtService.verify)

4. If valid:
   ├─ Store user data in socket.data
   ├─ Join user room (user:${userId})
   └─ Track as online

5. If invalid:
   └─ Disconnect socket immediately
```

---

## Implementation

### Backend Implementation

#### 1. WebSocket Gateway

**Location**: `apps/api/src/websocket/websocket.gateway.ts`

The gateway handles connection lifecycle and authentication:

```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/ws',
  transports: ['websocket', 'polling'],
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // JWT authentication on connection
  // Room management
  // Heartbeat monitoring
}
```

**Features:**

- JWT authentication via handshake token
- Connection/disconnection management
- Room-based messaging (user, hackathon, team rooms)
- Heartbeat ping/pong every 30 seconds
- Auto-disconnect on auth failure

#### 2. WebSocket Service

**Location**: `apps/api/src/websocket/websocket.service.ts`

The service provides broadcasting and event emission methods:

**Broadcasting Methods:**

```typescript
// Broadcast to all users in a hackathon
broadcastToHackathon(hackathonId: string, event: string, data: any)

// Broadcast to all team members
broadcastToTeam(teamId: string, event: string, data: any)

// Send to specific user
sendToUser(userId: string, event: string, data: any)

// Send to multiple users
sendToUsers(userIds: string[], event: string, data: any)

// Broadcast to all connected clients
broadcastToAll(event: string, data: any)
```

**Specialized Event Emitters:**

```typescript
emitHackathonUpdate(hackathonId, data); // Hackathon status changes
emitNewSubmission(hackathonId, submission); // New submission alerts
emitSubmissionScored(hackathonId, submission); // Judge scoring
emitLeaderboardUpdate(hackathonId, leaderboard); // Live rankings
emitTeamUpdate(teamId, data); // Team changes
emitNewTeamMember(teamId, member); // Member joins
emitTeamMemberRemoved(teamId, memberId); // Member leaves
emitNotification(userId, notification); // Notifications
emitTeamInvitation(userId, invitation); // Invitations
```

**Online Presence Tracking:**

```typescript
addOnlineUser(userId: string)       // Track user connection
removeOnlineUser(userId: string)    // Handle disconnection
isUserOnline(userId: string)        // Check user status
getOnlineUsers()                    // List all online users
getOnlineUserCount()                // Get count
```

#### 3. Integration with Services

**SubmissionsService** (`apps/api/src/submissions/submissions.service.ts`):

```typescript
async create(data) {
  const submission = await this.prisma.submission.create({ data });

  // Emit WebSocket event
  this.webSocketService.emitNewSubmission(
    submission.hackathonId,
    submission
  );

  return submission;
}
```

**JudgingService** (`apps/api/src/judging/judging.service.ts`):

```typescript
async scoreSubmission(submissionId, score) {
  const submission = await this.prisma.submission.update({
    where: { id: submissionId },
    data: { score }
  });

  // Emit scoring event
  this.webSocketService.emitSubmissionScored(
    submission.hackathonId,
    submission
  );

  // Recalculate and emit leaderboard
  const leaderboard = await this.calculateLeaderboard(submission.hackathonId);
  this.webSocketService.emitLeaderboardUpdate(
    submission.hackathonId,
    leaderboard
  );

  return submission;
}
```

### Frontend Implementation

#### 1. WebSocket Provider

**Location**: `apps/web/src/providers/websocket-provider.tsx`

The provider manages WebSocket connection state and provides context to components:

**Features:**

- Automatic connection when user is authenticated
- Auto-reconnect with exponential backoff (max 5 attempts)
- JWT token-based authentication
- Online user tracking
- Room management (join/leave)
- Global context via React Context API

**Usage:**

```tsx
import { useWebSocket } from '@/providers/websocket-provider';

function MyComponent() {
  const {
    socket, // Socket instance
    isConnected, // Connection status
    joinHackathon, // Join hackathon room
    leaveHackathon, // Leave hackathon room
    joinTeam, // Join team room
    leaveTeam, // Leave team room
    onlineUsers, // Set of online user IDs
    isUserOnline, // Check if user is online
  } = useWebSocket();

  // Listen to events
  useEffect(() => {
    if (!socket) return;

    socket.on('custom:event', data => {
      console.log('Received:', data);
    });

    return () => {
      socket.off('custom:event');
    };
  }, [socket]);
}
```

#### 2. Real-Time Components

##### NotificationBell

**Location**: `apps/web/src/components/realtime/notification-bell.tsx`

Displays live notification count with dropdown:

```tsx
import { NotificationBell } from '@/components/realtime';

<NotificationBell />;
```

**Features:**

- Live notification badge with pulse animation
- Real-time count updates
- Dropdown with recent notifications
- Auto-updates on `notification:new`, `invitation:new`, `submission:scored`

##### LiveLeaderboard

**Location**: `apps/web/src/components/realtime/live-leaderboard.tsx`

Animated leaderboard with live updates:

```tsx
<LiveLeaderboard hackathonId="hack-123" initialData={submissions} />
```

**Features:**

- Auto-updates on `leaderboard:update`
- Animated rank changes (Framer Motion)
- Live indicator badge
- Trophy icons for top 3
- Gaming-themed gradients

##### OnlineIndicator

**Location**: `apps/web/src/components/realtime/online-indicator.tsx`

Shows online/offline status:

```tsx
// Show user status
<OnlineIndicator userId="user-123" />

// Show total online count
<OnlineUsersCount />
```

**Features:**

- Pulse animation for online status
- Auto-updates on `user:online`, `user:offline`
- Global online user count

##### LiveSubmissionCounter

**Location**: `apps/web/src/components/realtime/live-submission-counter.tsx`

Real-time submission counter:

```tsx
<LiveSubmissionCounter hackathonId="hack-123" />
```

**Features:**

- Animated count updates
- Trending indicator
- Auto-updates on `submission:new`

##### LiveTeamMembers

**Location**: `apps/web/src/components/realtime/live-team-members.tsx`

Team roster with online status:

```tsx
<LiveTeamMembers teamId="team-123" members={members} />
```

**Features:**

- Online status for each member
- Animated member join/leave
- Auto-updates on `team:member:new`, `team:member:removed`

---

## API Reference

### Server → Client Events

| Event                 | Payload                                   | Description                      |
| --------------------- | ----------------------------------------- | -------------------------------- |
| `hackathon:update`    | `{ hackathonId, ...data, timestamp }`     | Hackathon status/details changed |
| `submission:new`      | `{ hackathonId, submission, timestamp }`  | New submission created           |
| `submission:scored`   | `{ hackathonId, submission, timestamp }`  | Submission received score        |
| `leaderboard:update`  | `{ hackathonId, leaderboard, timestamp }` | Rankings updated                 |
| `team:update`         | `{ teamId, ...data, timestamp }`          | Team details changed             |
| `team:member:new`     | `{ teamId, member, timestamp }`           | New team member joined           |
| `team:member:removed` | `{ teamId, memberId, timestamp }`         | Team member left                 |
| `notification:new`    | `{ notification, timestamp }`             | New notification                 |
| `invitation:new`      | `{ invitation, timestamp }`               | Team invitation received         |
| `user:online`         | `{ userId, timestamp }`                   | User came online                 |
| `user:offline`        | `{ userId, timestamp }`                   | User went offline                |
| `users:online`        | `{ userIds, count, timestamp }`           | Online users update              |

### Client → Server Events

| Event             | Payload           | Description          |
| ----------------- | ----------------- | -------------------- |
| `join:hackathon`  | `{ hackathonId }` | Join hackathon room  |
| `leave:hackathon` | `{ hackathonId }` | Leave hackathon room |
| `join:team`       | `{ teamId }`      | Join team room       |
| `leave:team`      | `{ teamId }`      | Leave team room      |
| `ping`            | -                 | Heartbeat ping       |

---

## Security

### Authentication

- **JWT Required**: All connections must provide valid JWT token
- **Token Validation**: Tokens verified on handshake
- **Auto-Disconnect**: Invalid tokens immediately rejected
- **Token Storage**: User data stored in `socket.data` after validation

### Authorization

- **Room Access Control**: Users can only join authorized rooms
- **Role-Based Access**: RBAC enforced for sensitive events
- **Guards**: WebSocket-specific guards protect events

### CORS Protection

```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
```

### Room Isolation

- Messages only sent to room members
- No cross-room data leakage
- Automatic room cleanup on disconnect

### Rate Limiting

- Connection attempt throttling
- Per-user event limits
- DoS attack prevention

---

## Performance

### Optimizations

1. **Single Connection Per User**
   - One WebSocket connection per authenticated user
   - Multi-tab support via local storage sync
   - Reduces server load

2. **Room-Based Messaging**
   - Messages only to subscribers
   - Efficient broadcast mechanism
   - No unnecessary data transfer

3. **Heartbeat Monitoring**
   - Ping/pong every 30 seconds
   - Detects dead connections
   - Auto-cleanup orphaned sockets

4. **Memory Efficient**
   - Map-based user tracking
   - Auto-cleanup on disconnect
   - No memory leaks

5. **Transport Fallback**
   - WebSocket preferred
   - Polling fallback for firewalls
   - Works in all environments

6. **Auto-Reconnection**
   - Exponential backoff
   - Max 5 attempts
   - Prevents server overload

### Scaling with Redis (Optional)

For multiple API instances, use Redis adapter:

```typescript
// apps/api/src/websocket/websocket.gateway.ts
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

This enables horizontal scaling:

```
Clients → Load Balancer → [API Server 1, API Server 2, API Server 3]
                          ↓           ↓           ↓
                         Redis Pub/Sub (message broker)
```

---

## Troubleshooting

### Connection Issues

**Problem**: WebSocket won't connect

**Solutions**:

1. Check JWT token is valid in session
2. Verify `NEXT_PUBLIC_WS_URL` is set correctly
3. Ensure CORS allows frontend origin
4. Check firewall allows WebSocket connections
5. Look for connection errors in browser console and API logs

**Debug**:

```javascript
// Check connection in browser console
console.log('Socket connected:', socket.connected);
console.log('Socket ID:', socket.id);
```

### Events Not Received

**Problem**: Client not receiving events

**Solutions**:

1. Verify client joined correct room (`joinHackathon`, `joinTeam`)
2. Check event names match exactly (case-sensitive)
3. Ensure user is authorized for the room
4. Confirm event listener is registered before event fires

**Debug**:

```javascript
// Log all received events
socket.onAny((event, ...args) => {
  console.log('Received event:', event, args);
});
```

### Memory Leaks

**Problem**: Memory usage grows over time

**Solutions**:

1. Always remove event listeners on component unmount
2. Call `leaveHackathon`/`leaveTeam` when navigating away
3. Check for orphaned event listeners
4. Monitor connection count in production

**Debug**:

```javascript
// Check number of listeners
console.log('Listeners:', socket.listeners('event:name').length);
```

### Authentication Failures

**Problem**: Connection rejected with auth error

**Solutions**:

1. Ensure user is logged in before connecting
2. Verify JWT token is not expired
3. Check token is sent in handshake
4. Confirm backend JWT secret matches

**Debug**:

```javascript
// Log auth errors
socket.on('connect_error', error => {
  console.error('Connection error:', error.message);
});
```

### Performance Issues

**Problem**: Slow event delivery or high latency

**Solutions**:

1. Check network latency (ping/pong times)
2. Reduce event payload sizes
3. Use room-based messaging (not broadcast)
4. Consider Redis adapter for scaling
5. Monitor server CPU/memory usage

**Debug**:

```javascript
// Measure round-trip time
const start = Date.now();
socket.emit('ping', () => {
  console.log('RTT:', Date.now() - start, 'ms');
});
```

---

## Production Deployment

### Checklist

- [ ] Update `NEXT_PUBLIC_WS_URL` to production WSS URL
- [ ] Enable HTTPS/WSS for secure connections
- [ ] Configure CORS for production frontend domain
- [ ] Set up load balancing with sticky sessions
- [ ] Monitor WebSocket connection metrics
- [ ] Set up Redis adapter for horizontal scaling
- [ ] Configure connection limits per instance
- [ ] Set up logging and error tracking
- [ ] Test auto-reconnect behavior
- [ ] Verify heartbeat monitoring

### Environment Variables

**Production Backend**:

```bash
FRONTEND_URL=https://innovation-lab.com
REDIS_URL=redis://redis:6379  # If using Redis adapter
```

**Production Frontend**:

```bash
NEXT_PUBLIC_WS_URL=wss://api.innovation-lab.com
```

---

## Gaming Theme Animations

All real-time components use gaming-inspired animations built with **Framer Motion**:

- **Pulse Effects**: Online indicators, notification badges
- **Slide Animations**: Leaderboard rank changes
- **Pop Effects**: New notifications, score updates
- **Color Gradients**: Trophy colors for top 3 ranks
- **Trending Indicators**: Submission count increases

Animations run at 60fps for smooth, engaging user experience.

---

## Future Enhancements

Potential future improvements:

- [ ] Typing indicators for team chat
- [ ] Live code collaboration
- [ ] Real-time hackathon countdown timer
- [ ] Live mentor availability status
- [ ] Screen sharing for demos
- [ ] Voice/video calls integration
- [ ] Real-time analytics dashboard
- [ ] Custom event channels per user

---

**Last Updated**: November 2025
