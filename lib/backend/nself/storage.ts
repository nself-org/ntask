import type { StorageAdapter, StorageFile, StorageUploadOptions } from '@/lib/types/backend';
import { config } from '@/lib/config';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nself_auth_token');
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export function createNselfStorage(): StorageAdapter {
  const baseUrl = config.nself.storageUrl;

  return {
    async upload(bucket: string, path: string, file: File | Blob, options?: StorageUploadOptions) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const metadata: Record<string, string> = {};
        if (options?.contentType) metadata['content-type'] = options.contentType;

        const res = await fetch(`${baseUrl}/files/${bucket}/${path}`, {
          method: 'POST',
          headers: authHeaders(),
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: res.statusText }));
          return { url: null, error: err.message || 'Upload failed' };
        }

        const data = await res.json();
        return { url: `${baseUrl}/files/${data.id || `${bucket}/${path}`}`, error: null };
      } catch (err) {
        return { url: null, error: (err as Error).message };
      }
    },

    async download(bucket: string, path: string) {
      try {
        const res = await fetch(`${baseUrl}/files/${bucket}/${path}`, {
          headers: authHeaders(),
        });
        if (!res.ok) return { data: null, error: res.statusText };
        const blob = await res.blob();
        return { data: blob, error: null };
      } catch (err) {
        return { data: null, error: (err as Error).message };
      }
    },

    async remove(bucket: string, paths: string[]) {
      try {
        for (const p of paths) {
          await fetch(`${baseUrl}/files/${bucket}/${p}`, {
            method: 'DELETE',
            headers: authHeaders(),
          });
        }
        return { error: null };
      } catch (err) {
        return { error: (err as Error).message };
      }
    },

    getPublicUrl(bucket: string, path: string) {
      return `${baseUrl}/files/${bucket}/${path}`;
    },

    async list(bucket: string, path?: string) {
      try {
        const queryPath = path ? `/${path}` : '';
        const res = await fetch(`${baseUrl}/files/${bucket}${queryPath}`, {
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
