'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getSubmissionById } from '@/lib/submissions';
import { getScores, createScore, updateScore } from '@/lib/judging';
import { getAuthToken } from '@/lib/api';
import type { Submission } from '@/types/submission';
import type { Score } from '@/types/judging';
import {
  ArrowLeft,
  CheckCircle2,
  Save,
  Send,
  Github,
  Globe,
  Video,
  Users,
  Star,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface CriterionScore {
  criterionId: string;
  value: number;
  feedback: string;
  scoreId?: string; // If already scored
}

export default function ScoreSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.submissionId as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [_existingScores, setExistingScores] = useState<Score[]>([]);
  const [scores, setScores] = useState<Record<string, CriterionScore>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

      // Get current user/judge ID from token or auth context
      const token = getAuthToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Fetch judge assignments to get the judge ID for this hackathon
      const { getJudgeAssignments } = await import('@/lib/judging');
      const assignments = await getJudgeAssignments(token, submissionData.hackathonId);
      const currentJudge = assignments.find(a => a.hackathonId === submissionData.hackathonId);

      if (!currentJudge) {
        setError('You are not assigned as a judge for this hackathon');
        return;
      }

      // Filter scores to only show current judge's scores
      const currentJudgeScores = scoresData.filter(score => score.judgeId === currentJudge.id);
      setExistingScores(currentJudgeScores);

      // Pre-populate scores if judge has already scored
      const scoresByJudge = currentJudgeScores.reduce(
        (acc, score) => {
          acc[score.criterionId] = {
            criterionId: score.criterionId,
            value: Number(score.value),
            feedback: score.feedback || '',
            scoreId: score.id,
          };
          return acc;
        },
        {} as Record<string, CriterionScore>
      );

      setScores(scoresByJudge);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : String(err) || 'Failed to load submission');
    } finally {
      setIsLoading(false);
    }
  }

  function handleScoreChange(criterionId: string, value: number) {
    setScores(prev => ({
      ...prev,
      [criterionId]: {
        ...(prev[criterionId] || { criterionId, feedback: '' }),
        criterionId,
        value,
      },
    }));
  }

  function handleFeedbackChange(criterionId: string, feedback: string) {
    setScores(prev => ({
      ...prev,
      [criterionId]: {
        ...(prev[criterionId] || { criterionId, value: 0 }),
        criterionId,
        feedback,
      },
    }));
  }

  async function handleSave(criterionId: string) {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const score = scores[criterionId];
      if (!score) return;

      const token = getAuthToken();
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      if (score.scoreId) {
        // Update existing score
        await updateScore(
          score.scoreId,
          {
            value: score.value,
            feedback: score.feedback,
          },
          token
        );
        setSuccessMessage('Score updated successfully!');
      } else {
        // Create new score
        const newScore = await createScore(
          submissionId,
          {
            criterionId,
            value: score.value,
            feedback: score.feedback,
          },
          token
        );
        // Update local state with score ID
        setScores(prev => ({
          ...prev,
          [criterionId]: {
            ...prev[criterionId],
            scoreId: newScore.id,
          },
        }));
        setSuccessMessage('Score submitted successfully!');
      }

      // Refresh data
      await fetchData();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving score:', err);
      setError(err instanceof Error ? err.message : String(err) || 'Failed to save score');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmitAll() {
    if (!submission?.hackathon?.criteria) return;

    try {
      setIsSaving(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      // Save all unsaved scores
      for (const criterion of submission.hackathon.criteria) {
        const score = scores[criterion.id];
        if (score && score.value > 0 && !score.scoreId) {
          await createScore(
            submissionId,
            {
              criterionId: criterion.id,
              value: score.value,
              feedback: score.feedback,
            },
            token
          );
        }
      }

      setSuccessMessage('All scores submitted successfully!');

      // Redirect back to judge dashboard after short delay
      setTimeout(() => {
        router.push('/judge');
      }, 2000);
    } catch (err) {
      console.error('Error submitting scores:', err);
      setError(err instanceof Error ? err.message : String(err) || 'Failed to submit all scores');
    } finally {
      setIsSaving(false);
    }
  }

  // Calculate completion
  const criteriaCount = submission?.hackathon?.criteria?.length || 0;
  const scoredCount = Object.values(scores).filter(s => s.value > 0 && s.scoreId).length;
  const isComplete = scoredCount === criteriaCount && criteriaCount > 0;

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
  if (error && !submission) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load submission</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{error}</p>
            <Link href="/judge">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!submission || !submission.hackathon) {
    return null;
  }

  const hasLinks = submission.repoUrl || submission.demoUrl || submission.videoUrl;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/judge">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Success/Error Messages */}
          {successMessage && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <p className="font-medium text-green-900">{successMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <p className="font-medium text-red-900">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Info */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{submission.title}</CardTitle>
                  <CardDescription className="flex items-center gap-3">
                    <Users className="w-4 h-4" />
                    {submission.team?.name}
                    {submission.track && (
                      <>
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs">
                          {submission.track.title}
                        </Badge>
                      </>
                    )}
                  </CardDescription>
                </div>
                <Badge variant={isComplete ? 'success' : 'warning'}>
                  {scoredCount}/{criteriaCount} Scored
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4 whitespace-pre-line">{submission.abstract}</p>

              {/* Team Members */}
              {submission.team && submission.team.members && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Team Members</p>
                  <div className="flex items-center gap-2">
                    {submission.team.members.map(member => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 bg-slate-100 rounded-full pl-1 pr-3 py-1"
                      >
                        <Avatar className="w-6 h-6">
                          {member.user.avatarUrl && (
                            <AvatarImage src={member.user.avatarUrl} alt={member.user.name} />
                          )}
                          <AvatarFallback className="text-xs">
                            {getInitials(member.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.user.name}</span>
                        {member.role === 'LEAD' && (
                          <Badge variant="default" className="text-xs py-0">
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
                <div className="flex flex-wrap gap-3">
                  {submission.repoUrl && (
                    <a
                      href={submission.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Github className="w-4 h-4" />
                      Repository
                    </a>
                  )}
                  {submission.demoUrl && (
                    <a
                      href={submission.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
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
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Video className="w-4 h-4" />
                      Video
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Scoring Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                Score Submission
              </CardTitle>
              <CardDescription>
                Score each criterion based on the defined guidelines. Provide constructive feedback
                to help the team improve.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {submission.hackathon.criteria
                ?.sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(criterion => {
                  const score = scores[criterion.id];
                  const currentValue = score?.value || 0;
                  const currentFeedback = score?.feedback || '';
                  const isSaved = !!score?.scoreId;

                  return (
                    <div
                      key={criterion.id}
                      className="border border-slate-200 rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{criterion.name}</h3>
                            {isSaved && (
                              <Badge variant="success" className="text-xs">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Saved
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{criterion.description}</p>
                          <p className="text-xs text-slate-500">
                            Max Score: {criterion.maxScore} | Weight:{' '}
                            {((criterion.weight || 0) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`score-${criterion.id}`}>
                          Score (0 - {criterion.maxScore})
                        </Label>
                        <Input
                          id={`score-${criterion.id}`}
                          type="number"
                          min="0"
                          max={criterion.maxScore}
                          step="0.5"
                          value={currentValue}
                          onChange={e =>
                            handleScoreChange(criterion.id, parseFloat(e.target.value) || 0)
                          }
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`feedback-${criterion.id}`}>Feedback (Optional)</Label>
                        <Textarea
                          id={`feedback-${criterion.id}`}
                          rows={3}
                          placeholder="Provide constructive feedback..."
                          value={currentFeedback}
                          onChange={e => handleFeedbackChange(criterion.id, e.target.value)}
                          className="mt-1.5"
                        />
                      </div>

                      <Button
                        onClick={() => handleSave(criterion.id)}
                        disabled={
                          isSaving || currentValue <= 0 || currentValue > criterion.maxScore
                        }
                        className="w-full"
                        variant={isSaved ? 'outline' : 'default'}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : isSaved ? (
                          <Save className="w-4 h-4 mr-2" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        {isSaved ? 'Update Score' : 'Save Score'}
                      </Button>
                    </div>
                  );
                })}

              {/* Submit All Button */}
              <div className="pt-4 border-t border-slate-200">
                <Button
                  onClick={handleSubmitAll}
                  disabled={isSaving || !isComplete}
                  size="lg"
                  className="w-full"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  {isComplete ? 'Complete & Return to Dashboard' : 'Score All Criteria to Complete'}
                </Button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  {isComplete
                    ? 'You have scored all criteria. You can still update individual scores.'
                    : `Score ${criteriaCount - scoredCount} more ${criteriaCount - scoredCount === 1 ? 'criterion' : 'criteria'} to complete.`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
