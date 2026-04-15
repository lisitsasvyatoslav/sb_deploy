import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getTokenExpiryMs } from '@/shared/utils/cookies';
import { refreshAccessToken } from '@/services/api/tokenRefresh';

const REFRESH_BEFORE_EXPIRY_MS = 2 * 60 * 1000; // Refresh 2 minutes before expiry
const MIN_REFRESH_DELAY_MS = 10_000; // Minimum delay to avoid spamming with short-lived tokens

/**
 * Proactively refreshes the access token before it expires.
 * Schedules a setTimeout based on the JWT exp claim.
 * Self-renewing: each successful refresh updates accessToken in the store,
 * which triggers the useEffect to schedule a new timer for the new token.
 */
export function useProactiveTokenRefresh() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!accessToken) return;

    const timeUntilExpiryMs = getTokenExpiryMs(accessToken);
    if (timeUntilExpiryMs === null) return;

    const refreshInMs = timeUntilExpiryMs - REFRESH_BEFORE_EXPIRY_MS;

    if (refreshInMs <= 0) {
      // Token already within the refresh window — schedule with a minimum delay
      // to avoid hammering the server when tokens are very short-lived
      timerRef.current = setTimeout(
        () => void refreshAccessToken(),
        Math.max(MIN_REFRESH_DELAY_MS, timeUntilExpiryMs / 2)
      );
    } else {
      timerRef.current = setTimeout(
        () => void refreshAccessToken(),
        refreshInMs
      );
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [accessToken]);
}
