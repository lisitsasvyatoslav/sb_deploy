'use client';

import { useEffect, useRef } from 'react';
import { trackYMEvent } from '@/shared/hooks/useYandexMetrika';
import { useOnboardingUIStore } from '../stores/onboardingUIStore';

/**
 * Fires Yandex Metrika `onboarding_started` when the product guide opens.
 * One event per open (dock/floating toggle keeps isGuideOpen true — no duplicate).
 */
export function useOnboardingGuideYmOpen() {
  const isGuideOpen = useOnboardingUIStore((s) => s.isGuideOpen);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isGuideOpen && !wasOpenRef.current) {
      trackYMEvent('onboarding_started', {
        started_time: new Date().toISOString(),
      });
    }
    wasOpenRef.current = isGuideOpen;
  }, [isGuideOpen]);
}
