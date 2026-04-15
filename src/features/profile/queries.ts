import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';
import { authApi } from '@/services/api/auth';
import { useAuthStore } from '@/stores/authStore';

export const useUpdateProfileMutation = (): UseMutationResult<
  { success: boolean },
  Error,
  { firstName: string; lastName: string }
> => {
  const setProfile = useAuthStore((s) => s.setProfile);

  return useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: (_result, variables) => {
      setProfile(variables);
    },
  });
};

export const useUploadAvatarMutation = (): UseMutationResult<
  { avatarUrl: string },
  Error,
  { file: Blob; signal?: AbortSignal }
> => {
  const setAvatarUrl = useAuthStore((s) => s.setAvatarUrl);

  return useMutation({
    mutationFn: ({ file, signal }) => authApi.uploadAvatar(file, signal),
    onSuccess: (data) => {
      setAvatarUrl(data.avatarUrl);
    },
  });
};

export const useChangePasswordMutation = (): UseMutationResult<
  { success: boolean },
  Error,
  { oldPassword: string; newPassword: string }
> => {
  return useMutation({
    mutationFn: (data) =>
      authApi.changePassword(data.oldPassword, data.newPassword),
  });
};

export const useDeleteAvatarMutation = (): UseMutationResult<
  { success: boolean },
  Error,
  void
> => {
  const setAvatarUrl = useAuthStore((s) => s.setAvatarUrl);

  return useMutation({
    mutationFn: () => authApi.deleteAvatar(),
    onSuccess: () => {
      setAvatarUrl(null);
    },
  });
};

export const useDeleteAccountMutation = (): UseMutationResult<
  { success: boolean },
  Error,
  { email: string }
> => {
  return useMutation({
    mutationFn: ({ email }) => authApi.deleteAccount(email),
  });
};
