'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { getHackathons, deleteHackathon } from '@/lib/hackathons';
import { getAuthToken } from '@/lib/api';
import type { Hackathon, HackathonStatus, HackathonLocation } from '@/types/hackathon';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Users,
  FileText,
  Gavel,
  MapPin,
  Calendar,
  Loader2,
  Settings,
} from 'lucide-react';

export default function HackathonsAdminPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<HackathonStatus | ''>('');
  const [locationFilter, setLocationFilter] = useState<HackathonLocation | ''>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchHackathons();
  }, [statusFilter, locationFilter]);

  async function fetchHackathons() {
    try {
      setIsLoading(true);
      const filters: Record<string, unknown> = {};
      if (statusFilter) filters.status = statusFilter;
      if (locationFilter) filters.location = locationFilter;

      const response = await getHackathons(filters);
      setHackathons(response.data);
    } catch (error) {
      console.error('Error fetching hackathons:', error);
      addToast({
        type: 'error',
        title: 'Failed to load hackathons',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const token = getAuthToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      await deleteHackathon(id, token);
      addToast({
        type: 'success',
        title: 'Hackathon deleted',
        description: 'The hackathon has been successfully deleted.',
      });
      fetchHackathons();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting hackathon:', error);
      addToast({
        type: 'error',
        title: 'Failed to delete hackathon',
        description: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const filteredHackathons = hackathons.filter(
    hackathon =>
      hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hackathon.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function getStatusBadgeColor(status: HackathonStatus) {
    switch (status) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700';
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-700';
      case 'LIVE':
        return 'bg-green-100 text-green-700';
      case 'JUDGING':
        return 'bg-yellow-100 text-yellow-700';
      case 'CLOSED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                Hackathon Management
              </h1>
              <p className="text-lg text-white/90">
                Create and manage hackathons for the Innovation Lab
              </p>
            </div>
            <Link href="/admin/hackathons/create">
              <Button className="btn-game">
                <Plus className="w-4 h-4 mr-2" />
                Create Hackathon
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="game-card mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <Input
                  placeholder="Search hackathons..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as HackathonStatus | '')}
                className="h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-card px-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="LIVE">Live</option>
                <option value="JUDGING">Judging</option>
                <option value="CLOSED">Closed</option>
              </select>

              {/* Location Filter */}
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value as HackathonLocation | '')}
                className="h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-card px-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <option value="">All Locations</option>
                <option value="VIRTUAL">Virtual</option>
                <option value="ONSITE">Onsite</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-slate-600 dark:text-slate-300">Loading hackathons...</p>
          </div>
        )}

        {/* Hackathons List */}
        {!isLoading && filteredHackathons.length === 0 && (
          <Card className="game-card">
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-display font-bold mb-2">No hackathons found</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                {searchQuery || statusFilter || locationFilter
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first hackathon'}
              </p>
              {!searchQuery && !statusFilter && !locationFilter && (
                <Link href="/admin/hackathons/create">
                  <Button className="btn-game">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Hackathon
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {!isLoading && filteredHackathons.length > 0 && (
          <div className="space-y-4">
            {filteredHackathons.map(hackathon => (
              <Card key={hackathon.id} className="game-card hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
                              {hackathon.title}
                            </h3>
                            <Badge className={getStatusBadgeColor(hackathon.status)}>
                              {hackathon.status}
                            </Badge>
                            {!hackathon.isPublished && (
                              <Badge className="bg-orange-100 text-orange-700">Unpublished</Badge>
                            )}
                          </div>
                          {hackathon.subtitle && (
                            <p className="text-slate-600 dark:text-slate-300 mb-2">{hackathon.subtitle}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(hackathon.startsAt)} - {formatDate(hackathon.endsAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span className="capitalize">{hackathon.location.toLowerCase()}</span>
                          {hackathon.city && ` - ${hackathon.city}`}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">
                            {hackathon._count?.teams || 0} Teams
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">
                            {hackathon._count?.submissions || 0} Submissions
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gavel className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">
                            {hackathon._count?.judges || 0} Judges
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 lg:w-48">
                      <Link href={`/admin/hackathons/${hackathon.id}/manage`} className="flex-1">
                        <Button variant="default" className="w-full btn-game">
                          <Settings className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </Link>
                      <Link href={`/hackathons/${hackathon.slug}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/admin/hackathons/${hackathon.id}/edit`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      {deleteConfirm === hackathon.id ? (
                        <div className="flex-1 flex gap-1">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(hackathon.id)}
                            className="flex-1"
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full text-red-600 hover:text-red-700 hover:border-red-300"
                          onClick={() => setDeleteConfirm(hackathon.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
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
