'use client';

import { useState, useCallback } from 'react';
import type { StorageUploadOptions } from '@/lib/types/backend';
import { getBackend } from '@/lib/backend';

interface UseStorageResult {
  upload: (bucket: string, path: string, file: File | Blob, options?: StorageUploadOptions) => Promise<string | null>;
  remove: (bucket: string, paths: string[]) => Promise<void>;
  getUrl: (bucket: string, path: string) => string;
  uploading: boolean;
  error: string | null;
}

export function useStorage(): UseStorageResult {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (bucket: string, path: string, file: File | Blob, options?: StorageUploadOptions) => {
    setUploading(true);
    setError(null);
    try {
      const backend = getBackend();
      const { url, error: uploadError } = await backend.storage.upload(bucket, path, file, options);
      if (uploadError) { setError(uploadError); return null; }
      return url;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const remove = useCallback(async (bucket: string, paths: string[]) => {
    const backend = getBackend();
    const { error: removeError } = await backend.storage.remove(bucket, paths);
    if (removeError) setError(removeError);
  }, []);

  const getUrl = useCallback((bucket: string, path: string) => {
    return getBackend().storage.getPublicUrl(bucket, path);
  }, []);

  return { upload, remove, getUrl, uploading, error };
}
