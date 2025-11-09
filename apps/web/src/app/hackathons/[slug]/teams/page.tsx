'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TeamCard } from '@/components/teams/team-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getTeams } from '@/lib/teams';
import { getHackathonBySlug } from '@/lib/hackathons';
import type { Team } from '@/types/team';
import type { Hackathon } from '@/types/hackathon';
import { Search, Filter, Users, UserPlus, ArrowLeft, Plus } from 'lucide-react';
import { getAuthToken } from '@/lib/api';

export default function HackathonTeamsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { toast } = useToast();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyLookingForMembers, setShowOnlyLookingForMembers] = useState(false);

  useEffect(() => {
    fetchData();
  }, [slug]);

  async function fetchData() {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch hackathon to get ID
      const hackathonData = await getHackathonBySlug(slug);
      setHackathon(hackathonData);

      // Fetch teams
      const teamsData = await getTeams({
        hackathonId: hackathonData.id,
      });

      setTeams(teamsData);
    } catch (err: any) {
      console.error('Error fetching teams:', err);
      setError(err.message || 'Failed to fetch teams');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleJoinRequest(teamId: string) {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const { requestToJoinTeam } = await import('@/lib/teams');
      const result = await requestToJoinTeam(teamId, '', token);

      toast({
        title: 'Join Request Sent',
        description: result.message,
      });
      await fetchData();
    } catch (err: any) {
      console.error('Error requesting to join team:', err);
      toast({
        title: 'Join Request Failed',
        description: err.message || 'Failed to process join request. Please try again.',
        variant: 'destructive',
      });
    }
  }

  // Filter teams based on search and filters
  const filteredTeams = teams.filter((team) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = team.name.toLowerCase().includes(searchLower);
      const matchesBio = team.bio?.toLowerCase().includes(searchLower);
      const matchesMembers = team.members.some(
        (m) =>
          m.user.name.toLowerCase().includes(searchLower) ||
          m.user.handle.toLowerCase().includes(searchLower)
      );

      if (!matchesName && !matchesBio && !matchesMembers) {
        return false;
      }
    }

    // Looking for members filter
    if (showOnlyLookingForMembers) {
      const maxSize = hackathon?.maxTeamSize || 4;
      const isFull = team.members.length >= maxSize;
      if (!team.lookingForMembers || isFull) {
        return false;
      }
    }

    return true;
  });

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Loading teams...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !hackathon) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load teams</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{error || 'Hackathon not found'}</p>
            <Link href="/hackathons">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hackathons
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lookingForMembersCount = teams.filter((t) => {
    const maxSize = hackathon.maxTeamSize || 4;
    const isFull = t.members.length >= maxSize;
    return t.lookingForMembers && !isFull;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/hackathons/${slug}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {hackathon.title}
            </Button>
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                Teams
              </h1>
              <p className="text-lg text-white/90">
                Browse teams or create your own for {hackathon.title}
              </p>
            </div>
            <Link href={`/hackathons/${slug}/teams/create`}>
              <Button size="lg" variant="secondary" className="hidden md:flex">
                <Plus className="w-5 h-5 mr-2" />
                Create Team
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6 text-white/90">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{teams.length} team{teams.length !== 1 ? 's' : ''}</span>
            </div>
            {lookingForMembersCount > 0 && (
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <span>
                  {lookingForMembersCount} looking for members
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search teams by name, bio, or members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Filter Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={showOnlyLookingForMembers ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2 hover:bg-primary hover:text-white transition-colors"
              onClick={() => setShowOnlyLookingForMembers(!showOnlyLookingForMembers)}
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Looking for Members ({lookingForMembersCount})
            </Badge>
          </div>
        </div>

        {/* Mobile Create Button */}
        <div className="md:hidden mb-6">
          <Link href={`/hackathons/${slug}/teams/create`} className="block">
            <Button size="lg" className="w-full">
              <Plus className="w-5 h-5 mr-2" />
              Create Team
            </Button>
          </Link>
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-4 text-sm text-slate-600">
            {filteredTeams.length === 0 ? (
              'No teams found'
            ) : (
              <>
                Showing {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''}
                {searchTerm || showOnlyLookingForMembers ? (
                  <> of {teams.length} total</>
                ) : null}
              </>
            )}
          </div>
        )}

        {/* Teams Grid */}
        {filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onJoinRequest={handleJoinRequest}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {searchTerm || showOnlyLookingForMembers
                ? 'No teams match your filters'
                : 'No teams yet'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || showOnlyLookingForMembers
                ? 'Try adjusting your filters or search term'
                : 'Be the first to create a team for this hackathon!'}
            </p>
            {(searchTerm || showOnlyLookingForMembers) ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setShowOnlyLookingForMembers(false);
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Link href={`/hackathons/${slug}/teams/create`}>
                <Button>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Team
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
