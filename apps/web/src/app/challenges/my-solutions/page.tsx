'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUserSubmissions, getSubmissionStatusVariant } from '@/lib/challenges';
import { getAuthToken } from '@/lib/api';
import type { ChallengeSubmission } from '@/types/challenge';
import {
  Trophy,
  Code,
  Calendar,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  Zap,
  Target,
} from 'lucide-react';

export default function MySolutionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubmissions() {
      const token = getAuthToken();

      if (!token) {
        // Not logged in, redirect to login
        router.push('/auth/login?redirect=/challenges/my-solutions');
        return;
      }

      try {
        setIsLoading(true);
        const data = await getUserSubmissions(token);
        setSubmissions(data);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError(err instanceof Error ? err.message : String(err) || 'Failed to load submissions');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubmissions();
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen hex-grid flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-bold">Loading your solutions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hex-grid">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary via-accent to-accent2 py-20 overflow-hidden">
        <div className="absolute inset-0 particle-bg opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <Target className="w-14 h-14 text-accent animate-wiggle" />
            <div>
              <h1 className="text-5xl md:text-7xl font-display font-black text-white drop-shadow-2xl">
                My Solutions
              </h1>
              <p className="text-xl font-bold text-white/95 mt-2">
                <Zap className="inline w-6 h-6 mr-2 animate-sparkle" />
                Track your challenge submissions and earned loot!
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="glass-game p-5 border-2">
              <Code className="w-7 h-7 text-accent mb-2 animate-bounce-subtle" />
              <p className="text-3xl font-black stat-counter">{submissions.length}</p>
              <p className="text-sm font-bold uppercase">Total Attempts</p>
            </div>
            <div className="glass-game p-5 border-2">
              <CheckCircle className="w-7 h-7 text-green-500 mb-2 animate-wiggle" />
              <p className="text-3xl font-black stat-counter">
                {submissions.filter(s => s.status === 'ACCEPTED' || s.status === 'WINNER').length}
              </p>
              <p className="text-sm font-bold uppercase">Accepted</p>
            </div>
            <div className="glass-game p-5 border-2">
              <Clock className="w-7 h-7 text-yellow-500 mb-2 animate-float" />
              <p className="text-3xl font-black stat-counter">
                {submissions.filter(s => s.status === 'UNDER_REVIEW').length}
              </p>
              <p className="text-sm font-bold uppercase">Under Review</p>
            </div>
            <div className="glass-game p-5 border-2">
              <Trophy className="w-7 h-7 text-primary mb-2 animate-sparkle" />
              <p className="text-3xl font-black stat-counter">
                {submissions.filter(s => s.status === 'WINNER').length}
              </p>
              <p className="text-sm font-bold uppercase">Won</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-900">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Submissions List */}
        {submissions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {submissions.map(submission => {
              const statusIcons: Record<string, React.ElementType> = {
                SUBMITTED: Code,
                UNDER_REVIEW: Clock,
                ACCEPTED: CheckCircle,
                REJECTED: XCircle,
                WINNER: Trophy,
              };
              const StatusIcon = statusIcons[submission.status] || Code;

              return (
                <Card
                  key={submission.id}
                  className="hover:shadow-lg transition-shadow duration-200"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getSubmissionStatusVariant(submission.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {submission.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl font-display">
                          {submission.challenge?.title || 'Challenge'}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4" />
                          Submitted {new Date(submission.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Solution URL */}
                    {submission.repoUrl && (
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Solution Link:</p>
                        <a
                          href={submission.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm break-all"
                        >
                          {submission.repoUrl}
                        </a>
                      </div>
                    )}

                    {/* Description */}
                    {submission.content && (
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description:</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{submission.content}</p>
                      </div>
                    )}

                    {/* Review Feedback */}
                    {submission.feedback && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Review Feedback:</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{submission.feedback}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      {submission.challenge?.slug && (
                        <Link href={`/challenges/${submission.challenge.slug}`}>
                          <Button variant="outline" size="sm">
                            View Challenge
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <Code className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No submissions yet</h3>
            <p className="text-slate-500 dark:text-slate-300 mb-6">
              Start competing in challenges to see your solutions here!
            </p>
            <Link href="/challenges">
              <Button>
                <Trophy className="w-4 h-4 mr-2" />
                Browse Challenges
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
