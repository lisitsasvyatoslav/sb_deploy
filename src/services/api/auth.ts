import { trackYMEvent } from '@/shared/hooks/useYandexMetrika';
import { apiClient, currentBoard } from '@/services/api/client';
import { flushAttributionAfterAuth } from '@/shared/utils/attribution';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { useOnboardingUIStore } from '@/features/onboarding/stores/onboardingUIStore';
import {
  getYmSidebarEngagementParams,
  setClientRegistrationTimestamp,
} from '@/shared/utils/ymEngagement';

export const authApi = {
  async login(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    const resp = await apiClient.post('/auth/login', { email, password });
    const access = resp.data?.accessToken as string;
    const refresh = resp.data?.refreshToken as string | undefined;
    if (!access) throw new Error('Empty access token');

    // Save tokens to cookies
    useAuthStore.getState().setAuth(access, refresh);

    // Load user data via restoreAuth (avoids duplicate requests)
    await useAuthStore.getState().restoreAuth();

    await flushAttributionAfterAuth('login');

    // NestJS returns camelCase boardId
    const boardId = resp.data?.boardId as number | undefined;
    if (typeof boardId === 'number' && boardId > 0) currentBoard.setId(boardId);

    // Set active chat from auth response
    const chatId = resp.data?.homeChatId as number | undefined;
    if (typeof chatId === 'number' && chatId > 0) {
      useChatStore.getState().setActiveChatId(chatId);
    }

    trackYMEvent('login', getYmSidebarEngagementParams()); // explore/chat sidebar state for analytics

    return { accessToken: access, refreshToken: refresh };
  },

  async register({
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
  }): Promise<{ accessToken: string; refreshToken?: string }> {
    const resp = await apiClient.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      acceptedPrivacyPolicy,
      acceptedMarketing,
    });
    const access = resp.data?.accessToken as string;
    const refresh = resp.data?.refreshToken as string | undefined;
    if (!access) throw new Error('Empty access token');

    // Save tokens to cookies + sync Zustand (cookies via setTokens are synchronous)
    useAuthStore.getState().setAuth(access, refresh);

    // Load user data via restoreAuth; use returned userId (same value written to store) for YM timestamp
    const restoredUserId = await useAuthStore.getState().restoreAuth();

    await flushAttributionAfterAuth('signup');

    try {
      localStorage.removeItem('current_home_board_id');
    } catch (_) {
      /* noop */
    }
    // NestJS returns camelCase boardId
    const boardId = resp.data?.boardId as number | undefined;
    if (typeof boardId === 'number' && boardId > 0) {
      currentBoard.setId(boardId);
      try {
        await apiClient.get(`/board/${boardId}/full`);
      } catch (_) {
        /* noop */
      }
    }

    // Set active chat if created during registration
    const chatId = resp.data?.homeChatId as number | undefined;
    if (typeof chatId === 'number' && chatId > 0) {
      useChatStore.getState().setActiveChatId(chatId);
    }

    // Client-only registration time for YM `active` (registration_date / retention); not from API.
    if (restoredUserId) {
      setClientRegistrationTimestamp(restoredUserId);
    }
    trackYMEvent('registration_completed', getYmSidebarEngagementParams());

    return { accessToken: access, refreshToken: refresh };
  },

  async devLogin(
    email?: string
  ): Promise<{ accessToken: string; refreshToken?: string }> {
    const resp = await apiClient.post(
      '/auth/dev-login',
      email ? { email } : {}
    );
    const access = resp.data?.accessToken as string;
    const refresh = resp.data?.refreshToken as string | undefined;
    if (!access) throw new Error('Empty access token');

    useAuthStore.getState().setAuth(access, refresh);
    await useAuthStore.getState().restoreAuth();

    await flushAttributionAfterAuth('login');

    const boardId = resp.data?.homeBoardId as number | undefined;
    if (typeof boardId === 'number' && boardId > 0) currentBoard.setId(boardId);

    const chatId = resp.data?.homeChatId as number | undefined;
    if (typeof chatId === 'number' && chatId > 0) {
      useChatStore.getState().setActiveChatId(chatId);
    }

    // dev quick login counts as login for analytics
    trackYMEvent('login', getYmSidebarEngagementParams());

    return { accessToken: access, refreshToken: refresh };
  },

  async logout(): Promise<void> {
    const refresh = useAuthStore.getState().refreshToken;
    try {
      if (refresh)
        await apiClient.post('/auth/logout', { refreshToken: refresh });
    } finally {
      // Logout goal must run before clearAuth / closeAll so user_id and sidebar flags stay accurate.
      trackYMEvent('logout', {
        session_closed: new Date().toISOString(),
        ...getYmSidebarEngagementParams(),
      });
      useAuthStore.getState().clearAuth();
      useChatStore.getState().closeAll();
      useOnboardingUIStore.getState().resetStepState();
    }
  },

  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
  }): Promise<{ success: boolean }> {
    const resp = await apiClient.put('/auth/me', data);
    return resp.data;
  },

  async uploadAvatar(
    file: Blob,
    signal?: AbortSignal
  ): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file, 'avatar.jpg');
    const resp = await apiClient.post('/auth/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      signal,
    });
    return resp.data;
  },

  async deleteAvatar(): Promise<{ success: boolean }> {
    const resp = await apiClient.delete('/auth/me/avatar');
    return resp.data;
  },

  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean }> {
    const resp = await apiClient.put('/auth/me/password', {
      oldPassword,
      newPassword,
    });
    return resp.data;
  },

  async deleteAccount(email: string): Promise<{ success: boolean }> {
    const resp = await apiClient.delete('/auth/me', { data: { email } });
    return resp.data;
  },
};
