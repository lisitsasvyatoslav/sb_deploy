import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

import type { Card } from '@/types';
import { cookieStorage } from '@/shared/utils/cookies';
import { API_BASE_URL_EXPORT } from '@/services/api/client';
import {
  ChartWidgetController,
  type ChartCardData,
  type ChartErrorCode,
  type AiInstrument,
} from '@/services/chartWidgetController';
import { useUpdateCardMutation } from '@/features/board/queries';

type ChartError = {
  code: ChartErrorCode;
  detail?: string;
};

type UseChartWidgetOptions = {
  card: Card;
  containerId: string;
};

type UseChartWidgetResult = {
  containerRef: React.RefCallback<HTMLDivElement>;
  loading: boolean;
  mounted: boolean;
  error: ChartError | null;
};

export function useChartWidget({
  card,
  containerId,
}: UseChartWidgetOptions): UseChartWidgetResult {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ChartError | null>(null);

  const controllerRef = useRef<ChartWidgetController | null>(null);
  const cardRef = useRef(card);
  cardRef.current = card;

  const updateCardMutation = useUpdateCardMutation();
  const { resolvedTheme } = useTheme();
  const prevThemeRef = useRef(resolvedTheme);

  // Persistence callbacks stored in refs to keep containerRef stable.
  // handleSaveRef is updated every render so it always captures the latest updateCardMutation.
  const handleSaveRef = useRef<
    (cardId: number, meta: Record<string, unknown>) => void
  >(null!);
  handleSaveRef.current = (cardId, meta) => {
    updateCardMutation.mutate({
      id: cardId,
      data: { meta },
      boardId: cardRef.current.boardId,
      skipInvalidate: true,
    });
  };

  // Best-effort save using raw fetch with `keepalive: true` so the request
  // survives page unload (beforeunload / visibilitychange).  Axios and TanStack
  // Query don't support `keepalive`, hence the raw fetch.  Token is read
  // directly from cookie storage; if it's expired, the request silently fails —
  // acceptable for a last-chance save that the normal debounced save already covers.
  const handleSaveKeepaliveRef = useRef<
    (cardId: number, meta: Record<string, unknown>) => void
  >(null!);
  handleSaveKeepaliveRef.current = (cardId, meta) => {
    const token = cookieStorage.getAccessToken();
    fetch(`${API_BASE_URL_EXPORT}/card/${cardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ meta }),
      keepalive: true,
    }).catch(() => {
      /* best effort */
    });
  };

  // Ref callback — fires when the DOM node is attached
  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || controllerRef.current) return;

      const theme = prevThemeRef.current === 'dark' ? 'dark' : 'light';

      const controller = new ChartWidgetController({
        container: node,
        containerId,
        card: cardRef.current as ChartCardData,
        theme,
        onSave: (...args) => handleSaveRef.current(...args),
        onSaveKeepalive: (...args) => handleSaveKeepaliveRef.current(...args),
        onMounted: () => setMounted(true),
        onLoadingChange: (l) => setLoading(l),
        onError: (code, detail) => setError({ code, detail }),
      });

      controllerRef.current = controller;
      controller.init();
    },
    [containerId]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  // Keep card data up-to-date in the controller
  useEffect(() => {
    controllerRef.current?.updateCard(card as ChartCardData);
  }, [card]);

  // Flush save on tab blur
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) controllerRef.current?.saveState();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Keepalive save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Theme change → remount chart
  useEffect(() => {
    if (!controllerRef.current || !mounted) return;
    if (prevThemeRef.current === resolvedTheme) return;
    prevThemeRef.current = resolvedTheme;

    const newTheme = resolvedTheme === 'dark' ? 'dark' : 'light';
    controllerRef.current.changeTheme(newTheme).catch(() => {
      /* logged internally */
    });
  }, [resolvedTheme, mounted]);

  // AI instruments injection
  useEffect(() => {
    if (!controllerRef.current || !mounted) return;
    const aiInstruments = (card.meta?.aiInstruments || []) as AiInstrument[];
    controllerRef.current.injectAiInstruments(aiInstruments);
  }, [card.meta?.aiInstruments, mounted]);

  return { containerRef, loading, mounted, error };
}
