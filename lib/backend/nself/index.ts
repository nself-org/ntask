import type { BackendClient } from '@/lib/types/backend';
import { createNselfAuth } from './auth';
import { createNselfDatabase } from './database';
import { createNselfStorage } from './storage';
import { createNselfRealtime } from './realtime';
import { createNselfFunctions } from './functions';

export function createNselfBackend(): BackendClient {
  return {
    auth: createNselfAuth(),
    db: createNselfDatabase(),
    storage: createNselfStorage(),
    realtime: createNselfRealtime(),
    functions: createNselfFunctions(),
  };
}
