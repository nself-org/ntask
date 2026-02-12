'use client';

import { useState, useCallback } from 'react';
import type { MutationResult } from '@/lib/types/backend';
import { getBackend } from '@/lib/backend';

interface UseFunctionsResult<T> {
  invoke: (body?: Record<string, unknown>) => Promise<MutationResult<T>>;
  loading: boolean;
  error: string | null;
  data: T | null;
}

export function useFunctions<T = unknown>(functionName: string): UseFunctionsResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const invoke = useCallback(async (body?: Record<string, unknown>): Promise<MutationResult<T>> => {
    setLoading(true);
    setError(null);
    try {
      const backend = getBackend();
      const result = await backend.functions.invoke<T>(functionName, body);
      if (result.error) setError(result.error);
      else setData(result.data);
      return result;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      return { data: null, error: message };
    } finally {
      setLoading(false);
    }
  }, [functionName]);

  return { invoke, loading, error, data };
}
