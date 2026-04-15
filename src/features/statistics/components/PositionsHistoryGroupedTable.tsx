'use client';

import { useTranslation } from '@/shared/i18n/client';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import DataTable from '@/shared/ui/DataTable';
import type { ColumnDef } from '@/shared/ui/DataTable';
import { useStatisticsStore } from '@/stores/statisticsStore';
import type { InstrumentGroup, TradesFilterParams } from '@/types';
import {
  TableCellTicker,
  TableCellString,
  TableCellNumbers,
} from '@/shared/ui/DataTable/cells';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import TradeContextMenu from './TradeContextMenu';
import { useTradeContextMenuBySymbolSingle } from '../hooks/useTradeContextMenu';
import { useBrokerTradesQuery, useGroupedPositionsQuery } from '../queries';
import { TradeRow } from '@/features/statistics/utils/positionsTableShared';
import {
  currencySymbol,
  formatNumber,
  formatQuantity,
} from '@/features/statistics/utils/positionsTableUtils';
import { usePaginationSync } from '../hooks/usePaginationSync';
import ImportTradesDialog from '@/features/broker/components/ImportTradesDialog';
import { usePortfoliosWithSummaryQuery } from '@/features/portfolio-catalog/queries';
import { ymPortfolioContextFromCatalog } from '@/features/portfolio-catalog/utils/ymPortfolioAnalytics';
import { useYandexMetrika } from '@/shared/hooks';
import PositionsTableEmptyState from './PositionsTableEmptyState';
import PositionsTableSkeletons from './PositionsTableSkeletons';

const COLUMN_COUNT = 9;

interface InstrumentTradesSectionProps {
  symbol: string;
  filters: TradesFilterParams;
  currency?: string;
  isParentSelected?: boolean;
  childSelectedTradeIds?: Set<number>;
  onTradeClick?: (
    tradeId: number,
    instrument: string,
    e: React.MouseEvent,
    siblingTradeIds?: number[]
  ) => void;
}

const InstrumentTradesSection: React.FC<InstrumentTradesSectionProps> = ({
  symbol,
  filters,
  currency,
  isParentSelected,
  childSelectedTradeIds,
  onTradeClick,
}) => {
  const { t } = useTranslation('statistics');
  const { data, isLoading } = useBrokerTradesQuery({
    ...filters,
    symbol,
  });
  const trades = useMemo(() => data?.data || [], [data?.data]);

  // Extract bare instrument name from symbol (e.g. "SBER@MISX" → "SBER")
  const instrument = symbol.includes('@') ? symbol.split('@')[0] : symbol;

  if (isLoading) {
    return (
      <tr>
        <td colSpan={COLUMN_COUNT} className="py-4">
          <div className="flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blackinverse-a32 border-t-transparent rounded-full animate-spin" />
          </div>
        </td>
      </tr>
    );
  }

  if (trades.length === 0) {
    return (
      <tr>
        <td colSpan={COLUMN_COUNT} className="py-4 text-center">
          <TableCellString
            value={t('trades.noTrades')}
            className="justify-center"
          />
        </td>
      </tr>
    );
  }

  return (
    <>
      {trades.map((trade) => (
        <TradeRow
          key={trade.id}
          trade={trade}
          currency={currency}
          isSelected={
            isParentSelected || childSelectedTradeIds?.has(Number(trade.id))
          }
          onClick={
            onTradeClick
              ? (e) => {
                  const tradeId = Number(trade.id);
                  const siblingTradeIds = trades
                    .filter((t) => Number(t.id) !== tradeId)
                    .map((t) => Number(t.id));
                  onTradeClick(tradeId, instrument, e, siblingTradeIds);
                }
              : undefined
          }
        />
      ))}
    </>
  );
};

export interface PositionsHistoryGroupedTableProps {
  /** Called when instrument selection changes (for portfolio creation modal). */
  onInstrumentSelectionChange?: (instruments: string[]) => void;
  /** Pre-selected instruments for edit mode. */
  initialParentInstruments?: string[];
  /** Child clicks select whole parent instrument (no individual trade selection). */
  parentOnlySelection?: boolean;
}

const PositionsHistoryGroupedTable: React.FC<
  PositionsHistoryGroupedTableProps
> = ({
  onInstrumentSelectionChange,
  initialParentInstruments,
  parentOnlySelection,
}) => {
  const { t, i18n } = useTranslation('statistics');
  const locale = getLocaleTag(i18n.language);
  const filters = useStatisticsStore((state) => state.positionsFilters);
  const selectedPortfolioId = useStatisticsStore(
    (state) => state.selectedPortfolioId
  );
  const setShowBrokerDialog = useStatisticsStore(
    (state) => state.setShowBrokerDialog
  );
  const [showImportDialog, setShowImportDialog] = useState(false);

  const effectiveFilters = useMemo(
    () =>
      !selectedPortfolioId
        ? filters
        : { ...filters, portfolioId: selectedPortfolioId },
    [filters, selectedPortfolioId]
  );

  const { data, isLoading, isSuccess } =
    useGroupedPositionsQuery(effectiveFilters);
  const instruments = useMemo(() => data?.data || [], [data?.data]);

  usePaginationSync(data?.pagination);

  const tradesFilters = useMemo<TradesFilterParams>(
    () => ({
      fromDate: filters.dateFrom || undefined,
      toDate: filters.dateTo || undefined,
      accountIds: filters.accountIds || undefined,
    }),
    [filters.dateFrom, filters.dateTo, filters.accountIds]
  );

  const { data: portfolios } = usePortfoliosWithSummaryQuery();
  const ymStatsContext = useMemo(() => {
    const p = selectedPortfolioId
      ? portfolios?.find((x) => x.id === selectedPortfolioId)
      : undefined;
    return ymPortfolioContextFromCatalog(selectedPortfolioId, p?.fillRule);
  }, [selectedPortfolioId, portfolios]);

  const { trackEvent } = useYandexMetrika();

  const groupedTradesLoadedYmKey = useMemo(() => {
    const f = effectiveFilters;
    return [
      f.portfolioId ?? 0,
      f.dateFrom ?? '',
      f.dateTo ?? '',
      (f.accountIds ?? []).join(','),
      f.page ?? 1,
      f.pageSize ?? 13,
      f.search ?? '',
      f.brokerType ?? '',
      f.instrument ?? '',
      f.sortBy ?? '',
      f.sortOrder ?? '',
      f.status ?? '',
    ].join('|');
  }, [effectiveFilters]);

  const tradesLoadedKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (isLoading || !isSuccess || data === undefined) return;
    if (tradesLoadedKeyRef.current === groupedTradesLoadedYmKey) return;
    tradesLoadedKeyRef.current = groupedTradesLoadedYmKey;
    trackEvent('trades_loaded', {
      portfolio_id: ymStatsContext.portfolio_id,
      broker_name: ymStatsContext.broker_name,
    });
  }, [
    isLoading,
    isSuccess,
    data,
    groupedTradesLoadedYmKey,
    ymStatsContext.portfolio_id,
    ymStatsContext.broker_name,
    trackEvent,
  ]);

  const allColumns = useMemo<ColumnDef<InstrumentGroup>[]>(
    () => [
      {
        key: 'instrument',
        header: t('columnsLower.instrument'),
        align: 'left',
        renderCell: (instrument, isExpanded, toggle, isSelected) => (
          <TableCellTicker
            ticker={instrument.instrument}
            securityId={instrument.securityId}
            isExpanded={isExpanded}
            onToggle={toggle}
            isSelected={isSelected}
          />
        ),
      },
      {
        key: 'broker',
        header: t('columnsLower.broker'),
        align: 'right',
        renderCell: (instrument, isExpanded) => {
          const firstBroker = instrument.brokers[0];
          const extraBrokers = instrument.brokers.length - 1;
          if (isExpanded || !firstBroker) return null;
          return (
            <TableCellString
              value={firstBroker.brokerType}
              count={extraBrokers > 0 ? extraBrokers : undefined}
            />
          );
        },
      },
      {
        key: 'account',
        header: t('columnsLower.account'),
        align: 'right',
        renderCell: (instrument, isExpanded) => {
          const allAccounts = instrument.brokers.flatMap((b) => b.accounts);
          const firstAccount = allAccounts[0];
          const extraAccounts = allAccounts.length - 1;
          if (isExpanded || !firstAccount) return null;
          return (
            <TableCellString
              value={firstAccount.accountName || firstAccount.accountId}
              count={extraAccounts > 0 ? extraAccounts : undefined}
            />
          );
        },
      },
      {
        key: 'exchange',
        header: t('columnsLower.exchange'),
        align: 'right',
        renderCell: (instrument, isExpanded) => {
          const firstExchange = instrument.brokers.flatMap((b) => b.accounts)[0]
            ?.exchange;
          if (isExpanded || !firstExchange) return null;
          return <TableCellString value={firstExchange} />;
        },
      },
      {
        key: 'quantity',
        header: t('columnsLower.quantity'),
        align: 'right',
        renderCell: (instrument) => (
          <TableCellNumbers
            value={formatQuantity(instrument.totalQuantity, locale)}
          />
        ),
      },
      {
        key: 'side',
        header: t('columns.buySell'),
        align: 'right',
        renderCell: () => <TableCellNumbers value="—" />,
      },
      {
        key: 'price',
        header: t('columnsLower.price'),
        align: 'right',
        renderCell: (instrument) => {
          const price = parseFloat(instrument.avgOpenPrice || '0');
          if (price === 0) return <TableCellNumbers value="—" />;
          return (
            <TableCellNumbers
              value={`${formatNumber(instrument.avgOpenPrice, 2, locale)} ${currencySymbol(instrument.currency)}`}
            />
          );
        },
      },
      {
        key: 'currency',
        header: t('columnsLower.currency'),
        align: 'right',
        renderCell: (instrument) => (
          <TableCellString value={currencySymbol(instrument.currency)} />
        ),
      },
      {
        key: 'total',
        header: t('columnsLower.tradeTotal'),
        align: 'right',
        renderCell: () => <TableCellString value="—" />,
      },
    ],
    [t, locale]
  );

  const selectionOptions = useMemo(
    () =>
      onInstrumentSelectionChange || initialParentInstruments?.length
        ? {
            onInstrumentSelectionChange,
            initialParentInstruments,
            parentOnlySelection,
          }
        : undefined,
    [onInstrumentSelectionChange, initialParentInstruments, parentOnlySelection]
  );

  const {
    anchor,
    symbols: menuSymbols,
    childTradeIds,
    tickerSecurityIds,
    selectedKeys,
    childSelectedTradeIds,
    handleRowClick,
    handleChildTradeClick,
    close: closeMenu,
  } = useTradeContextMenuBySymbolSingle(selectionOptions);
  const tableRef = useRef<HTMLDivElement>(null);

  /**
   * YM `trade_selected`: one event per false→true edge on "any row/trade selection present".
   * While either a parent instrument (`selectedKeys`) or context-menu trades (`childTradeIds`)
   * stay non-empty, the ref stays true — no further events. Example: select trade A, clear A,
   * select trade B without clearing a selected parent row → second selection does not emit.
   * Fully empty both → ref resets, next selection emits again. Intentional reach cap per selection stretch.
   */
  const tradeYmPrevHasRef = useRef(false);
  useEffect(() => {
    const has = selectedKeys.size > 0 || childTradeIds.length > 0;
    if (has && !tradeYmPrevHasRef.current) {
      trackEvent('trade_selected', {
        portfolio_id: ymStatsContext.portfolio_id,
        broker_name: ymStatsContext.broker_name,
      });
    }
    tradeYmPrevHasRef.current = has;
  }, [
    selectedKeys.size,
    childTradeIds.length,
    ymStatsContext.portfolio_id,
    ymStatsContext.broker_name,
    trackEvent,
  ]);

  return (
    <>
      <div ref={tableRef} className="h-full overflow-hidden">
        <DataTable
          columns={allColumns}
          rows={instruments}
          getRowKey={(instrument) => instrument.instrument}
          onRowClick={handleRowClick}
          selectedKeys={selectedKeys}
          renderExpandedRows={(instrument) => (
            <InstrumentTradesSection
              symbol={instrument.instrument}
              filters={tradesFilters}
              currency={instrument.currency}
              isParentSelected={selectedKeys.has(instrument.instrument)}
              childSelectedTradeIds={childSelectedTradeIds}
              onTradeClick={handleChildTradeClick}
            />
          )}
          isLoading={isLoading}
          isEmpty={instruments.length === 0}
          loadingFallback={<PositionsTableSkeletons />}
          emptyFallback={
            <PositionsTableEmptyState
              onConnectBroker={() => setShowBrokerDialog(true)}
              onImportCsv={() => setShowImportDialog(true)}
            />
          }
        />
      </div>
      <TradeContextMenu
        anchor={anchor}
        symbols={menuSymbols}
        tradeIds={childTradeIds.length > 0 ? childTradeIds : undefined}
        tickerSecurityIds={tickerSecurityIds}
        labelType={childTradeIds.length > 0 ? 'trades' : 'tickers'}
        onClose={closeMenu}
        tableRef={tableRef}
      />
      {showImportDialog && (
        <ImportTradesDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
        />
      )}
    </>
  );
};

export default PositionsHistoryGroupedTable;
