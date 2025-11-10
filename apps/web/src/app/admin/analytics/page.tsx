'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { KPICard, ExportButton, TimeRangeSelector } from '@/components/analytics';
import {
  chartColors,
  multiSeriesColors,
  lineChartConfig,
  barChartConfig,
  TimeRange,
} from '@/lib/analytics';

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalHackathons: number;
  activeHackathons: number;
  totalChallenges: number;
  activeChallenges: number;
  totalSubmissions: number;
  totalTeams: number;
  averageTeamSize: number;
  topDepartments: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
}

interface GrowthMetrics {
  period: string;
  dataPoints: Array<{
    date: string;
    users: number;
    hackathons: number;
    challenges: number;
    submissions: number;
  }>;
  trends: {
    userGrowth: number;
    hackathonGrowth: number;
    challengeGrowth: number;
    submissionGrowth: number;
  };
}

interface EngagementMetrics {
  activeUsersToday: number;
  activeUsersThisWeek: number;
  activeUsersThisMonth: number;
  submissionsPerHackathon: number;
  participationRate: number;
  repeatParticipants: number;
  activityByDay: Array<{ day: string; activities: number }>;
  activityByHour: Array<{ hour: number; activities: number }>;
}

export default function PlatformAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [platformRes, growthRes, engagementRes] = await Promise.all([
        fetch('/api/analytics/platform'),
        fetch(`/api/analytics/growth?timeRange=${timeRange}`),
        fetch('/api/analytics/engagement'),
      ]);

      const [platform, growth, engagement] = await Promise.all([
        platformRes.json(),
        growthRes.json(),
        engagementRes.json(),
      ]);

      setPlatformStats(platform);
      setGrowthMetrics(growth);
      setEngagementMetrics(engagement);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Platform Analytics</h1>
            <p className="mt-2 text-slate-400">
              Comprehensive insights into platform performance
            </p>
          </div>
          {platformStats && (
            <ExportButton
              data={[platformStats]}
              filename="platform-analytics"
              title="Platform Analytics Report"
              columns={[
                { header: 'Total Users', dataKey: 'totalUsers' },
                { header: 'Active Users', dataKey: 'activeUsers' },
                { header: 'Total Hackathons', dataKey: 'totalHackathons' },
                { header: 'Active Hackathons', dataKey: 'activeHackathons' },
                { header: 'Total Challenges', dataKey: 'totalChallenges' },
                { header: 'Total Submissions', dataKey: 'totalSubmissions' },
              ]}
            />
          )}
        </div>

        {/* Time Range Selector */}
        <div className="mb-8">
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Users"
            value={platformStats?.totalUsers || 0}
            trend={growthMetrics?.trends.userGrowth}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            loading={loading}
          />
          <KPICard
            title="Active Hackathons"
            value={platformStats?.activeHackathons || 0}
            trend={growthMetrics?.trends.hackathonGrowth}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
            loading={loading}
          />
          <KPICard
            title="Total Challenges"
            value={platformStats?.totalChallenges || 0}
            trend={growthMetrics?.trends.challengeGrowth}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            loading={loading}
          />
          <KPICard
            title="Total Submissions"
            value={platformStats?.totalSubmissions || 0}
            trend={growthMetrics?.trends.submissionGrowth}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            }
            loading={loading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Growth Trends */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold text-white">Growth Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={growthMetrics?.dataPoints || []}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...lineChartConfig.grid} />
                <XAxis dataKey="date" {...lineChartConfig.axisStyle} {...lineChartConfig.labelStyle} />
                <YAxis {...lineChartConfig.axisStyle} {...lineChartConfig.labelStyle} />
                <Tooltip {...lineChartConfig.tooltip} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke={chartColors.primary}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  name="Users"
                />
                <Area
                  type="monotone"
                  dataKey="submissions"
                  stroke={chartColors.secondary}
                  fillOpacity={1}
                  fill="url(#colorSubmissions)"
                  name="Submissions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Activity by Day */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold text-white">Activity by Day of Week</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementMetrics?.activityByDay || []}>
                <CartesianGrid {...barChartConfig.grid} />
                <XAxis dataKey="day" {...barChartConfig.axisStyle} {...barChartConfig.labelStyle} />
                <YAxis {...barChartConfig.axisStyle} {...barChartConfig.labelStyle} />
                <Tooltip {...barChartConfig.tooltip} />
                <Bar dataKey="activities" fill={chartColors.primary} radius={barChartConfig.radius} name="Activities" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Distribution */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold text-white">Department Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformStats?.topDepartments || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ department, percentage }) => `${department}: ${percentage.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {platformStats?.topDepartments.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={multiSeriesColors[index % multiSeriesColors.length]} />
                  ))}
                </Pie>
                <Tooltip {...lineChartConfig.tooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Activity by Hour */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold text-white">Activity by Hour</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementMetrics?.activityByHour || []}>
                <CartesianGrid {...lineChartConfig.grid} />
                <XAxis dataKey="hour" {...lineChartConfig.axisStyle} {...lineChartConfig.labelStyle} />
                <YAxis {...lineChartConfig.axisStyle} {...lineChartConfig.labelStyle} />
                <Tooltip {...lineChartConfig.tooltip} />
                <Line
                  type="monotone"
                  dataKey="activities"
                  stroke={chartColors.secondary}
                  strokeWidth={lineChartConfig.strokeWidth}
                  dot={lineChartConfig.dot}
                  activeDot={lineChartConfig.activeDot}
                  name="Activities"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <KPICard
            title="Active Users (Today)"
            value={engagementMetrics?.activeUsersToday || 0}
            loading={loading}
          />
          <KPICard
            title="Participation Rate"
            value={engagementMetrics?.participationRate || 0}
            format="percentage"
            loading={loading}
          />
          <KPICard
            title="Avg Submissions/Hackathon"
            value={engagementMetrics?.submissionsPerHackathon || 0}
            format="none"
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
