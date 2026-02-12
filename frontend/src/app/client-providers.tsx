'use client';

import type { ReactNode } from 'react';
import { AppProviders } from '@/lib/providers';
import { DevModeIndicator } from '@/components/dashboard/dev-mode-indicator';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AppProviders>
      {children}
      <DevModeIndicator />
    </AppProviders>
  );
}
