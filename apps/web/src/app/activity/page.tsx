'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAuthToken, apiFetch } from '@/lib/api';
import {
  Activity,
  Trophy,
  Users,
  FileText,
  MessageSquare,
  Award,
  UserPlus,
  Star,
  ArrowLeft,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ActivityMetadata {
  hackathonName?: string;
  teamName?: string;
  challengeName?: string;
  level?: number;
  streak?: number;
}

interface ActivityEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  points?: number;
  createdAt: string;
  metadata?: ActivityMetadata;
}

interface XPEvent {
  id: string;
  eventType: string;
  points: number;
  createdAt: string;
  metadata?: ActivityMetadata;
}

const activityIcons: Record<string, LucideIcon> = {
  SIGNUP: UserPlus,
  JOIN_HACKATHON: Trophy,
  CREATE_TEAM: Users,
  JOIN_TEAM: Users,
  SUBMIT_PROJECT: FileText,
  COMMENT: MessageSquare,
  EARN_BADGE: Award,
  LEVEL_UP: Star,
  COMPLETE_CHALLENGE: Trophy,
  DEFAULT: Activity,
};

const activityColors: Record<string, string> = {
  SIGNUP: 'text-blue-600 bg-blue-50',
  JOIN_HACKATHON: 'text-purple-600 bg-purple-50',
  CREATE_TEAM: 'text-green-600 bg-green-50',
  JOIN_TEAM: 'text-green-600 bg-green-50',
  SUBMIT_PROJECT: 'text-orange-600 bg-orange-50',
  COMMENT: 'text-slate-600 bg-slate-50',
  EARN_BADGE: 'text-yellow-600 bg-yellow-50',
  LEVEL_UP: 'text-amber-600 bg-amber-50',
  COMPLETE_CHALLENGE: 'text-indigo-600 bg-indigo-50',
  DEFAULT: 'text-slate-600 bg-slate-50',
};

function getActivityIcon(type: string) {
  return activityIcons[type] || activityIcons.DEFAULT;
}

function getActivityColor(type: string) {
  return activityColors[type] || activityColors.DEFAULT;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export default function ActivityFeedPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchActivity();
  }, []);

  async function fetchActivity() {
    try {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Fetch XP events which represent user activity
      const user = (await apiFetch('/auth/me', { token })) as { id: string };
      const xpEvents = await apiFetch(`/gamification/xp-events/${user.id}`, { token });

      // Transform XP events into activity feed format
      const activityEvents: ActivityEvent[] = (xpEvents as XPEvent[]).map(event => ({
        id: event.id,
        type: event.eventType,
        title: getActivityTitle(event.eventType),
        description: getActivityDescription(event.eventType, event.metadata),
        points: event.points,
        createdAt: event.createdAt,
        metadata: event.metadata,
      }));

      setActivities(activityEvents);
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError(
        err instanceof Error
          ? err instanceof Error
            ? err.message
            : String(err)
          : 'Failed to load activity feed'
      );
    } finally {
      setIsLoading(false);
    }
  }

  function getActivityTitle(type: string): string {
    const titles: Record<string, string> = {
      SIGNUP: 'Joined Innovation Lab',
      JOIN_HACKATHON: 'Joined a Hackathon',
      CREATE_TEAM: 'Created a Team',
      JOIN_TEAM: 'Joined a Team',
      SUBMIT_PROJECT: 'Submitted a Project',
      COMMENT: 'Posted a Comment',
      EARN_BADGE: 'Earned a Badge',
      LEVEL_UP: 'Leveled Up',
      COMPLETE_CHALLENGE: 'Completed a Challenge',
      DAILY_LOGIN: 'Daily Login Streak',
    };
    return titles[type] || 'Activity';
  }

  function getActivityDescription(type: string, metadata?: ActivityMetadata): string {
    if (type === 'SIGNUP') return 'Welcome to the Innovation Lab community!';
    if (type === 'JOIN_HACKATHON' && metadata?.hackathonName)
      return `Registered for ${metadata.hackathonName}`;
    if (type === 'CREATE_TEAM' && metadata?.teamName) return `Created team "${metadata.teamName}"`;
    if (type === 'JOIN_TEAM' && metadata?.teamName) return `Joined team "${metadata.teamName}"`;
    if (type === 'SUBMIT_PROJECT') return 'Submitted a hackathon project';
    if (type === 'COMPLETE_CHALLENGE' && metadata?.challengeName)
      return `Completed "${metadata.challengeName}"`;
    if (type === 'LEVEL_UP' && metadata?.level) return `Reached level ${metadata.level}`;
    if (type === 'DAILY_LOGIN' && metadata?.streak) return `${metadata.streak} day streak!`;
    return 'User activity';
  }

  const filteredActivities =
    filter === 'all' ? activities : activities.filter(a => a.type === filter);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading activity...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
            <Button onClick={fetchActivity}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-4 flex items-center gap-2">
            <Activity className="w-8 h-8" />
            Activity Feed
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Your recent activity and achievements</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Activity
          </Button>
          <Button
            variant={filter === 'JOIN_HACKATHON' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('JOIN_HACKATHON')}
          >
            <Trophy className="w-4 h-4 mr-1" />
            Hackathons
          </Button>
          <Button
            variant={filter === 'CREATE_TEAM' || filter === 'JOIN_TEAM' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('CREATE_TEAM')}
          >
            <Users className="w-4 h-4 mr-1" />
            Teams
          </Button>
          <Button
            variant={filter === 'LEVEL_UP' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('LEVEL_UP')}
          >
            <Star className="w-4 h-4 mr-1" />
            Level Ups
          </Button>
        </div>

        {/* Activity List */}
        {filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300 mb-2">No activity yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Start participating in hackathons and challenges to see your activity here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map(activity => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);

              return (
                <Card key={activity.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{activity.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{activity.description}</p>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-300 whitespace-nowrap">
                            {formatRelativeTime(activity.createdAt)}
                          </span>
                        </div>
                        {activity.points && (
                          <Badge variant="secondary" className="mt-2">
                            +{activity.points} XP
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        {activities.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Total Activities</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{activities.length}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Total XP Earned</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {activities.reduce((sum, a) => sum + (a.points || 0), 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Hackathons Joined</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {activities.filter(a => a.type === 'JOIN_HACKATHON').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Teams Created</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {activities.filter(a => a.type === 'CREATE_TEAM').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
