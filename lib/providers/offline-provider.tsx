'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { getQueue, processQueue } from '@/lib/offline/queue';

export type ConnectivityStatus = 'online' | 'offline' | 'reconnecting' | 'syncing';

interface OfflineContextValue {
  isOnline: boolean;
  isOffline: boolean;
  status: ConnectivityStatus;
  pendingActions: number;
  lastSyncResult: { processed: number; failed: number } | null;
}

const OfflineContext = createContext<OfflineContextValue>({
  isOnline: true,
  isOffline: false,
  status: 'online',
  pendingActions: 0,
  lastSyncResult: null,
});

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [status, setStatus] = useState<ConnectivityStatus>('online');
  const [pendingActions, setPendingActions] = useState(0);
  const [lastSyncResult, setLastSyncResult] = useState<{ processed: number; failed: number } | null>(null);
  const wasOffline = useRef(false);

  const checkPendingActions = useCallback(async () => {
    try {
      const queue = await getQueue();
      setPendingActions(queue.length);
    } catch {
      // ignore
    }
  }, []);

  const syncQueue = useCallback(async () => {
    const queue = await getQueue();
    if (queue.length === 0) {
      setStatus('online');
      setPendingActions(0);
      return;
    }

    setStatus('syncing');
    try {
      const result = await processQueue();
      setLastSyncResult(result);
      const remaining = await getQueue();
      setPendingActions(remaining.length);
    } catch {
      // ignore
    }
    setStatus('online');
  }, []);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      setStatus('offline');
      wasOffline.current = true;
    }
    checkPendingActions();

    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline.current) {
        setStatus('reconnecting');
        wasOffline.current = false;
        setTimeout(() => {
          syncQueue();
        }, 1500);
      } else {
        setStatus('online');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatus('offline');
      wasOffline.current = true;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(checkPendingActions, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [checkPendingActions, syncQueue]);

  return (
    <OfflineContext.Provider value={{ isOnline, isOffline: !isOnline, status, pendingActions, lastSyncResult }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline(): OfflineContextValue {
  return useContext(OfflineContext);
}
