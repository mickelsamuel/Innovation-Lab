'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSubmissionSchema, type ReviewSubmissionFormData } from '@/lib/validations/challenge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ChallengeSubmissionStatus } from '@/types/challenge';
import { Loader2, CheckCircle2, XCircle, Trophy, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmissionReviewFormProps {
  defaultValues?: Partial<ReviewSubmissionFormData>;
  onSubmit: (data: ReviewSubmissionFormData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

const STATUS_OPTIONS = [
  {
    value: ChallengeSubmissionStatus.SUBMITTED,
    label: 'Submitted',
    description: 'Initial submission state',
    icon: AlertCircle,
    color: 'text-slate-500 dark:text-slate-300',
    bgColor: 'bg-slate-50 dark:bg-slate-900',
  },
  {
    value: ChallengeSubmissionStatus.UNDER_REVIEW,
    label: 'Under Review',
    description: 'Currently being evaluated',
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
  },
  {
    value: ChallengeSubmissionStatus.ACCEPTED,
    label: 'Accepted',
    description: 'Meets requirements',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    value: ChallengeSubmissionStatus.REJECTED,
    label: 'Rejected',
    description: 'Does not meet requirements',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    value: ChallengeSubmissionStatus.WINNER,
    label: 'Winner',
    description: 'Selected as winning solution',
    icon: Trophy,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

export function SubmissionReviewForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  className,
}: SubmissionReviewFormProps) {
  const [scoreValue, setScoreValue] = useState<number>(defaultValues?.score || 0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ReviewSubmissionFormData>({
    resolver: zodResolver(reviewSubmissionSchema),
    defaultValues: {
      status: ChallengeSubmissionStatus.UNDER_REVIEW,
      score: 0,
      feedback: '',
      ...defaultValues,
    },
  });

  const status = watch('status');

  const handleFormSubmit = async (data: ReviewSubmissionFormData) => {
    await onSubmit(data);
  };

  const selectedStatus = STATUS_OPTIONS.find(opt => opt.value === status);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-6', className)}>
      {/* Status Selection */}
      <Card className="border-2 border-slate-200 dark:border-slate-800">
        <CardContent className="pt-6">
          <Label className="text-base font-semibold mb-4 block">Review Status</Label>

          <div className="grid grid-cols-1 gap-3">
            {STATUS_OPTIONS.map(option => {
              const Icon = option.icon;
              const isSelected = status === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('status', option.value)}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      isSelected ? option.bgColor : 'bg-slate-100 dark:bg-slate-800'
                    )}
                  >
                    <Icon className={cn('w-5 h-5', isSelected ? option.color : 'text-slate-400')} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100">{option.label}</h4>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-300 mt-0.5">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {errors.status && <p className="text-sm text-red-600 mt-2">{errors.status.message}</p>}
        </CardContent>
      </Card>

      {/* Score */}
      <Card className="border-2 border-slate-200 dark:border-slate-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-base font-semibold">Score (Optional)</Label>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">{scoreValue}</span>
              <span className="text-slate-500 dark:text-slate-300">/100</span>
            </div>
          </div>

          <Slider
            min={0}
            max={100}
            step={1}
            value={[scoreValue]}
            onValueChange={value => {
              const newScore = value[0];
              setScoreValue(newScore);
              setValue('score', newScore);
            }}
            className="mb-4"
          />

          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-300">
            <span>0 - Poor</span>
            <span>25 - Below Average</span>
            <span>50 - Average</span>
            <span>75 - Good</span>
            <span>100 - Excellent</span>
          </div>

          {errors.score && <p className="text-sm text-red-600 mt-2">{errors.score.message}</p>}
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card className="border-2 border-slate-200 dark:border-slate-800">
        <CardContent className="pt-6">
          <Label htmlFor="feedback" className="text-base font-semibold">
            Feedback (Optional)
          </Label>
          <Textarea
            id="feedback"
            {...register('feedback')}
            placeholder="Provide constructive feedback on the submission. What did they do well? What could be improved?"
            rows={8}
            className="mt-2"
          />
          {errors.feedback && (
            <p className="text-sm text-red-600 mt-1">{errors.feedback.message}</p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-300 mt-2">
            This feedback will be visible to the submitter
          </p>
        </CardContent>
      </Card>

      {/* Review Summary */}
      <Card className={cn('border-2', selectedStatus?.bgColor)}>
        <CardContent className="pt-6">
          <h3 className="text-base font-semibold mb-3">Review Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Status:</span>
              <span className={cn('font-semibold', selectedStatus?.color)}>
                {selectedStatus?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Score:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {scoreValue > 0 ? `${scoreValue}/100` : 'Not scored'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Feedback:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {watch('feedback') ? 'Provided' : 'None'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Button type="submit" size="lg" disabled={isLoading} className="min-w-[200px]">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting Review...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Submit Review
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
