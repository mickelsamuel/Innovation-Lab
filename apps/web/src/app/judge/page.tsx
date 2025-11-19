'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getJudgeAssignments } from '@/lib/judging';
import { getAuthToken } from '@/lib/api';
import type { JudgeAssignment } from '@/types/judging';
import {
  Users,
  Star,
  ArrowRight,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function JudgeDashboardPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    const token = getAuthToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      setLoading(true);
      const data = await getJudgeAssignments(token);
      setAssignments(data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError(err instanceof Error ? err.message : String(err) || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-slate-700 dark:text-slate-300 font-semibold">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-accent to-accent2 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-12 h-12 text-accent" />
            <h1 className="text-4xl md:text-5xl font-display font-black text-white drop-shadow-lg">
              Judge Dashboard
            </h1>
          </div>
          <p className="text-lg text-white/95 font-semibold">
            Review and score submissions for hackathons you're judging
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-red-900">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {assignments.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 text-center py-12">
              <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Judge Assignments</h3>
              <p className="text-slate-600 dark:text-slate-300">
                You haven't been assigned to judge any hackathons yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignments.map(assignment => {
              const submissions = assignment.hackathon.submissions || [];
              const scoredSubmissions = submissions.filter(s => {
                // Check if current judge has scored this submission
                return s._count.scores > 0;
              });
              const scoredCount = scoredSubmissions.length;
              const totalCount = submissions.length;
              const progress = totalCount > 0 ? (scoredCount / totalCount) * 100 : 0;

              return (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{assignment.hackathon.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(assignment.hackathon.startsAt).toLocaleDateString()} -
                          {new Date(assignment.hackathon.endsAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          assignment.hackathon.status === 'JUDGING' ? 'warning' : 'secondary'
                        }
                      >
                        {assignment.hackathon.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Scoring Progress</span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {scoredCount}/{totalCount} submissions
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Submissions List */}
                    {submissions.length > 0 ? (
                      <div className="space-y-2">
                        {submissions.slice(0, 3).map(submission => {
                          const hasScored = submission._count.scores > 0;

                          return (
                            <Link
                              key={submission.id}
                              href={`/judge/score/${submission.id}`}
                              className="block"
                            >
                              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors truncate">
                                    {submission.title}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                                    <Users className="w-3 h-3 inline mr-1" />
                                    {submission.team?.name}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  {hasScored ? (
                                    <Badge variant="success" className="text-xs">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Scored
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">
                                      Not Scored
                                    </Badge>
                                  )}
                                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                        {submissions.length > 3 && (
                          <Link href={`/hackathons/${assignment.hackathon.slug}/submissions`}>
                            <Button variant="outline" size="sm" className="w-full mt-2">
                              View all {submissions.length} submissions
                            </Button>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-300 text-center py-4">
                        No submissions to score yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
