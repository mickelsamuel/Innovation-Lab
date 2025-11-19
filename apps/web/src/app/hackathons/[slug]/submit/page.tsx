'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getHackathonBySlug } from '@/lib/hackathons';
import { getUserTeams } from '@/lib/teams';
import { createSubmission, updateSubmission, getSubmissions } from '@/lib/submissions';
import { createSubmissionSchema, type CreateSubmissionInput } from '@/lib/validations/submission';
import type { Hackathon } from '@/types/hackathon';
import type { Team } from '@/types/team';
import type { Submission } from '@/types/submission';
import {
  ArrowLeft,
  FileText,
  Github,
  Globe,
  Video,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Save,
  Paperclip,
} from 'lucide-react';
import { FileUpload } from '@/components/files/file-upload';
import { FileList } from '@/components/files/file-list';
import { FileType, type FileUploadResponse } from '@/lib/files';
import { getAuthToken } from '@/lib/api';

export default function SubmitProjectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [_uploadedFiles, _setUploadedFiles] = useState<FileUploadResponse[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateSubmissionInput>({
    resolver: zodResolver(createSubmissionSchema),
  });

  const selectedTeamId = watch('teamId');
  const selectedTrackId = watch('trackId');

  useEffect(() => {
    fetchData();
  }, [slug]);

  async function fetchData() {
    try {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Fetch hackathon
      const hackathonData = await getHackathonBySlug(slug);
      setHackathon(hackathonData);
      setValue('hackathonId', hackathonData.id);

      // Fetch user's teams for this hackathon
      const teamsData = await getUserTeams(token, hackathonData.id);
      setUserTeams(teamsData);

      // If user has only one team, auto-select it
      if (teamsData.length === 1) {
        setValue('teamId', teamsData[0].id);

        // Check if team already has a submission
        await checkExistingSubmission(hackathonData.id, teamsData[0].id);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(
        err instanceof Error ? err.message : String(err) || 'Failed to load submission form'
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function checkExistingSubmission(hackathonId: string, teamId: string) {
    try {
      const submissions = await getSubmissions({ hackathonId, teamId });
      if (submissions.length > 0) {
        const submission = submissions[0];
        setExistingSubmission(submission);

        // Pre-fill form with existing data if it's a draft
        if (submission.status === 'DRAFT') {
          setValue('title', submission.title);
          setValue('abstract', submission.abstract);
          setValue('repoUrl', submission.repoUrl || '');
          setValue('demoUrl', submission.demoUrl || '');
          setValue('videoUrl', submission.videoUrl || '');
          if (submission.trackId) {
            setValue('trackId', submission.trackId);
          }
        }
      }
    } catch (err) {
      console.error('Error checking existing submission:', err);
    }
  }

  async function onSubmit(data: CreateSubmissionInput, _isDraft: boolean = true) {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const token = getAuthToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      if (existingSubmission && existingSubmission.status === 'DRAFT') {
        // Update existing draft
        await updateSubmission(
          existingSubmission.id,
          {
            title: data.title,
            abstract: data.abstract,
            repoUrl: data.repoUrl,
            demoUrl: data.demoUrl,
            videoUrl: data.videoUrl,
            trackId: data.trackId,
          },
          token
        );
        setSuccessMessage('Submission updated successfully!');
      } else {
        // Create new submission
        await createSubmission(data, token);
        setSuccessMessage('Submission created successfully!');
      }

      // Redirect after short delay
      setTimeout(() => {
        router.push(`/hackathons/${slug}/submissions`);
      }, 1500);
    } catch (err) {
      console.error('Error submitting:', err);
      setError(err instanceof Error ? err.message : String(err) || 'Failed to submit project');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSaveDraft() {
    handleSubmit(data => onSubmit(data, true))();
  }

  // Check if deadline has passed
  const isBeforeDeadline = hackathon ? new Date() < new Date(hackathon.endsAt) : false;

  const canSubmit =
    isBeforeDeadline && (!existingSubmission || existingSubmission.status === 'DRAFT');

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading submission form...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (!hackathon) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load submission form</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-300 mb-4">{error || 'Hackathon not found'}</p>
            <Link href="/hackathons">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hackathons
              </Button>
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
          <Link href={`/hackathons/${slug}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {hackathon.title}
            </Button>
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            {existingSubmission && existingSubmission.status === 'DRAFT'
              ? 'Edit Submission'
              : 'Submit Your Project'}
          </h1>
          <p className="text-lg text-white/90">{hackathon.title}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Alerts */}
          {!isBeforeDeadline && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Submission Deadline Passed</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      The submission deadline for this hackathon has passed. You can no longer
                      submit or edit your project.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {existingSubmission && existingSubmission.status !== 'DRAFT' && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Submission Already Finalized</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your team has already submitted a finalized project for this hackathon.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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

          {/* Team Selection */}
          {userTeams.length === 0 && (
            <Card className="mb-6 border-yellow-200">
              <CardHeader>
                <CardTitle>No Team Found</CardTitle>
                <CardDescription>
                  You need to join or create a team before submitting a project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/hackathons/${slug}/teams`}>
                  <Button>Browse Teams</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {userTeams.length > 0 && (
            <form onSubmit={handleSubmit(data => onSubmit(data, false))}>
              {/* Team Selection Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Team Selection
                  </CardTitle>
                  <CardDescription>Select which team is submitting this project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="teamId">Your Team *</Label>
                    <select
                      id="teamId"
                      {...register('teamId')}
                      className="w-full mt-1.5 h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-card px-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!canSubmit || userTeams.length === 1}
                      onChange={e => {
                        setValue('teamId', e.target.value);
                        if (hackathon) {
                          checkExistingSubmission(hackathon.id, e.target.value);
                        }
                      }}
                    >
                      <option value="">Select a team...</option>
                      {userTeams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name} ({team.members.length} members)
                        </option>
                      ))}
                    </select>
                    {errors.teamId && (
                      <p className="text-sm text-red-600 mt-1">{errors.teamId.message}</p>
                    )}
                  </div>

                  {/* Track Selection */}
                  {hackathon.tracks && hackathon.tracks.length > 0 && (
                    <div>
                      <Label htmlFor="trackId">Challenge Track (Optional)</Label>
                      <select
                        id="trackId"
                        {...register('trackId')}
                        className="w-full mt-1.5 h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-card px-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!canSubmit}
                      >
                        <option value="">No specific track</option>
                        {hackathon.tracks.map(track => (
                          <option key={track.id} value={track.id}>
                            {track.title}
                          </option>
                        ))}
                      </select>
                      {selectedTrackId && hackathon.tracks && (
                        <p className="text-sm text-slate-500 dark:text-slate-300 mt-1.5">
                          {hackathon.tracks.find(t => t.id === selectedTrackId)?.description}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Project Details Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Project Details
                  </CardTitle>
                  <CardDescription>Tell us about your innovative solution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., AI-Powered Banking Assistant"
                      {...register('title')}
                      disabled={!canSubmit}
                      className="mt-1.5"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="abstract">Project Description *</Label>
                    <Textarea
                      id="abstract"
                      placeholder="Describe your project, the problem it solves, how it works, and what makes it innovative... (minimum 50 characters)"
                      rows={8}
                      {...register('abstract')}
                      disabled={!canSubmit}
                      className="mt-1.5"
                    />
                    {errors.abstract && (
                      <p className="text-sm text-red-600 mt-1">{errors.abstract.message}</p>
                    )}
                    <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                      Minimum 50 characters. Be detailed and explain your innovation clearly.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Project Links Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Project Links</CardTitle>
                  <CardDescription>Share your code, demo, and video presentation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="repoUrl" className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      Repository URL (Optional)
                    </Label>
                    <Input
                      id="repoUrl"
                      type="url"
                      placeholder="https://github.com/yourusername/project"
                      {...register('repoUrl')}
                      disabled={!canSubmit}
                      className="mt-1.5"
                    />
                    {errors.repoUrl && (
                      <p className="text-sm text-red-600 mt-1">{errors.repoUrl.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="demoUrl" className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Live Demo URL (Optional)
                    </Label>
                    <Input
                      id="demoUrl"
                      type="url"
                      placeholder="https://your-demo.com"
                      {...register('demoUrl')}
                      disabled={!canSubmit}
                      className="mt-1.5"
                    />
                    {errors.demoUrl && (
                      <p className="text-sm text-red-600 mt-1">{errors.demoUrl.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="videoUrl" className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Video Presentation URL (Optional)
                    </Label>
                    <Input
                      id="videoUrl"
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      {...register('videoUrl')}
                      disabled={!canSubmit}
                      className="mt-1.5"
                    />
                    {errors.videoUrl && (
                      <p className="text-sm text-red-600 mt-1">{errors.videoUrl.message}</p>
                    )}
                    <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
                      YouTube, Vimeo, or similar video hosting platform
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* File Attachments Card */}
              {existingSubmission && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Paperclip className="w-5 h-5 text-primary" />
                      File Attachments
                    </CardTitle>
                    <CardDescription>
                      Upload images, videos, or documents to support your submission
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* File Upload */}
                    {canSubmit && (
                      <FileUpload
                        accept="image/*,video/*,application/pdf,.doc,.docx,.ppt,.pptx"
                        maxSizeMB={100}
                        maxFiles={10}
                        fileType={FileType.DOCUMENT}
                        entityId={existingSubmission.id}
                        entityType="submission"
                        onUploadComplete={files => {
                          setSuccessMessage(`${files.length} file(s) uploaded successfully!`);
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }}
                        onUploadError={err => {
                          setError(err instanceof Error ? err.message : String(err));
                          setTimeout(() => setError(null), 5000);
                        }}
                      />
                    )}

                    {/* Uploaded Files List */}
                    <FileList
                      entityType="submission"
                      entityId={existingSubmission.id}
                      canDelete={canSubmit}
                      onDelete={file => {
                        setSuccessMessage(`${file.filename} deleted successfully!`);
                        setTimeout(() => setSuccessMessage(null), 3000);
                      }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              {canSubmit && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={isSubmitting || !selectedTeamId}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save as Draft
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || !selectedTeamId}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Create Submission
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-300 text-center mt-3">
                      You can edit your submission as a draft. Only the team lead can finalize it.
                    </p>
                  </CardContent>
                </Card>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
