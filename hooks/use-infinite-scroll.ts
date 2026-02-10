'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInfiniteScrollOptions<T> {
  fetchPage: (page: number) => Promise<{ items: T[]; hasMore: boolean }>;
  initialPage?: number;
  threshold?: number;
}

interface UseInfiniteScrollResult<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  sentinelRef: (node: HTMLElement | null) => void;
  reset: () => void;
  loadMore: () => Promise<void>;
}

export function useInfiniteScroll<T>(options: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
  const { fetchPage, initialPage = 1, threshold = 100 } = options;
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(initialPage);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPage(pageRef.current);
      setItems((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      pageRef.current += 1;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [fetchPage, loading, hasMore]);

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && hasMore && !loading) loadMore();
        },
        { rootMargin: `${threshold}px` },
      );
      observerRef.current.observe(node);
    },
    [hasMore, loading, loadMore, threshold],
  );

  const reset = useCallback(() => {
    setItems([]);
    setHasMore(true);
    setError(null);
    pageRef.current = initialPage;
  }, [initialPage]);

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return { items, loading, error, hasMore, sentinelRef, reset, loadMore };
}
