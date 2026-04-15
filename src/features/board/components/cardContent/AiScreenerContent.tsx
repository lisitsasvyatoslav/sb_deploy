import Button from '@/shared/ui/Button';
import { Dropdown } from '@/shared/ui/Dropdown';
import { Icon } from '@/shared/ui/Icon';
import Input from '@/shared/ui/Input';
import { useTranslation } from '@/shared/i18n/client';
import { useUpdateCardMutation } from '@/features/board/queries';
import { useCardResize } from '@/features/board/hooks/useCardResize';
import { useBoardStore } from '@/stores/boardStore';
import { tickersApi } from '@/services/api/tickers';
import type { ScreenerResult } from '@/services/api/tickers';
import { REGION } from '@/shared/config/region';
import React, { useCallback, useMemo, useState } from 'react';
import { AiScreenerResultsTable } from './AiScreenerResultsTable';

export interface AiScreenerFilters {
  market: string;
  topN: string;
  minPotential: string;
  maxVolatility: string;
  minSharpe: string;
  maxDrawdown: string;
}

const DEFAULT_FILTERS: AiScreenerFilters = {
  market: REGION === 'us' ? 'us' : 'ru',
  topN: '10',
  minPotential: '',
  maxVolatility: '',
  minSharpe: '',
  maxDrawdown: '',
};

const HIDE_SPINNERS =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

type ViewState =
  | { kind: 'filters' }
  | { kind: 'loading' }
  | { kind: 'results'; data: ScreenerResult[] }
  | { kind: 'error'; message: string };

function renderDropdownTrigger(
  label: string,
  {
    isOpen,
    onClick,
    triggerRef,
  }: {
    isOpen: boolean;
    onClick: () => void;
    triggerRef: React.Ref<HTMLDivElement>;
  }
) {
  return (
    <div
      ref={triggerRef}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="flex items-center justify-between w-full bg-[var(--bg-input)] border border-[var(--border-light)] rounded-[4px] px-3 py-2 cursor-pointer hover:border-gray-500 transition-colors"
      role="button"
      tabIndex={0}
    >
      <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">
        {label}
      </span>
      <Icon
        variant={isOpen ? 'chevronUpSmall' : 'chevronDownSmall'}
        size={12}
        className="shrink-0 ml-1 text-text-secondary"
      />
    </div>
  );
}

function parseFilterNum(
  val: string,
  min?: number,
  max?: number
): number | undefined {
  if (val === '') return undefined;
  const n = parseFloat(val);
  if (isNaN(n)) return undefined;
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

interface AiScreenerContentProps {
  cardId?: number;
  widgetType?: string;
  screenerFilters?: AiScreenerFilters;
  screenerResults?: ScreenerResult[] | null;
}

const SCREENER_FILTERS_SIZE = { width: 336, height: 420 };
const SCREENER_RESULTS_SIZE = { width: 680, height: 560 };

function restoreFilters(saved?: AiScreenerFilters): AiScreenerFilters {
  const base = saved ? { ...DEFAULT_FILTERS, ...saved } : DEFAULT_FILTERS;
  // On the US deployment Russian market is not available — fall back to 'us'
  if (REGION === 'us' && base.market === 'ru') {
    return { ...base, market: 'us' };
  }
  return base;
}

function restoreViewState(results?: ScreenerResult[] | null): ViewState {
  if (Array.isArray(results) && results.length > 0) {
    return { kind: 'results', data: results };
  }
  return { kind: 'filters' };
}

export const AiScreenerContent: React.FC<AiScreenerContentProps> = ({
  cardId,
  widgetType = 'ai_screener',
  screenerFilters,
  screenerResults,
}) => {
  const boardId = useBoardStore((state) => state.boardId);
  const { t } = useTranslation('board');
  const [filters, setFilters] = useState<AiScreenerFilters>(() =>
    restoreFilters(screenerFilters)
  );
  const [viewState, setViewState] = useState<ViewState>(() =>
    restoreViewState(screenerResults)
  );
  const updateCardMutation = useUpdateCardMutation();

  const MARKET_ITEMS = useMemo(
    () =>
      [
        REGION !== 'us' ? { label: t('screener.marketRu'), value: 'ru' } : null,
        { label: t('screener.marketUs'), value: 'us' },
      ].filter(Boolean) as { label: string; value: string }[],
    [t]
  );

  const TOP_N_ITEMS = useMemo(
    () => [
      { label: t('screener.top5'), value: '5' },
      { label: t('screener.top10'), value: '10' },
      { label: t('screener.top20'), value: '20' },
      { label: t('screener.top50'), value: '50' },
    ],
    [t]
  );

  const updateFilter = useCallback(
    <K extends keyof AiScreenerFilters>(
      key: K,
      value: AiScreenerFilters[K]
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resizeCard = useCardResize(cardId);

  const handleSearch = useCallback(async () => {
    const limit = parseInt(filters.topN, 10) || 10;
    setViewState({ kind: 'loading' });

    try {
      const params: Record<string, number | string> = {
        limit,
        market: filters.market,
      };

      const minPotential = parseFilterNum(filters.minPotential, 0);
      const maxDrawdown = parseFilterNum(filters.maxDrawdown, 0, 100);
      const minSharpe = parseFilterNum(filters.minSharpe, -3, 3);
      const maxVolatility = parseFilterNum(filters.maxVolatility, 0, 100);

      // Reflect clamped values back to the inputs so the user sees what was actually used
      setFilters((prev) => ({
        ...prev,
        minPotential:
          minPotential != null ? String(minPotential) : prev.minPotential,
        maxDrawdown:
          maxDrawdown != null ? String(maxDrawdown) : prev.maxDrawdown,
        minSharpe: minSharpe != null ? String(minSharpe) : prev.minSharpe,
        maxVolatility:
          maxVolatility != null ? String(maxVolatility) : prev.maxVolatility,
      }));

      if (minPotential != null) params.min_potential = minPotential;
      if (maxDrawdown != null) params.max_drawdown = maxDrawdown;
      if (minSharpe != null) params.min_sharpe = minSharpe;
      if (maxVolatility != null) params.max_volatility = maxVolatility;

      const results = await tickersApi.getScreenerResults(
        params as Parameters<typeof tickersApi.getScreenerResults>[0]
      );

      setViewState({ kind: 'results', data: results });
      resizeCard(SCREENER_RESULTS_SIZE);

      if (cardId && boardId) {
        updateCardMutation.mutate({
          id: cardId,
          boardId,
          skipInvalidate: true,
          data: {
            meta: {
              widgetType: 'ai_screener' as const,
              screenerResults: results,
              screenerFilters: filters,
              screenerUpdatedAt: new Date().toISOString(),
            },
          },
        });
      }
    } catch (err) {
      console.error('Screener request failed:', err);
      setViewState({ kind: 'error', message: t('screener.loadError') });
    }
  }, [filters, resizeCard, cardId, boardId, updateCardMutation, t]);

  const handleBack = useCallback(() => {
    setViewState({ kind: 'filters' });
    resizeCard(SCREENER_FILTERS_SIZE);

    if (cardId && boardId) {
      updateCardMutation.mutate({
        id: cardId,
        boardId,
        skipInvalidate: true,
        data: {
          meta: {
            widgetType: 'ai_screener' as const,
            screenerFilters: filters,
            screenerResults: null,
            screenerUpdatedAt: null,
          },
        },
      });
    }
  }, [resizeCard, cardId, boardId, filters, updateCardMutation]);

  const selectedMarketLabel =
    MARKET_ITEMS.find((m) => m.value === filters.market)?.label ?? '';
  const selectedTopNLabel =
    TOP_N_ITEMS.find((item) => item.value === filters.topN)?.label ?? '';

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (viewState.kind === 'loading') {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 p-4 min-h-[200px]"
        onMouseDown={stopPropagation}
        onClick={stopPropagation}
      >
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[13px] text-[var(--text-secondary)]">
          {t('screener.searching')}
        </span>
      </div>
    );
  }

  if (viewState.kind === 'results') {
    return (
      <AiScreenerResultsTable results={viewState.data} onBack={handleBack} />
    );
  }

  if (viewState.kind === 'error') {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 p-4 min-h-[200px]"
        onMouseDown={stopPropagation}
        onClick={stopPropagation}
      >
        <span className="text-[13px] text-red-400">{viewState.message}</span>
        <Button variant="secondary" size="sm" onClick={handleBack}>
          {t('screener.back')}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-3 p-1 nowheel"
      onMouseDown={stopPropagation}
      onClick={stopPropagation}
    >
      {/* Header with finam icon */}
      <div className="flex flex-col items-start gap-1.5 mb-1">
        <div className="w-10 h-10 rounded-full bg-background-bgbase________ border-2 border-blackinverse-a12 flex items-center justify-center">
          <Icon variant="finam" size={20} />
        </div>
        <span className="text-[12px] font-medium text-[var(--text-secondary)]">
          {t('screener.title')}
        </span>
      </div>

      {/* Dropdowns row */}
      <div className="grid grid-cols-2 gap-2">
        <Dropdown
          trigger={(props) => renderDropdownTrigger(selectedMarketLabel, props)}
          items={MARKET_ITEMS}
          selectedValue={filters.market}
          onSelect={(value) => updateFilter('market', value)}
          placement="bottom"
          matchTriggerWidth
        />
        <Dropdown
          trigger={(props) => renderDropdownTrigger(selectedTopNLabel, props)}
          items={TOP_N_ITEMS}
          selectedValue={filters.topN}
          onSelect={(value) => updateFilter('topN', value)}
          placement="bottom"
          matchTriggerWidth
        />
      </div>

      {/* Filter inputs grid */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-3 [&_label]:!text-[12px]">
        <Input
          size="sm"
          type="number"
          label={t('screener.minPotential')}
          placeholder="0"
          min={0}
          value={filters.minPotential}
          onChange={(e) => updateFilter('minPotential', e.target.value)}
          rightIcon={
            <span className="text-[12px] text-[var(--text-secondary)]">%</span>
          }
          className={HIDE_SPINNERS}
        />
        <Input
          size="sm"
          type="number"
          label={t('screener.maxVolatility')}
          placeholder="100"
          min={0}
          max={100}
          value={filters.maxVolatility}
          onChange={(e) => updateFilter('maxVolatility', e.target.value)}
          className={HIDE_SPINNERS}
        />
        <Input
          size="sm"
          type="number"
          label={t('screener.minSharpe')}
          placeholder="-3"
          min={-3}
          max={3}
          value={filters.minSharpe}
          onChange={(e) => updateFilter('minSharpe', e.target.value)}
          className={HIDE_SPINNERS}
        />
        <Input
          size="sm"
          type="number"
          label={t('screener.maxDrawdown')}
          placeholder="100"
          min={0}
          max={100}
          value={filters.maxDrawdown}
          onChange={(e) => updateFilter('maxDrawdown', e.target.value)}
          rightIcon={
            <span className="text-[12px] text-[var(--text-secondary)]">%</span>
          }
          className={HIDE_SPINNERS}
        />
      </div>

      {/* Search button */}
      <Button
        variant="secondary"
        size="md"
        onClick={handleSearch}
        className="w-full mt-1"
      >
        {t('screener.findSignals')}
      </Button>
    </div>
  );
};

export default AiScreenerContent;
