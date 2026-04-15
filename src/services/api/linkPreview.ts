import { apiClient } from '@/services/api/client';

export interface LinkPreviewData {
  url: string;
  domain: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
}

export async function fetchLinkPreview(url: string): Promise<LinkPreviewData> {
  const { data } = await apiClient.get<LinkPreviewData>('/link-preview', {
    params: { url },
  });
  return data;
}
