'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { KPICard, ExportButton } from '@/components/analytics';
import {
  chartColors,
  lineChartConfig,
  barChartConfig,
  areaChartConfig,
  formatDuration,
} from '@/lib/analytics';

interface ChallengeAnalytics {
  challengeId: string;
  challengeSlug: string;
  challengeName: string;
  category: string;
  difficulty: string;
  totalAttempts: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  averageScore: number;
  averageReviewTime: number;
  submissionTrend: Array<{
    date: string;
    submissions: number;
    accepted: number;
  }>;
  topPerformers: Array<{
    userId: string;
    userName: string;
    score: number;
    submittedAt: string;
  }>;
  difficultyPerception: {
    tooEasy: number;
    justRight: number;
    tooHard: number;
  };
  categoryPerformance: {
    category: string;
    averageScore: number;
    completionRate: number;
  };
}

export default function ChallengeAnalyticsPage() {
  const params = useParams();
  const challengeSlug = params.slug as string;
  const [analytics, setAnalytics] = useState<ChallengeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [challengeSlug]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // First get challenge by slug, then fetch analytics by ID
      const challengeRes = await fetch(`/api/challenges/${challengeSlug}`);
      const challenge = await challengeRes.json();

      const response = await fetch(`/api/analytics/challenges/${challenge.id}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch challenge analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const difficultyBadgeColor = {
    Easy: 'bg-green-500/10 text-green-400',
    Medium: 'bg-yellow-500/10 text-yellow-400',
    Hard: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              {analytics?.challengeName || 'Challenge Analytics'}
            </h1>
            <p className="mt-2 text-slate-400">
              Performance insights and submission metrics
            </p>
          </div>
          {analytics && (
            <ExportButton
              data={analytics.topPerformers}
              filename={`challenge-${challengeSlug}-analytics`}
              title={`${analytics.challengeName} Analytics`}
              columns={[
                { header: 'User Name', dataKey: 'userName' },
                { header: 'Score', dataKey: 'score' },
                { header: 'Submitted At', dataKey: 'submittedAt' },
              ]}
            />
          )}
        </div>

        {/* Category and Difficulty Badges */}
        {analytics && (
          <div className="mb-6 flex gap-3">
            <span className="inline-flex items-center rounded-full bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400">
              {analytics.category}
            </span>
            <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${
              difficultyBadgeColor[analytics.difficulty as keyof typeof difficultyBadgeColor] || 'bg-slate-500/10 text-slate-400'
            }`}>
              {analytics.difficulty}
            </span>
          </div>
        )}

        {/* KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Attempts"
            value={analytics?.totalAttempts || 0}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            loading={loading}
          />
          <KPICard
            title="Submissions"
            value={analytics?.totalSubmissions || 0}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            loading={loading}
          />
          <KPICard
            title="Acceptance Rate"
            value={analytics?.acceptanceRate || 0}
            format="percentage"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            loading={loading}
          />
          <KPICard
            title="Average Score"
            value={analytics?.averageScore || 0}
            format="none"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            }
            loading={loading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Submission Trend */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm lg:col-span-2">
            <h2 className="mb-4 text-xl font-bold text-white">Submission Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.submissionTrend || []}>
                <defs>
                  <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chartColors.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...areaChartConfig.grid} />
                <XAxis dataKey="date" {...areaChartConfig.axisStyle} {...areaChartConfig.labelStyle} />
                <YAxis {...areaChartConfig.axisStyle} {...areaChartConfig.labelStyle} />
                <Tooltip {...areaChartConfig.tooltip} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  stroke={chartColors.primary}
                  fillOpacity={1}
                  fill="url(#colorSubmissions)"
                  name="Total Submissions"
                />
                <Area
                  type="monotone"
                  dataKey="accepted"
                  stroke={chartColors.success}
                  fillOpacity={1}
                  fill="url(#colorAccepted)"
                  name="Accepted"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Metrics */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold text-white">Performance Metrics</h2>
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-400">Acceptance Rate</span>
                  <span className="font-medium text-white">
                    {analytics?.acceptanceRate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                    style={{ width: `${analytics?.acceptanceRate || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-400">Average Score</span>
                  <span className="font-medium text-white">
                    {analytics?.averageScore.toFixed(1)} / 100
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{ width: `${analytics?.averageScore || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-400">Completion Rate</span>
                  <span className="font-medium text-white">
                    {analytics?.categoryPerformance.completionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                    style={{
                      width: `${analytics?.categoryPerformance.completionRate || 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="pt-4">
                <div className="text-sm text-slate-400">Average Review Time</div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {analytics?.averageReviewTime
                    ? formatDuration(analytics.averageReviewTime)
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Submission Status */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold text-white">Submission Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-slate-700/50 p-4">
                <div>
                  <div className="text-sm text-slate-400">Total Attempts</div>
                  <div className="text-2xl font-bold text-white">
                    {analytics?.totalAttempts || 0}
                  </div>
                </div>
                <svg className="h-10 w-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-700/50 p-4">
                <div>
                  <div className="text-sm text-slate-400">Accepted</div>
                  <div className="text-2xl font-bold text-green-400">
                    {analytics?.acceptedSubmissions || 0}
                  </div>
                </div>
                <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-700/50 p-4">
                <div>
                  <div className="text-sm text-slate-400">Rejected</div>
                  <div className="text-2xl font-bold text-red-400">
                    {(analytics?.totalSubmissions || 0) - (analytics?.acceptedSubmissions || 0)}
                  </div>
                </div>
                <svg className="h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="mt-8 rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-bold text-white">Top Performers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="pb-3 text-left text-sm font-medium text-slate-400">Rank</th>
                  <th className="pb-3 text-left text-sm font-medium text-slate-400">User</th>
                  <th className="pb-3 text-left text-sm font-medium text-slate-400">Score</th>
                  <th className="pb-3 text-left text-sm font-medium text-slate-400">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.topPerformers.map((performer, index) => (
                  <tr key={performer.userId} className="border-b border-slate-700/50">
                    <td className="py-4 text-slate-300">
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                        index === 0
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : index === 1
                          ? 'bg-slate-400/20 text-slate-300'
                          : index === 2
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-4 font-medium text-white">{performer.userName}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center rounded-full bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-400">
                        {performer.score.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">
                      {new Date(performer.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
