'use client';

import { useAuth } from '@/lib/providers';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback, loadingFallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      loadingFallback || (
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )
    );
  }

  if (!user) {
    return (
      fallback || (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
          <h2 className="text-lg font-semibold">Sign in required</h2>
          <p className="text-sm text-muted-foreground">
            You need to be signed in to view this page.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
