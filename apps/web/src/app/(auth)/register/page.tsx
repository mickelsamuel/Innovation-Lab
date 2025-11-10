'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2, Trophy, Sparkles, Zap } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Registration failed. Please try again.');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen hex-grid flex items-center justify-center p-4">
      <div className="game-card p-8 w-full max-w-md shadow-3d-lg">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-10 h-10 text-primary animate-wiggle" />
            <h1 className="text-4xl font-display font-black">Join Arena</h1>
          </div>
          <p className="text-slate-700 font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent animate-sparkle" />
            Create your player profile and begin your legendary journey!
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

            {success && (
              <div className="flex items-center gap-2 p-3 text-sm font-bold text-green-600 bg-green-50 border-2 border-green-200 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span>Player profile created! Redirecting to arena...</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold text-slate-900">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Warrior"
                autoComplete="name"
                disabled={isLoading}
                className="font-semibold"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm font-bold text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="handle" className="font-bold text-slate-900">
                Warrior Handle
              </Label>
              <Input
                id="handle"
                type="text"
                placeholder="legendary_warrior"
                autoComplete="username"
                disabled={isLoading}
                className="font-semibold"
                {...register('handle')}
              />
              {errors.handle && (
                <p className="text-sm font-bold text-red-600">{errors.handle.message}</p>
              )}
              <p className="text-xs text-slate-600 font-semibold">
                Only letters, numbers, underscores, and hyphens
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-slate-900">
                Player Email
              </Label>
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
              <Label htmlFor="password" className="font-bold text-slate-900">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                autoComplete="new-password"
                disabled={isLoading}
                className="font-semibold"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm font-bold text-red-600">{errors.password.message}</p>
              )}
              <p className="text-xs text-slate-600 font-semibold">
                Min 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-bold text-slate-900">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                autoComplete="new-password"
                disabled={isLoading}
                className="font-semibold"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm font-bold text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization" className="font-bold text-slate-900">
                Guild (Optional)
              </Label>
              <Input
                id="organization"
                type="text"
                placeholder="Legendary Coders"
                disabled={isLoading}
                className="font-semibold"
                {...register('organization')}
              />
              {errors.organization && (
                <p className="text-sm font-bold text-red-600">{errors.organization.message}</p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="acceptTerms"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                disabled={isLoading}
                {...register('acceptTerms')}
              />
              <label htmlFor="acceptTerms" className="text-sm text-slate-700 font-semibold">
                I agree to the{' '}
                <Link href="/legal/terms" className="text-primary font-bold hover:underline">
                  Arena Rules
                </Link>{' '}
                and{' '}
                <Link href="/legal/privacy" className="text-primary font-bold hover:underline">
                  Privacy Shield
                </Link>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm font-bold text-red-600">{errors.acceptTerms.message}</p>
            )}

            <button type="submit" className="btn-game w-full" disabled={isLoading || success}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating player profile...
                </>
              ) : (
                <>
                  <Zap className="inline w-5 h-5 mr-2" />
                  Join the Battle
                </>
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t-2 border-slate-200">
            <p className="text-sm text-center text-slate-700 font-semibold w-full">
              Already have a player account?{' '}
              <Link href="/auth/login" className="text-primary font-bold hover:underline">
                Enter Arena
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
