import Cookies from 'js-cookie';
import { useAuthStore } from '@/stores/authStore';
import { LANGUAGE_COOKIE } from '@/shared/i18n/settings';
import { cookieStorage } from '@/shared/utils/cookies';
import { logger } from '@/shared/utils/logger';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface RetryableAxiosConfig extends InternalAxiosRequestConfig {
  retried?: boolean;
}
import * as Sentry from '@sentry/nextjs';

// Use NEXT_PUBLIC_ prefix for Next.js environment variables
const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;

declare global {
  interface Window {
    __API_BASE_URL__?: string;
  }
}
const PUBLIC_ROUTES = ['/login', '/welcome', '/register', '/forgot-password'];

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  paramsSerializer: {
    serialize: (params) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => searchParams.append(key, String(item)));
        } else if (value !== null && value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
      return searchParams.toString();
    },
  },
});

// Dev diagnostics
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.__API_BASE_URL__ = API_BASE_URL;
}

// JWT tokens helpers
export const authTokens = {
  set(access: string, refresh?: string) {
    cookieStorage.setTokens(access, refresh);
  },
  getAccess() {
    return cookieStorage.getAccessToken() || null;
  },
  getRefresh() {
    return cookieStorage.getRefreshToken() || null;
  },
  clear() {
    cookieStorage.clearTokens();
  },
};

// Current board helper
const CURRENT_BOARD_KEY = 'current_board_id';
export const currentBoard = {
  getId(): number | null {
    if (typeof window === 'undefined') return null;
    const v = localStorage.getItem(CURRENT_BOARD_KEY);
    return v ? Number(v) : null;
  },
  setId(id: number) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_BOARD_KEY, String(id));
    }
  },
};

export async function ensureBoardInitialized(): Promise<number> {
  const boardId = currentBoard.getId();
  if (boardId) return boardId;
  return 1; // fallback
}

// Authorization + locale interceptor
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = cookieStorage.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Send current UI locale so the backend can return localised content
  const locale = Cookies.get(LANGUAGE_COOKIE);
  if (locale) {
    config.headers['Accept-Language'] = locale;
  }
  return config;
});

// Response interceptor — uses shared refreshAccessToken from tokenRefresh.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableAxiosConfig;
    const status = error.response?.status;

    if (process.env.NODE_ENV === 'development') {
      let dataStr: string | undefined;
      try {
        const d: unknown = error.response?.data;
        dataStr = typeof d === 'string' ? d : JSON.stringify(d);
      } catch {
        dataStr = String(error.response?.data ?? '');
      }
      const method = original?.method?.toUpperCase() ?? '?';
      const url = original?.url ?? '?';
      logger.error(
        'apiClient',
        `API ${method} ${url} → ${status ?? 'no status'}: ${error.message ?? dataStr ?? 'unknown'}`,
        dataStr
      );
    }

    const skipRefresh =
      original?.url === '/auth/refresh' ||
      original?.url === '/auth/reset-password' ||
      original?.url === '/auth/forgot-password';

    // Network Error might be CORS-blocked 401 response
    // Only treat 401 as JWT auth error when the response message is the generic
    // Passport "Unauthorized" (or absent). Application-level 401s (e.g. invalid
    // broker credentials) carry a specific message and should NOT trigger refresh.
    const responseData = error.response?.data as
      | Record<string, unknown>
      | undefined;
    const hasAppMessage =
      responseData &&
      ((responseData.message && responseData.message !== 'Unauthorized') ||
        responseData.detail);
    const isGeneric401 = status === 401 && !hasAppMessage;
    const isAuthError =
      isGeneric401 || (error.message === 'Network Error' && !status);
    if (isAuthError && original && !original.retried && !skipRefresh) {
      original.retried = true;
      try {
        const { refreshAccessToken } = await import('./tokenRefresh');
        await refreshAccessToken();
        const newToken = cookieStorage.getAccessToken();
        if (newToken && original.headers) {
          original.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(original);
      } catch (e) {
        logger.error('apiClient', 'Refresh token failed, redirecting to login');
        cookieStorage.clearTokens();
        useAuthStore.getState().clearAuth();
        if (
          typeof window !== 'undefined' &&
          !PUBLIC_ROUTES.some((path) =>
            window.location.pathname.startsWith(path)
          )
        ) {
          window.location.href = '/login';
        }
        return Promise.reject(e);
      }
    }

    // Report non-auth errors to GlitchTip/Sentry (skip 401, 403, 404)
    const skipSentryStatuses = [401, 403, 404];
    if (status && !skipSentryStatuses.includes(status)) {
      Sentry.captureException(error, {
        extra: {
          url: original?.url,
          method: original?.method,
          status,
          responseData: error.response?.data,
        },
        tags: {
          api_error: 'true',
          status_code: String(status),
        },
      });
    } else if (!status && error.message !== 'Network Error') {
      // Capture network errors that aren't CORS-related auth issues
      Sentry.captureException(error, {
        extra: {
          url: original?.url,
          method: original?.method,
          message: error.message,
        },
        tags: {
          api_error: 'true',
          network_error: 'true',
        },
      });
    }

    throw error;
  }
);

export const API_BASE_URL_EXPORT = API_BASE_URL;
