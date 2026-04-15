import { apiClient } from '@/services/api/client';
import type { UtmData } from '@/shared/utils/utm';

export const analyticsApi = {
  /**
   * Send UTM attribution data to the backend.
   * Errors are intentionally swallowed — tracking must never break the app.
   */
  trackUtm: async (data: UtmData): Promise<void> => {
    try {
      await apiClient.post('/analytics/utm', data);
    } catch {
      // silent — tracking is non-critical
    }
  },
};
