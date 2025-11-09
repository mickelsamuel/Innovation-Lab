'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken } from '@/lib/api';
import { getSubmissionById, reviewSubmission } from '@/lib/challenges';
import { SubmissionReviewForm } from '@/components/challenges/SubmissionReviewForm';
import type { ReviewSubmissionFormData } from '@/lib/validations/challenge';
import type { ChallengeSubmission } from '@/types/challenge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, User, Users, Calendar, FileText, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { getSubmissionStatusVariant } from '@/lib/challenges';
import { cn } from '@/lib/utils';

export default function ReviewSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { addToast } = useToast();

  const [submission, setSubmission] = useState<ChallengeSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const data = await getSubmissionById(id);

        // Check if user has permission to review (challenge owner or admin)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isAdmin = payload.roles?.includes('BANK_ADMIN');
        const isChallengeOwner = data.challenge && payload.id === data.challenge.id; // This would need the challenge owner ID

        if (!isAdmin && !isChallengeOwner) {
          setError('You do not have permission to review this submission');
          return;
        }

        setSubmission(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load submission');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmission();
  }, [id, router]);

  const handleSubmit = async (data: ReviewSubmissionFormData) => {
    if (!submission) return;

    setIsReviewing(true);

    try {
      const token = getAuthToken();
      if (!token) {
        addToast({
          type: 'error',
          title: 'Error',
          description: 'Please login to review the submission',
        });
        router.push('/auth/login');
        return;
      }

      await reviewSubmission(submission.id, data, token);

      addToast({
        type: 'success',
        title: 'Success!',
        description: 'Submission reviewed successfully',
      });

      // Redirect back to challenge page
      if (submission.challenge?.slug) {
        router.push(`/challenges/${submission.challenge.slug}`);
      } else {
        router.push('/admin/challenges');
      }
    } catch (error: any) {
      console.error('Review submission error:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: error.message || 'Failed to review submission',
      });
    } finally {
      setIsReviewing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="max-w-6xl mx-auto">
        <Link href="/admin/challenges">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 text-slate-300">
            <ArrowLeft className="w-4 h-4" />
            Back to Challenges
          </Button>
        </Link>
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-lg text-slate-700">{error || 'Submission not found'}</p>
          <Link href="/admin/challenges">
            <Button>Back to Challenges</Button>
          </Link>
        </div>
      </div>
    );
  }

  const defaultValues: Partial<ReviewSubmissionFormData> = {
    status: submission.status,
    score: submission.score || 0,
    feedback: submission.feedback || '',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href={submission.challenge?.slug ? `/challenges/${submission.challenge.slug}` : '/admin/challenges'}>
          <Button variant="ghost" size="sm" className="gap-2 mb-4 text-slate-300">
            <ArrowLeft className="w-4 h-4" />
            Back to Challenge
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Review Submission</h1>
            <p className="text-slate-400 mt-1">{submission.title}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submission Details (Left Column) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Challenge Info */}
          {submission.challenge && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Challenge</h3>
                  <Link href={`/challenges/${submission.challenge.slug}`}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      View Challenge
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <p className="text-slate-300">{submission.challenge.title}</p>
              </CardContent>
            </Card>
          )}

          {/* Submission Content */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Submission Details
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-1">Title</h4>
                  <p className="text-white">{submission.title}</p>
                </div>

                {submission.repoUrl && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-1">Repository URL</h4>
                    <a
                      href={submission.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {submission.repoUrl}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Content</h4>
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-slate-300 whitespace-pre-wrap">{submission.content}</p>
                  </div>
                </div>

                {submission.files && submission.files.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">
                      Attachments ({submission.files.length})
                    </h4>
                    <div className="space-y-2">
                      {submission.files.map((file, index) => (
                        <a
                          key={index}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <FileText className="w-4 h-4" />
                          File {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Review Status */}
          {(submission.score !== undefined || submission.feedback) && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Current Review</h3>

                <div className="space-y-3">
                  {submission.score !== undefined && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-1">Score</h4>
                      <p className="text-2xl font-bold text-primary">{submission.score}/100</p>
                    </div>
                  )}

                  {submission.feedback && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-2">Feedback</h4>
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <p className="text-slate-300 whitespace-pre-wrap">{submission.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Review Form & Meta Info (Right Column) */}
        <div className="space-y-6">
          {/* Submitter Info */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Submitted By</h3>

              <div className="space-y-4">
                {submission.user && (
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      'bg-gradient-to-br from-primary/20 to-primary/10'
                    )}>
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{submission.user.name}</p>
                      <p className="text-sm text-slate-400">@{submission.user.handle}</p>
                    </div>
                  </div>
                )}

                {submission.team && (
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-700">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      'bg-gradient-to-br from-blue-500/20 to-blue-500/10'
                    )}>
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{submission.team.name}</p>
                      <p className="text-sm text-slate-400">Team submission</p>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Submitted {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Status</h4>
                  <Badge variant={getSubmissionStatusVariant(submission.status)}>
                    {submission.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Form */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Review This Submission</h3>
            <SubmissionReviewForm
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              isLoading={isReviewing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
