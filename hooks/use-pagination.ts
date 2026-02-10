'use client';

import { useState, useCallback, useMemo } from 'react';

interface PaginationOptions {
  initialPage?: number;
  pageSize?: number;
  totalItems?: number;
}

interface PaginationResult {
  page: number;
  pageSize: number;
  totalPages: number;
  offset: number;
  hasNext: boolean;
  hasPrev: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setTotalItems: (total: number) => void;
  setPageSize: (size: number) => void;
  pageRange: number[];
}

export function usePagination(options: PaginationOptions = {}): PaginationResult {
  const [page, setPage] = useState(options.initialPage || 1);
  const [pageSize, setPageSizeState] = useState(options.pageSize || 20);
  const [totalItems, setTotalItems] = useState(options.totalItems || 0);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const offset = (page - 1) * pageSize;
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const goToPage = useCallback(
    (p: number) => setPage(Math.max(1, Math.min(p, totalPages))),
    [totalPages],
  );

  const nextPage = useCallback(() => {
    if (hasNext) setPage((p) => p + 1);
  }, [hasNext]);

  const prevPage = useCallback(() => {
    if (hasPrev) setPage((p) => p - 1);
  }, [hasPrev]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  const pageRange = useMemo(() => {
    const range: number[] = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }, [page, totalPages]);

  return {
    page,
    pageSize,
    totalPages,
    offset,
    hasNext,
    hasPrev,
    goToPage,
    nextPage,
    prevPage,
    setTotalItems,
    setPageSize,
    pageRange,
  };
}
