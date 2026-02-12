import type { FunctionsAdapter, MutationResult } from '@/lib/types/backend';
import { config } from '@/lib/config';

export function createNselfFunctions(): FunctionsAdapter {
  return {
    async invoke<T = unknown>(functionName: string, body?: Record<string, unknown>): Promise<MutationResult<T>> {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('nself_auth_token') : null;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${config.nself.functionsUrl}/${functionName}`, {
          method: 'POST',
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
          const errText = await res.text();
          return { data: null, error: errText };
        }

        const data = await res.json();
        return { data: data as T, error: null };
      } catch (err) {
        return { data: null, error: (err as Error).message };
      }
    },
  };
}
