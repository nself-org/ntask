import { get, set, del, keys } from 'idb-keyval';

const CACHE_PREFIX = 'app_cache:';
const DEFAULT_TTL = 1000 * 60 * 30;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const entry = await get<CacheEntry<T>>(CACHE_PREFIX + key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      await del(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export async function setCache<T>(key: string, data: T, ttl = DEFAULT_TTL): Promise<void> {
  try {
    await set(CACHE_PREFIX + key, { data, timestamp: Date.now(), ttl });
  } catch {
    // IndexedDB may be unavailable
  }
}

export async function removeCache(key: string): Promise<void> {
  try {
    await del(CACHE_PREFIX + key);
  } catch {
    // noop
  }
}

export async function clearAllCache(): Promise<void> {
  try {
    const allKeys = await keys();
    const cacheKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith(CACHE_PREFIX));
    await Promise.all(cacheKeys.map((k) => del(k)));
  } catch {
    // noop
  }
}
