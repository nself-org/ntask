import type { BackendClient } from '@/lib/types/backend';
import { createSupabaseAuth } from './auth';
import { createSupabaseDatabase } from './database';
import { createSupabaseStorage } from './storage';
import { createSupabaseRealtime } from './realtime';
import { createSupabaseFunctions } from './functions';

export function createSupabaseBackend(): BackendClient {
  return {
    auth: createSupabaseAuth(),
    db: createSupabaseDatabase(),
    storage: createSupabaseStorage(),
    realtime: createSupabaseRealtime(),
    functions: createSupabaseFunctions(),
  };
}
