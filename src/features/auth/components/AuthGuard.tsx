'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Navigate } from '@/shared/ui/Navigation';
import { cookieStorage } from '@/shared/utils/cookies';
import { useAuthStore } from '@/stores/authStore';
import { refreshAccessToken } from '@/services/api/tokenRefresh';
import { logger } from '@/shared/utils/logger';
import { YmActiveSessionTracker } from '@/features/auth/components/YmActiveSessionTracker';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  // Re-check token validity on every render/navigation
  usePathname();

  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshingRef = useRef(false);
  const failedRef = useRef(false);

  const isValid =
    typeof window === 'undefined' || cookieStorage.isAccessTokenValid();
  const hasRefreshToken =
    typeof window !== 'undefined' && !!cookieStorage.getRefreshToken();

  useEffect(() => {
    if (
      !isValid &&
      hasRefreshToken &&
      !refreshingRef.current &&
      !failedRef.current
    ) {
      refreshingRef.current = true;
      refreshAccessToken()
        .catch((error) => {
          logger.error('AuthGuard', 'Token refresh failed', error);
          failedRef.current = true;
          useAuthStore.getState().clearAuth();
        })
        .finally(() => {
          refreshingRef.current = false;
        });
    }
    // accessToken in deps: re-trigger check when store updates after successful refresh
  }, [isValid, hasRefreshToken, accessToken]);

  // Reset failure flag when token becomes valid (e.g., user logs in again)
  useEffect(() => {
    if (isValid) {
      failedRef.current = false;
    }
  }, [isValid]);

  // Render children when: SSR, token valid, or refresh in progress (no flicker)
  if (
    typeof window === 'undefined' ||
    isValid ||
    (hasRefreshToken && !failedRef.current)
  ) {
    return (
      <>
        {/* YM `active` — only meaningful when this guard allows authenticated app shell */}
        <YmActiveSessionTracker />
        {children}
      </>
    );
  }

  // No refresh token or refresh failed — redirect to login
  return <Navigate to="/login" replace />;
};

export default AuthGuard;
