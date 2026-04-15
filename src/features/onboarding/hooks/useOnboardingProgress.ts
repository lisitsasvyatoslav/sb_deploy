import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '../api/onboarding';
import type { OnboardingProgress, OnboardingProgressPatch } from '../types';
import {
  ONBOARDING_COMPLETE_STEP,
  ONBOARDING_DISMISSED_STEP,
} from '../constants';

export const onboardingKeys = {
  all: ['onboarding'] as const,
  progress: () => [...onboardingKeys.all, 'progress'] as const,
};

export function useOnboardingProgress() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: onboardingKeys.progress(),
    queryFn: onboardingApi.getProgress,
    // Silent error: if the fetch fails, don't block the user
    retry: 1,
  });

  // markSceneViewed and dismiss only own the `step` / `isDismissed` fields
  // on the server. Their responses include the full state for convenience,
  // but the rich progress fields (checkedSteps, activeSceneIndex,
  // surveyCompleted) in those responses are STALE if a debounced PATCH
  // from useOnboardingProgressSync is still in flight. Merge only the
  // owned fields into the cache to avoid stomping fresh local changes.
  const mergeOwnedFields = (updated: OnboardingProgress) => {
    queryClient.setQueryData<OnboardingProgress>(
      onboardingKeys.progress(),
      (prev) =>
        prev
          ? { ...prev, step: updated.step, isDismissed: updated.isDismissed }
          : updated
    );
  };

  const markViewedMutation = useMutation({
    mutationFn: onboardingApi.markSceneViewed,
    onSuccess: mergeOwnedFields,
  });

  const dismissMutation = useMutation({
    mutationFn: onboardingApi.dismiss,
    onSuccess: mergeOwnedFields,
  });

  // reset is intentionally a full replace — the server clears every field,
  // and the hydration effect should write those zeroed values into the
  // local store.
  const resetMutation = useMutation({
    mutationFn: onboardingApi.reset,
    onSuccess: (updated) => {
      queryClient.setQueryData(onboardingKeys.progress(), updated);
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: (patch: OnboardingProgressPatch) =>
      onboardingApi.updateProgress(patch),
    // Optimistic: merge the patch into the cached progress immediately so the
    // UI doesn't wait on the round-trip. Roll back if the request fails.
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: onboardingKeys.progress() });
      const previous = queryClient.getQueryData<OnboardingProgress>(
        onboardingKeys.progress()
      );
      if (previous) {
        queryClient.setQueryData<OnboardingProgress>(
          onboardingKeys.progress(),
          { ...previous, ...patch }
        );
      }
      return { previous };
    },
    onError: (_err, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(onboardingKeys.progress(), context.previous);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(onboardingKeys.progress(), updated);
    },
  });

  const step = data?.step ?? 0;
  const isDismissed = step === ONBOARDING_DISMISSED_STEP;
  const isCompleted = step >= ONBOARDING_COMPLETE_STEP;
  // Show onboarding only when we have a successful server response
  // (prevents auto-opening for all users on API failure)
  const isActive = !!data && !isDismissed && !isCompleted;

  return {
    step,
    data,
    isLoading,
    isActive,
    isCompleted,
    isDismissed,
    markSceneViewed: markViewedMutation.mutate,
    dismiss: dismissMutation.mutate,
    reset: resetMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
  };
}
