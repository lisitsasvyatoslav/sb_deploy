'use client';

import AddBrokerDialog from '@/features/broker/components/AddBrokerDialog';
import TickerPickerModal from '@/features/ticker/components/TickerPickerModal';
import TickerInfoModal from '@/features/ticker/components/TickerInfoModal';
import AddNewsAnalyticsModal from '@/features/ticker/components/AddNewsAnalyticsModal';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { Loading } from '@/shared/ui/Loading';
import { useAuthStore } from '@/stores/authStore';
import { useProactiveTokenRefresh } from '@/shared/hooks';
import { useEffect } from 'react';

/**
 * Settings Layout - for settings pages (Profile, etc.)
 * Full-width layout; each page manages its own internal navigation.
 */
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, restoreAuth } = useAuthStore();

  // Proactively refresh access token before it expires
  useProactiveTokenRefresh();

  // Restore auth on mount
  useEffect(() => {
    restoreAuth(true);
  }, [restoreAuth]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <AuthGuard>
      <div
        className="h-screen flex flex-col"
        style={{ backgroundColor: 'var(--bg-base)' }}
      >
        {children}

        <TickerPickerModal />
        <TickerInfoModal />
        <AddNewsAnalyticsModal />
        <AddBrokerDialog />
      </div>
    </AuthGuard>
  );
}
