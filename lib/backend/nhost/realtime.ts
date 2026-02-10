import type { RealtimeAdapter, RealtimeChannel } from '@/lib/types/backend';
import { config } from '@/lib/config';

export function createNhostRealtime(): RealtimeAdapter {
  const sockets = new Map<string, WebSocket>();
  const channelListeners = new Map<string, Map<string, Set<(payload: unknown) => void>>>();

  function getOrCreateSocket(name: string): WebSocket {
    let ws = sockets.get(name);
    if (ws && ws.readyState === WebSocket.OPEN) return ws;

    const token = typeof window !== 'undefined' ? localStorage.getItem('nhost_auth_token') : null;
    const url = new URL(config.nhost.graphqlWsUrl);
    if (token) url.searchParams.set('token', token);
    url.searchParams.set('channel', name);

    ws = new WebSocket(url.toString());
    sockets.set(name, ws);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const eventName = msg.event || msg.type;
        const cbs = channelListeners.get(name)?.get(eventName);
        cbs?.forEach((cb) => cb(msg.payload || msg.data || msg));
      } catch {
        /* ignore parse errors */
      }
    };

    return ws;
  }

  return {
    channel(name: string): RealtimeChannel {
      if (!channelListeners.has(name)) {
        channelListeners.set(name, new Map());
      }

      return {
        subscribe() {
          getOrCreateSocket(name);
          return this;
        },
        unsubscribe() {
          const ws = sockets.get(name);
          if (ws) {
            ws.close();
            sockets.delete(name);
          }
          channelListeners.delete(name);
        },
        on(event: string, callback: (payload: unknown) => void) {
          const events = channelListeners.get(name)!;
          if (!events.has(event)) events.set(event, new Set());
          events.get(event)!.add(callback);
          return this;
        },
        send(event: string, payload: unknown) {
          const ws = sockets.get(name);
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event, payload }));
          }
        },
      };
    },

    removeChannel(name: string) {
      const ws = sockets.get(name);
      if (ws) {
        ws.close();
        sockets.delete(name);
      }
      channelListeners.delete(name);
    },

    removeAllChannels() {
      sockets.forEach((ws) => ws.close());
      sockets.clear();
      channelListeners.clear();
    },
  };
}
