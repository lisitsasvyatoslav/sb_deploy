import { ONBOARDING_SCENES, ONBOARDING_TOTAL_STEPS } from '../constants';
import type { OnboardingScene } from '../types';

/** Build the checkedSteps key for a given scene + step index. */
export function getStepKey(sceneIndex: number, stepIndex: number): string {
  return `${sceneIndex}-${stepIndex}`;
}

/** Check whether a step is marked as checked in the store's checkedSteps map. */
export function isStepChecked(
  checkedSteps: Record<string, boolean>,
  sceneIndex: number,
  stepIndex: number
): boolean {
  return !!checkedSteps[getStepKey(sceneIndex, stepIndex)];
}

/** Resolve the effective highlight target: step-level overrides scene-level. */
export function resolveHighlightTarget(
  scene: OnboardingScene,
  stepHighlightTarget?: string
): string | undefined {
  return stepHighlightTarget ?? scene.highlightTarget;
}

/**
 * Determine whether a step is locked based on scene-specific gating rules.
 *
 * - Scene 4: steps 2-3 locked until user is on a board page (/ideas/{id})
 */
export function isStepLocked(opts: {
  sceneId: number;
  stepIndex: number;
  pathname: string | null;
}): boolean {
  const { sceneId, stepIndex, pathname } = opts;

  if (sceneId === 4 && stepIndex > 0 && !/^\/ideas\/\d+/.test(pathname ?? '')) {
    return true;
  }

  return false;
}

/**
 * Find the highlight target for the next actionable step in the current scene.
 *
 * Walks the step list and returns the resolved highlight target for the first
 * step that is both unchecked AND unlocked. Returns `null` when all steps
 * are checked or when no unlocked step has a highlight target.
 */
export function getNextHighlightTarget(opts: {
  scene: OnboardingScene;
  activeSceneIndex: number;
  checkedSteps: Record<string, boolean>;
  pathname: string | null;
}): string | null {
  const { scene, activeSceneIndex, checkedSteps, pathname } = opts;

  for (let i = 0; i < scene.steps.length; i++) {
    if (isStepChecked(checkedSteps, activeSceneIndex, i)) continue;

    const locked = isStepLocked({
      sceneId: scene.id,
      stepIndex: i,
      pathname,
    });
    if (locked) continue;

    const target = resolveHighlightTarget(
      scene,
      scene.steps[i].highlightTarget
    );
    return target ?? null;
  }

  // All steps checked — fall back to scene-level highlight so the relevant
  // area stays visible until the user advances to the next scene.
  return scene.highlightTarget ?? null;
}

/**
 * Count how many onboarding steps the user has checked off.
 *
 * `checkedSteps` is server-synced (via useOnboardingProgressSync), so it's
 * the single source of truth for completion — including unchecking. We just
 * count entries that map to a valid (sceneIdx, stepIdx) pair in the current
 * scene configuration so renamed/removed steps from old data don't inflate
 * the total.
 */
export function computeCompletedSteps(
  checkedSteps: Record<string, boolean>
): number {
  let count = 0;
  for (const [key, checked] of Object.entries(checkedSteps)) {
    if (!checked) continue;
    const [sceneIdxStr, stepIdxStr] = key.split('-');
    const sceneIdx = Number.parseInt(sceneIdxStr, 10);
    const stepIdx = Number.parseInt(stepIdxStr, 10);
    const scene = ONBOARDING_SCENES[sceneIdx];
    if (
      !scene ||
      !Number.isInteger(stepIdx) ||
      stepIdx < 0 ||
      stepIdx >= scene.steps.length
    )
      continue;
    count += 1;
  }
  return Math.min(count, ONBOARDING_TOTAL_STEPS);
}
