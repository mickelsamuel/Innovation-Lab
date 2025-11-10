'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken } from '@/lib/api';
import { createChallenge } from '@/lib/challenges';
import { ChallengeForm } from '@/components/challenges/ChallengeForm';
import type { CreateChallengeFormData } from '@/lib/validations/challenge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Target, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function CreateChallengePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (data: CreateChallengeFormData) => {
    setIsLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        addToast({
          type: 'error',
          title: 'Error',
          description: 'Please login to create a challenge',
        });
        router.push('/auth/login');
        return;
      }

      // Create the challenge
      await createChallenge(data, token);

      addToast({
        type: 'success',
        title: 'Success!',
        description: 'Challenge created successfully',
      });

      // Redirect to the challenge page or management dashboard
      router.push(`/admin/challenges`);
    } catch (error) {
      console.error('Create challenge error:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create challenge',
      });
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-3xl font-bold text-white">Create New Challenge</h1>
            <p className="text-slate-400 mt-1">
              Define a coding challenge for the community to solve
            </p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Challenge Creation Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Write a clear and detailed problem statement</li>
              <li>• Specify requirements and expected deliverables</li>
              <li>• Add relevant categories and skills</li>
              <li>• Set a realistic deadline for submissions</li>
              <li>• Start with DRAFT status and publish when ready</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <ChallengeForm onSubmit={handleSubmit} submitLabel="Create Challenge" isLoading={isLoading} />
    </div>
  );
}
