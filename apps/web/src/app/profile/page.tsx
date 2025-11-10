'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAuthToken, apiFetch, ApiError } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import {
  User,
  Mail,
  Building2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface UserData {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatarUrl: string | null;
  bio: string | null;
  organization: string | null;
  roles: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    bio: '',
    organization: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      const token = getAuthToken();

      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userData = await apiFetch<UserData>('/users/me', { token });
        setUser(userData);
        setFormData({
          name: userData.name,
          handle: userData.handle,
          bio: userData.bio || '',
          organization: userData.organization || '',
        });
      } catch (err) {
        console.error('Profile error:', err);
        if (err instanceof ApiError && err.status === 401) {
          localStorage.removeItem('auth_token');
          router.push('/auth/login');
        } else {
          setError('Failed to load profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const token = getAuthToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const updatedUser = await apiFetch<UserData>('/users/me', {
        method: 'PUT',
        token,
        body: JSON.stringify(formData),
      });

      setUser(updatedUser);
      setSuccess('Profile updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Update error:', err);
      if (err instanceof ApiError) {
        setError(err instanceof Error ? err.message : String(err) || 'Failed to update profile');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen hex-grid flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen hex-grid flex items-center justify-center">
        <div className="game-card p-8 max-w-md text-center">
          <p className="text-red-600 font-bold mb-4">Failed to load profile</p>
          <Button onClick={() => window.location.reload()} className="btn-game">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hex-grid">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-primary mb-4 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-display font-black gradient-text">Profile Settings</h1>
            <p className="text-slate-600 font-semibold mt-2">Manage your account information</p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm font-semibold text-green-900">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm font-semibold text-red-900">{error}</p>
            </div>
          )}

          <div className="grid gap-6">
            {/* Avatar Section */}
            <Card className="game-card">
              <CardHeader>
                <CardTitle className="font-display">Profile Picture</CardTitle>
                <CardDescription>Your avatar is generated from your initials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-primary">
                    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                    <AvatarFallback className="bg-primary text-white font-bold text-2xl">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-slate-600 font-semibold mb-2">
                      Custom avatar uploads coming soon!
                    </p>
                    <p className="text-xs text-slate-500">
                      Currently showing initials: {getInitials(user.name)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="game-card">
              <CardHeader>
                <CardTitle className="font-display">Account Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email (Read-only) */}
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-slate-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Email cannot be changed
                    </p>
                  </div>

                  {/* Name */}
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      required
                      disabled={saving}
                    />
                  </div>

                  {/* Handle */}
                  <div>
                    <Label htmlFor="handle" className="mb-2">
                      Username/Handle
                    </Label>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 font-medium">
                        @
                      </span>
                      <Input
                        id="handle"
                        type="text"
                        value={formData.handle}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            handle: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                          })
                        }
                        placeholder="username"
                        required
                        disabled={saving}
                        className="rounded-l-none"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Lowercase letters, numbers, and underscores only
                    </p>
                  </div>

                  {/* Organization */}
                  <div>
                    <Label htmlFor="organization" className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4" />
                      Organization
                    </Label>
                    <Input
                      id="organization"
                      type="text"
                      value={formData.organization}
                      onChange={e => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="Your company or institution"
                      disabled={saving}
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <Label htmlFor="bio" className="mb-2">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      disabled={saving}
                      maxLength={500}
                    />
                    <p className="text-xs text-slate-500 mt-1 font-medium text-right">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-4">
                    <Button type="submit" className="btn-game flex-1" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Link href="/dashboard">
                      <Button type="button" variant="outline" className="btn-game-secondary">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Details */}
            <Card className="game-card">
              <CardHeader>
                <CardTitle className="font-display">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-600">User ID</span>
                  <span className="text-sm font-mono text-slate-900">{user.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm font-semibold text-slate-600">Roles</span>
                  <div className="flex gap-2">
                    {user.roles.map(role => (
                      <span
                        key={role}
                        className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-bold"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
