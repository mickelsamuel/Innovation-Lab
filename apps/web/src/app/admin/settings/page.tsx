'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, Globe, Mail, Bell, Shield, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Platform Settings</h1>
        <p className="text-gray-400">Configure platform-wide settings and preferences</p>
      </div>

      {/* General Settings */}
      <Card className="bg-[#0f1115] border-[#1e2129]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <CardTitle className="text-white">General Settings</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Basic platform configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="platform-name" className="text-gray-300">
              Platform Name
            </Label>
            <Input
              id="platform-name"
              defaultValue="Innovation Lab"
              className="mt-2 bg-[#1a1c23] border-[#1e2129] text-white"
            />
          </div>

          <div>
            <Label htmlFor="platform-url" className="text-gray-300">
              Platform URL
            </Label>
            <Input
              id="platform-url"
              defaultValue="https://innovationlab.com"
              className="mt-2 bg-[#1a1c23] border-[#1e2129] text-white"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Maintenance Mode</Label>
              <p className="text-sm text-gray-500">
                Temporarily disable platform access
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="bg-[#0f1115] border-[#1e2129]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-accent" />
            <CardTitle className="text-white">Email Settings</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Configure email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Welcome Emails</Label>
              <p className="text-sm text-gray-500">Send welcome email to new users</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Hackathon Notifications</Label>
              <p className="text-sm text-gray-500">
                Notify users of hackathon updates
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Weekly Digest</Label>
              <p className="text-sm text-gray-500">
                Send weekly activity summaries
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-[#0f1115] border-[#1e2129]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <CardTitle className="text-white">Security Settings</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Platform security configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-gray-300">Password Requirements</Label>
              <p className="text-sm text-gray-500">
                Enforce strong password policies
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div>
            <Label htmlFor="session-timeout" className="text-gray-300">
              Session Timeout (minutes)
            </Label>
            <Input
              id="session-timeout"
              type="number"
              defaultValue="60"
              className="mt-2 bg-[#1a1c23] border-[#1e2129] text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-primary hover:bg-primary/90 text-white px-8">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
