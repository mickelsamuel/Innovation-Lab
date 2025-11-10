'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createChallengeSchema,
  type CreateChallengeFormData,
  generateSlug,
} from '@/lib/validations/challenge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CategoryMultiSelect } from './CategoryMultiSelect';
import { SkillMultiSelect } from './SkillMultiSelect';
import { FileUpload } from '@/components/files/file-upload';
import { FileType } from '@/lib/files';
import { ChallengeStatus, ChallengeVisibility, RewardType } from '@/types/challenge';
import { Loader2, Sparkles, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChallengeFormProps {
  defaultValues?: Partial<CreateChallengeFormData>;
  onSubmit: (data: CreateChallengeFormData) => Promise<void>;
  submitLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function ChallengeForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Create Challenge',
  isLoading = false,
  className,
}: ChallengeFormProps) {
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateChallengeFormData>({
    resolver: zodResolver(createChallengeSchema),
    defaultValues: {
      title: '',
      slug: '',
      problemStatement: '',
      ownerOrg: '',
      rewardType: undefined,
      rewardValue: '',
      categories: [],
      skills: [],
      status: ChallengeStatus.DRAFT,
      visibility: ChallengeVisibility.PUBLIC,
      deadlineAt: '',
      ...defaultValues,
    },
  });

  const title = watch('title');
  const categories = watch('categories');
  const skills = watch('skills');
  const status = watch('status');
  const visibility = watch('visibility');
  const rewardType = watch('rewardType');

  // Auto-generate slug from title
  useEffect(() => {
    if (autoGenerateSlug && title) {
      const slug = generateSlug(title);
      setValue('slug', slug);
    }
  }, [title, autoGenerateSlug, setValue]);

  const handleFormSubmit = async (data: CreateChallengeFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-6', className)}>
      {/* Title & Slug */}
      <Card className="border-2 border-slate-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Challenge Title
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., Build a Real-Time Chat Application"
                className="mt-2"
              />
              {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="slug" className="text-base font-semibold">
                  URL Slug
                </Label>
                <button
                  type="button"
                  onClick={() => setAutoGenerateSlug(!autoGenerateSlug)}
                  className="text-xs text-primary hover:underline"
                >
                  {autoGenerateSlug ? 'Edit manually' : 'Auto-generate'}
                </button>
              </div>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="real-time-chat-application"
                readOnly={autoGenerateSlug}
                className={cn('mt-1', autoGenerateSlug && 'bg-slate-50')}
              />
              {errors.slug && <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>}
              <p className="text-xs text-slate-500 mt-1">This will be used in the challenge URL</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problem Statement */}
      <Card className="border-2 border-slate-200">
        <CardContent className="pt-6">
          <Label htmlFor="problemStatement" className="text-base font-semibold">
            Problem Statement
          </Label>
          <Textarea
            id="problemStatement"
            {...register('problemStatement')}
            placeholder="Describe the challenge in detail. What problem needs to be solved? What are the requirements? What should participants build?"
            rows={12}
            className="mt-2 font-mono text-sm"
          />
          {errors.problemStatement && (
            <p className="text-sm text-red-600 mt-1">{errors.problemStatement.message}</p>
          )}
          <p className="text-xs text-slate-500 mt-2">
            Minimum 100 characters. Use markdown for formatting.
          </p>
        </CardContent>
      </Card>

      {/* Categories & Skills */}
      <Card className="border-2 border-slate-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-semibold mb-3 block">Categories</Label>
              <CategoryMultiSelect
                value={categories || []}
                onChange={cats => setValue('categories', cats)}
                maxSelections={5}
              />
              {errors.categories && (
                <p className="text-sm text-red-600 mt-1">{errors.categories.message}</p>
              )}
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Required Skills</Label>
              <SkillMultiSelect
                value={skills || []}
                onChange={skls => setValue('skills', skls)}
                maxSelections={10}
              />
              {errors.skills && (
                <p className="text-sm text-red-600 mt-1">{errors.skills.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reward Information */}
      <Card className="border-2 border-slate-200">
        <CardContent className="pt-6">
          <h3 className="text-base font-semibold mb-4">Reward Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rewardType">Reward Type</Label>
              <Select
                value={rewardType || ''}
                onValueChange={val => setValue('rewardType', val as RewardType)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select reward type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RewardType.CASH}>Cash Prize</SelectItem>
                  <SelectItem value={RewardType.PRIZE}>Prize</SelectItem>
                  <SelectItem value={RewardType.INTERNSHIP}>Internship</SelectItem>
                  <SelectItem value={RewardType.RECOGNITION}>Recognition</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rewardValue">Reward Value</Label>
              <Input
                id="rewardValue"
                {...register('rewardValue')}
                placeholder="e.g., $1000, MacBook Pro, 3-month internship"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="ownerOrg">Organization</Label>
              <Input
                id="ownerOrg"
                {...register('ownerOrg')}
                placeholder="Your organization name"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="border-2 border-slate-200">
        <CardContent className="pt-6">
          <h3 className="text-base font-semibold mb-4">Challenge Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={val => setValue('status', val as ChallengeStatus)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ChallengeStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={ChallengeStatus.OPEN}>Open</SelectItem>
                  <SelectItem value={ChallengeStatus.REVIEW}>Under Review</SelectItem>
                  <SelectItem value={ChallengeStatus.CLOSED}>Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={visibility}
                onValueChange={val => setValue('visibility', val as ChallengeVisibility)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ChallengeVisibility.PUBLIC}>Public</SelectItem>
                  <SelectItem value={ChallengeVisibility.PRIVATE}>Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="deadlineAt" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Deadline (Optional)
              </Label>
              <Input
                id="deadlineAt"
                type="datetime-local"
                {...register('deadlineAt')}
                className="mt-1"
              />
              {errors.deadlineAt && (
                <p className="text-sm text-red-600 mt-1">{errors.deadlineAt.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Attachments */}
      <Card className="border-2 border-slate-200">
        <CardContent className="pt-6">
          <Label className="text-base font-semibold mb-3 block">Attachments (Optional)</Label>
          <FileUpload
            accept="*/*"
            maxSizeMB={25}
            maxFiles={10}
            fileType={FileType.DOCUMENT}
            entityType="challenge"
            onUploadComplete={files => {
              const fileUrls = files.map(f => f.url);
              setUploadedFiles([...uploadedFiles, ...fileUrls]);
            }}
          />
          <p className="text-xs text-slate-500 mt-2">
            Add any supporting documents, diagrams, or resources
          </p>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Button type="submit" size="lg" disabled={isLoading} className="min-w-[200px]">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
