import { storage, StorageKey } from './storage';

interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'task' | 'list';
  payload: unknown;
  timestamp: number;
}

class OfflineQueue {
  async add(op: Omit<OfflineOperation, 'id' | 'timestamp'>): Promise<void> {
    const queue = await this.getAll();
    queue.push({
      ...op,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    });
    await storage.set(StorageKey.OFFLINE_QUEUE, queue);
  }

  async getAll(): Promise<OfflineOperation[]> {
    return (await storage.get<OfflineOperation[]>(StorageKey.OFFLINE_QUEUE)) ?? [];
  }

  async remove(id: string): Promise<void> {
    const queue = await this.getAll();
    await storage.set(
      StorageKey.OFFLINE_QUEUE,
      queue.filter((op) => op.id !== id)
    );
  }

  async clear(): Promise<void> {
    await storage.set(StorageKey.OFFLINE_QUEUE, []);
  }

  get size(): Promise<number> {
    return this.getAll().then((q) => q.length);
  }
}

export const offlineQueue = new OfflineQueue();

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}
