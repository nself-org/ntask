import type { StorageAdapter, StorageFile, StorageUploadOptions } from '@/lib/types/backend';
import { getSupabaseClient } from './client';

export function createSupabaseStorage(): StorageAdapter {
  const client = getSupabaseClient();

  return {
    async upload(bucket: string, path: string, file: File | Blob, options?: StorageUploadOptions) {
      const { error } = await client.storage.from(bucket).upload(path, file, {
        contentType: options?.contentType,
        upsert: options?.upsert ?? false,
        cacheControl: options?.cacheControl || '3600',
      });
      if (error) return { url: null, error: error.message };
      const { data: urlData } = client.storage.from(bucket).getPublicUrl(path);
      return { url: urlData.publicUrl, error: null };
    },

    async download(bucket: string, path: string) {
      const { data, error } = await client.storage.from(bucket).download(path);
      return { data: data || null, error: error?.message || null };
    },

    async remove(bucket: string, paths: string[]) {
      const { error } = await client.storage.from(bucket).remove(paths);
      return { error: error?.message || null };
    },

    getPublicUrl(bucket: string, path: string) {
      const { data } = client.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    },

    async list(bucket: string, path?: string) {
      const { data, error } = await client.storage.from(bucket).list(path || '');
      const files: StorageFile[] = (data || []).map((f) => ({
        name: f.name,
        id: f.id,
        size: f.metadata?.size,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
        mimeType: f.metadata?.mimetype,
      }));
      return { data: files, error: error?.message || null };
    },
  };
}
