import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { useOnboardingUIStore } from '../stores/onboardingUIStore';
import { useOnboardingUIStoreHydrated } from './useOnboardingUIStoreHydrated';

const DOCKED_ROUTES = ['/', '/ideas', '/strategies', '/portfolio'];

/**
 * Automatically sets the widget mode based on the current route:
 * - Board / portfolio / strategy pages → docked (right sidebar)
 * - All other pages → floating overlay
 *
 * Routes are matched as exact path OR prefix followed by "/", so
 * `/ideas` and `/ideas/123` both dock but `/ideas-foo` does not.
 *
 * Honours the persisted widgetMode on initial mount: only writes when
 * the user *navigates* to a different route after hydration. The
 * hydration gate is the load-bearing part — without it, a re-mount
 * (Strict Mode, Suspense, layout reorder) could re-initialise the
 * pathname ref and overwrite the persisted mode against the rehydrated
 * value.
 */
export function useOnboardingAutoMode() {
  const pathname = usePathname();
  const setWidgetMode = useOnboardingUIStore((s) => s.setWidgetMode);
  const hydrated = useOnboardingUIStoreHydrated();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Don't touch widgetMode until the persisted value is in place,
    // otherwise we'll race the rehydration and clobber it.
    if (!hydrated) return;

    // First post-hydration run: capture the pathname as the baseline
    // and DON'T write — the persisted mode is authoritative.
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return;
    }

    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;

    const isDocked = DOCKED_ROUTES.some(
      (r) => pathname === r || pathname.startsWith(r + '/')
    );
    setWidgetMode(isDocked ? 'docked' : 'floating');
  }, [hydrated, pathname, setWidgetMode]);
}
