import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { profileService, type Profile, type UpdateProfileInput } from '@/lib/services/profile';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast.error('Error loading profile', { description: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    try {
      const updatedProfile = await profileService.updateProfile(input);
      setProfile(updatedProfile);
      toast.success('Profile updated');
      return updatedProfile;
    } catch (err) {
      const error = err as Error;
      toast.error('Error updating profile', { description: error.message });
      throw error;
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File) => {
    try {
      const avatarUrl = await profileService.uploadAvatar(file);
      await updateProfile({ avatar_url: avatarUrl });
      toast.success('Avatar uploaded');
      return avatarUrl;
    } catch (err) {
      const error = err as Error;
      toast.error('Error uploading avatar', { description: error.message });
      throw error;
    }
  }, [updateProfile]);

  const deleteAvatar = useCallback(async () => {
    try {
      await profileService.deleteAvatar();
      setProfile((prev) => (prev ? { ...prev, avatar_url: '' } : null));
      toast.success('Avatar deleted');
    } catch (err) {
      const error = err as Error;
      toast.error('Error deleting avatar', { description: error.message });
      throw error;
    }
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    refetch: fetchProfile,
  };
}
