'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { getSubmissionById, deleteSubmission } from '@/lib/submissions';
import { getScores } from '@/lib/judging';
import { getAuthToken } from '@/lib/api';
import type { Submission, SubmissionStatus } from '@/types/submission';
import type { Score } from '@/types/judging';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Github,
  Globe,
  Video,
  Users,
  Star,
  MessageSquare,
  Award,
  TrendingUp,
  AlertCircle,
  Paperclip,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { FileList } from '@/components/files/file-list';

function getStatusVariant(status: SubmissionStatus): 'draft' | 'warning' | 'live' | 'secondary' {
  const variantMap: Record<SubmissionStatus, 'draft' | 'warning' | 'live' | 'secondary'> = {
    DRAFT: 'draft',
    SUBMITTED: 'warning',
    FINAL: 'live',
    DISQUALIFIED: 'secondary',
  };
  return variantMap[status];
}

function getRankDisplay(rank?: number) {
  if (!rank) return null;

  if (rank === 1) {
    return (
      <div className="flex items-center gap-2 bg-accent/10 border border-accent rounded-lg px-4 py-3">
        <Trophy className="w-6 h-6 text-accent" />
        <div>
          <p className="text-sm font-medium text-slate-700">Winner</p>
          <p className="text-lg font-bold text-accent">1st Place</p>
        </div>
      </div>
    );
  } else if (rank === 2) {
    return (
      <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-lg px-4 py-3">
        <Medal className="w-6 h-6 text-slate-500" />
        <div>
          <p className="text-sm font-medium text-slate-700">Runner-up</p>
          <p className="text-lg font-bold text-slate-700">2nd Place</p>
        </div>
      </div>
    );
  } else if (rank === 3) {
    return (
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-lg px-4 py-3">
        <Medal className="w-6 h-6 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-slate-700">Third Place</p>
          <p className="text-lg font-bold text-amber-600">3rd Place</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
      <Award className="w-6 h-6 text-slate-500" />
      <div>
        <p className="text-sm font-medium text-slate-700">Ranked</p>
        <p className="text-lg font-bold text-slate-700">#{rank}</p>
      </div>
    </div>
  );
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const submissionId = params.id as string;
  const { toast } = useToast();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [submissionId]);

  async function fetchData() {
    try {
      setIsLoading(true);
      setError(null);

      const [submissionData, scoresData] = await Promise.all([
        getSubmissionById(submissionId),
        getScores(submissionId),
      ]);

      setSubmission(submissionData);
      setScores(scoresData);
    } catch (err: any) {
      console.error('Error fetching submission:', err);
      setError(err.message || 'Failed to load submission');
    } finally {
      setIsLoading(false);
    }
  }

  // Group scores by criterion
  const scoresByCriterion: Record<string, Score[]> = scores.reduce((acc, score) => {
    if (!acc[score.criterionId]) {
      acc[score.criterionId] = [];
    }
    acc[score.criterionId].push(score);
    return acc;
  }, {} as Record<string, Score[]>);

  // Calculate criterion averages
  const criterionAverages: Record<string, number> = Object.entries(scoresByCriterion).reduce(
    (acc, [criterionId, criterionScores]) => {
      const sum = criterionScores.reduce((s, score) => s + Number(score.value), 0);
      acc[criterionId] = sum / criterionScores.length;
      return acc;
    },
    {} as Record<string, number>
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !submission) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load submission</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{error || 'Submission not found'}</p>
            <Button onClick={() => router.back()} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasLinks = submission.repoUrl || submission.demoUrl || submission.videoUrl;
  const hasScores = scores.length > 0;
  const uniqueJudges = new Set(scores.map((s) => s.judgeId)).size;

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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Main Submission Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant={getStatusVariant(submission.status)}>
                      {submission.status}
                    </Badge>
                    {submission.track && (
                      <Badge variant="info" className="text-xs">
                        {submission.track.title}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-3xl mb-2">{submission.title}</CardTitle>
                  <CardDescription className="flex items-center gap-3">
                    <Users className="w-4 h-4" />
                    {submission.team?.name}
                  </CardDescription>
                </div>
                {getRankDisplay(submission.rank)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Abstract */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">About This Project</h3>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                  {submission.abstract}
                </p>
              </div>

              {/* Team Members */}
              {submission.team && submission.team.members && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Team Members</h3>
                  <div className="flex flex-wrap gap-3">
                    {submission.team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 bg-slate-50 rounded-lg pl-2 pr-4 py-2"
                      >
                        <Avatar className="w-8 h-8">
                          {member.user.avatarUrl && (
                            <AvatarImage src={member.user.avatarUrl} alt={member.user.name} />
                          )}
                          <AvatarFallback className="text-xs">
                            {getInitials(member.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{member.user.name}</p>
                          <p className="text-xs text-slate-500">@{member.user.handle}</p>
                        </div>
                        {member.role === 'LEAD' && (
                          <Badge variant="default" className="text-xs">
                            Lead
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Links */}
              {hasLinks && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Project Links</h3>
                  <div className="flex flex-wrap gap-3">
                    {submission.repoUrl && (
                      <a
                        href={submission.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        View Repository
                      </a>
                    )}
                    {submission.demoUrl && (
                      <a
                        href={submission.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Globe className="w-4 h-4" />
                        Live Demo
                      </a>
                    )}
                    {submission.videoUrl && (
                      <a
                        href={submission.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        Watch Video
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-primary" />
                Attachments
              </CardTitle>
              <CardDescription>Files uploaded by the team</CardDescription>
            </CardHeader>
            <CardContent>
              <FileList
                entityType="submission"
                entityId={submission.id}
                canDelete={false}
                showEmpty={true}
              />
            </CardContent>
          </Card>

          {/* Overall Score Card */}
          {submission.scoreAggregate !== null && submission.scoreAggregate !== undefined && (
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Overall Score
                </CardTitle>
                <CardDescription>
                  Weighted average based on {uniqueJudges} judge{uniqueJudges !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-6xl font-bold text-primary mb-2">
                    {submission.scoreAggregate.toFixed(1)}
                    <span className="text-2xl font-normal text-slate-500">/100</span>
                  </p>
                  <div className="w-full bg-slate-200 rounded-full h-3 mt-4">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all"
                      style={{ width: `${submission.scoreAggregate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Score Breakdown */}
          {hasScores && submission.hackathon ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent" />
                  Score Breakdown
                </CardTitle>
                <CardDescription>
                  Detailed scores from {uniqueJudges} judge{uniqueJudges !== 1 ? 's' : ''} across all
                  criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {submission.hackathon.criteria
                  ?.sort((a, b) => a.order - b.order)
                  .map((criterion) => {
                    const criterionScores = scoresByCriterion[criterion.id] || [];
                    const avgScore = criterionAverages[criterion.id] || 0;
                    const normalizedScore = (avgScore / criterion.maxScore) * 100;

                    return (
                      <div key={criterion.id} className="space-y-4">
                        <div className="border-l-4 border-primary pl-4">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="font-semibold text-lg text-slate-800">
                                {criterion.name}
                              </h3>
                              <p className="text-sm text-slate-600">{criterion.description}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                Weight: {(criterion.weight * 100).toFixed(0)}% • Max Score:{' '}
                                {criterion.maxScore}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">
                                {avgScore.toFixed(1)}
                                <span className="text-sm font-normal text-slate-500">
                                  /{criterion.maxScore}
                                </span>
                              </p>
                              <p className="text-xs text-slate-500">
                                {normalizedScore.toFixed(0)}%
                              </p>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${normalizedScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Individual Judge Scores */}
                        {criterionScores.length > 0 && (
                          <div className="ml-4 space-y-3">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                              Individual Scores
                            </p>
                            {criterionScores.map((score) => (
                              <div
                                key={score.id}
                                className="bg-slate-50 rounded-lg p-4 space-y-2"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                      {score.judge.user.avatarUrl && (
                                        <AvatarImage
                                          src={score.judge.user.avatarUrl}
                                          alt={score.judge.user.name}
                                        />
                                      )}
                                      <AvatarFallback className="text-xs">
                                        {getInitials(score.judge.user.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-sm font-medium text-slate-700">
                                        {score.judge.user.name}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        @{score.judge.user.handle}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold text-slate-800">
                                      {Number(score.value).toFixed(1)}
                                      <span className="text-sm font-normal text-slate-500">
                                        /{criterion.maxScore}
                                      </span>
                                    </p>
                                  </div>
                                </div>

                                {score.feedback && (
                                  <div className="border-l-2 border-slate-300 pl-3 mt-2">
                                    <div className="flex items-start gap-2">
                                      <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                      <p className="text-sm text-slate-600 italic">
                                        "{score.feedback}"
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          ) : submission.status === 'FINAL' ? (
            /* No scores yet for final submission */
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 mb-1">Judging in Progress</p>
                    <p className="text-sm text-blue-700">
                      This submission has been finalized and is awaiting judge scores. Check back
                      later to see the results!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Draft or submitted, not yet judged */
            <Card className="border-slate-200 bg-slate-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-700 mb-1">Not Yet Judged</p>
                    <p className="text-sm text-slate-600">
                      This submission must be finalized before it can be judged.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone - Only for Team Members */}
          {submission.team &&
           submission.team.members?.some((m) => m.userId === session?.user?.id) && (
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader>
                <CardTitle className="text-red-900">Danger Zone</CardTitle>
                <CardDescription className="text-red-700">
                  Irreversible submission actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!confirm(`Are you sure you want to delete "${submission.title}"? This action cannot be undone.`)) return;
                    try {
                      const token = getAuthToken();
                      if (!token) {
                        router.push('/auth/login');
                        return;
                      }
                      await deleteSubmission(submissionId, token);
                      toast({
                        title: 'Submission Deleted',
                        description: 'Submission deleted successfully',
                      });
                      router.push('/dashboard');
                    } catch (err: any) {
                      toast({
                        title: 'Delete Failed',
                        description: err.message || 'Failed to delete submission',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  Delete Submission
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Back Button */}
          <div className="flex justify-center pt-4">
            <Button variant="outline" size="lg" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Submissions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
