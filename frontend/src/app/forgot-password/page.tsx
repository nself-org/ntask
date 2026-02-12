'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/providers';
import { AppHeader } from '@/components/layout/app-header';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await resetPassword(email);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="text-center">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <h1 className="mb-2 text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="mb-8 text-sm text-muted-foreground">
                We sent a password reset link to <span className="font-medium text-foreground">{email}</span>
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your email and we will send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send reset link'}
                </button>
              </form>

              <p className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
