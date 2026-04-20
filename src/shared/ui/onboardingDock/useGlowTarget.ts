import { useOnboardingUIStore } from './onboardingUIStore';

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
