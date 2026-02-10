'use client';

import { useEffect } from 'react';
import { supportsServiceWorker } from '@/lib/platform';
import { setupOnlineSync } from '@/lib/offline';

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (supportsServiceWorker()) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    setupOnlineSync();
  }, []);

  return null;
}
