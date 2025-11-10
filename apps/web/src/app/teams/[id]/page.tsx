'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { getTeamById, deleteTeam } from '@/lib/teams';
import { getAuthToken } from '@/lib/api';
import { InviteModal } from '@/components/invitations/InviteModal';
import type { Team } from '@/types/team';
import { ArrowLeft, Users, Award, Calendar, UserPlus, Mail } from 'lucide-react';
import { getInitials } from '@/lib/utils';

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const teamId = params.id as string;
  const { toast } = useToast();

  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  async function fetchTeam() {
    try {
      setIsLoading(true);
      const data = await getTeamById(teamId);
      setTeam(data);
    } catch (err) {
      setError('Team not found');
    } finally {
      setIsLoading(false);
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading team...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !team) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600 mb-4">{error || 'Team not found'}</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLookingForMembers =
    team.lookingForMembers && team.members.length < (team.hackathon?.maxTeamSize || 4);

  // Check if current user is team lead
  const currentUserMember = team.members.find(m => m.userId === session?.user?.id);
  const isTeamLead = currentUserMember?.role === 'LEAD';
  const canInvite = isTeamLead && team.members.length < (team.hackathon?.maxTeamSize || 4);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                  {team.name}
                </h1>
                {team.hackathon && (
                  <Link
                    href={`/hackathons/${team.hackathon.slug}`}
                    className="text-white/90 hover:text-white transition-colors"
                  >
                    {team.hackathon.title}
                  </Link>
                )}
              </div>
            </div>
            {isLookingForMembers && (
              <Badge variant="success" className="text-sm">
                <UserPlus className="w-4 h-4 mr-1" />
                Looking for Members
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Users className="w-6 h-6 text-white mb-2" />
              <p className="text-2xl font-bold text-white">{team.members.length}</p>
              <p className="text-sm text-white/80">Team Members</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Calendar className="w-6 h-6 text-white mb-2" />
              <p className="text-2xl font-bold text-white">
                {new Date(team.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <p className="text-sm text-white/80">Created</p>
            </div>
            {team._count?.submissions !== undefined && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Award className="w-6 h-6 text-white mb-2" />
                <p className="text-2xl font-bold text-white">{team._count.submissions}</p>
                <p className="text-sm text-white/80">Submissions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Team Bio */}
          {team.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About the Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-line">{team.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Team Members */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Team Members ({team.members.length})
                  </CardTitle>
                  <CardDescription>
                    {team.hackathon?.maxTeamSize && `Maximum ${team.hackathon.maxTeamSize} members`}
                  </CardDescription>
                </div>
                {canInvite && (
                  <Button onClick={() => setIsInviteModalOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Members
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {team.members.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        {member.user.avatarUrl && (
                          <AvatarImage src={member.user.avatarUrl} alt={member.user.name} />
                        )}
                        <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-slate-900">{member.user.name}</p>
                        <p className="text-sm text-slate-600">@{member.user.handle}</p>
                      </div>
                    </div>
                    <Badge variant={member.role === 'LEAD' ? 'default' : 'secondary'}>
                      {member.role === 'LEAD' ? 'Team Lead' : 'Member'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Settings - Only for Team Lead */}
          {isTeamLead && (
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader>
                <CardTitle className="text-red-900">Danger Zone</CardTitle>
                <CardDescription className="text-red-700">
                  Irreversible team actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (
                      !confirm(
                        `Are you sure you want to delete "${team.name}"? This action cannot be undone.`
                      )
                    )
                      return;
                    try {
                      const token = getAuthToken();
                      if (!token) {
                        router.push('/auth/login');
                        return;
                      }
                      await deleteTeam(teamId, token);
                      toast({
                        title: 'Team Deleted',
                        description: 'Team deleted successfully',
                      });
                      router.push('/dashboard');
                    } catch (err) {
                      toast({
                        title: 'Delete Failed',
                        description:
                          err instanceof Error
                            ? err.message
                            : String(err) || 'Failed to delete team',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  Delete Team
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Join Team CTA */}
          {isLookingForMembers && !currentUserMember && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="pt-6 text-center">
                <h3 className="text-xl font-bold mb-2">Interested in joining?</h3>
                <p className="text-slate-700 mb-4">
                  This team is looking for new members to join their hackathon project.
                </p>
                <Button
                  size="lg"
                  onClick={async () => {
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
                      await fetchTeam();
                    } catch (err) {
                      toast({
                        title: 'Request Failed',
                        description:
                          err instanceof Error
                            ? err.message
                            : String(err) || 'Failed to send request',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Request to Join
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        teamId={teamId}
        teamName={team.name}
        onSuccess={fetchTeam}
      />
    </div>
  );
}
