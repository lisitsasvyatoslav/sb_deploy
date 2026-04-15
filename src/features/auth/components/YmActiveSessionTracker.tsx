'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { trackYMEvent } from '@/shared/hooks/useYandexMetrika';
import {
  getYmDeviceType,
  getYmSidebarEngagementParams,
  readClientRegistrationTimestamp,
  retentionDaysBetween,
  YM_ACTIVE_SESSION_STORAGE_KEY,
} from '@/shared/utils/ymEngagement';

/**
 * Product analytics: sends Yandex Metrika `active` once per browser tab after
 * the user profile is loaded. Uses sessionStorage so revisits in the same tab
 * do not duplicate the goal; cleared on logout via ymEngagement helpers.
 */
export function YmActiveSessionTracker() {
  const userId = useAuthStore((s) => s.userId);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    // Wait for /auth/me so user_id in the goal is not stale.
    if (!userId || isLoading || typeof window === 'undefined') return;

    try {
      if (sessionStorage.getItem(YM_ACTIVE_SESSION_STORAGE_KEY) === '1') return;
    } catch {
      return;
    }

    const session_started = new Date().toISOString();
    const registration_date = readClientRegistrationTimestamp(userId);

    const params = {
      session_started,
      ...getYmSidebarEngagementParams(),
      device: getYmDeviceType(),
      ...(registration_date
        ? {
            registration_date,
            retention: retentionDaysBetween(registration_date, session_started),
          }
        : {}),
    };

    trackYMEvent('active', params);

    try {
      sessionStorage.setItem(YM_ACTIVE_SESSION_STORAGE_KEY, '1');
    } catch {
      /* noop */
    }
  }, [userId, isLoading]);

  return null;
}
