'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { FileUpload } from '@/components/files/file-upload';
import { createHackathon } from '@/lib/hackathons';
import { getAuthToken } from '@/lib/api';
import { createHackathonSchema, type CreateHackathonInput } from '@/lib/validations/hackathon';
import { HackathonStatus, HackathonLocation } from '@/types/hackathon';
import { FileType } from '@/lib/files';
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
  AlertCircle,
} from 'lucide-react';

export default function CreateHackathonPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<CreateHackathonInput>({
    resolver: zodResolver(createHackathonSchema),
    defaultValues: {
      status: HackathonStatus.DRAFT,
      location: HackathonLocation.VIRTUAL,
      maxTeamSize: 5,
      minTeamSize: 1,
      allowSoloTeams: true,
      requireApproval: false,
      isPublished: false,
      tracks: [],
      criteria: [],
    },
  });

  const { fields: trackFields, append: appendTrack, remove: removeTrack } = useFieldArray({
    control,
    name: 'tracks',
  });

  const { fields: criteriaFields, append: appendCriterion, remove: removeCriterion } = useFieldArray({
    control,
    name: 'criteria',
  });

  const location = watch('location');

  async function onSubmit(data: CreateHackathonInput) {
    const token = getAuthToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      setIsSubmitting(true);

      // Add uploaded URLs
      const submitData = {
        ...data,
        bannerUrl: bannerUrl || data.bannerUrl,
        logoUrl: logoUrl || data.logoUrl,
        // Convert empty strings to undefined
        subtitle: data.subtitle || undefined,
        description: data.description || undefined,
        virtualUrl: data.virtualUrl || undefined,
        venue: data.venue || undefined,
        city: data.city || undefined,
        country: data.country || undefined,
        timezone: data.timezone || undefined,
        registrationOpensAt: data.registrationOpensAt || undefined,
        registrationClosesAt: data.registrationClosesAt || undefined,
        submissionOpensAt: data.submissionOpensAt || undefined,
        submissionClosesAt: data.submissionClosesAt || undefined,
        prizePool: data.prizePool || undefined,
      };

      const hackathon = await createHackathon(submitData, token);

      addToast({
        type: 'success',
        title: 'Hackathon created',
        description: 'The hackathon has been successfully created.',
      });

      router.push(`/admin/hackathons/${hackathon.id}/edit`);
    } catch (error: any) {
      console.error('Error creating hackathon:', error);
      addToast({
        type: 'error',
        title: 'Failed to create hackathon',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
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
            Create New Hackathon
          </h1>
          <p className="text-lg text-white/90">Set up a new hackathon event</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
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
                  placeholder="Provide a detailed description of the hackathon, its goals, and what participants can expect..."
                  rows={6}
                  {...register('description')}
                  className="mt-1.5"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
                <p className="text-sm text-slate-500 mt-1">Minimum 50 characters</p>
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
                  {errors.status && (
                    <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="isPublished">Visibility</Label>
                  <select
                    id="isPublished"
                    {...register('isPublished', { setValueAs: (v) => v === 'true' })}
                    className="w-full mt-1.5 h-10 rounded-md border border-slate-200 bg-white px-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <option value="false">Unpublished (Draft)</option>
                    <option value="true">Published (Visible to users)</option>
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
              <CardDescription>Where will the hackathon take place?</CardDescription>
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
                {errors.location && (
                  <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
                )}
              </div>

              {(location === HackathonLocation.VIRTUAL || location === HackathonLocation.HYBRID) && (
                <div>
                  <Label htmlFor="virtualUrl">Virtual Meeting URL</Label>
                  <Input
                    id="virtualUrl"
                    type="url"
                    placeholder="https://meet.google.com/xxx-xxx-xxx"
                    {...register('virtualUrl')}
                    className="mt-1.5"
                  />
                  {errors.virtualUrl && (
                    <p className="text-sm text-red-600 mt-1">{errors.virtualUrl.message}</p>
                  )}
                </div>
              )}

              {(location === HackathonLocation.ONSITE || location === HackathonLocation.HYBRID) && (
                <>
                  <div>
                    <Label htmlFor="venue">Venue</Label>
                    <Input
                      id="venue"
                      placeholder="e.g., Tech Hub, 123 Innovation Street"
                      {...register('venue')}
                      className="mt-1.5"
                    />
                    {errors.venue && (
                      <p className="text-sm text-red-600 mt-1">{errors.venue.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="e.g., San Francisco"
                        {...register('city')}
                        className="mt-1.5"
                      />
                      {errors.city && (
                        <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        placeholder="e.g., United States"
                        {...register('country')}
                        className="mt-1.5"
                      />
                      {errors.country && (
                        <p className="text-sm text-red-600 mt-1">{errors.country.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        placeholder="e.g., America/Los_Angeles"
                        {...register('timezone')}
                        className="mt-1.5"
                      />
                      {errors.timezone && (
                        <p className="text-sm text-red-600 mt-1">{errors.timezone.message}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Dates & Timeline */}
          <Card className="game-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Dates & Timeline
              </CardTitle>
              <CardDescription>Set important dates for the hackathon</CardDescription>
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
                  {errors.registrationOpensAt && (
                    <p className="text-sm text-red-600 mt-1">{errors.registrationOpensAt.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="registrationClosesAt">Registration Closes</Label>
                  <Input
                    id="registrationClosesAt"
                    type="datetime-local"
                    {...register('registrationClosesAt')}
                    className="mt-1.5"
                  />
                  {errors.registrationClosesAt && (
                    <p className="text-sm text-red-600 mt-1">{errors.registrationClosesAt.message}</p>
                  )}
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
                  {errors.submissionOpensAt && (
                    <p className="text-sm text-red-600 mt-1">{errors.submissionOpensAt.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="submissionClosesAt">Submission Closes</Label>
                  <Input
                    id="submissionClosesAt"
                    type="datetime-local"
                    {...register('submissionClosesAt')}
                    className="mt-1.5"
                  />
                  {errors.submissionClosesAt && (
                    <p className="text-sm text-red-600 mt-1">{errors.submissionClosesAt.message}</p>
                  )}
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
              <CardDescription>Set team size rules</CardDescription>
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
                  {errors.minTeamSize && (
                    <p className="text-sm text-red-600 mt-1">{errors.minTeamSize.message}</p>
                  )}
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
                  {errors.maxTeamSize && (
                    <p className="text-sm text-red-600 mt-1">{errors.maxTeamSize.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="allowSoloTeams"
                  {...register('allowSoloTeams')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="allowSoloTeams" className="cursor-pointer">
                    Allow Solo Teams
                  </Label>
                  <p className="text-sm text-slate-500 mt-1">
                    Participants can compete individually
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="requireApproval"
                  {...register('requireApproval')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="requireApproval" className="cursor-pointer">
                    Require Team Approval
                  </Label>
                  <p className="text-sm text-slate-500 mt-1">
                    Teams must be approved before participating
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prizes */}
          <Card className="game-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Prize Pool
              </CardTitle>
              <CardDescription>Optional prize information</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="prizePool">Total Prize Pool (USD)</Label>
                <Input
                  id="prizePool"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 10000"
                  {...register('prizePool', { valueAsNumber: true })}
                  className="mt-1.5"
                />
                {errors.prizePool && (
                  <p className="text-sm text-red-600 mt-1">{errors.prizePool.message}</p>
                )}
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
              <CardDescription>Banner and logo for the hackathon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="bannerUrl">Banner URL</Label>
                <Input
                  id="bannerUrl"
                  type="url"
                  placeholder="https://example.com/banner.jpg"
                  {...register('bannerUrl')}
                  className="mt-1.5"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                />
                {errors.bannerUrl && (
                  <p className="text-sm text-red-600 mt-1">{errors.bannerUrl.message}</p>
                )}
                <p className="text-sm text-slate-500 mt-1">
                  Recommended size: 1200x400px. Or upload below after creating.
                </p>
              </div>

              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  {...register('logoUrl')}
                  className="mt-1.5"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
                {errors.logoUrl && (
                  <p className="text-sm text-red-600 mt-1">{errors.logoUrl.message}</p>
                )}
                <p className="text-sm text-slate-500 mt-1">
                  Recommended size: 512x512px. Or upload below after creating.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tracks */}
          <Card className="game-card mb-6">
            <CardHeader>
              <CardTitle>Challenge Tracks</CardTitle>
              <CardDescription>
                Optional themed tracks for submissions (can be added after creation)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium">Add Tracks Later</p>
                  <p className="text-sm text-blue-700 mt-1">
                    You can add and configure tracks after creating the hackathon from the edit page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Judging Criteria */}
          <Card className="game-card mb-6">
            <CardHeader>
              <CardTitle>Judging Criteria</CardTitle>
              <CardDescription>
                Define how submissions will be evaluated (can be added after creation)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium">Add Criteria Later</p>
                  <p className="text-sm text-blue-700 mt-1">
                    You can add and configure judging criteria after creating the hackathon from the edit page.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Card className="game-card">
            <CardContent className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-game"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Hackathon...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Hackathon
                  </>
                )}
              </Button>
              <p className="text-xs text-slate-500 text-center mt-3">
                You can edit all settings after creating the hackathon
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
