'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getAuthToken, apiFetch } from '@/lib/api';
import {
  ArrowLeft,
  Star,
  Trophy,
  Award,
  Users,
  TrendingUp,
  Target,
  Plus,
  Trash2,
} from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  handle: string;
  level: number;
  xp: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  criteria: Record<string, unknown>;
  createdAt: string;
}

interface XPStats {
  totalXPAwarded: number;
  activeUsers: number;
  averageLevel: number;
  topUsers: Array<{
    id: string;
    name: string;
    handle: string;
    level: number;
    xp: number;
  }>;
}

export default function AdminGamificationPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState<XPStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Badge creation state
  const [showCreateBadge, setShowCreateBadge] = useState(false);
  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    imageUrl: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setIsLoading(true);

      const token = getAuthToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Fetch badges
      const badgesData = (await apiFetch('/gamification/badges', { token })) as Badge[];
      setBadges(badgesData);

      // Fetch gamification stats (using leaderboard as proxy)
      try {
        const leaderboard = (await apiFetch('/gamification/leaderboard?limit=10', {
          token,
        })) as LeaderboardUser[];

        const totalXP = leaderboard.reduce((sum, user) => sum + user.xp, 0);
        const avgLevel =
          leaderboard.reduce((sum, user) => sum + user.level, 0) / leaderboard.length;

        setStats({
          totalXPAwarded: totalXP,
          activeUsers: leaderboard.length,
          averageLevel: Math.round(avgLevel * 10) / 10,
          topUsers: leaderboard.slice(0, 5),
        });
      } catch (err) {
        console.log('Could not fetch gamification stats');
      }
    } catch (err) {
      console.error('Error fetching gamification data:', err);
      toast({
        title: 'Error',
        description:
          err instanceof Error
            ? err instanceof Error
              ? err.message
              : String(err)
            : 'Failed to load gamification data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateBadge(e: React.FormEvent) {
    e.preventDefault();

    setIsCreating(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      await apiFetch('/gamification/badges', {
        method: 'POST',
        body: JSON.stringify({
          ...newBadge,
          criteria: {}, // Empty criteria for manual awarding
        }),
        token,
      });

      toast({
        title: 'Badge Created',
        description: 'New badge has been created successfully.',
      });

      setShowCreateBadge(false);
      setNewBadge({ name: '', description: '', imageUrl: '' });
      await fetchData();
    } catch (err) {
      toast({
        title: 'Creation Failed',
        description: err instanceof Error ? err.message : String(err) || 'Failed to create badge',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteBadge(badgeId: string) {
    if (!confirm('Are you sure you want to delete this badge?')) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      await apiFetch(`/gamification/badges/${badgeId}`, {
        method: 'DELETE',
        token,
      });

      toast({
        title: 'Badge Deleted',
        description: 'Badge has been deleted successfully.',
      });

      await fetchData();
    } catch (err) {
      toast({
        title: 'Deletion Failed',
        description: err instanceof Error ? err.message : String(err) || 'Failed to delete badge',
        variant: 'destructive',
      });
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading gamification data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-4 flex items-center gap-2">
            <Trophy className="w-8 h-8" />
            Gamification Management
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Manage XP, badges, and user progression</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Total XP Awarded</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {stats.totalXPAwarded.toLocaleString()}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Active Users</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.activeUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Average Level</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.averageLevel}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Total Badges</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{badges.length}</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Badges Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Badges
                  </CardTitle>
                  <CardDescription>Manage achievement badges</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowCreateBadge(!showCreateBadge)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Create Badge
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showCreateBadge && (
                <form
                  onSubmit={handleCreateBadge}
                  className="border rounded-lg p-4 space-y-4 bg-slate-50 dark:bg-slate-800"
                >
                  <div>
                    <Label htmlFor="badge-name">Badge Name</Label>
                    <Input
                      id="badge-name"
                      value={newBadge.name}
                      onChange={e => setNewBadge({ ...newBadge, name: e.target.value })}
                      required
                      placeholder="First Hackathon"
                    />
                  </div>
                  <div>
                    <Label htmlFor="badge-description">Description</Label>
                    <Input
                      id="badge-description"
                      value={newBadge.description}
                      onChange={e => setNewBadge({ ...newBadge, description: e.target.value })}
                      required
                      placeholder="Participated in first hackathon"
                    />
                  </div>
                  <div>
                    <Label htmlFor="badge-image">Image URL (optional)</Label>
                    <Input
                      id="badge-image"
                      value={newBadge.imageUrl}
                      onChange={e => setNewBadge({ ...newBadge, imageUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create Badge'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setShowCreateBadge(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {badges.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-300 text-center py-4">No badges created yet</p>
                ) : (
                  badges.map(badge => (
                    <div
                      key={badge.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{badge.name}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{badge.description}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteBadge(badge.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Users */}
          {stats && stats.topUsers && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Top Users
                </CardTitle>
                <CardDescription>Leaderboard rankings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div className="flex-shrink-0">
                        {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                        {index === 1 && <Trophy className="w-6 h-6 text-slate-400" />}
                        {index === 2 && <Trophy className="w-6 h-6 text-amber-600" />}
                        {index > 2 && (
                          <div className="w-6 h-6 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">@{user.handle}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">Level {user.level}</Badge>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{user.xp} XP</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link href="/leaderboard">
                  <Button variant="outline" className="w-full mt-4">
                    View Full Leaderboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* XP Configuration Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              XP Configuration
            </CardTitle>
            <CardDescription>Current XP award values</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Sign Up</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">50 XP</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Daily Login</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">10 XP</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Join Hackathon</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">100 XP</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Submit Project</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">250 XP</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Complete Challenge</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">100 XP</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Create Team</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">50 XP</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Join Team</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">25 XP</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">Win Hackathon</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">500 XP</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-300 mt-4">
              XP values are configured in the gamification service. Contact development team to
              modify these values.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
