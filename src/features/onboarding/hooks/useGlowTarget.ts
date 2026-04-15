import { useOnboardingUIStore } from '../stores/onboardingUIStore';

/**
 * Returns true when the onboarding guide is open and the given
 * highlight target (or one of several targets) is active.
 *
 * Replaces the repeated `isGuideOpen && activeHighlightTarget === 'x'`
 * pattern used across integration points.
 */
export function useGlowTarget(target: string | string[]): boolean {
  const isGuideOpen = useOnboardingUIStore((s) => s.isGuideOpen);
  const activeHighlightTarget = useOnboardingUIStore(
    (s) => s.activeHighlightTarget
  );

  if (!isGuideOpen || !activeHighlightTarget) return false;

  if (Array.isArray(target)) {
    return target.includes(activeHighlightTarget);
  }

  return activeHighlightTarget === target;
}
