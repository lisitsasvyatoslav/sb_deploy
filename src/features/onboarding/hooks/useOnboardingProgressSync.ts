'use client';

import { useEffect, useRef } from 'react';

import { useOnboardingUIStore } from '../stores/onboardingUIStore';
import type { OnboardingProgressPatch } from '../types';
import { useOnboardingProgress } from './useOnboardingProgress';

const DEBOUNCE_MS = 500;

type ProgressBaseline = {
  checkedSteps: Record<string, boolean>;
  activeSceneIndex: number;
  surveyCompleted: boolean;
};

function baselineEquals(a: ProgressBaseline, b: ProgressBaseline): boolean {
  return (
    a.activeSceneIndex === b.activeSceneIndex &&
    a.surveyCompleted === b.surveyCompleted &&
    JSON.stringify(a.checkedSteps) === JSON.stringify(b.checkedSteps)
  );
}

/**
 * Bridges server-side onboarding progress with the local Zustand store.
 *
 * - **Server → Store** (hydration): whenever the server response differs
 *   from the last *server-confirmed* values we know about, the store is
 *   overwritten. Runs on initial mount and after any external change
 *   (manual reset, account switch, etc.).
 * - **Store → Server** (write-through): every local mutation of
 *   checkedSteps / activeSceneIndex / surveyCompleted is debounced and
 *   PATCHed back to the server. The baseline is only advanced *after*
 *   the server confirms the new values — never optimistically — so a
 *   concurrent stale cache write from a different mutation (e.g.
 *   `markSceneViewed`) cannot trip the hydration into rolling local
 *   state back.
 *
 * Per-device UI preferences (widgetMode, widgetPosition, widgetSize,
 * dockedWidth) intentionally stay in localStorage and are NOT synced.
 */
export function useOnboardingProgressSync() {
  const { data, updateProgress } = useOnboardingProgress();
  const setCheckedSteps = useOnboardingUIStore((s) => s.setCheckedSteps);
  const setActiveSceneIndex = useOnboardingUIStore(
    (s) => s.setActiveSceneIndex
  );
  const setSurveyCompleted = useOnboardingUIStore((s) => s.setSurveyCompleted);

  // Server-confirmed baseline. Updated by:
  //   1. Hydration (server data diverges from current baseline)
  //   2. Successful PATCH response (write-through completes)
  // NEVER updated optimistically by the store subscriber.
  const lastKnownServer = useRef<ProgressBaseline | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Server → Store: hydrate the store whenever server data diverges
  // from the confirmed baseline.
  useEffect(() => {
    if (!data) return;

    const next: ProgressBaseline = {
      checkedSteps: data.checkedSteps,
      activeSceneIndex: data.activeSceneIndex,
      surveyCompleted: data.surveyCompleted,
    };

    if (
      lastKnownServer.current &&
      baselineEquals(lastKnownServer.current, next)
    ) {
      return;
    }

    // Capture the new baseline FIRST so the store-subscriber below sees
    // matching values when we write into the store and skips the
    // write-through.
    lastKnownServer.current = next;

    setCheckedSteps(next.checkedSteps);
    setActiveSceneIndex(next.activeSceneIndex);
    setSurveyCompleted(next.surveyCompleted);
  }, [data, setCheckedSteps, setActiveSceneIndex, setSurveyCompleted]);

  // Store → Server: subscribe to local changes; reschedule a single
  // debounced PATCH that always sends the LATEST state at fire time.
  useEffect(() => {
    const unsubscribe = useOnboardingUIStore.subscribe((state, prevState) => {
      // Don't push anything until we've seen the server at least once —
      // otherwise we might overwrite real progress with empty defaults.
      if (lastKnownServer.current === null) return;

      // Only react to changes in the three synced fields. Anything else
      // (transient UI state, highlight target, etc.) shouldn't reset the
      // debounce.
      if (
        state.checkedSteps === prevState.checkedSteps &&
        state.activeSceneIndex === prevState.activeSceneIndex &&
        state.surveyCompleted === prevState.surveyCompleted
      ) {
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        // Recompute the patch at fire time using the LATEST store state
        // and the LATEST baseline. This handles the case where the user
        // toggled something then toggled it back — the patch becomes
        // empty and no PATCH is sent.
        const baseline = lastKnownServer.current;
        if (!baseline) return;

        const latest = useOnboardingUIStore.getState();
        const patch: OnboardingProgressPatch = {};

        if (
          JSON.stringify(latest.checkedSteps) !==
          JSON.stringify(baseline.checkedSteps)
        ) {
          patch.checkedSteps = latest.checkedSteps;
        }
        if (latest.activeSceneIndex !== baseline.activeSceneIndex) {
          patch.activeSceneIndex = latest.activeSceneIndex;
        }
        if (latest.surveyCompleted !== baseline.surveyCompleted) {
          patch.surveyCompleted = latest.surveyCompleted;
        }

        if (Object.keys(patch).length === 0) return;

        updateProgress(patch, {
          // Advance the baseline ONLY after the server confirms.
          // The global onSuccess (in useOnboardingProgress) updates the
          // React Query cache; this inline callback runs after it.
          onSuccess: (updated) => {
            lastKnownServer.current = {
              checkedSteps: updated.checkedSteps,
              activeSceneIndex: updated.activeSceneIndex,
              surveyCompleted: updated.surveyCompleted,
            };
          },
        });
      }, DEBOUNCE_MS);
    });

    // Single cleanup: unsubscribe AND drop any pending debounced write.
    return () => {
      unsubscribe();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [updateProgress]);
}
