import { create } from 'zustand';
import { cookieStorage } from '@/shared/utils/cookies';
import { logger } from '@/shared/utils/logger';
import { apiClient } from '@/services/api/client';
import * as Sentry from '@sentry/react';
import {
  clearClientRegistrationTimestamp,
  clearYmActiveSessionSentFlag,
} from '@/shared/utils/ymEngagement';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: string | null;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  setAuth: (accessToken: string, refreshToken?: string, email?: string) => void;
  updateTokens: (accessToken: string, refreshToken?: string) => void;
  clearAuth: () => void;
  /** Resolves to `userId` after a successful `/auth/me` (store is updated synchronously in the same tick). */
  restoreAuth: (skipIfLoaded?: boolean) => Promise<string | null>;
  setLoading: (loading: boolean) => void;
  setCurrentUser: (email: string | null) => void;
  setAvatarUrl: (url: string | null) => void;
  setProfile: (data: { firstName?: string; lastName?: string }) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  currentUser: null,
  userId: null,
  firstName: null,
  lastName: null,
  avatarUrl: null,
  isLoading: true,
  accessToken: null,
  refreshToken: null,

  setAuth: (accessToken: string, refreshToken?: string, email?: string) => {
    cookieStorage.setTokens(accessToken, refreshToken);

    // Set user context for GlitchTip/Sentry error tracking
    if (email) {
      Sentry.setUser({ email });
    }

    set({
      isAuthenticated: true,
      currentUser: email || null,
      accessToken,
      refreshToken: refreshToken || null,
    });
  },

  updateTokens: (accessToken: string, refreshToken?: string) => {
    cookieStorage.setTokens(accessToken, refreshToken);
    set({
      isAuthenticated: true,
      accessToken,
      refreshToken: refreshToken || null,
    });
  },

  clearAuth: () => {
    const previousUserId = useAuthStore.getState().userId;
    // YM: drop per-user registration marker and allow `active` to fire on next login.
    clearClientRegistrationTimestamp(previousUserId);
    clearYmActiveSessionSentFlag();

    cookieStorage.clearTokens();

    // Clear board selection from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_board_id');
    }

    // Clear user context from GlitchTip/Sentry
    Sentry.setUser(null);

    set({
      isAuthenticated: false,
      currentUser: null,
      userId: null,
      firstName: null,
      lastName: null,
      avatarUrl: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  restoreAuth: async (skipIfLoaded = false): Promise<string | null> => {
    const state = useAuthStore.getState();

    // Если данные уже загружены и skipIfLoaded = true, пропускаем
    if (
      skipIfLoaded &&
      state.isAuthenticated &&
      state.currentUser &&
      !state.isLoading
    ) {
      return state.userId;
    }

    const accessToken = cookieStorage.getAccessToken();
    const refreshToken = cookieStorage.getRefreshToken();

    if (accessToken) {
      // Получаем актуальные данные пользователя с сервера
      set({
        isAuthenticated: true,
        accessToken,
        refreshToken: refreshToken || null,
        isLoading: true,
      });

      try {
        interface MeResponse {
          userId?: string;
          email?: string;
          firstName?: string;
          lastName?: string;
          avatarUrl?: string;
          oauthAvatarUrl?: string;
        }

        const meResp = await apiClient.get<MeResponse>('/auth/me');
        const {
          userId,
          email,
          firstName,
          lastName,
          avatarUrl,
          oauthAvatarUrl,
        } = meResp.data ?? {};

        const resolvedUserId = userId ?? null;

        // Set user context for GlitchTip/Sentry error tracking
        if (email) {
          Sentry.setUser({ email });
        }

        set({
          currentUser: email ?? null,
          userId: resolvedUserId,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
          avatarUrl: avatarUrl ?? oauthAvatarUrl ?? null,
          isLoading: false,
        });
        return resolvedUserId;
      } catch (err) {
        // Если не удалось получить данные, возможно токен невалиден
        const isAuthError =
          err instanceof Error &&
          'response' in err &&
          (err as { response?: { status?: number } }).response?.status === 401;

        if (isAuthError) {
          // Только при 401 разлогиниваем
          set({
            isAuthenticated: false,
            currentUser: null,
            userId: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
          });
        } else {
          // Для других ошибок оставляем залогиненным но без email
          logger.warn('authStore', 'Failed to fetch user profile', err);
          set({
            currentUser: null,
            userId: null,
            isLoading: false,
          });
        }
        return null;
      }
    }

    set({
      isAuthenticated: false,
      currentUser: null,
      userId: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
    });
    return null;
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setCurrentUser: (email: string | null) => {
    set({ currentUser: email });
  },

  setAvatarUrl: (url: string | null) => {
    set({ avatarUrl: url });
  },

  setProfile: (data: { firstName?: string; lastName?: string }) => {
    set(data);
  },
}));
