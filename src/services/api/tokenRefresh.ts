import { cookieStorage } from '@/shared/utils/cookies';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from './client';

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value: void | PromiseLike<void>) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Single source of truth for token refresh.
 * Prevents concurrent refresh attempts via queue.
 * Updates cookies + Zustand store on success; throws on failure (caller decides cleanup).
 * Used by: Axios interceptor, AuthGuard, SSE, chat streaming, pipeline streaming.
 */
export async function refreshAccessToken(): Promise<void> {
  if (isRefreshing) {
    return new Promise<void>((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    });
  }
  isRefreshing = true;
  try {
    const refresh = cookieStorage.getRefreshToken();
    if (!refresh) throw new Error('No refresh token');

    const resp = await apiClient.post('/auth/refresh', {
      refreshToken: refresh,
    });
    const newAccess: string = resp.data?.accessToken;
    const newRefresh: string | undefined = resp.data?.refreshToken;
    if (!newAccess) throw new Error('No access token in refresh response');

    useAuthStore.getState().updateTokens(newAccess, newRefresh);

    pendingQueue.forEach((p) => p.resolve());
    pendingQueue = [];
  } catch (e) {
    // Don't call clearAuth() here — let each caller decide how to handle failure.
    // Axios interceptor and AuthGuard handle cleanup; non-critical callers (SSE,
    // proactive timer) catch silently so a transient failure doesn't cause logout.
    pendingQueue.forEach((p) => p.reject(e));
    pendingQueue = [];
    throw e;
  } finally {
    isRefreshing = false;
  }
}

/**
 * Wrapper for native fetch() with automatic token refresh on 401.
 * For use by streaming endpoints (chat, pipeline) that bypass Axios.
 */
export async function fetchWithTokenRefresh(
  fetchFn: (token: string | null) => Promise<Response>
): Promise<Response> {
  const token = cookieStorage.getAccessToken() || null;
  const response = await fetchFn(token);

  if (response.status === 401) {
    try {
      await refreshAccessToken();
    } catch {
      return response;
    }
    const newToken = cookieStorage.getAccessToken() || null;
    return fetchFn(newToken);
  }

  return response;
}
