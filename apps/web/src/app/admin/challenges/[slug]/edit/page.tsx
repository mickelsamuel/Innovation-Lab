'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken } from '@/lib/api';
import { getChallengeBySlug, updateChallenge } from '@/lib/challenges';
import { ChallengeForm } from '@/components/challenges/ChallengeForm';
import type { CreateChallengeFormData } from '@/lib/validations/challenge';
import type { Challenge } from '@/types/challenge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function EditChallengePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { addToast } = useToast();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const data = await getChallengeBySlug(slug);

        // Check if user owns this challenge
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (data.ownerId !== payload.id && !payload.roles?.includes('BANK_ADMIN')) {
          setError('You do not have permission to edit this challenge');
          return;
        }

        setChallenge(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err instanceof Error
              ? err.message
              : String(err)
            : 'Failed to load challenge'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenge();
  }, [slug, router]);

  const handleSubmit = async (data: CreateChallengeFormData) => {
    if (!challenge) return;

    setIsSaving(true);

    try {
      const token = getAuthToken();
      if (!token) {
        addToast({
          type: 'error',
          title: 'Error',
          description: 'Please login to update the challenge',
        });
        router.push('/auth/login');
        return;
      }

      // Update the challenge
      await updateChallenge(challenge.id, data, token);

      addToast({
        type: 'success',
        title: 'Success!',
        description: 'Challenge updated successfully',
      });

      // Redirect to the challenge management dashboard
      router.push('/admin/challenges');
    } catch (error) {
      console.error('Update challenge error:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description:
          error instanceof Error
            ? error instanceof Error
              ? error.message
              : String(error)
            : 'Failed to update challenge',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/challenges">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 text-slate-300">
            <ArrowLeft className="w-4 h-4" />
            Back to Challenges
          </Button>
        </Link>
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-lg text-slate-700">{error || 'Challenge not found'}</p>
          <Link href="/admin/challenges">
            <Button>Back to Challenges</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Format challenge data for the form
  const defaultValues: Partial<CreateChallengeFormData> = {
    title: challenge.title,
    slug: challenge.slug,
    problemStatement: challenge.problemStatement,
    ownerOrg: challenge.ownerOrg || '',
    rewardType: challenge.rewardType,
    rewardValue: challenge.rewardValue || '',
    categories: challenge.categories,
    skills: challenge.skills,
    status: challenge.status,
    visibility: challenge.visibility,
    deadlineAt: challenge.deadlineAt || '',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link href="/admin/challenges">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 text-slate-300">
            <ArrowLeft className="w-4 h-4" />
            Back to Challenges
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Challenge</h1>
            <p className="text-slate-400 mt-1">{challenge.title}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <ChallengeForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Update Challenge"
        isLoading={isSaving}
      />
    </div>
  );
}
