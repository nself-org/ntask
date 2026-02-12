import type { RealtimeAdapter, RealtimeChannel } from '@/lib/types/backend';
import { getSupabaseClient } from './client';

export function createSupabaseRealtime(): RealtimeAdapter {
  const client = getSupabaseClient();
  const channels = new Map<string, ReturnType<typeof client.channel>>();

  return {
    channel(name: string): RealtimeChannel {
      const ch = client.channel(name);
      channels.set(name, ch);

      return {
        subscribe() {
          ch.subscribe();
          return this;
        },
        unsubscribe() {
          ch.unsubscribe();
          channels.delete(name);
        },
        on(event: string, callback: (payload: unknown) => void) {
          ch.on('broadcast', { event }, (payload) => callback(payload));
          return this;
        },
        send(event: string, payload: unknown) {
          ch.send({ type: 'broadcast', event, payload });
        },
      };
    },

    removeChannel(name: string) {
      const ch = channels.get(name);
      if (ch) {
        ch.unsubscribe();
        channels.delete(name);
      }
    },

    removeAllChannels() {
      channels.forEach((ch) => ch.unsubscribe());
      channels.clear();
    },
  };
}
