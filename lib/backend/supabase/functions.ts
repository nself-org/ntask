import type { FunctionsAdapter, MutationResult } from '@/lib/types/backend';
import { config } from '@/lib/config';
import { getSupabaseClient } from './client';

export function createSupabaseFunctions(): FunctionsAdapter {
  return {
    async invoke<T = unknown>(functionName: string, body?: Record<string, unknown>): Promise<MutationResult<T>> {
      try {
        const session = await getSupabaseClient().auth.getSession();
        const token = session.data.session?.access_token || config.supabase.anonKey;

        const res = await fetch(`${config.supabase.url}/functions/v1/${functionName}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
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
