import type { DatabaseAdapter, QueryOptions, MutationResult } from '@/lib/types/backend';
import { getSupabaseClient } from './client';

export function createSupabaseDatabase(): DatabaseAdapter {
  const client = getSupabaseClient();

  return {
    async query<T = unknown>(table: string, options?: QueryOptions): Promise<MutationResult<T[]>> {
      let q = client.from(table).select(options?.select || '*');

      if (options?.where) {
        for (const [key, value] of Object.entries(options.where)) {
          q = q.eq(key, value);
        }
      }
      if (options?.orderBy) {
        for (const order of options.orderBy) {
          q = q.order(order.column, { ascending: order.ascending ?? true });
        }
      }
      if (options?.limit) q = q.limit(options.limit);
      if (options?.offset) q = q.range(options.offset, options.offset + (options.limit || 10) - 1);

      const { data, error } = await q;
      return { data: (data as T[]) || null, error: error?.message || null };
    },

    async queryById<T = unknown>(table: string, id: string): Promise<MutationResult<T>> {
      const { data, error } = await client.from(table).select('*').eq('id', id).maybeSingle();
      return { data: data as T | null, error: error?.message || null };
    },

    async insert<T = unknown>(table: string, data: Record<string, unknown>): Promise<MutationResult<T>> {
      const { data: result, error } = await client.from(table).insert(data).select().maybeSingle();
      return { data: result as T | null, error: error?.message || null };
    },

    async update<T = unknown>(table: string, id: string, data: Record<string, unknown>): Promise<MutationResult<T>> {
      const { data: result, error } = await client.from(table).update(data).eq('id', id).select().maybeSingle();
      return { data: result as T | null, error: error?.message || null };
    },

    async remove(table: string, id: string): Promise<MutationResult<null>> {
      const { error } = await client.from(table).delete().eq('id', id);
      return { data: null, error: error?.message || null };
    },

    async rpc<T = unknown>(functionName: string, params?: Record<string, unknown>): Promise<MutationResult<T>> {
      const { data, error } = await client.rpc(functionName, params);
      return { data: data as T | null, error: error?.message || null };
    },
  };
}
