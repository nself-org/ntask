import { get, set } from 'idb-keyval';
import { getBackend } from '@/lib/backend';

const QUEUE_KEY = 'offline_action_queue';

export interface OfflineAction {
  table: string;
  type: 'insert' | 'update' | 'delete';
  data?: Record<string, unknown>;
  id?: string;
  timestamp: number;
}

export async function queueOfflineAction(action: OfflineAction): Promise<void> {
  const queue = await getQueue();
  queue.push(action);
  await set(QUEUE_KEY, queue);
}

export async function getQueue(): Promise<OfflineAction[]> {
  return (await get<OfflineAction[]>(QUEUE_KEY)) || [];
}

export async function clearQueue(): Promise<void> {
  await set(QUEUE_KEY, []);
}

export async function processQueue(): Promise<{ processed: number; failed: number }> {
  const queue = await getQueue();
  if (queue.length === 0) return { processed: 0, failed: 0 };

  const backend = getBackend();
  let processed = 0;
  let failed = 0;
  const remaining: OfflineAction[] = [];

  for (const action of queue) {
    try {
      let result;
      switch (action.type) {
        case 'insert':
          result = await backend.db.insert(action.table, action.data || {});
          break;
        case 'update':
          result = await backend.db.update(action.table, action.id!, action.data || {});
          break;
        case 'delete':
          result = await backend.db.remove(action.table, action.id!);
          break;
      }
      if (result.error) {
        failed++;
        remaining.push(action);
      } else {
        processed++;
      }
    } catch {
      failed++;
      remaining.push(action);
    }
  }

  await set(QUEUE_KEY, remaining);
  return { processed, failed };
}

export function setupOnlineSync(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => {
    processQueue();
  });
}
