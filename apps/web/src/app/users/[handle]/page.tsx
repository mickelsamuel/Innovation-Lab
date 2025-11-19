'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiFetch } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import {
  Trophy, Award, Users, FileText, Building2, Calendar, ArrowLeft,
  Target, Swords, ExternalLink, Clock, Star, TrendingUp
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  handle: string;
  email?: string;
  avatarUrl: string | null;
  bio: string | null;
  organization: string | null;
  roles: string[];
  createdAt: string;
  gamificationProfile?: {
    level: number;
    xp: number;
    rank: number;
    streak: number;
  };
  badges?: any[];
  teams?: any[];
  submissions?: any[];
}

interface Activity {
  id: string;
  type: string;
  description: string;
  xpGained: number;
  createdAt: string;
}

interface Team {
  id: string;
  name: string;
  hackathonName: string;
  memberCount: number;
  createdAt: string;
}

interface Submission {
  id: string;
  title: string;
  type: 'HACKATHON' | 'CHALLENGE';
  hackathonName?: string;
  challengeName?: string;
  status: string;
  score?: number;
  submittedAt: string;
}

export default function PublicUserProfilePage() {
  const params = useParams();
  const handle = params.handle as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'submissions'>('overview');

  // Tab data
  const [activities, setActivities] = useState<Activity[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [handle]);

  useEffect(() => {
    if (user) {
      fetchTabData();
    }
  }, [activeTab, user]);

  async function fetchUserProfile() {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch user by handle
      const userData = await apiFetch<UserProfile>(`/users/handle/${handle}`);

      // Fetch gamification profile
      try {
        const gamification = await apiFetch<{
          level: number;
          xp: number;
          rank: number;
          streak: number;
        }>(`/gamification/profile/${userData.id}`);
        userData.gamificationProfile = gamification;
      } catch (err) {
        console.log('Could not fetch gamification profile');
      }

      // Fetch user badges
      try {
        const badges = await apiFetch<any[]>(`/gamification/badges/user/${userData.id}`);
        userData.badges = badges;
      } catch (err) {
        console.log('Could not fetch badges');
      }

      setUser(userData);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err instanceof Error ? err.message : String(err) || 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchTabData() {
    if (!user) return;

    setLoadingTab(true);
    try {
      if (activeTab === 'overview') {
        // Fetch recent XP events as activity
        try {
          const xpEvents = await apiFetch<Activity[]>(`/gamification/xp-events/${user.id}?limit=10`);
          setActivities(xpEvents);
        } catch (err) {
          console.error('Could not fetch activities:', err);
          setActivities([]);
        }
      } else if (activeTab === 'teams') {
        // Fetch user's teams
        try {
          const userTeams = await apiFetch<Team[]>(`/users/${user.id}/teams`);
          setTeams(userTeams);
        } catch (err) {
          console.error('Could not fetch teams:', err);
          setTeams([]);
        }
      } else if (activeTab === 'submissions') {
        // Fetch user's submissions
        try {
          const userSubmissions = await apiFetch<Submission[]>(`/users/${user.id}/submissions`);
          setSubmissions(userSubmissions);
        } catch (err) {
          console.error('Could not fetch submissions:', err);
          setSubmissions([]);
        }
      }
    } finally {
      setLoadingTab(false);
    }
  }

  function formatJoinDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  function formatActivityDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  function getActivityIcon(type: string) {
    if (type.includes('HACKATHON')) return Swords;
    if (type.includes('CHALLENGE')) return Target;
    if (type.includes('STREAK')) return TrendingUp;
    return Star;
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Error Loading Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-300 mb-4">{error || 'User not found'}</p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary via-accent to-accent2 py-12">
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Arena
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
              <AvatarFallback className="bg-primary text-white text-3xl font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-4xl font-display font-black text-white mb-2">{user.name}</h1>
              <p className="text-white/90 font-semibold mb-4">@{user.handle}</p>

              {user.gamificationProfile && (
                <div className="flex flex-wrap gap-4">
                  <Badge className="bg-white/20 text-white border-white/40 px-4 py-1">
                    <Trophy className="w-4 h-4 mr-2" />
                    Level {user.gamificationProfile.level}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/40 px-4 py-1">
                    <Star className="w-4 h-4 mr-2" />
                    {user.gamificationProfile.xp.toLocaleString()} XP
                  </Badge>
                  {user.gamificationProfile.streak > 0 && (
                    <Badge className="bg-white/20 text-white border-white/40 px-4 py-1">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {user.gamificationProfile.streak} day streak
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - About */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.bio ? (
                  <p className="text-slate-600 dark:text-slate-300">{user.bio}</p>
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 italic">No bio provided</p>
                )}

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  {user.organization && (
                    <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Building2 className="w-4 h-4" />
                      {user.organization}
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4" />
                    Joined {formatJoinDate(user.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            {user.badges && user.badges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Badges ({user.badges.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {user.badges.slice(0, 9).map((badge: any) => (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        title={badge.name}
                      >
                        <div className="text-3xl mb-1">{badge.icon || '🏆'}</div>
                        <p className="text-xs text-center text-slate-600 dark:text-slate-300 truncate w-full">
                          {badge.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  {user.badges.length > 9 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-3">
                      +{user.badges.length - 9} more
                    </p>
                  )}
                  <Link href="/badges" className="block mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      View All Badges
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'teams'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Teams
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'submissions'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Submissions
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    {user.name}'s recent contributions and achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingTab ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity) => {
                        const Icon = getActivityIcon(activity.type);
                        return (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
                          >
                            <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-slate-900 dark:text-slate-100 font-semibold mb-1">
                                {activity.description}
                              </p>
                              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  +{activity.xpGained} XP
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatActivityDate(activity.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-300 mb-2">No activity yet</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Recent hackathons, challenges, and achievements will appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'teams' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Teams
                  </CardTitle>
                  <CardDescription>Teams {user.name} is a member of</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingTab ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : teams.length > 0 ? (
                    <div className="grid gap-4">
                      {teams.map((team) => (
                        <Link key={team.id} href={`/teams/${team.id}`}>
                          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                {team.name}
                              </h4>
                              <ExternalLink className="w-4 h-4 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              {team.hackathonName}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {team.memberCount} members
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Created {formatActivityDate(team.createdAt)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-300 mb-2">No teams yet</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Teams will appear here once {user.name} joins or creates one
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'submissions' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Submissions
                  </CardTitle>
                  <CardDescription>Projects and solutions submitted by {user.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingTab ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : submissions.length > 0 ? (
                    <div className="grid gap-4">
                      {submissions.map((submission) => (
                        <Link key={submission.id} href={`/submissions/${submission.id}`}>
                          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {submission.type === 'HACKATHON' ? (
                                    <Swords className="w-4 h-4 text-primary" />
                                  ) : (
                                    <Target className="w-4 h-4 text-accent" />
                                  )}
                                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                    {submission.title}
                                  </h4>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {submission.hackathonName || submission.challengeName}
                                </p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <Badge variant="outline" className="font-semibold">
                                {submission.status}
                              </Badge>
                              {submission.score !== undefined && (
                                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  {submission.score}/100
                                </span>
                              )}
                              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatActivityDate(submission.submittedAt)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-600 dark:text-slate-300 mb-2">No submissions yet</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Hackathon and challenge submissions will appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
