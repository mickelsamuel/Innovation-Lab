'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  getChallengeBySlug,
  getChallengeSubmissions,
  submitSolution,
  getStatusVariant,
  getRewardTypeLabel,
  getSubmissionStatusVariant,
  formatDeadline,
  isAcceptingSubmissions,
} from '@/lib/challenges';
import type { Challenge, ChallengeSubmission } from '@/types/challenge';
import {
  Trophy,
  Calendar,
  Users,
  Tag,
  Code,
  ArrowLeft,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

export default function ChallengeDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submission form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitContent, setSubmitContent] = useState('');
  const [submitRepoUrl, setSubmitRepoUrl] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchChallengeData();
  }, [slug]);

  async function fetchChallengeData() {
    try {
      setIsLoading(true);
      setError(null);

      const challengeData = await getChallengeBySlug(slug);
      setChallenge(challengeData);

      const submissionsData = await getChallengeSubmissions(challengeData.id);
      setSubmissions(submissionsData);
    } catch (err: any) {
      console.error('Error fetching challenge:', err);
      setError(err.message || 'Failed to load challenge');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitSolution(e: React.FormEvent) {
    e.preventDefault();

    if (!session?.accessToken) {
      setSubmitError('You must be logged in to submit a solution');
      return;
    }

    if (!challenge) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      await submitSolution(
        challenge.id,
        {
          title: submitTitle,
          content: submitContent,
          repoUrl: submitRepoUrl || undefined,
        },
        session.accessToken
      );

      setSubmitSuccess('Solution submitted successfully!');
      setShowSubmitForm(false);
      setSubmitTitle('');
      setSubmitContent('');
      setSubmitRepoUrl('');

      // Refresh submissions
      await fetchChallengeData();
    } catch (err: any) {
      console.error('Error submitting solution:', err);
      setSubmitError(err.message || 'Failed to submit solution');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading challenge...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md mx-4 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-900 mb-4">{error || 'Challenge not found'}</p>
              <Link href="/challenges">
                <Button variant="outline">Back to Challenges</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canSubmit = isAcceptingSubmissions(challenge);
  const userSubmission = submissions.find(s => s.userId === session?.user?.id);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent py-8">
        <div className="container mx-auto px-4">
          <Link href="/challenges">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Challenges
            </Button>
          </Link>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={getStatusVariant(challenge.status)} className="text-sm">
                  {challenge.status}
                </Badge>
                {canSubmit && (
                  <Badge variant="success" className="text-sm">
                    Accepting Submissions
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                {challenge.title}
              </h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    {challenge.owner.avatarUrl && (
                      <AvatarImage src={challenge.owner.avatarUrl} alt={challenge.owner.name} />
                    )}
                    <AvatarFallback className="text-sm">
                      {getInitials(challenge.owner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{challenge.owner.name}</span>
                </div>
                {challenge.ownerOrg && (
                  <span className="text-sm">• Sponsored by {challenge.ownerOrg}</span>
                )}
              </div>
            </div>

            {challenge.rewardType && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Trophy className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white font-bold">{getRewardTypeLabel(challenge.rewardType)}</p>
                {challenge.rewardValue && (
                  <p className="text-white/90 text-sm">{challenge.rewardValue}</p>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {challenge.deadlineAt && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Calendar className="w-5 h-5 text-white mb-1" />
                <p className="text-white font-medium">{formatDeadline(challenge.deadlineAt)}</p>
                <p className="text-xs text-white/80">Deadline</p>
              </div>
            )}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Users className="w-5 h-5 text-white mb-1" />
              <p className="text-white font-medium">{challenge._count?.submissions || 0}</p>
              <p className="text-xs text-white/80">Submissions</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <Tag className="w-5 h-5 text-white mb-1" />
              <p className="text-white font-medium">{challenge.categories.length}</p>
              <p className="text-xs text-white/80">Categories</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {submitSuccess && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-900">{submitSuccess}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Problem Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Problem Statement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  <p className="whitespace-pre-wrap text-slate-700">{challenge.problemStatement}</p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Solution */}
            {session && canSubmit && !userSubmission && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary" />
                    Submit Your Solution
                  </CardTitle>
                  <CardDescription>Share your solution to this challenge</CardDescription>
                </CardHeader>
                <CardContent>
                  {!showSubmitForm ? (
                    <Button onClick={() => setShowSubmitForm(true)} className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Submit Solution
                    </Button>
                  ) : (
                    <form onSubmit={handleSubmitSolution} className="space-y-4">
                      {submitError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-900">{submitError}</p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Solution Title *
                        </label>
                        <Input
                          value={submitTitle}
                          onChange={e => setSubmitTitle(e.target.value)}
                          placeholder="My implementation of..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Repository URL
                        </label>
                        <Input
                          type="url"
                          value={submitRepoUrl}
                          onChange={e => setSubmitRepoUrl(e.target.value)}
                          placeholder="https://github.com/username/repo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Solution Description *
                        </label>
                        <Textarea
                          value={submitContent}
                          onChange={e => setSubmitContent(e.target.value)}
                          placeholder="Describe your approach, technologies used, challenges faced..."
                          rows={8}
                          required
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button type="submit" disabled={isSubmitting} className="flex-1">
                          {isSubmitting ? 'Submitting...' : 'Submit Solution'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowSubmitForm(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            {/* User's Submission */}
            {userSubmission && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Your Submission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge variant={getSubmissionStatusVariant(userSubmission.status)}>
                      {userSubmission.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{userSubmission.title}</h3>
                    {userSubmission.repoUrl && (
                      <a
                        href={userSubmission.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-sm mb-3"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Repository
                      </a>
                    )}
                    <p className="text-slate-700 whitespace-pre-wrap">{userSubmission.content}</p>
                  </div>
                  {userSubmission.score !== null && userSubmission.score !== undefined && (
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600 mb-1">Score</p>
                      <p className="text-2xl font-bold text-primary">{userSubmission.score}/100</p>
                    </div>
                  )}
                  {userSubmission.feedback && (
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-sm font-medium text-slate-700 mb-2">Feedback</p>
                      <p className="text-slate-600">{userSubmission.feedback}</p>
                    </div>
                  )}
                  <p className="text-xs text-slate-500">
                    Submitted {new Date(userSubmission.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Submissions List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Submissions ({submissions.length})
                </CardTitle>
                <CardDescription>Solutions submitted by the community</CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <Code className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No submissions yet</p>
                    <p className="text-sm text-slate-500">Be the first to submit a solution!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map(submission => (
                      <div
                        key={submission.id}
                        className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            {submission.user && (
                              <>
                                <Avatar className="w-8 h-8">
                                  {submission.user.avatarUrl && (
                                    <AvatarImage
                                      src={submission.user.avatarUrl}
                                      alt={submission.user.name}
                                    />
                                  )}
                                  <AvatarFallback className="text-xs">
                                    {getInitials(submission.user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {submission.user.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    @{submission.user.handle}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                          <Badge variant={getSubmissionStatusVariant(submission.status)}>
                            {submission.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <h4 className="font-semibold mb-2">{submission.title}</h4>
                        {submission.repoUrl && (
                          <a
                            href={submission.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 text-sm mb-2"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Repository
                          </a>
                        )}
                        <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                          {submission.content}
                        </p>

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                          {submission.score !== null && submission.score !== undefined && (
                            <span className="font-medium text-primary">
                              Score: {submission.score}/100
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            {challenge.categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {challenge.categories.map(category => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {challenge.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="w-4 h-4 text-primary" />
                    Required Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {challenge.skills.map(skill => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Challenge Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Challenge Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600 mb-1">Status</p>
                  <Badge variant={getStatusVariant(challenge.status)}>{challenge.status}</Badge>
                </div>
                {challenge.deadlineAt && (
                  <div>
                    <p className="text-slate-600 mb-1">Deadline</p>
                    <p className="font-medium">{formatDeadline(challenge.deadlineAt)}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(challenge.deadlineAt).toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-slate-600 mb-1">Created</p>
                  <p className="font-medium">
                    {new Date(challenge.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 mb-1">Visibility</p>
                  <p className="font-medium">{challenge.visibility}</p>
                </div>
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Challenge Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    {challenge.owner.avatarUrl && (
                      <AvatarImage src={challenge.owner.avatarUrl} alt={challenge.owner.name} />
                    )}
                    <AvatarFallback>{getInitials(challenge.owner.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{challenge.owner.name}</p>
                    <p className="text-sm text-slate-600">@{challenge.owner.handle}</p>
                  </div>
                </div>
                {challenge.ownerOrg && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Sponsored by</p>
                    <p className="font-medium">{challenge.ownerOrg}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
