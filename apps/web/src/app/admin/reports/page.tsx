'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Flag, CheckCircle, XCircle, User, FileText, MessageSquare } from 'lucide-react';
import { getAuthToken, apiFetch } from '@/lib/api';

interface ReportStats {
  pending: number;
  investigating: number;
  resolved: number;
  dismissed: number;
}

interface Report {
  id: string;
  entityType: string;
  entityId: string;
  reason: string;
  status: string;
  resolution?: string;
  createdAt: string;
  reporter: {
    id: string;
    name: string;
    handle: string;
    email: string;
    avatarUrl?: string;
  };
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<ReportStats>({ pending: 0, investigating: 0, resolved: 0, dismissed: 0 });
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedStatus]);

  async function fetchData() {
    try {
      const token = getAuthToken();
      if (!token) return;

      const [statsData, reportsData] = await Promise.all([
        apiFetch<ReportStats>('/moderation/stats', { token }),
        apiFetch<Report[]>(`/moderation/reports${selectedStatus ? `?status=${selectedStatus}` : ''}`, { token }),
      ]);

      setStats(statsData);
      setReports(reportsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'OPEN':
        return <Badge variant="default" className="bg-orange-500/10 text-orange-500 border-orange-500/20">Pending</Badge>;
      case 'INVESTIGATING':
        return <Badge variant="default" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Under Review</Badge>;
      case 'RESOLVED':
        return <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">Resolved</Badge>;
      case 'DISMISSED':
        return <Badge variant="default" className="bg-gray-500/10 text-gray-500 border-gray-500/20">Dismissed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  function getEntityIcon(entityType: string) {
    switch (entityType) {
      case 'USER':
        return <User className="w-4 h-4" />;
      case 'SUBMISSION':
        return <FileText className="w-4 h-4" />;
      case 'COMMENT':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Flag className="w-4 h-4" />;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Content Reports</h1>
        <p className="text-gray-400">Review and moderate flagged content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#0f1115] border-[#1e2129]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-white">{isLoading ? '...' : stats.pending}</p>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1115] border-[#1e2129]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-white">{isLoading ? '...' : stats.investigating}</p>
              <Shield className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1115] border-[#1e2129]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-white">{isLoading ? '...' : stats.resolved}</p>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1115] border-[#1e2129]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Dismissed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-white">{isLoading ? '...' : stats.dismissed}</p>
              <XCircle className="w-5 h-5 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card className="bg-[#0f1115] border-[#1e2129]">
        <CardHeader>
          <CardTitle className="text-white">Reported Content</CardTitle>
          <CardDescription className="text-gray-400">
            Review and take action on reported submissions, comments, and users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Reports</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                There are currently no content reports to review. Reported content will appear here for moderation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-lg bg-[#1a1d24] border border-[#1e2129] hover:border-[#2a2d35] transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-800/50">
                        {getEntityIcon(report.entityType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">
                            {report.entityType}
                          </span>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-xs text-gray-500">
                          Reported by {report.reporter.name} (@{report.reporter.handle})
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-1">Reason:</p>
                      <p className="text-sm text-white">{report.reason}</p>
                    </div>

                    {report.resolution && (
                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-1">Resolution:</p>
                        <p className="text-sm text-white">{report.resolution}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800">
                      View Details
                    </Button>
                    {report.status === 'OPEN' && (
                      <>
                        <Button size="sm" variant="outline" className="bg-transparent border-blue-500/20 text-blue-500 hover:bg-blue-500/10">
                          Investigate
                        </Button>
                        <Button size="sm" variant="outline" className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800">
                          Dismiss
                        </Button>
                      </>
                    )}
                    {report.status === 'INVESTIGATING' && (
                      <>
                        <Button size="sm" variant="outline" className="bg-transparent border-green-500/20 text-green-500 hover:bg-green-500/10">
                          Resolve
                        </Button>
                        <Button size="sm" variant="outline" className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800">
                          Dismiss
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
