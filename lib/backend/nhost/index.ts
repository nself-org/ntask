import type { BackendClient } from '@/lib/types/backend';
import { createNhostAuth } from './auth';
import { createNhostDatabase } from './database';
import { createNhostStorage } from './storage';
import { createNhostRealtime } from './realtime';
import { createNhostFunctions } from './functions';

export function createNhostBackend(): BackendClient {
  return {
    auth: createNhostAuth(),
    db: createNhostDatabase(),
    storage: createNhostStorage(),
    realtime: createNhostRealtime(),
    functions: createNhostFunctions(),
  };
}
