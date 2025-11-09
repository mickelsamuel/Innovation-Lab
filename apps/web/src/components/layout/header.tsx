'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, getInitials } from '@/lib/utils';
import { Menu, X, Trophy, Users, Target, User, LogIn, LogOut, Settings, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAuthToken, apiFetch } from '@/lib/api';
import { NotificationBell } from '@/components/layout/NotificationBell';

const navigation = [
  { name: 'Home', href: '/', icon: null },
  { name: 'Dashboard', href: '/dashboard', icon: User },
  { name: 'Hackathons', href: '/hackathons', icon: Trophy },
  { name: 'Challenges', href: '/challenges', icon: Target },
  { name: 'Leaderboard', href: '/leaderboard', icon: Users },
];

interface UserData {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatarUrl: string | null;
}

interface GamificationProfile {
  level: number;
  xp: number;
  vaultKeys: number;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [gamification, setGamification] = useState<GamificationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = getAuthToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await apiFetch<UserData>('/users/me', { token });
        setUser(userData);

        try {
          const gamificationData = await apiFetch<GamificationProfile>('/gamification/profile', { token });
          setGamification(gamificationData);
        } catch (err) {
          console.error('Failed to fetch gamification data:', err);
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem('auth_token');
    setUser(null);
    setGamification(null);
    router.push('/');
  }

  // Don't show header on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto px-4" aria-label="Global">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">IL</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-display font-bold text-slate-900">
                  Innovation Lab
                </span>
                <span className="block text-xs text-slate-500">NBC + Vaultix</span>
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-slate-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-slate-700 border-b-2 border-transparent'
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
            {!isLoading && (
              user ? (
                <div className="flex items-center gap-4">
                  {/* Vault Keys Display */}
                  {gamification && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30">
                      <Zap className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold text-slate-900">{gamification.vaultKeys}</span>
                    </div>
                  )}

                  {/* Notification Bell */}
                  <NotificationBell />

                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-3 rounded-full hover:bg-slate-100 transition-colors p-1 pr-3">
                        <Avatar className="w-9 h-9 border-2 border-primary">
                          {user.avatarUrl && (
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                          )}
                          <AvatarFallback className="bg-primary text-white font-bold text-sm">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left hidden xl:block">
                          <p className="text-sm font-bold text-slate-900">{user.name.split(' ')[0]}</p>
                          {gamification && (
                            <p className="text-xs text-slate-500">Level {gamification.level}</p>
                          )}
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div>
                          <p className="font-bold">{user.name}</p>
                          <p className="text-xs text-slate-500 font-normal">@{user.handle}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <User className="w-4 h-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <Settings className="w-4 h-4 mr-2" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="space-y-2 pb-3 pt-2">
              {/* User Info (Mobile) */}
              {user && (
                <div className="px-3 py-4 border-b border-slate-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-12 h-12 border-2 border-primary">
                      {user.avatarUrl && (
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                      )}
                      <AvatarFallback className="bg-primary text-white font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-500">@{user.handle}</p>
                    </div>
                  </div>
                  {gamification && (
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="font-bold">Level {gamification.level}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-accent" />
                        <span className="font-bold">{gamification.vaultKeys} Keys</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Links */}
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {item.name}
                  </Link>
                );
              })}

              {/* Auth Actions (Mobile) */}
              <div className="border-t border-slate-200 mt-4 pt-4 space-y-2">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className="flex w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full justify-start" size="lg">
                        <Settings className="w-5 h-5 mr-2" />
                        Profile Settings
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      size="lg"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="flex w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full justify-start" size="lg">
                        <LogIn className="w-5 h-5 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/auth/register"
                      className="flex w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full" size="lg">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
