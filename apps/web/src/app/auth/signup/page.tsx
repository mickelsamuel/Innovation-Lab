'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Mail, Lock, User, Users, Target } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      // Store the token if provided
      if (data.accessToken) {
        localStorage.setItem('auth_token', data.accessToken);
        // Redirect to the original page or dashboard
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirect') || '/dashboard';
        router.push(redirectTo);
      } else {
        // If no token, redirect to login with redirect param
        const params2 = new URLSearchParams(window.location.search);
        const redirectTo = params2.get('redirect');
        const loginUrl = redirectTo
          ? `/auth/login?registered=true&redirect=${encodeURIComponent(redirectTo)}`
          : '/auth/login?registered=true';
        router.push(loginUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen hex-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-semibold">Back to Arena</span>
        </Link>

        <div className="game-card p-8 shadow-glow-accent">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce-subtle">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-display font-black mb-2 gradient-text">Join the Arena!</h1>
            <p className="text-slate-600 font-semibold">Create your account and start your legendary journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg text-sm text-red-900 font-semibold">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  disabled={isSubmitting}
                  className="flex h-12 w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 pl-10 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="flex h-12 w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 pl-10 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="flex h-12 w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 pl-10 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="flex h-12 w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 pl-10 text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-game w-full py-4 text-lg flex items-center justify-center"
              disabled={isSubmitting || !name || !email || !password || !confirmPassword}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-600 font-semibold">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline font-bold">
                Sign In
              </Link>
            </p>
          </form>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="game-card p-4">
              <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Compete</p>
            </div>
          </div>
          <div className="text-center">
            <div className="game-card p-4">
              <User className="w-8 h-8 text-accent2 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Collaborate</p>
            </div>
          </div>
          <div className="text-center">
            <div className="game-card p-4">
              <Trophy className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">Level Up</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
