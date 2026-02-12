'use client';

import { useAuth } from '@/lib/providers';
import { AppHeader } from '@/components/layout/app-header';
import { Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const greeting = getGreeting();
  const displayName = user.displayName || user.email?.split('@')[0] || 'there';

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
        <div className="text-center">
          <div className="mb-8 inline-flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-400 shadow-lg shadow-sky-500/20">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>

          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {greeting}, {displayName}
          </h1>

          <p className="mx-auto max-w-lg text-base leading-relaxed text-muted-foreground">
            Hello World -- your dashboard is up and running. This is your
            authenticated home base.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard label="Email" value={user.email} />
          <InfoCard label="User ID" value={user.id.slice(0, 8) + '...'} />
          <InfoCard
            label="Joined"
            value={
              user.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Just now'
            }
          />
        </div>
      </main>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-border hover:shadow-sm">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
