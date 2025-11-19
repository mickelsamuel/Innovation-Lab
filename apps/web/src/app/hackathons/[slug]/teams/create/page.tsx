'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getHackathonBySlug } from '@/lib/hackathons';
import { createTeam } from '@/lib/teams';
import { getAuthToken } from '@/lib/api';
import type { Hackathon } from '@/types/hackathon';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';

export default function CreateTeamPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [teamName, setTeamName] = useState('');
  const [bio, setBio] = useState('');
  const [lookingForMembers, setLookingForMembers] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push(`/auth/login?redirect=/hackathons/${slug}/teams/create`);
      return;
    }
    fetchHackathon();
  }, [slug, router]);

  async function fetchHackathon() {
    try {
      setIsLoading(true);
      const data = await getHackathonBySlug(slug);
      setHackathon(data);
    } catch (err) {
      setError('Failed to load hackathon');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hackathon) return;

    const token = getAuthToken();
    if (!token) {
      setError('You must be logged in to create a team');
      router.push(`/auth/login?redirect=/hackathons/${slug}/teams/create`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createTeam(
        {
          name: teamName,
          bio: bio || undefined,
          lookingForMembers,
          hackathonId: hackathon.id,
        },
        token
      );

      // Redirect to teams page
      router.push(`/hackathons/${slug}/teams`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err) || 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-4">Hackathon not found</p>
            <Link href="/hackathons">
              <Button variant="outline">Back to Hackathons</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-card border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/hackathons/${slug}/teams`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-10 h-10 text-white" />
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Create a Team
              </h1>
              <p className="text-lg text-white/90">{hackathon.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>
                Create a new team for this hackathon. You'll be the team lead and can invite other
                members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-900">
                    {error}
                  </div>
                )}

                <div>
                  <Label htmlFor="teamName">Team Name *</Label>
                  <Input
                    id="teamName"
                    placeholder="e.g., Code Warriors"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    required
                    maxLength={50}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                    Choose a unique and memorable name for your team
                  </p>
                </div>

                <div>
                  <Label htmlFor="bio">Team Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell others about your team's goals, skills, and what you're building..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={4}
                    maxLength={500}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">{bio.length}/500 characters</p>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <input
                    type="checkbox"
                    id="lookingForMembers"
                    checked={lookingForMembers}
                    onChange={e => setLookingForMembers(e.target.checked)}
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="lookingForMembers"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Looking for members
                    </Label>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Show your team in the "Looking for Members" filter to help others find you
                    </p>
                  </div>
                </div>

                {hackathon.maxTeamSize && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> This hackathon has a maximum team size of{' '}
                      <strong>{hackathon.maxTeamSize} members</strong>. You can invite up to{' '}
                      {hackathon.maxTeamSize - 1} additional{' '}
                      {hackathon.maxTeamSize - 1 === 1 ? 'member' : 'members'}.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !teamName.trim()}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Team...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Create Team
                      </>
                    )}
                  </Button>
                  <Link href={`/hackathons/${slug}/teams`}>
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
