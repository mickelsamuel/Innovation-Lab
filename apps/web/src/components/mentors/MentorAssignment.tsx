'use client';

import { useState } from 'react';
import { Search, UserPlus, Trash2, Users as UsersIcon, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { assignMentor, removeMentor } from '@/lib/mentors';
import { getAuthToken } from '@/lib/api';
import type { Mentor } from '@/lib/mentors';

interface User {
  id: string;
  name: string | null;
  email: string;
  handle: string | null;
  avatarUrl: string | null;
  roles: string[];
}

interface MentorAssignmentProps {
  hackathonId: string;
  mentors: Mentor[];
  onUpdate: () => void;
}

export function MentorAssignment({ hackathonId, mentors, onUpdate }: MentorAssignmentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [bio, setBio] = useState('');
  const [calendlyUrl, setCalendlyUrl] = useState('');
  const [expertise, setExpertise] = useState('');
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1'}/users/search?q=${encodeURIComponent(searchQuery)}&role=MENTOR`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Search failed');

      const users = await response.json();
      const assignedUserIds = new Set(mentors.map(m => m.userId));
      const filteredUsers = users.filter((u: User) => !assignedUserIds.has(u.id));

      setSearchResults(filteredUsers);

      if (filteredUsers.length === 0) {
        toast({
          title: 'No results',
          description: 'No unassigned mentors found matching your search',
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

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setShowAssignForm(true);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAssign = async () => {
    if (!selectedUser) return;

    setIsLoading(selectedUser.id);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      await assignMentor(
        hackathonId,
        {
          userId: selectedUser.id,
          bio: bio.trim() || undefined,
          calendlyUrl: calendlyUrl.trim() || undefined,
          expertise: expertise.trim() ? expertise.split(',').map(s => s.trim()) : undefined,
        },
        token
      );

      toast({
        title: 'Success',
        description: 'Mentor assigned successfully',
      });

      setShowAssignForm(false);
      setSelectedUser(null);
      setBio('');
      setCalendlyUrl('');
      setExpertise('');
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign mentor',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleRemove = async (userId: string, hasUpcomingSessions: boolean) => {
    if (hasUpcomingSessions) {
      toast({
        title: 'Cannot remove',
        description: 'Cannot remove mentor with upcoming sessions',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Are you sure you want to remove this mentor?')) {
      return;
    }

    setIsLoading(userId);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      await removeMentor(hackathonId, userId, token);

      toast({
        title: 'Success',
        description: 'Mentor removed successfully',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove mentor',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      {!showAssignForm && (
        <Card className="p-6 bg-slate-900/50 border-cyan-500/20">
          <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Assign Mentor
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
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">{user.name || 'Unnamed User'}</p>
                      <p className="text-sm text-slate-400">
                        {user.handle ? `@${user.handle}` : user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSelectUser(user)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Assignment Form */}
      {showAssignForm && selectedUser && (
        <Card className="p-6 bg-slate-900/50 border-cyan-500/20">
          <h3 className="text-lg font-bold text-cyan-400 mb-4">Assign Mentor Details</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
              <Avatar className="w-10 h-10">
                {selectedUser.avatarUrl ? (
                  <img src={selectedUser.avatarUrl} alt={selectedUser.name || 'User'} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {(selectedUser.name || selectedUser.email)[0].toUpperCase()}
                  </div>
                )}
              </Avatar>
              <div>
                <p className="font-medium text-white">{selectedUser.name}</p>
                <p className="text-sm text-slate-400">{selectedUser.email}</p>
              </div>
            </div>

            <div>
              <Label htmlFor="bio" className="text-slate-300">
                Bio (Optional)
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Mentor bio and background..."
                className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="calendlyUrl" className="text-slate-300">
                Calendly URL (Optional)
              </Label>
              <Input
                id="calendlyUrl"
                type="url"
                value={calendlyUrl}
                onChange={(e) => setCalendlyUrl(e.target.value)}
                placeholder="https://calendly.com/username"
                className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="expertise" className="text-slate-300">
                Expertise (Optional, comma-separated)
              </Label>
              <Input
                id="expertise"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                placeholder="React, Node.js, AWS"
                className="mt-1.5 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAssign}
                disabled={!!isLoading}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              >
                {isLoading ? 'Assigning...' : 'Assign Mentor'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignForm(false);
                  setSelectedUser(null);
                  setBio('');
                  setCalendlyUrl('');
                  setExpertise('');
                }}
                className="border-slate-700 hover:bg-slate-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Current Mentors */}
      <Card className="p-6 bg-slate-900/50 border-cyan-500/20">
        <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <UsersIcon className="w-5 h-5" />
          Assigned Mentors ({mentors.length})
        </h3>

        {mentors.length === 0 ? (
          <p className="text-slate-400 text-center py-8">
            No mentors assigned yet. Search and assign mentors above.
          </p>
        ) : (
          <div className="space-y-2">
            {mentors.map((mentor) => {
              const upcomingSessions = mentor.sessions?.filter(
                s => new Date(s.startsAt) > new Date()
              ).length || 0;
              const hasUpcomingSessions = upcomingSessions > 0;

              return (
                <div
                  key={mentor.id}
                  className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-10 h-10">
                      {mentor.user.avatarUrl ? (
                        <img src={mentor.user.avatarUrl} alt={mentor.user.name || 'Mentor'} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {(mentor.user.name || mentor.user.email)[0].toUpperCase()}
                        </div>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-white">{mentor.user.name || 'Unnamed Mentor'}</p>
                      <p className="text-sm text-slate-400">
                        {mentor.user.handle ? `@${mentor.user.handle}` : mentor.user.email}
                      </p>
                      {hasUpcomingSessions && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-green-400">
                          <Calendar className="w-3 h-3" />
                          {upcomingSessions} upcoming session{upcomingSessions !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemove(mentor.userId, hasUpcomingSessions)}
                    disabled={isLoading === mentor.userId || hasUpcomingSessions}
                    title={hasUpcomingSessions ? 'Cannot remove mentor with upcoming sessions' : 'Remove mentor'}
                  >
                    {isLoading === mentor.userId ? 'Removing...' : <><Trash2 className="w-4 h-4 mr-1" />Remove</>}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
