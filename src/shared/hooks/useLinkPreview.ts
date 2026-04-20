import { useEffect, useState } from 'react';
import {
  fetchLinkPreview,
  type LinkPreviewData,
} from '@/shared/utils/linkPreview';

export function useLinkPreview(url: string | null) {
  const [data, setData] = useState<LinkPreviewData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(!!url);

  useEffect(() => {
    if (!url) {
      setData(undefined);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    fetchLinkPreview(url)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, isLoading };
}
