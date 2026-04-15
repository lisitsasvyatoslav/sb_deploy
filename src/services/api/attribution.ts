import { apiClient } from '@/services/api/client';
import type { AttributionEventPayload } from '@/types/attribution';

export const attributionApi = {
  /**
   * Batch post attribution events (requires JWT). Returns true on 2xx.
   */
  postEvents: async (events: AttributionEventPayload[]): Promise<boolean> => {
    if (!events.length) return true;
    try {
      await apiClient.post('/attribution/events', { events });
      return true;
    } catch {
      return false;
    }
  },
};
