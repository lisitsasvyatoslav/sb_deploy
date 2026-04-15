import { apiClient } from './client';

export const chartExportApi = {
  exportJson: async (cardId: number, pitch?: string) => {
    const params: Record<string, string> = {};
    if (pitch) params.pitch = pitch;
    const response = await apiClient.get(`/chart-export/${cardId}/json`, {
      params,
    });
    return response.data;
  },

  exportCsv: async (
    cardId: number,
    pitch?: string
  ): Promise<{ blob: Blob; filename: string }> => {
    const params: Record<string, string> = {};
    if (pitch) params.pitch = pitch;
    const response = await apiClient.get(`/chart-export/${cardId}/csv`, {
      params,
      responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'] || '';
    // Prefer RFC 5987 filename* (URL-encoded original) over plain filename (ASCII-sanitized)
    const rfc5987Match = disposition.match(/filename\*=UTF-8''([^;\n]+)/);
    const plainMatch = disposition.match(/(?<!\*)filename="?([^";\n]+)"?/);
    const filename = rfc5987Match
      ? decodeURIComponent(rfc5987Match[1])
      : plainMatch?.[1] || '';

    return { blob: response.data, filename };
  },
};
