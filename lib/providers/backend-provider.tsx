'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { BackendClient } from '@/lib/types/backend';
import { getBackend } from '@/lib/backend';

const BackendContext = createContext<BackendClient | null>(null);

export function BackendProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  const backend = useMemo(() => {
    try {
      return getBackend();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initialize backend');
      return null;
    }
  }, []);

  if (error) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '4rem auto' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: '#dc2626' }}>
          Backend Configuration Error
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#666', lineHeight: 1.6 }}>{error}</p>
      </div>
    );
  }

  return <BackendContext.Provider value={backend}>{children}</BackendContext.Provider>;
}

export function useBackend(): BackendClient {
  const ctx = useContext(BackendContext);
  if (!ctx) throw new Error('useBackend must be used within BackendProvider');
  return ctx;
}
