'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAuthToken } from '@/lib/api';
import { getJudges, assignJudge, removeJudge } from '@/lib/judging';
import { apiFetch } from '@/lib/api';
import type { Hackathon } from '@/types/hackathon';
import { ArrowLeft, UserPlus, Trash2, Award, Loader2 } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface Judge {
  id: string;
  userId: string;
  hackathonId: string;
  bio?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    handle?: string;
  };
}

export default function ManageJudgesPage() {
  const params = useParams();
  const hackathonId = params.id as string;

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newJudgeEmail, setNewJudgeEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [hackathonId]);

  async function fetchData() {
    try {
      setIsLoading(true);
      setError(null);
      const token = getAuthToken();

      const [hackathonData, judgesData] = await Promise.all([
        apiFetch<Hackathon>(`/hackathons/${hackathonId}`, { token }),
        getJudges(hackathonId),
      ]);

      setHackathon(hackathonData);
      setJudges(judgesData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load judges');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddJudge() {
    if (!newJudgeEmail.trim()) return;

    try {
      setIsAdding(true);
      setError(null);
      const token = getAuthToken();
      if (!token) {
        setError('Please log in');
        return;
      }

      const response = await apiFetch<any[]>(
        `/users/search?email=${encodeURIComponent(newJudgeEmail)}`,
        { token }
      );

      if (!response || response.length === 0) {
        setError('User not found with that email');
        return;
      }

      const user = response[0];
      await assignJudge(hackathonId, user.id, token);
      setNewJudgeEmail('');
      await fetchData();
    } catch (err: any) {
      console.error('Error adding judge:', err);
      setError(err.message || 'Failed to add judge');
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRemoveJudge(judge: Judge) {
    if (!confirm(`Remove ${judge.user.name} as judge? Their scores will remain.`)) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      await removeJudge(hackathonId, judge.userId, token);
      await fetchData();
    } catch (err: any) {
      console.error('Error removing judge:', err);
      setError(err.message || 'Failed to remove judge');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/admin/hackathons/${hackathonId}/manage`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Manage Hackathon
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                Manage Judges
              </CardTitle>
              <CardDescription>
                Assign judges to score submissions for {hackathon?.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Enter user email to add as judge..."
                  value={newJudgeEmail}
                  onChange={e => setNewJudgeEmail(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddJudge();
                  }}
                  className="flex-1"
                />
                <Button onClick={handleAddJudge} disabled={isAdding || !newJudgeEmail.trim()}>
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  Add Judge
                </Button>
              </div>

              <div className="space-y-3">
                {judges.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">
                    No judges assigned yet. Add judges using their email address.
                  </p>
                ) : (
                  judges.map(judge => (
                    <div
                      key={judge.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={judge.user.avatarUrl} />
                          <AvatarFallback>{getInitials(judge.user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{judge.user.name}</p>
                          <p className="text-sm text-slate-600">{judge.user.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveJudge(judge)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
