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
  
  Trophy,
  
  Award,
  Users,
  FileText,
  Building2,
  
  Calendar,
  ArrowLeft,
  
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

export default function PublicUserProfilePage() {
  const params = useParams();
  const handle = params.handle as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'submissions'>('overview');

  useEffect(() => {
    fetchUserProfile();
  }, [handle]);

  async function fetchUserProfile() {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch user by handle
      const userData = await apiFetch(`/users/handle/${handle}`);

      // Fetch gamification profile
      try {
        const gamification = await apiFetch(`/gamification/profile/${userData.id}`);
        userData.gamificationProfile = gamification;
      } catch (err) {
        console.log('Could not fetch gamification profile');
      }

      // Fetch user badges
      try {
        const badges = await apiFetch(`/gamification/badges/user/${userData.id}`);
        userData.badges = badges;
      } catch (err) {
        console.log('Could not fetch badges');
      }

      setUser(userData);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  }

  function formatJoinDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">User Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              {error || 'Could not find a user with this handle.'}
            </p>
            <Link href="/leaderboard">
              <Button>Browse Users</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link href="/leaderboard">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leaderboard
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback className="text-2xl bg-primary-600">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
              <p className="text-white/90 mb-2">@{user.handle}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {user.roles.map((role) => (
                  <Badge key={role} variant="secondary" className="bg-white/20 text-white border-white/30">
                    {role}
                  </Badge>
                ))}
              </div>

              {user.organization && (
                <p className="flex items-center gap-2 text-white/90">
                  <Building2 className="w-4 h-4" />
                  {user.organization}
                </p>
              )}
            </div>

            {user.gamificationProfile && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-white/70">Level</p>
                      <p className="text-2xl font-bold text-white">
                        {user.gamificationProfile.level}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70">XP</p>
                      <p className="text-2xl font-bold text-white">
                        {user.gamificationProfile.xp}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Rank</p>
                      <p className="text-2xl font-bold text-white">
                        #{user.gamificationProfile.rank}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Streak</p>
                      <p className="text-2xl font-bold text-white">
                        {user.gamificationProfile.streak}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
                  <p className="text-slate-600">{user.bio}</p>
                ) : (
                  <p className="text-slate-400 italic">No bio provided</p>
                )}

                <div className="pt-4 border-t space-y-2">
                  <p className="flex items-center gap-2 text-sm text-slate-600">
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
                        className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-50 transition-colors"
                        title={badge.name}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-1">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-xs text-center text-slate-600 truncate w-full">
                          {badge.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  {user.badges.length > 9 && (
                    <p className="text-sm text-slate-500 text-center mt-3">
                      +{user.badges.length - 9} more
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('teams')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'teams'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Teams
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === 'submissions'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-slate-600 hover:text-slate-900'
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
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">Activity coming soon</p>
                    <p className="text-sm text-slate-500">
                      Recent hackathons, challenges, and achievements will appear here
                    </p>
                  </div>
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
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">No teams yet</p>
                    <p className="text-sm text-slate-500">
                      Teams will appear here once {user.name} joins or creates one
                    </p>
                  </div>
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
                  <CardDescription>
                    Projects and solutions submitted by {user.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">No submissions yet</p>
                    <p className="text-sm text-slate-500">
                      Hackathon and challenge submissions will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
