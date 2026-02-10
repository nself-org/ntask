import type { BackendClient } from '@/lib/types/backend';
import { config } from '@/lib/config';

let clientInstance: BackendClient | null = null;

export function getBackend(): BackendClient {
  if (!clientInstance) {
    switch (config.backend) {
      case 'nself': {
        const { createNselfBackend } = require('./nself');
        clientInstance = createNselfBackend();
        break;
      }
      case 'nhost': {
        const { createNhostBackend } = require('./nhost');
        clientInstance = createNhostBackend();
        break;
      }
      case 'bolt':
      case 'supabase':
      default: {
        const { createSupabaseBackend } = require('./supabase');
        clientInstance = createSupabaseBackend();
        break;
      }
    }
  }
  return clientInstance!;
}

export function resetBackend(): void {
  clientInstance = null;
}

export { type BackendClient } from '@/lib/types/backend';
