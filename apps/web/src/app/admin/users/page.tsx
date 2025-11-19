'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAuthToken, apiFetch } from '@/lib/api';
import { Search, Users, UserCheck, UserX, Shield, Filter } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  handle: string;
  roles: string[];
  createdAt: string;
  _count?: {
    submissions: number;
    teams: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const token = getAuthToken();
      if (!token) return;

      const data = await apiFetch<User[]>('/users/search?limit=1000', { token });
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const roles = ['ALL', 'PARTICIPANT', 'BANK_ADMIN', 'ORGANIZER', 'JUDGE', 'MENTOR'];

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.handle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === 'ALL' || user.roles.includes(selectedRole);

    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">Manage platform users and their roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0f1115] border-[#1e2129]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <Users className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1115] border-[#1e2129]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <UserCheck className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1115] border-[#1e2129]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.roles.includes('BANK_ADMIN')).length}
              </p>
              <Shield className="w-5 h-5 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by name, email, or handle..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#0f1115] border-[#1e2129] text-white"
          />
        </div>

        <div className="flex gap-2">
          {roles.map(role => (
            <Badge
              key={role}
              variant={selectedRole === role ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2 hover:bg-primary hover:text-white transition-colors"
              onClick={() => setSelectedRole(role)}
            >
              {role}
            </Badge>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card className="bg-[#0f1115] border-[#1e2129]">
        <CardHeader>
          <CardTitle className="text-white">Users ({filteredUsers.length})</CardTitle>
          <CardDescription className="text-gray-400">
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg bg-[#1a1c23] hover:bg-[#1e2129] transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{user.name}</h3>
                    <span className="text-sm text-gray-400">@{user.handle}</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{user.email}</p>
                  <div className="flex items-center gap-2">
                    {user.roles.map(role => (
                      <Badge
                        key={role}
                        variant="outline"
                        className="text-xs border-primary/50 text-primary"
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-400 mb-2">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  {user._count && (
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{user._count.submissions} submissions</span>
                      <span>{user._count.teams} teams</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UserX className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
