import { useQuery } from '@tanstack/react-query';
import {
  fetchLinkPreview,
  type LinkPreviewData,
} from '@/services/api/linkPreview';

export function useLinkPreview(url: string | null) {
  return useQuery<LinkPreviewData>({
    queryKey: ['link-preview', url],
    queryFn: () => fetchLinkPreview(url!),
    enabled: !!url,
    staleTime: 1000 * 60 * 60, // 1 hour — OG data rarely changes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours — keep in client cache
    retry: false,
  });
}
