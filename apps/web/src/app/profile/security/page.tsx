'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getAuthToken, apiFetch } from '@/lib/api';
import { ArrowLeft, Shield, Key, Trash2, CheckCircle, XCircle, Smartphone } from 'lucide-react';

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  // 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [showQR, setShowQR] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Account Deletion State
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    checkUserStatus();
  }, []);

  async function checkUserStatus() {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const user = await apiFetch<{ totpEnabled?: boolean }>('/auth/me', { token });
      setIs2FAEnabled(user.totpEnabled || false);
    } catch (err) {
      console.error('Error fetching user status:', err);
    }
  }

  async function setup2FA() {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await apiFetch<{ secret: string; qrCode: string }>('/auth/2fa/setup', {
        method: 'POST',
        token,
      });

      setSecret(response.secret);
      setQrCode(response.qrCode);
      setShowQR(true);

      toast({
        title: '2FA Setup Initiated',
        description: 'Scan the QR code with your authenticator app.',
      });
    } catch (err: any) {
      toast({
        title: 'Setup Failed',
        description: err.message || 'Failed to setup 2FA',
        variant: 'destructive',
      });
    }
  }

  async function enable2FA() {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await apiFetch<{ success: boolean; message?: string }>('/auth/2fa/enable', {
        method: 'POST',
        body: JSON.stringify({ secret, token: totpToken }),
        token,
      });

      if (response.success) {
        setIs2FAEnabled(true);
        setShowQR(false);
        setTotpToken('');
        toast({
          title: '2FA Enabled',
          description: 'Two-factor authentication has been enabled successfully.',
        });
      } else {
        toast({
          title: 'Verification Failed',
          description: response.message || 'Invalid 2FA token',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Enable Failed',
        description: err.message || 'Failed to enable 2FA',
        variant: 'destructive',
      });
    }
  }

  async function disable2FA() {
    try {
      const token = getAuthToken();
      if (!token) return;

      await apiFetch('/auth/2fa/disable', {
        method: 'POST',
        token,
      });

      setIs2FAEnabled(false);
      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled.',
      });
    } catch (err: any) {
      toast({
        title: 'Disable Failed',
        description: err.message || 'Failed to disable 2FA',
        variant: 'destructive',
      });
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirmation do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
        token,
      });

      toast({
        title: 'Password Changed',
        description: 'Your password has been changed successfully.',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast({
        title: 'Change Failed',
        description: err.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmation !== 'DELETE') {
      toast({
        title: 'Confirmation Required',
        description: 'Please type DELETE to confirm account deletion.',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    try {
      const token = getAuthToken();
      if (!token) return;

      await apiFetch('/auth/delete-account', {
        method: 'POST',
        body: JSON.stringify({ password: deletePassword }),
        token,
      });

      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
      });

      localStorage.removeItem('auth_token');
      router.push('/');
    } catch (err: any) {
      toast({
        title: 'Deletion Failed',
        description: err.message || 'Failed to delete account',
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-4 flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Security Settings
          </h1>
          <p className="text-slate-600 mt-2">Manage your account security and authentication</p>
        </div>

        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-sm text-slate-600">
                    {is2FAEnabled ? (
                      <Badge variant="default" className="mt-1">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="mt-1">
                        <XCircle className="w-3 h-3 mr-1" />
                        Disabled
                      </Badge>
                    )}
                  </p>
                </div>
                {!is2FAEnabled && !showQR && <Button onClick={setup2FA}>Enable 2FA</Button>}
                {is2FAEnabled && (
                  <Button variant="destructive" onClick={disable2FA}>
                    Disable 2FA
                  </Button>
                )}
              </div>

              {showQR && (
                <div className="border rounded-lg p-4 space-y-4">
                  <div>
                    <p className="font-medium mb-2">1. Scan QR Code</p>
                    <p className="text-sm text-slate-600 mb-4">
                      Scan this QR code with Google Authenticator, Authy, or any TOTP app
                    </p>
                    {qrCode && <img src={qrCode} alt="2FA QR Code" className="max-w-xs mx-auto" />}
                  </div>

                  <div>
                    <p className="font-medium mb-2">2. Enter Verification Code</p>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={totpToken}
                        onChange={e => setTotpToken(e.target.value)}
                        maxLength={6}
                        className="max-w-xs"
                      />
                      <Button onClick={enable2FA} disabled={totpToken.length !== 6}>
                        Verify & Enable
                      </Button>
                    </div>
                  </div>

                  <Button variant="ghost" onClick={() => setShowQR(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters long</p>
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Delete Account
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showDeleteConfirm ? (
                <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                  Delete My Account
                </Button>
              ) : (
                <div className="space-y-4 border border-red-200 rounded-lg p-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800 font-medium">
                      ⚠️ Warning: This action cannot be undone!
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      All your data, including teams, submissions, and activity will be permanently
                      deleted.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="delete-password">Enter Your Password</Label>
                    <Input
                      id="delete-password"
                      type="password"
                      value={deletePassword}
                      onChange={e => setDeletePassword(e.target.value)}
                      placeholder="Password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
                    <Input
                      id="delete-confirm"
                      type="text"
                      value={deleteConfirmation}
                      onChange={e => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                    >
                      {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword('');
                        setDeleteConfirmation('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
