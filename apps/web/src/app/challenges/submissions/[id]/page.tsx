'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken } from '@/lib/api';
import { getSubmissionById } from '@/lib/challenges';
import type { ChallengeSubmission } from '@/types/challenge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Target,
  User,
  Users,
  Calendar,
  FileText,
  Loader2,
  AlertCircle,
  ExternalLink,
  Download,
  Trophy,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
import { getSubmissionStatusVariant } from '@/lib/challenges';
import { cn } from '@/lib/utils';

export default function SubmissionDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [submission, setSubmission] = useState<ChallengeSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const token = getAuthToken();

        const data = await getSubmissionById(id);
        setSubmission(data);

        if (token) {
          // Decode token to check permissions
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.id;
          const userRoles = payload.roles || [];

          // Check if user is the submitter
          const isSubmitter = data.userId === userId || Boolean(data.team && data.teamId); // Add team member check if needed

          // Check if user can review (challenge owner or admin)
          const canReviewSubmission =
            userRoles.includes('BANK_ADMIN') || userRoles.includes('ORGANIZER');

          setIsOwner(isSubmitter);
          setCanReview(canReviewSubmission);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load submission');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/challenges">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Challenges
          </Button>
        </Link>
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-lg text-slate-700">{error || 'Submission not found'}</p>
          <Link href="/challenges">
            <Button>Back to Challenges</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusVariant = getSubmissionStatusVariant(submission.status);
  const hasReview = submission.score !== undefined || submission.feedback;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink via-[#1a1c23] to-ink py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link
            href={
              submission.challenge?.slug
                ? `/challenges/${submission.challenge.slug}`
                : '/challenges'
            }
          >
            <Button variant="ghost" size="sm" className="gap-2 mb-4 text-slate-300">
              <ArrowLeft className="w-4 h-4" />
              Back to Challenge
            </Button>
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{submission.title}</h1>
                <p className="text-slate-400 mt-1">
                  Submitted {new Date(submission.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={statusVariant} className="text-sm">
                {submission.status}
              </Badge>
              {canReview && (
                <Link href={`/admin/challenges/submissions/${submission.id}/review`}>
                  <Button className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Review
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Challenge Info */}
            {submission.challenge && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Challenge</p>
                      <h3 className="text-xl font-semibold text-white">
                        {submission.challenge.title}
                      </h3>
                    </div>
                    <Link href={`/challenges/${submission.challenge.slug}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        View Challenge
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submission Content */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Submission Details
                </h2>

                <div className="space-y-6">
                  {submission.repoUrl && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-2">Repository URL</h3>
                      <a
                        href={submission.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        {submission.repoUrl}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-3">Description</h3>
                    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                      <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {submission.content}
                      </p>
                    </div>
                  </div>

                  {submission.files && submission.files.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-400 mb-3">
                        Attachments ({submission.files.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {submission.files.map((file, index) => (
                          <a
                            key={index}
                            href={file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-primary transition-colors group"
                          >
                            <FileText className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                File {index + 1}
                              </p>
                              <p className="text-xs text-slate-500">Click to download</p>
                            </div>
                            <Download className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Review Section */}
            {hasReview && (
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    Review
                  </h2>

                  <div className="space-y-6">
                    {submission.score !== undefined && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-2">Score</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-primary">
                            {submission.score}
                          </span>
                          <span className="text-2xl text-slate-400">/100</span>
                        </div>
                      </div>
                    )}

                    {submission.feedback && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Feedback
                        </h3>
                        <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {submission.feedback}
                          </p>
                        </div>
                      </div>
                    )}

                    {submission.status === 'WINNER' && (
                      <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Trophy className="w-8 h-8 text-primary" />
                          <div>
                            <h3 className="text-lg font-bold text-white">Winner!</h3>
                            <p className="text-sm text-slate-300">
                              This submission was selected as a winning solution
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submitter Info */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Submitted By</h3>

                <div className="space-y-4">
                  {submission.user && (
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center',
                          'bg-gradient-to-br from-primary/20 to-primary/10'
                        )}
                      >
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{submission.user.name}</p>
                        <p className="text-sm text-slate-400">@{submission.user.handle}</p>
                      </div>
                    </div>
                  )}

                  {submission.team && (
                    <div className="pt-4 border-t border-slate-700">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center',
                            'bg-gradient-to-br from-blue-500/20 to-blue-500/10'
                          )}
                        >
                          <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{submission.team.name}</p>
                          <p className="text-sm text-slate-400">Team submission</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Information</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Submitted</p>
                      <p>{new Date(submission.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Last Updated</p>
                      <p>{new Date(submission.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <Badge variant={statusVariant}>{submission.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {isOwner && submission.status === 'SUBMITTED' && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                  <p className="text-sm text-slate-400 mb-4">Your submission is awaiting review</p>
                  <Button variant="outline" size="sm" className="w-full" disabled>
                    Edit Submission
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
