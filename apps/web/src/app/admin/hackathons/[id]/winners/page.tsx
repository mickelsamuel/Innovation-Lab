'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getAuthToken, apiFetch } from '@/lib/api';
import { announceWinners } from '@/lib/hackathons';
import type { Hackathon } from '@/types/hackathon';
import { ArrowLeft, Trophy, Medal, Award, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Submission {
  id: string;
  title: string;
  description?: string;
  rank: number | null;
  finalScore: number | null;
  team: {
    id: string;
    name: string;
  };
}

interface Winner {
  submissionId: string;
  rank: '1' | '2' | '3';
  prize?: string;
}

export default function AnnounceWinnersPage() {
  const params = useParams();
  const router = useRouter();
  const hackathonId = params.id as string;
  const { toast } = useToast();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Winner selection state
  const [selectedWinners, setSelectedWinners] = useState<Winner[]>([]);
  const [prizes, setPrizes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [hackathonId]);

  async function fetchData() {
    try {
      setIsLoading(true);
      setError(null);
      const token = getAuthToken();

      const [hackathonData, submissionsData] = await Promise.all([
        apiFetch<Hackathon>(`/hackathons/${hackathonId}`, { token }),
        apiFetch<Submission[]>(`/hackathons/${hackathonId}/submissions`, { token }),
      ]);

      setHackathon(hackathonData);

      // Filter and sort submissions by rank
      const rankedSubmissions = submissionsData
        .filter(s => s.rank !== null)
        .sort((a, b) => (a.rank || 999) - (b.rank || 999));

      setSubmissions(rankedSubmissions);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectWinner(submissionId: string, rank: '1' | '2' | '3') {
    setSelectedWinners(prev => {
      // Remove any existing winner with this rank
      const filtered = prev.filter(w => w.rank !== rank);

      // Add new winner
      return [
        ...filtered,
        {
          submissionId,
          rank,
          prize: prizes[submissionId] || undefined,
        },
      ];
    });
  }

  function handleRemoveWinner(rank: '1' | '2' | '3') {
    setSelectedWinners(prev => prev.filter(w => w.rank !== rank));
  }

  function handlePrizeChange(submissionId: string, prize: string) {
    setPrizes(prev => ({ ...prev, [submissionId]: prize }));

    // Update the prize in selected winners if this submission is already selected
    setSelectedWinners(prev =>
      prev.map(w => (w.submissionId === submissionId ? { ...w, prize: prize || undefined } : w))
    );
  }

  async function handleAnnounceWinners() {
    if (selectedWinners.length === 0) {
      setError('Please select at least one winner');
      return;
    }

    try {
      setIsAnnouncing(true);
      setError(null);
      const token = getAuthToken();
      if (!token) {
        setError('Please log in');
        return;
      }

      await announceWinners(hackathonId, selectedWinners, token);

      toast({
        title: 'Winners Announced!',
        description: 'Winners announced successfully! Notifications sent to winning teams.',
      });
      router.push(`/admin/hackathons/${hackathonId}/manage`);
    } catch (err: any) {
      console.error('Error announcing winners:', err);
      setError(err.message || 'Failed to announce winners');
    } finally {
      setIsAnnouncing(false);
    }
  }

  function getWinnerByRank(rank: '1' | '2' | '3'): Winner | undefined {
    return selectedWinners.find(w => w.rank === rank);
  }

  function isSubmissionSelected(submissionId: string): boolean {
    return selectedWinners.some(w => w.submissionId === submissionId);
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
        <div className="max-w-6xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                Announce Winners
              </CardTitle>
              <CardDescription>Select top 3 submissions for {hackathon?.title}</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {submissions.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">
                    No ranked submissions found. Please calculate rankings first.
                  </p>
                  <Link href={`/admin/hackathons/${hackathonId}/manage`}>
                    <Button variant="outline">Go to Rankings</Button>
                  </Link>
                </div>
              )}

              {submissions.length > 0 && (
                <>
                  {/* Winner Selection Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {['1', '2', '3'].map(rank => {
                      const winner = getWinnerByRank(rank as '1' | '2' | '3');
                      const submission = winner
                        ? submissions.find(s => s.id === winner.submissionId)
                        : null;

                      return (
                        <Card key={rank} className="border-2">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {rank === '1' && <Trophy className="w-5 h-5 text-yellow-500" />}
                                {rank === '2' && <Medal className="w-5 h-5 text-slate-400" />}
                                {rank === '3' && <Award className="w-5 h-5 text-orange-600" />}
                                <span className="font-semibold">
                                  {rank === '1' ? '1st' : rank === '2' ? '2nd' : '3rd'} Place
                                </span>
                              </div>
                              {submission && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveWinner(rank as '1' | '2' | '3')}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            {submission ? (
                              <div>
                                <p className="font-medium text-sm mb-1">{submission.title}</p>
                                <p className="text-xs text-slate-600">{submission.team.name}</p>
                              </div>
                            ) : (
                              <p className="text-sm text-slate-400">Not selected</p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Ranked Submissions List */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Ranked Submissions</h3>
                    <div className="space-y-2">
                      {submissions.map(submission => {
                        const selected = isSubmissionSelected(submission.id);
                        const selectedRank = selectedWinners.find(
                          w => w.submissionId === submission.id
                        )?.rank;

                        return (
                          <div
                            key={submission.id}
                            className={`p-4 border rounded-lg ${
                              selected
                                ? 'border-primary bg-primary/5'
                                : 'border-slate-200 hover:border-primary/50'
                            } transition-colors`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline">Rank #{submission.rank}</Badge>
                                  {submission.finalScore !== null && (
                                    <Badge variant="secondary">
                                      Score: {submission.finalScore.toFixed(2)}
                                    </Badge>
                                  )}
                                  {selected && selectedRank && (
                                    <Badge className="bg-primary">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      {selectedRank === '1'
                                        ? '1st Place'
                                        : selectedRank === '2'
                                          ? '2nd Place'
                                          : '3rd Place'}
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-semibold">{submission.title}</p>
                                <p className="text-sm text-slate-600">{submission.team.name}</p>

                                {selected && (
                                  <div className="mt-3">
                                    <Input
                                      placeholder="Prize (optional, e.g., $5,000)"
                                      value={prizes[submission.id] || ''}
                                      onChange={e =>
                                        handlePrizeChange(submission.id, e.target.value)
                                      }
                                      className="max-w-xs"
                                    />
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2">
                                {!selected ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSelectWinner(submission.id, '1')}
                                      disabled={!!getWinnerByRank('1')}
                                    >
                                      1st
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSelectWinner(submission.id, '2')}
                                      disabled={!!getWinnerByRank('2')}
                                    >
                                      2nd
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSelectWinner(submission.id, '3')}
                                      disabled={!!getWinnerByRank('3')}
                                    >
                                      3rd
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleRemoveWinner(selectedRank as '1' | '2' | '3')
                                    }
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Announce Button */}
                  <div className="flex justify-end">
                    <Button
                      size="lg"
                      onClick={handleAnnounceWinners}
                      disabled={isAnnouncing || selectedWinners.length === 0}
                    >
                      {isAnnouncing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Announcing...
                        </>
                      ) : (
                        <>
                          <Trophy className="w-4 h-4 mr-2" />
                          Announce Winners ({selectedWinners.length} selected)
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
