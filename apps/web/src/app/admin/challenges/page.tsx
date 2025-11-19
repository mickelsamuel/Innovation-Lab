'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken } from '@/lib/api';
import { getChallenges } from '@/lib/challenges';
import type { Challenge } from '@/types/challenge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Target,
  Users,
  CheckCircle2,
  Trophy,
  Edit,
  Eye,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { formatDeadline, getStatusVariant } from '@/lib/challenges';

export default function ChallengeManagementPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push('/auth/login');
          return;
        }

        // Decode token to get user ID
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Fetch user's challenges
        const data = await getChallenges({ ownerId: payload.id });
        setChallenges(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err instanceof Error
              ? err.message
              : String(err)
            : 'Failed to load challenges'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg text-slate-700">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  // Calculate stats
  const totalSubmissions = challenges.reduce((sum, c) => sum + (c._count?.submissions || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Challenge Management
          </h1>
          <p className="text-slate-400 mt-2">Create and manage your challenges</p>
        </div>
        <Link href="/admin/challenges/create">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Create Challenge
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-50/50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Challenges</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{challenges.length}</p>
              </div>
              <Target className="w-10 h-10 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-50/50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Submissions</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{totalSubmissions}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-50/50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Open Challenges</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {challenges.filter(c => c.status === 'OPEN').length}
                </p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-50/50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Draft Challenges</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {challenges.filter(c => c.status === 'DRAFT').length}
                </p>
              </div>
              <Trophy className="w-10 h-10 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Challenges List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Your Challenges</h2>

        {challenges.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-12 pb-12 text-center">
              <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No challenges yet</h3>
              <p className="text-slate-400 mb-6">Create your first challenge to get started</p>
              <Link href="/admin/challenges/create">
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Create Your First Challenge
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {challenges.map(challenge => (
              <Card
                key={challenge.id}
                className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-3">
                        <Target className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {challenge.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant={getStatusVariant(challenge.status)}>
                              {challenge.status}
                            </Badge>
                            <Badge variant="secondary">{challenge.visibility}</Badge>
                            {challenge.rewardType && (
                              <Badge className="bg-primary/20 text-primary border-primary/30">
                                {challenge.rewardType}
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-300 text-sm line-clamp-2 mb-3">
                            {challenge.problemStatement}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{challenge._count?.submissions || 0} submissions</span>
                            </div>
                            {challenge.deadlineAt && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDeadline(challenge.deadlineAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link href={`/challenges/${challenge.slug}`}>
                        <Button variant="outline" size="sm" className="gap-2 w-full">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/admin/challenges/${challenge.slug}/edit`}>
                        <Button variant="outline" size="sm" className="gap-2 w-full">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </Link>
                      {(challenge._count?.submissions || 0) > 0 && (
                        <Link href={`/challenges/${challenge.slug}`}>
                          <Button size="sm" className="gap-2 w-full">
                            <Users className="w-4 h-4" />
                            Review ({challenge._count?.submissions})
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
