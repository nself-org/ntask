interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryIf?: (error: unknown, attempt: number) => boolean;
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'retryIf' | 'onRetry'>> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
};

function getDelay(attempt: number, options: Required<Omit<RetryOptions, 'retryIf' | 'onRetry'>>): number {
  const delay = options.baseDelay * Math.pow(options.backoffFactor, attempt - 1);
  const jitter = delay * 0.1 * Math.random();
  return Math.min(delay + jitter, options.maxDelay);
}

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let lastError: unknown;
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt === opts.maxAttempts) break;
      if (options.retryIf && !options.retryIf(err, attempt)) break;

      const delay = getDelay(attempt, opts);
      options.onRetry?.(err, attempt, delay);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}

export async function retryFetch(url: string, init?: RequestInit, options?: RetryOptions): Promise<Response> {
  return retry(
    async () => {
      const res = await fetch(url, init);
      if (!res.ok && res.status >= 500) throw new Error(`HTTP ${res.status}`);
      return res;
    },
    {
      retryIf: (err) => {
        if (err instanceof TypeError) return true;
        if (err instanceof Error && err.message.startsWith('HTTP 5')) return true;
        return false;
      },
      ...options,
    },
  );
}
