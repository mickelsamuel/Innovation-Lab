/**
 * EXAMPLE: WebSocket Integration Guide
 *
 * This file demonstrates how to integrate WebSocket real-time features
 * into your Innovation Lab pages. Copy and adapt these examples.
 */

'use client';

// Example 1: Adding WebSocket Provider to Root Layout
// =====================================================
// File: apps/web/src/app/layout.tsx

import { WebSocketProvider } from '@/providers/websocket-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {/* Wrap your app with WebSocketProvider after SessionProvider */}
        <SessionProvider>
          <WebSocketProvider>{children}</WebSocketProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

// Example 2: Adding Notification Bell to Header
// ==============================================
// File: apps/web/src/components/layout/header.tsx

import { NotificationBell } from '@/components/realtime';

export function Header() {
  return (
    <header className="border-b">
      <nav className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">{/* Logo and nav items */}</div>

        <div className="flex items-center gap-2">
          {/* Add the real-time notification bell */}
          <NotificationBell />

          {/* User menu, etc. */}
        </div>
      </nav>
    </header>
  );
}

// Example 3: Live Leaderboard on Hackathon Page
// ==============================================
// File: apps/web/src/app/hackathons/[slug]/leaderboard/page.tsx

import { LiveLeaderboard } from '@/components/realtime';

export default async function LeaderboardPage({ params }: { params: { slug: string } }) {
  // Fetch initial data server-side
  const hackathon = await fetchHackathon(params.slug);
  const submissions = await fetchSubmissions(hackathon.id);

  return (
    <div className="container mx-auto py-8">
      {/* LiveLeaderboard will auto-update in real-time */}
      <LiveLeaderboard hackathonId={hackathon.id} initialData={submissions} />
    </div>
  );
}

// Example 4: Live Dashboard with Multiple Real-Time Components
// =============================================================
// File: apps/web/src/app/dashboard/page.tsx

import { OnlineUsersCount, LiveSubmissionCounter } from '@/components/realtime';
import { useWebSocket } from '@/providers/websocket-provider';

export default function Dashboard() {
  const { isConnected } = useWebSocket();

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* Show connection status and online users */}
        <div className="flex items-center gap-4">{isConnected && <OnlineUsersCount />}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Live submission counter */}
        <LiveSubmissionCounter hackathonId="current-hackathon-id" initialCount={0} />

        {/* Other dashboard cards */}
      </div>
    </div>
  );
}

// Example 5: Team Page with Live Members
// =======================================
// File: apps/web/src/app/teams/[id]/page.tsx

import { LiveTeamMembers } from '@/components/realtime';

export default async function TeamPage({ params }: { params: { id: string } }) {
  const team = await fetchTeam(params.id);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{team.name}</h1>

      {/* Live team members list with online status */}
      <LiveTeamMembers teamId={team.id} initialMembers={team.members} />
    </div>
  );
}

// Example 6: Custom WebSocket Event Listener
// ===========================================

import { useWebSocket } from '@/providers/websocket-provider';
import { useEffect, useState } from 'react';

export function HackathonDetailPage({ hackathonId }: { hackathonId: string }) {
  const { socket, joinHackathon, leaveHackathon } = useWebSocket();
  const [announcement, setAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    // Join the hackathon room
    if (socket && hackathonId) {
      joinHackathon(hackathonId);

      // Listen for hackathon updates
      const handleHackathonUpdate = (data: any) => {
        if (data.announcement) {
          setAnnouncement(data.announcement);
        }
      };

      socket.on('hackathon:update', handleHackathonUpdate);

      // Cleanup on unmount
      return () => {
        socket.off('hackathon:update', handleHackathonUpdate);
        leaveHackathon(hackathonId);
      };
    }
  }, [socket, hackathonId, joinHackathon, leaveHackathon]);

  return (
    <div>
      {announcement && (
        <div className="bg-blue-100 p-4 rounded-lg mb-4">
          <p className="font-semibold">New Announcement:</p>
          <p>{announcement}</p>
        </div>
      )}

      {/* Rest of hackathon page */}
    </div>
  );
}

// Example 7: Online Status Indicators
// ====================================

import { OnlineIndicator } from '@/components/realtime';

export function UserCard({ user }: { user: any }) {
  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg">
      <div className="relative">
        <Avatar>
          <img src={user.avatarUrl} alt={user.name} />
        </Avatar>
        {/* Online indicator overlay */}
        <div className="absolute -bottom-1 -right-1">
          <OnlineIndicator userId={user.id} showLabel={false} />
        </div>
      </div>

      <div className="flex-1">
        <p className="font-semibold">{user.name}</p>
        <p className="text-sm text-muted-foreground">@{user.handle}</p>
      </div>

      {/* Or show with label */}
      <OnlineIndicator userId={user.id} showLabel={true} />
    </div>
  );
}

// Example 8: Judge Dashboard with Real-Time Submissions
// ======================================================

import { useWebSocket } from '@/providers/websocket-provider';

export function JudgeDashboard({ hackathonId }: { hackathonId: string }) {
  const { socket, joinHackathon } = useWebSocket();
  const [_newSubmissions, setNewSubmissions] = useState<any[]>([]);

  useEffect(() => {
    if (socket && hackathonId) {
      joinHackathon(hackathonId);

      const handleNewSubmission = (data: any) => {
        // Show toast notification
        toast({
          title: 'New Submission',
          description: `${data.submission.title} was just submitted!`,
        });

        setNewSubmissions(prev => [data.submission, ...prev]);
      };

      socket.on('submission:new', handleNewSubmission);

      return () => {
        socket.off('submission:new', handleNewSubmission);
      };
    }
  }, [socket, hackathonId, joinHackathon]);

  return (
    <div>
      <h2>Pending Submissions</h2>
      {/* Display submissions */}
    </div>
  );
}

// Example 9: Connection Status Component
// =======================================

import { useWebSocket } from '@/providers/websocket-provider';
import { Wifi, WifiOff } from 'lucide-react';

export function ConnectionStatus() {
  const { isConnected } = useWebSocket();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-green-500 text-sm">
        <Wifi className="h-4 w-4" />
        <span>Live</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-red-500 text-sm">
      <WifiOff className="h-4 w-4" />
      <span>Offline</span>
    </div>
  );
}

// Example 10: Environment Configuration
// ======================================
/*
Add to .env.local:

# Development
NEXT_PUBLIC_WS_URL=http://localhost:4000

# Production
NEXT_PUBLIC_WS_URL=wss://api.innovation-lab.com
*/
