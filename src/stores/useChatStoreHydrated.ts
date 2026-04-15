import { useSyncExternalStore } from 'react';
import { useChatStore } from '@/stores/chatStore';

/**
 * Returns `true` once the chat store has finished rehydrating from localStorage.
 * Stays `true` synchronously if hydration completed before this component mounted.
 * Safe for SSR (server snapshot returns `false`).
 */
export function useChatStoreHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) =>
      useChatStore.persist.onFinishHydration(() => onStoreChange()),
    () => useChatStore.persist.hasHydrated(),
    () => false
  );
}
