'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel, Trophy, Users, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getAuthToken, apiFetch } from '@/lib/api';

interface JudgingStats {
  totalJudges: number;
  activeAssignments: number;
  completedReviews: number;
}

export default function AdminJudgingPage() {
  const [stats, setStats] = useState<JudgingStats>({ totalJudges: 0, activeAssignments: 0, completedReviews: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJudgingStats();
  }, []);

  async function fetchJudgingStats() {
    try {
      const token = getAuthToken();
      if (!token) return;

      const data = await apiFetch<JudgingStats>('/judging/stats', { token });
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch judging stats:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Judging Management</h1>
        <p className="text-gray-400">Manage judges and judging assignments for hackathons</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0f1115] border-[#1e2129]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Judges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-white">{isLoading ? '...' : stats.totalJudges}</p>
              <Users className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1115] border-[#1e2129]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Active Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-white">{isLoading ? '...' : stats.activeAssignments}</p>
              <Gavel className="w-5 h-5 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1115] border-[#1e2129]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Completed Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-white">{isLoading ? '...' : stats.completedReviews}</p>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-[#0f1115] border-[#1e2129]">
        <CardHeader>
          <CardTitle className="text-white">Judging Overview</CardTitle>
          <CardDescription className="text-gray-400">
            Assign judges to hackathons and monitor judging progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Gavel className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Judging Management
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Manage judge assignments from individual hackathon pages. Navigate to a hackathon to assign judges and monitor judging progress.
            </p>
            <Link href="/admin/hackathons">
              <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                View Hackathons
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
