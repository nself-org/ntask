'use client';

import { AppHeader } from '@/components/layout/app-header';
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="flex items-center justify-center px-4 py-24">
        <div className="text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Page not found</h1>
          <p className="mb-8 text-base text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
