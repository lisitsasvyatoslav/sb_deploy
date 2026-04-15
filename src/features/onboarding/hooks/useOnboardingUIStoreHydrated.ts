import { useSyncExternalStore } from 'react';

import { useOnboardingUIStore } from '../stores/onboardingUIStore';

/**
 * Returns `true` once the onboarding UI store has finished rehydrating
 * from localStorage. Stays `true` synchronously if hydration completed
 * before this component mounted. Safe for SSR (server snapshot returns
 * `false`, so any effect gated on this won't fire on the server).
 *
 * Use this anywhere a write to the onboarding store could race against
 * Zustand's async rehydration — e.g. the auto-open effect or the
 * route-driven auto-mode. Without it the write can land on the default
 * state and then be silently overwritten when localStorage finally loads.
 */
export function useOnboardingUIStoreHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) =>
      useOnboardingUIStore.persist.onFinishHydration(() => onStoreChange()),
    () => useOnboardingUIStore.persist.hasHydrated(),
    () => false
  );
}
