'use client';

import { useState } from 'react';
import { Search, UserPlus, Trash2, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { assignJudge, removeJudge } from '@/lib/judging';
import { getAuthToken } from '@/lib/api';

interface User {
  id: string;
  name: string | null;
  email: string;
  handle: string | null;
  avatarUrl: string | null;
  roles: string[];
}

interface Judge {
  id: string;
  userId: string;
  user: User;
  _count?: {
    scores: number;
  };
}

interface JudgeAssignmentProps {
  hackathonId: string;
  judges: Judge[];
  onUpdate: () => void;
}

export function JudgeAssignment({ hackathonId, judges, onUpdate }: JudgeAssignmentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a search query',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      // Search for users with JUDGE role
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1'}/users/search?q=${encodeURIComponent(searchQuery)}&role=JUDGE`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Search failed');

      const users = await response.json();

      // Filter out already assigned judges
      const assignedUserIds = new Set(judges.map(j => j.userId));
      const filteredUsers = users.filter((u: User) => !assignedUserIds.has(u.id));

      setSearchResults(filteredUsers);

      if (filteredUsers.length === 0) {
        toast({
          title: 'No results',
          description: 'No unassigned judges found matching your search',
        });
      }
    } catch (error) {
      toast({
        title: 'Search failed',
        description: error instanceof Error ? error.message : 'Failed to search users',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssign = async (userId: string) => {
    setIsLoading(userId);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      await assignJudge(hackathonId, userId, token);

      toast({
        title: 'Success',
        description: 'Judge assigned successfully',
      });

      setSearchResults(prev => prev.filter(u => u.id !== userId));
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign judge',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleRemove = async (userId: string, hasScores: boolean) => {
    if (hasScores) {
      toast({
        title: 'Cannot remove',
        description: 'Cannot remove a judge who has already scored submissions',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Are you sure you want to remove this judge?')) {
      return;
    }

    setIsLoading(userId);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      await removeJudge(hackathonId, userId, token);

      toast({
        title: 'Success',
        description: 'Judge removed successfully',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove judge',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="p-6 bg-slate-900/50 border-cyan-500/20">
        <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Assign Judge
        </h3>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-slate-400">{searchResults.length} user(s) found</p>
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name || 'User'} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">
                      {user.name || 'Unnamed User'}
                    </p>
                    <p className="text-sm text-slate-400">
                      {user.handle ? `@${user.handle}` : user.email}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2 border-purple-500/50 text-purple-400">
                    <Shield className="w-3 h-3 mr-1" />
                    JUDGE
                  </Badge>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAssign(user.id)}
                  disabled={isLoading === user.id}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading === user.id ? 'Assigning...' : 'Assign'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Current Judges */}
      <Card className="p-6 bg-slate-900/50 border-cyan-500/20">
        <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Assigned Judges ({judges.length})
        </h3>

        {judges.length === 0 ? (
          <p className="text-slate-400 text-center py-8">
            No judges assigned yet. Search and assign judges above.
          </p>
        ) : (
          <div className="space-y-2">
            {judges.map((judge) => {
              const hasScores = (judge._count?.scores ?? 0) > 0;
              return (
                <div
                  key={judge.id}
                  className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      {judge.user.avatarUrl ? (
                        <img src={judge.user.avatarUrl} alt={judge.user.name || 'User'} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {(judge.user.name || judge.user.email)[0].toUpperCase()}
                        </div>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">
                        {judge.user.name || 'Unnamed User'}
                      </p>
                      <p className="text-sm text-slate-400">
                        {judge.user.handle ? `@${judge.user.handle}` : judge.user.email}
                      </p>
                    </div>
                    {hasScores && (
                      <Badge variant="outline" className="ml-2 border-green-500/50 text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {judge._count?.scores} score{judge._count?.scores !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemove(judge.userId, hasScores)}
                    disabled={isLoading === judge.userId || hasScores}
                    title={hasScores ? 'Cannot remove judge with scores' : 'Remove judge'}
                  >
                    {isLoading === judge.userId ? (
                      'Removing...'
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Progress Indicator */}
      <Card className="p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-500/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300">Judging Progress</span>
          <span className="text-cyan-400 font-bold">{judges.length} Judge{judges.length !== 1 ? 's' : ''} Assigned</span>
        </div>
      </Card>
    </div>
  );
}
