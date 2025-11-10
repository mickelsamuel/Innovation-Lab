'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { KPICard, ExportButton } from '@/components/analytics';
import {
  chartColors,
  multiSeriesColors,
  lineChartConfig,
  barChartConfig,
} from '@/lib/analytics';

interface HackathonAnalytics {
  hackathonId: string;
  hackathonName: string;
  status: string;
  totalRegistrations: number;
  totalTeams: number;
  totalSubmissions: number;
  completionRate: number;
  averageTeamSize: number;
  registrationFunnel: {
    registered: number;
    formedTeam: number;
    submitted: number;
    judged: number;
  };
  submissionTimeline: Array<{
    date: string;
    count: number;
  }>;
  departmentDistribution: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
  scoreDistribution: Array<{
    range: string;
    count: number;
  }>;
  judgeProgress: {
    totalJudges: number;
    activeJudges: number;
    submissionsJudged: number;
    submissionsPending: number;
    averageJudgingTime: number;
  };
  topTeams: Array<{
    teamId: string;
    teamName: string;
    score: number;
    members: number;
  }>;
}

export default function HackathonAnalyticsPage() {
  const params = useParams();
  const hackathonId = params.id as string;
  const [analytics, setAnalytics] = useState<HackathonAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [hackathonId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/hackathons/${hackathonId}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch hackathon analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform funnel data for visualization
  const funnelData = analytics
    ? [
        { name: 'Registered', value: analytics.registrationFunnel.registered, fill: multiSeriesColors[0] },
        { name: 'Formed Team', value: analytics.registrationFunnel.formedTeam, fill: multiSeriesColors[1] },
        { name: 'Submitted', value: analytics.registrationFunnel.submitted, fill: multiSeriesColors[2] },
        { name: 'Judged', value: analytics.registrationFunnel.judged, fill: multiSeriesColors[3] },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              {analytics?.hackathonName || 'Hackathon Analytics'}
            </h1>
            <p className="mt-2 text-slate-400">
              Detailed performance metrics and insights
            </p>
          </div>
          {analytics && (
            <ExportButton
              data={analytics.topTeams}
              filename={`hackathon-${hackathonId}-analytics`}
              title={`${analytics.hackathonName} Analytics`}
              columns={[
                { header: 'Team Name', dataKey: 'teamName' },
                { header: 'Score', dataKey: 'score' },
                { header: 'Members', dataKey: 'members' },
              ]}
            />
          )}
        </div>

        {/* Status Badge */}
        {analytics && (
          <div className="mb-6">
            <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${
              analytics.status === 'LIVE'
                ? 'bg-green-500/10 text-green-400'
                : analytics.status === 'JUDGING'
                ? 'bg-yellow-500/10 text-yellow-400'
                : 'bg-slate-500/10 text-slate-400'
            }`}>
              {analytics.status}
            </span>
          </div>
        )}

        {/* KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Registrations"
            value={analytics?.totalRegistrations || 0}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            loading={loading}
          />
          <KPICard
            title="Teams Formed"
            value={analytics?.totalTeams || 0}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            loading={loading}
          />
          <KPICard
            title="Submissions"
            value={analytics?.totalSubmissions || 0}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            }
            loading={loading}
          />
          <KPICard
            title="Completion Rate"
            value={analytics?.completionRate || 0}
            format="percentage"
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            loading={loading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Registration Funnel */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold text-white">Registration Funnel</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid {...barChartConfig.grid} />
                <XAxis type="number" {...barChartConfig.axisStyle} {...barChartConfig.labelStyle} />
                <YAxis type="category" dataKey="name" {...barChartConfig.axisStyle} {...barChartConfig.labelStyle} />
                <Tooltip {...barChartConfig.tooltip} />
                <Bar dataKey="value" radius={[0, 8, 8, 0] as [number, number, number, number]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Submission Timeline */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold text-white">Submission Timeline</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.submissionTimeline || []}>
                <CartesianGrid {...lineChartConfig.grid} />
                <XAxis dataKey="date" {...lineChartConfig.axisStyle} {...lineChartConfig.labelStyle} />
                <YAxis {...lineChartConfig.axisStyle} {...lineChartConfig.labelStyle} />
                <Tooltip {...lineChartConfig.tooltip} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={chartColors.primary}
                  strokeWidth={lineChartConfig.strokeWidth}
                  dot={lineChartConfig.dot}
                  activeDot={lineChartConfig.activeDot}
                  name="Submissions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Department Distribution */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold text-white">Department Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.departmentDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => {
                    const { department, percentage } = props.payload as { department: string; percentage: number };
                    return `${department}: ${percentage.toFixed(1)}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics?.departmentDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={multiSeriesColors[index % multiSeriesColors.length]} />
                  ))}
                </Pie>
                <Tooltip {...lineChartConfig.tooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Score Distribution */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-bold text-white">Score Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.scoreDistribution || []}>
                <CartesianGrid {...barChartConfig.grid} />
                <XAxis dataKey="range" {...barChartConfig.axisStyle} {...barChartConfig.labelStyle} />
                <YAxis {...barChartConfig.axisStyle} {...barChartConfig.labelStyle} />
                <Tooltip {...barChartConfig.tooltip} />
                <Bar dataKey="count" fill={chartColors.secondary} radius={barChartConfig.radius} name="Teams" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Judge Progress */}
        <div className="mt-8 rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-bold text-white">Judge Progress</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <KPICard
              title="Total Judges"
              value={analytics?.judgeProgress.totalJudges || 0}
              loading={loading}
            />
            <KPICard
              title="Active Judges"
              value={analytics?.judgeProgress.activeJudges || 0}
              loading={loading}
            />
            <KPICard
              title="Submissions Judged"
              value={analytics?.judgeProgress.submissionsJudged || 0}
              loading={loading}
            />
            <KPICard
              title="Pending Reviews"
              value={analytics?.judgeProgress.submissionsPending || 0}
              loading={loading}
            />
          </div>
        </div>

        {/* Top Teams */}
        <div className="mt-8 rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
          <h2 className="mb-6 text-xl font-bold text-white">Top Performing Teams</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="pb-3 text-left text-sm font-medium text-slate-400">Rank</th>
                  <th className="pb-3 text-left text-sm font-medium text-slate-400">Team Name</th>
                  <th className="pb-3 text-left text-sm font-medium text-slate-400">Score</th>
                  <th className="pb-3 text-left text-sm font-medium text-slate-400">Members</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.topTeams.map((team, index) => (
                  <tr key={team.teamId} className="border-b border-slate-700/50">
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
                    <td className="py-4 font-medium text-white">{team.teamName}</td>
                    <td className="py-4 text-purple-400">{team.score.toFixed(2)}</td>
                    <td className="py-4 text-slate-300">{team.members}</td>
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
