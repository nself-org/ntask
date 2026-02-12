'use client';

import { useState, useCallback, useRef } from 'react';

interface UseCopyResult {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
  error: string | null;
}

export function useCopyToClipboard(resetDelay = 2000): UseCopyResult {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (timerRef.current) clearTimeout(timerRef.current);

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);
      timerRef.current = setTimeout(() => setCopied(false), resetDelay);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setCopied(false);
      return false;
    }
  }, [resetDelay]);

  return { copy, copied, error };
}
