'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Trophy, Sparkles, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    await signIn('azure-ad', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen hex-grid flex items-center justify-center p-4">
      <div className="game-card p-8 w-full max-w-md shadow-3d-lg">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-10 h-10 text-primary animate-wiggle" />
            <h1 className="text-4xl font-display font-black">Enter Arena</h1>
          </div>
          <p className="text-slate-700 font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent animate-sparkle" />
            Sign in to access your player account and continue your legendary journey!
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm font-bold text-red-600 bg-red-50 border-2 border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-slate-900">Player Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="warrior@example.com"
                autoComplete="email"
                disabled={isLoading}
                className="font-semibold"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm font-bold text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-bold text-slate-900">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary font-bold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading}
                className="font-semibold"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm font-bold text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button type="submit" className="btn-game w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entering...
                </>
              ) : (
                <>
                  <Zap className="inline w-5 h-5 mr-2" />
                  Begin Battle
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500 font-bold">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-game-secondary w-full"
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              Microsoft
            </button>
          </div>

          <div className="mt-6 pt-6 border-t-2 border-slate-200">
            <p className="text-sm text-center text-slate-700 font-semibold w-full">
              Don&apos;t have a player account?{' '}
              <Link href="/auth/register" className="text-primary font-bold hover:underline">
                Join Arena
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
