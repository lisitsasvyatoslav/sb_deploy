import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { cookieStorage } from '@/shared/utils/cookies';
import { logger } from '@/shared/utils/logger';

interface RetryableAxiosConfig extends InternalAxiosRequestConfig {
  retried?: boolean;
}
import * as Sentry from '@sentry/nextjs';

const API_STRATEGIES_CATALOG_URL =
  'https://marketplace-api.changesandbox.ru/api/public/v1/strategies';

const PUBLIC_ROUTES = ['/login', '/welcome', '/register', '/forgot-password'];

declare global {
  interface Window {
    __API_STRATEGIES_CATALOG_URL__?: string;
  }
}

export const apiClientStrategiesCatalog = axios.create({
  baseURL: API_STRATEGIES_CATALOG_URL,
  headers: { 'Content-Type': 'application/json' },
  // withCredentials: true,
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
  window.__API_STRATEGIES_CATALOG_URL__ = API_STRATEGIES_CATALOG_URL;
}

// Authorization interceptor
apiClientStrategiesCatalog.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = cookieStorage.getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Response interceptor — uses shared refreshAccessToken from tokenRefresh.ts
apiClientStrategiesCatalog.interceptors.response.use(
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
      logger.error('apiClient', 'API Error', {
        message: error.message,
        status,
        baseURL: apiClientStrategiesCatalog.defaults.baseURL,
        url: original?.url,
        method: original?.method,
        data: dataStr,
      });
    }

    const skipRefresh = original?.url === '/auth/refresh';

    // Network Error might be CORS-blocked 401 response
    const isAuthError =
      status === 401 || (error.message === 'Network Error' && !status);
    if (isAuthError && original && !original.retried && !skipRefresh) {
      original.retried = true;
      try {
        const { refreshAccessToken } = await import('./tokenRefresh');
        await refreshAccessToken();
        const newToken = cookieStorage.getAccessToken();
        if (newToken && original.headers) {
          original.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClientStrategiesCatalog(original);
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
