import type {
  StrategyBinding,
  StrategyBindingInitResponse,
  StrategyBindingWithDetails,
} from '@/types/strategyBinding';
import { isStrategiesCatalogEnabled } from '@/shared/hooks/useDevStrategyCatalog';

// TODO [MOCK]: This entire file contains mock implementations.
// After backend implementation (TD-983 — init, TD-985 — list/bind):
// 1. Uncomment real apiClient calls
// 2. Remove mock imports and mock logic
// 3. Remove artificial delays
// import { apiClient } from '@/services/api/client';

function assertStrategiesCatalogEnabled(): void {
  if (!isStrategiesCatalogEnabled()) {
    throw new Error(
      'Strategy binding API is unavailable: strategies catalog feature flag is off'
    );
  }
}

export const strategyBindingApi = {
  /**
   * Initiate strategy binding.
   * Backend returns a URL to redirect to comon.ru.
   *
   * TODO [MOCK]: Replace with real call:
   * const response = await apiClient.post<{ data: StrategyBindingInitResponse }>(
   *   '/strategies/binding/init'
   * );
   * return response.data.data;
   */
  async initBinding(): Promise<StrategyBindingInitResponse> {
    assertStrategiesCatalogEnabled();
    // TODO [MOCK]: Replace with real POST /api/strategies/binding/init
    const mockToken = `mock-binding-token-${Date.now()}`;
    const callbackUrl = `${window.location.origin}/strategies/bind/callback`;
    return {
      comonRedirectUrl: `${window.location.origin}/strategies/bind/mock-comon?token=${mockToken}&callback=${encodeURIComponent(callbackUrl)}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  },

  /**
   * Fetch list of bound strategies.
   *
   * TODO [MOCK]: Replace with real call:
   * const response = await apiClient.get<{ data: StrategyBinding[] }>(
   *   '/strategies/binding/list'
   * );
   * return response.data.data;
   */
  async listBindings(): Promise<StrategyBinding[]> {
    assertStrategiesCatalogEnabled();
    const { getMockBindings } =
      await import('@/features/strategy-binding/mock/data');
    // TODO [MOCK]: Replace with real GET /api/strategies/binding/list
    return getMockBindings();
  },

  /**
   * Fetch bindings with strategy details (for UI).
   *
   * TODO [MOCK]: After backend implementation — may merge
   * with the list endpoint if the backend returns strategy details,
   * or issue an additional request for details.
   */
  async listBindingsWithDetails(): Promise<StrategyBindingWithDetails[]> {
    assertStrategiesCatalogEnabled();
    const { getMockBindingsWithDetails } =
      await import('@/features/strategy-binding/mock/data');
    // TODO [MOCK]: Replace with real request including strategy details
    return getMockBindingsWithDetails();
  },
};
