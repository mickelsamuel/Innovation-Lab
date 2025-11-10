'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken } from '@/lib/api';
import {
  LayoutDashboard,
  Trophy,
  Users,
  Target,
  Gavel,
  UserCircle,
  Settings,
  Menu,
  X,
  BarChart3,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Decode JWT to check roles
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles = payload.roles || [];
      setUserRoles(roles);

      // Check if user has admin or organizer role
      const hasAccess = roles.some((role: string) =>
        ['BANK_ADMIN', 'ORGANIZER', 'MODERATOR'].includes(role)
      );

      if (!hasAccess) {
        router.push('/dashboard');
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      router.push('/auth/login');
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink via-[#1a1c23] to-ink">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      roles: ['BANK_ADMIN', 'ORGANIZER', 'MODERATOR'],
    },
    {
      name: 'Hackathons',
      href: '/admin/hackathons',
      icon: Trophy,
      roles: ['BANK_ADMIN', 'ORGANIZER'],
    },
    {
      name: 'Challenges',
      href: '/admin/challenges',
      icon: Target,
      roles: ['BANK_ADMIN', 'ORGANIZER', 'PROJECT_OWNER'],
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      roles: ['BANK_ADMIN', 'MODERATOR'],
    },
    {
      name: 'Judging',
      href: '/admin/judging',
      icon: Gavel,
      roles: ['BANK_ADMIN', 'ORGANIZER'],
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      roles: ['BANK_ADMIN', 'ORGANIZER'],
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: UserCircle,
      roles: ['BANK_ADMIN', 'MODERATOR'],
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      roles: ['BANK_ADMIN'],
    },
  ];

  const visibleNav = navigation.filter(item => item.roles.some(role => userRoles.includes(role)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink via-[#1a1c23] to-ink">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full w-64 px-3 py-4 overflow-y-auto bg-[#0f1115] border-r border-[#1e2129]">
          <div className="flex items-center justify-between mb-8 px-3">
            <Link href="/admin" className="flex items-center space-x-2">
              <Trophy className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-white">Admin Panel</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2">
            {visibleNav.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-gray-300 rounded-lg hover:bg-[#1a1c23] hover:text-white transition-colors group"
                >
                  <Icon className="w-5 h-5 mr-3 group-hover:text-primary transition-colors" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-8 border-t border-[#1e2129]">
            <Link
              href="/dashboard"
              className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed top-4 left-4 z-30 p-2 bg-[#0f1115] border border-[#1e2129] rounded-lg lg:hidden ${
          isSidebarOpen ? 'hidden' : 'block'
        }`}
      >
        <Menu className="w-6 h-6 text-white" />
      </button>

      {/* Main content */}
      <div className="lg:ml-64">
        <main className="p-4 lg:p-8">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
