'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Loader2, Lock, LogOut, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useI18n } from '@/components/I18nProvider';
import { SITE } from '@/lib/site';

/**
 * Sign-in surface for /admin. Deliberately not a redirect to /login: an admin
 * arriving at /admin should be able to finish the job on that URL, and the
 * customer login page is a different audience with a register link on it.
 */
export function AdminLogin({ signedInAsNonAdmin }: { signedInAsNonAdmin?: string }) {
  const { login, logout } = useAuthStore();
  const { href } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      // No redirect needed — the page re-renders as the panel once the store
      // holds an ADMIN user.
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Sign-in failed. Check your email and password.');
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16 dark:bg-dark">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-white/50">{SITE.name}</p>
        </div>

        {signedInAsNonAdmin ? (
          <div className="glass-card p-8 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
            <h2 className="mt-4 font-semibold text-gray-900 dark:text-white">This account has no admin access</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-white/50">
              You are signed in as <span className="font-medium text-gray-700 dark:text-white/80">{signedInAsNonAdmin}</span>.
              Sign out and use an administrator account.
            </p>
            <button
              onClick={logout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-white/80 dark:hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card space-y-4 p-8">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm text-gray-500 dark:text-white/50">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm text-gray-500 dark:text-white/50">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex w-full items-center justify-center gap-2 !py-3.5 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Sign in
            </button>

            <p className="pt-1 text-center text-xs text-gray-400 dark:text-white/35">
              Staff access only. Sessions expire and require signing in again.
            </p>
          </form>
        )}

        <Link
          href={href('/')}
          className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-white/40 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>
      </div>
    </div>
  );
}
