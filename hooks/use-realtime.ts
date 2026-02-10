'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { RealtimeChannel } from '@/lib/types/backend';
import { getBackend } from '@/lib/backend';

export function useRealtime(
  channelName: string,
  events: Record<string, (payload: unknown) => void>,
  enabled = true
): { send: (event: string, payload: unknown) => void } {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const backend = getBackend();
    const channel = backend.realtime.channel(channelName);

    Object.entries(events).forEach(([event, callback]) => {
      channel.on(event, callback);
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [channelName, enabled]);

  const send = useCallback((event: string, payload: unknown) => {
    channelRef.current?.send(event, payload);
  }, []);

  return { send };
}
