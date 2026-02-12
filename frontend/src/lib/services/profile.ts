import { getBackend } from '../backend';
import type { BackendClient } from '../types/backend';
import { Tables } from '../utils/tables';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileInput {
  display_name?: string;
  avatar_url?: string;
  bio?: string;
}

export class ProfileService {
  private backend: BackendClient;

  constructor(backendAdapter: BackendClient) {
    this.backend = backendAdapter;
  }

  async getProfile(): Promise<Profile | null> {
    const user = await this.backend.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.backend.db.queryById<Profile>(Tables.PROFILES, user.id);

    if (error) throw new Error(error);
    return data;
  }

  async updateProfile(input: UpdateProfileInput): Promise<Profile> {
    const user = await this.backend.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.backend.db.update<Profile>(Tables.PROFILES, user.id, input as Record<string, unknown>);

    if (error) throw new Error(error);
    if (!data) throw new Error('Failed to update profile');
    return data;
  }

  async uploadAvatar(file: File): Promise<string> {
    const user = await this.backend.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    const { url, error } = await this.backend.storage.upload('avatars', fileName, file, {
      upsert: true,
      contentType: file.type,
    });

    if (error) throw new Error(error);
    if (!url) throw new Error('Failed to upload avatar');

    return url;
  }

  async deleteAvatar(): Promise<void> {
    const user = await this.backend.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const profile = await this.getProfile();
    if (!profile?.avatar_url) return;

    const path = profile.avatar_url.split('/avatars/').pop();
    if (!path) return;

    await this.backend.storage.remove('avatars', [path]);
    await this.updateProfile({ avatar_url: '' });
  }
}

export const profileService = new ProfileService(getBackend());
