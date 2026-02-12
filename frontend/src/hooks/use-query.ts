'use client';

import { useState, useEffect, useCallback } from 'react';
import type { QueryOptions } from '@/lib/types/backend';
import { getBackend } from '@/lib/backend';
import { getCached, setCache } from '@/lib/offline/cache';

interface UseQueryResult<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useQuery<T = unknown>(table: string, options?: QueryOptions & { cacheKey?: string }): UseQueryResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = options?.cacheKey || `query:${table}:${JSON.stringify(options || {})}`;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cached = await getCached<T[]>(cacheKey);
      if (cached) setData(cached);

      const backend = getBackend();
      const result = await backend.db.query<T>(table, options);

      if (result.error) {
        setError(result.error);
        if (!cached) setData(null);
      } else {
        setData(result.data);
        if (result.data) await setCache(cacheKey, result.data);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [table, cacheKey, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
