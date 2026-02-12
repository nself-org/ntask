'use client';

import { useState, useCallback } from 'react';
import type { MutationResult } from '@/lib/types/backend';
import { getBackend } from '@/lib/backend';
import { queueOfflineAction } from '@/lib/offline/queue';

type MutationType = 'insert' | 'update' | 'delete';

interface UseMutationOptions {
  offlineSupport?: boolean;
}

interface UseMutationResult<T> {
  mutate: (data?: Record<string, unknown>, id?: string) => Promise<MutationResult<T>>;
  loading: boolean;
  error: string | null;
}

export function useMutation<T = unknown>(
  table: string,
  type: MutationType,
  options?: UseMutationOptions
): UseMutationResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (data?: Record<string, unknown>, id?: string): Promise<MutationResult<T>> => {
    setLoading(true);
    setError(null);

    try {
      const backend = getBackend();
      let result: MutationResult<T>;

      switch (type) {
        case 'insert':
          result = await backend.db.insert<T>(table, data || {});
          break;
        case 'update':
          if (!id) throw new Error('ID required for update');
          result = await backend.db.update<T>(table, id, data || {});
          break;
        case 'delete':
          if (!id) throw new Error('ID required for delete');
          result = (await backend.db.remove(table, id)) as MutationResult<T>;
          break;
        default:
          throw new Error(`Unknown mutation type: ${type}`);
      }

      if (result.error) setError(result.error);
      return result;
    } catch (err) {
      const message = (err as Error).message;

      if (options?.offlineSupport && !navigator.onLine) {
        await queueOfflineAction({ table, type, data, id, timestamp: Date.now() });
        return { data: (data as T) || null, error: null };
      }

      setError(message);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  }, [table, type, options?.offlineSupport]);

  return { mutate, loading, error };
}
