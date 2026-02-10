'use client';

import type { ReactNode } from 'react';
import { BackendProvider } from './backend-provider';
import { AuthProvider } from './auth-provider';
import { OfflineProvider } from './offline-provider';
import { ThemeProvider } from './theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/sonner';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <BackendProvider>
          <AuthProvider>
            <OfflineProvider>
              {children}
              <Toaster position="bottom-right" />
            </OfflineProvider>
          </AuthProvider>
        </BackendProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export { useBackend } from './backend-provider';
export { useAuth } from './auth-provider';
export { useOffline } from './offline-provider';
export { useTheme } from './theme-provider';
