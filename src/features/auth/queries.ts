import { authApi } from '@/services/api/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Query Keys - централизованное управление ключами кэша для auth feature
 */
export const authQueryKeys = {
  all: ['auth'] as const,
  user: () => [...authQueryKeys.all, 'user'] as const,
};

/**
 * Mutation: Вход в систему
 * Выполняет login и автоматически обновляет состояние через authStore
 */
export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: () => {
      // Инвалидируем кэш пользователя после успешного входа
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user() });
    },
  });
};

/**
 * Mutation: Регистрация нового пользователя
 * Выполняет register и автоматически обновляет состояние через authStore
 */
export const useRegisterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      email,
      password,
      firstName,
      lastName,
      acceptedPrivacyPolicy,
      acceptedMarketing,
    }: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      acceptedPrivacyPolicy?: boolean;
      acceptedMarketing?: boolean;
    }) =>
      authApi.register({
        email,
        password,
        firstName,
        lastName,
        acceptedPrivacyPolicy,
        acceptedMarketing,
      }),
    onSuccess: () => {
      // Инвалидируем кэш пользователя после успешной регистрации
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user() });
    },
  });
};

/**
 * Mutation: Выход из системы
 * Выполняет logout и очищает состояние через authStore
 */
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Очищаем весь кэш после выхода из системы
      queryClient.clear();
    },
  });
};
