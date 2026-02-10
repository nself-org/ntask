import { config } from '@/lib/config';

export interface HealthStatus {
  backend: 'healthy' | 'degraded' | 'down' | 'unknown';
  latencyMs: number;
  timestamp: number;
}

function getHealthUrl(): string {
  switch (config.backend) {
    case 'nself':
      return `${config.nself.graphqlUrl.replace('/v1/graphql', '')}/healthz`;
    case 'nhost':
      return `${config.nhost.graphqlUrl.replace('/v1/graphql', '')}/healthz`;
    case 'bolt':
    case 'supabase':
    default:
      return `${config.supabase.url}/rest/v1/`;
  }
}

function getHealthHeaders(): Record<string, string> {
  if (config.backend === 'bolt' || config.backend === 'supabase') {
    return { apikey: config.supabase.anonKey };
  }
  return {};
}

export async function checkBackendHealth(): Promise<HealthStatus> {
  const start = Date.now();
  const timestamp = start;

  try {
    const url = getHealthUrl();
    if (!url) return { backend: 'unknown', latencyMs: 0, timestamp };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { headers: getHealthHeaders(), signal: controller.signal });
    clearTimeout(timeout);

    const latencyMs = Date.now() - start;

    if (res.ok) return { backend: 'healthy', latencyMs, timestamp };
    if (res.status < 500) return { backend: 'degraded', latencyMs, timestamp };
    return { backend: 'down', latencyMs, timestamp };
  } catch {
    return { backend: 'down', latencyMs: Date.now() - start, timestamp };
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null;
let listeners: ((status: HealthStatus) => void)[] = [];

export function startHealthMonitor(intervalMs = 30000): void {
  if (intervalId) return;
  intervalId = setInterval(async () => {
    const status = await checkBackendHealth();
    for (const listener of listeners) listener(status);
  }, intervalMs);
}

export function stopHealthMonitor(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function onHealthChange(callback: (status: HealthStatus) => void): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}
