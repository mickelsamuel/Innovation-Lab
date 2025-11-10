'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { getHackathonById, updateHackathon } from '@/lib/hackathons';
import { getAuthToken } from '@/lib/api';
import { createHackathonSchema, type CreateHackathonInput } from '@/lib/validations/hackathon';
import { HackathonStatus, HackathonLocation, type Hackathon } from '@/types/hackathon';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Plus,
  X,
  Loader2,
  Save,
  Image as ImageIcon,
  FileText,
  Target,
  Gavel,
  AlertCircle,
} from 'lucide-react';

export default function EditHackathonPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const hackathonId = params.id as string;

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmissions, setHasSubmissions] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
  } = useForm<CreateHackathonInput>({
    resolver: zodResolver(createHackathonSchema),
  });

  const {
    fields: trackFields,
    append: appendTrack,
    remove: removeTrack,
  } = useFieldArray({
    control,
    name: 'tracks',
  });

  const {
    fields: criteriaFields,
    append: appendCriterion,
    remove: removeCriterion,
  } = useFieldArray({
    control,
    name: 'criteria',
  });

  const location = watch('location');

  useEffect(() => {
    fetchHackathon();
  }, [hackathonId]);

  async function fetchHackathon() {
    try {
      setIsLoading(true);
      const data = await getHackathonById(hackathonId);
      setHackathon(data);
      setHasSubmissions((data._count?.submissions || 0) > 0);

      // Populate form with existing data
      reset({
        title: data.title,
        subtitle: data.subtitle || '',
        description: data.description || '',
        status: data.status,
        location: data.location,
        virtualUrl: data.virtualUrl || '',
        venue: data.venue || '',
        city: data.city || '',
        country: data.country || '',
        timezone: data.timezone || '',
        bannerUrl: data.bannerUrl || '',
        logoUrl: data.logoUrl || '',
        startsAt: data.startsAt ? new Date(data.startsAt).toISOString().slice(0, 16) : '',
        endsAt: data.endsAt ? new Date(data.endsAt).toISOString().slice(0, 16) : '',
        registrationOpensAt: data.registrationOpensAt
          ? new Date(data.registrationOpensAt).toISOString().slice(0, 16)
          : '',
        registrationClosesAt: data.registrationClosesAt
          ? new Date(data.registrationClosesAt).toISOString().slice(0, 16)
          : '',
        submissionOpensAt: data.submissionOpensAt
          ? new Date(data.submissionOpensAt).toISOString().slice(0, 16)
          : '',
        submissionClosesAt: data.submissionClosesAt
          ? new Date(data.submissionClosesAt).toISOString().slice(0, 16)
          : '',
        prizePool: data.prizePool || undefined,
        maxTeamSize: data.maxTeamSize,
        minTeamSize: data.minTeamSize,
        allowSoloTeams: data.allowSoloTeams,
        requireApproval: data.requireApproval,
        isPublished: data.isPublished,
        tracks:
          data.tracks?.map(track => ({
            title: track.title,
            description: track.description,
            order: track.order,
          })) || [],
        criteria:
          data.criteria?.map(criterion => ({
            name: criterion.name,
            description: criterion.description,
            maxScore: criterion.maxScore,
            weight: criterion.weight,
            order: criterion.order,
          })) || [],
      });
    } catch (error) {
      console.error('Error fetching hackathon:', error);
      addToast({
        type: 'error',
        title: 'Failed to load hackathon',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(data: CreateHackathonInput) {
    const token = getAuthToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert empty strings to undefined
      const submitData = {
        ...data,
        subtitle: data.subtitle || undefined,
        description: data.description || undefined,
        virtualUrl: data.virtualUrl || undefined,
        venue: data.venue || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        timezone: data.timezone || undefined,
        bannerUrl: data.bannerUrl || undefined,
        logoUrl: data.logoUrl || undefined,
        registrationOpensAt: data.registrationOpensAt || undefined,
        registrationClosesAt: data.registrationClosesAt || undefined,
        submissionOpensAt: data.submissionOpensAt || undefined,
        submissionClosesAt: data.submissionClosesAt || undefined,
        prizePool: data.prizePool || undefined,
      };

      await updateHackathon(hackathonId, submitData, token);

      addToast({
        type: 'success',
        title: 'Hackathon updated',
        description: 'The hackathon has been successfully updated.',
      });

      // Refresh data
      fetchHackathon();
    } catch (error) {
      console.error('Error updating hackathon:', error);
      addToast({
        type: 'error',
        title: 'Failed to update hackathon',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 border-4 text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading hackathon...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load hackathon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">Hackathon not found</p>
            <Link href="/admin/hackathons">
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin/hackathons">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hackathons
            </Button>
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            Edit Hackathon
          </h1>
          <p className="text-lg text-white/90">{hackathon.title}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
          {/* Warning for submissions */}
          {hasSubmissions && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Active Submissions</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      This hackathon has {hackathon._count?.submissions || 0} submissions. Modifying
                      tracks or criteria may affect judging.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <Card className="game-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Basic Information
              </CardTitle>
              <CardDescription>Core details about the hackathon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Innovation Lab Summer Hackathon 2024"
                  {...register('title')}
                  className="mt-1.5"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  placeholder="e.g., Build the Future of Banking"
                  {...register('subtitle')}
                  className="mt-1.5"
                />
                {errors.subtitle && (
                  <p className="text-sm text-red-600 mt-1">{errors.subtitle.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the hackathon..."
                  rows={6}
                  {...register('description')}
                  className="mt-1.5"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    {...register('status')}
                    className="w-full mt-1.5 h-10 rounded-md border border-slate-200 bg-white px-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <option value={HackathonStatus.DRAFT}>Draft</option>
                    <option value={HackathonStatus.UPCOMING}>Upcoming</option>
                    <option value={HackathonStatus.LIVE}>Live</option>
                    <option value={HackathonStatus.JUDGING}>Judging</option>
                    <option value={HackathonStatus.CLOSED}>Closed</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="isPublished">Visibility</Label>
                  <select
                    id="isPublished"
                    {...register('isPublished', { setValueAs: v => v === 'true' })}
                    className="w-full mt-1.5 h-10 rounded-md border border-slate-200 bg-white px-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <option value="false">Unpublished</option>
                    <option value="true">Published</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Venue */}
          <Card className="game-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Location & Venue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Location Type *</Label>
                <select
                  id="location"
                  {...register('location')}
                  className="w-full mt-1.5 h-10 rounded-md border border-slate-200 bg-white px-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <option value={HackathonLocation.VIRTUAL}>Virtual</option>
                  <option value={HackathonLocation.ONSITE}>Onsite</option>
                  <option value={HackathonLocation.HYBRID}>Hybrid</option>
                </select>
              </div>

              {(location === HackathonLocation.VIRTUAL ||
                location === HackathonLocation.HYBRID) && (
                <div>
                  <Label htmlFor="virtualUrl">Virtual Meeting URL</Label>
                  <Input
                    id="virtualUrl"
                    type="url"
                    {...register('virtualUrl')}
                    className="mt-1.5"
                  />
                </div>
              )}

              {(location === HackathonLocation.ONSITE || location === HackathonLocation.HYBRID) && (
                <>
                  <div>
                    <Label htmlFor="venue">Venue</Label>
                    <Input id="venue" {...register('venue')} className="mt-1.5" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" {...register('city')} className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" {...register('country')} className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input id="timezone" {...register('timezone')} className="mt-1.5" />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Dates */}
          <Card className="game-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Dates & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startsAt">Start Date & Time *</Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    {...register('startsAt')}
                    className="mt-1.5"
                  />
                  {errors.startsAt && (
                    <p className="text-sm text-red-600 mt-1">{errors.startsAt.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="endsAt">End Date & Time *</Label>
                  <Input
                    id="endsAt"
                    type="datetime-local"
                    {...register('endsAt')}
                    className="mt-1.5"
                  />
                  {errors.endsAt && (
                    <p className="text-sm text-red-600 mt-1">{errors.endsAt.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationOpensAt">Registration Opens</Label>
                  <Input
                    id="registrationOpensAt"
                    type="datetime-local"
                    {...register('registrationOpensAt')}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="registrationClosesAt">Registration Closes</Label>
                  <Input
                    id="registrationClosesAt"
                    type="datetime-local"
                    {...register('registrationClosesAt')}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="submissionOpensAt">Submission Opens</Label>
                  <Input
                    id="submissionOpensAt"
                    type="datetime-local"
                    {...register('submissionOpensAt')}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="submissionClosesAt">Submission Closes</Label>
                  <Input
                    id="submissionClosesAt"
                    type="datetime-local"
                    {...register('submissionClosesAt')}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Configuration */}
          <Card className="game-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Team Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minTeamSize">Minimum Team Size *</Label>
                  <Input
                    id="minTeamSize"
                    type="number"
                    min="1"
                    {...register('minTeamSize', { valueAsNumber: true })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="maxTeamSize">Maximum Team Size *</Label>
                  <Input
                    id="maxTeamSize"
                    type="number"
                    min="1"
                    {...register('maxTeamSize', { valueAsNumber: true })}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="allowSoloTeams" {...register('allowSoloTeams')} />
                <Label htmlFor="allowSoloTeams" className="cursor-pointer">
                  Allow Solo Teams
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="requireApproval" {...register('requireApproval')} />
                <Label htmlFor="requireApproval" className="cursor-pointer">
                  Require Team Approval
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Prize Pool */}
          <Card className="game-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Prize Pool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="prizePool">Total Prize Pool (USD)</Label>
                <Input
                  id="prizePool"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('prizePool', { valueAsNumber: true })}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card className="game-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Media & Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bannerUrl">Banner URL</Label>
                <Input id="bannerUrl" type="url" {...register('bannerUrl')} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input id="logoUrl" type="url" {...register('logoUrl')} className="mt-1.5" />
              </div>
            </CardContent>
          </Card>

          {/* Tracks */}
          <Card className="game-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Challenge Tracks
              </CardTitle>
              <CardDescription>Themed tracks for submissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {trackFields.map((field, index) => (
                <Card key={field.id} className="border-2">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <Label>Track {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTrack(index)}
                        disabled={hasSubmissions}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Track title"
                      {...register(`tracks.${index}.title` as const)}
                    />
                    <Textarea
                      placeholder="Track description"
                      {...register(`tracks.${index}.description` as const)}
                      rows={2}
                    />
                    <input
                      type="hidden"
                      {...register(`tracks.${index}.order` as const)}
                      value={index}
                    />
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendTrack({ title: '', description: '', order: trackFields.length })
                }
                className="w-full"
                disabled={hasSubmissions}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Track
              </Button>
              {hasSubmissions && (
                <p className="text-sm text-yellow-600">
                  Cannot modify tracks with existing submissions
                </p>
              )}
            </CardContent>
          </Card>

          {/* Judging Criteria */}
          <Card className="game-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-primary" />
                Judging Criteria
              </CardTitle>
              <CardDescription>How submissions will be evaluated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {criteriaFields.map((field, index) => (
                <Card key={field.id} className="border-2">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <Label>Criterion {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCriterion(index)}
                        disabled={hasSubmissions}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Criterion name"
                      {...register(`criteria.${index}.name` as const)}
                    />
                    <Textarea
                      placeholder="Description"
                      {...register(`criteria.${index}.description` as const)}
                      rows={2}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">Max Score</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          {...register(`criteria.${index}.maxScore` as const, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Weight (0-1)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          {...register(`criteria.${index}.weight` as const, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                      <input
                        type="hidden"
                        {...register(`criteria.${index}.order` as const)}
                        value={index}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  appendCriterion({
                    name: '',
                    description: '',
                    maxScore: 10,
                    weight: 1,
                    order: criteriaFields.length,
                  })
                }
                className="w-full"
                disabled={hasSubmissions}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Criterion
              </Button>
              {hasSubmissions && (
                <p className="text-sm text-yellow-600">
                  Cannot modify criteria with existing submissions
                </p>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card className="game-card">
            <CardContent className="pt-6">
              <Button type="submit" disabled={isSubmitting} className="w-full btn-game" size="lg">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
