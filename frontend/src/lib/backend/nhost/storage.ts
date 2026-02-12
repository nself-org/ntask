import type { StorageAdapter, StorageFile, StorageUploadOptions } from '@/lib/types/backend';
import { config } from '@/lib/config';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nhost_auth_token');
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export function createNhostStorage(): StorageAdapter {
  const baseUrl = config.nhost.storageUrl;

  return {
    async upload(bucket: string, path: string, file: File | Blob, _options?: StorageUploadOptions) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket-id', bucket);

        const res = await fetch(`${baseUrl}/files`, {
          method: 'POST',
          headers: authHeaders(),
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: res.statusText }));
          return { url: null, error: err.message || 'Upload failed' };
        }

        const data = await res.json();
        const fileId = data.processedFiles?.[0]?.id || data.id;
        return { url: `${baseUrl}/files/${fileId}`, error: null };
      } catch (err) {
        return { url: null, error: (err as Error).message };
      }
    },

    async download(_bucket: string, path: string) {
      try {
        const res = await fetch(`${baseUrl}/files/${path}`, {
          headers: authHeaders(),
        });
        if (!res.ok) return { data: null, error: res.statusText };
        const blob = await res.blob();
        return { data: blob, error: null };
      } catch (err) {
        return { data: null, error: (err as Error).message };
      }
    },

    async remove(_bucket: string, paths: string[]) {
      try {
        for (const p of paths) {
          await fetch(`${baseUrl}/files/${p}`, {
            method: 'DELETE',
            headers: authHeaders(),
          });
        }
        return { error: null };
      } catch (err) {
        return { error: (err as Error).message };
      }
    },

    getPublicUrl(_bucket: string, path: string) {
      return `${baseUrl}/files/${path}`;
    },

    async list(bucket: string, _path?: string) {
      try {
        const res = await fetch(`${baseUrl}/files?bucket-id=${bucket}`, {
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        });
        if (!res.ok) return { data: null, error: res.statusText };
        const data = await res.json();
        const files: StorageFile[] = (Array.isArray(data) ? data : []).map((f: Record<string, unknown>) => ({
          name: (f.name as string) || '',
          id: f.id as string,
          size: f.size as number,
          createdAt: f.createdAt as string,
          mimeType: f.mimeType as string,
        }));
        return { data: files, error: null };
      } catch (err) {
        return { data: null, error: (err as Error).message };
      }
    },
  };
}
