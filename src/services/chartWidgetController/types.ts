import type { TxChartInstrument } from '@/types/txchart';

/** AI-injected instrument — extends TxChartInstrument with pattern tracking */
export interface AiInstrument extends TxChartInstrument {
  _aiPatternId?: string;
  points: { list: Array<{ pos: { date: number; value: number } }> };
}

/** Card-level data the controller needs (subset of Card) */
export type ChartCardData = {
  id: number;
  boardId: number;
  meta: {
    security_id?: number;
    pitch?: string;
    chartState?: unknown;
    aiInstruments?: unknown[];
    [key: string]: unknown;
  };
};

/** Theme as the controller understands it */
export type ChartTheme = 'dark' | 'light';

/** Semantic error codes passed to onError — component maps them to i18n keys */
export type ChartErrorCode = 'load_timeout' | 'auth_error' | 'load_failed';

/** Options for creating the controller */
export type ChartWidgetControllerOptions = {
  container: HTMLDivElement;
  containerId: string;
  card: ChartCardData;
  theme: ChartTheme;
  /** Persist state via React Query mutation */
  onSave: (cardId: number, meta: Record<string, unknown>) => void;
  /** Persist state via keepalive fetch (survives page unload) */
  onSaveKeepalive: (cardId: number, meta: Record<string, unknown>) => void;
  onMounted: () => void;
  onLoadingChange: (loading: boolean) => void;
  onError: (code: ChartErrorCode, detail?: string) => void;
};
