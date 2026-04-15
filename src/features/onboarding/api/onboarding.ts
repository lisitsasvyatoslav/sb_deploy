import { apiClient } from '@/services/api/client';
import type { OnboardingProgress, OnboardingProgressPatch } from '../types';

export const onboardingApi = {
  async getProgress(): Promise<OnboardingProgress> {
    const resp = await apiClient.get('/onboarding/progress');
    return resp.data;
  },

  async markSceneViewed(scene: number): Promise<OnboardingProgress> {
    const resp = await apiClient.put('/onboarding/scene-viewed', { scene });
    return resp.data;
  },

  async updateProgress(
    patch: OnboardingProgressPatch
  ): Promise<OnboardingProgress> {
    const resp = await apiClient.patch('/onboarding/progress', patch);
    return resp.data;
  },

  async dismiss(): Promise<OnboardingProgress> {
    const resp = await apiClient.put('/onboarding/dismiss');
    return resp.data;
  },

  async reset(): Promise<OnboardingProgress> {
    const resp = await apiClient.put('/onboarding/reset');
    return resp.data;
  },
};
