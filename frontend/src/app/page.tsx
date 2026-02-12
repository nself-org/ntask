'use client';

import { useAuth } from '@/lib/providers';
import { AppHeader } from '@/components/layout/app-header';
import { Sparkles, ArrowRight, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 py-20 sm:py-32">
        <div className="text-center">
          <div className="mb-8 inline-flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-400 shadow-lg shadow-sky-500/20">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">
              nSelf
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            A modern, production-ready boilerplate with multi-backend support.
            Sign in to access your dashboard, todos, and more.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {loading ? (
              <div className="h-11 w-40 animate-pulse rounded-lg bg-muted" />
            ) : user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-24 grid gap-8 sm:grid-cols-3">
          <FeatureCard
            icon={Zap}
            title="Lightning Fast"
            description="Built on Next.js with optimized performance and instant page loads."
          />
          <FeatureCard
            icon={Shield}
            title="Secure by Default"
            description="Built-in authentication with role-based access and row-level security."
          />
          <FeatureCard
            icon={Sparkles}
            title="Modern Stack"
            description="TypeScript, Tailwind CSS, and a clean component architecture."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Zap;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-border/60 bg-card p-6 transition-all hover:border-border hover:shadow-md">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
