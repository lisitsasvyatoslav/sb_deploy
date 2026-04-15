'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api/client';
import { logger } from '@/shared/utils/logger';

interface UseLegalDocResult {
  content: string;
  loading: boolean;
  error: string | null;
}

export function useLegalDoc(
  apiPath: string,
  errorMessage: string
): UseLegalDocResult {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await apiClient.get<string>(apiPath);
        if (!cancelled) setContent(res.data);
      } catch (err: unknown) {
        logger.error('useLegalDoc', `Failed to load ${apiPath}`, err);
        if (!cancelled) setError(errorMessage);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [apiPath, errorMessage]);

  return { content, loading, error };
}
