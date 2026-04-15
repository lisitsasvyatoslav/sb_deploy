'use client';

import { useTranslation } from '@/shared/i18n/client';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import { Icon } from '@/shared/ui/Icon';
import DataTable from '@/shared/ui/DataTable';
import type { ColumnDef } from '@/shared/ui/DataTable';
import TickerIcon from '@/shared/ui/TickerIcon';
import { useStatisticsStore } from '@/stores/statisticsStore';
import type { BrokerTrade } from '@/types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import TradeContextMenu from './TradeContextMenu';
import { useTradeContextMenuByIdsMulti } from '../hooks/useTradeContextMenu';
import { useBrokerTradesQuery } from '../queries';
import { cn } from '@/shared/utils/cn';
import { TableCellString, TableCellNumbers } from '@/shared/ui/DataTable/cells';
import {
  currencySymbol,
  formatDateTime,
  formatNumber,
  getExchange,
} from '@/features/statistics/utils/positionsTableUtils';
import { usePaginationSync } from '../hooks/usePaginationSync';
import ImportTradesDialog from '@/features/broker/components/ImportTradesDialog';
import { usePortfoliosWithSummaryQuery } from '@/features/portfolio-catalog/queries';
import { ymPortfolioContextFromCatalog } from '@/features/portfolio-catalog/utils/ymPortfolioAnalytics';
import { useYandexMetrika } from '@/shared/hooks';
import PositionsTableEmptyState from './PositionsTableEmptyState';
import PositionsTableSkeletons from './PositionsTableSkeletons';

const InstrumentCard: React.FC<{
  instrument: string;
  securityId?: number | null;
  onClose: () => void;
  className?: string;
}> = ({ instrument, securityId, onClose, className }) => {
  const { t } = useTranslation('statistics');
  return (
    <div
      className={cn(
        'flex items-center justify-between px-[16px] py-[8px]',
        className
      )}
    >
      <div className="flex items-center gap-[6px] w-[105px]">
        <TickerIcon
          symbol={instrument}
          securityId={securityId ?? undefined}
          size={24}
        />
        <span className="text-12 leading-16 font-medium tracking-tight-1 text-blackinverse-a100">
          {instrument}
        </span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex items-center justify-center p-[4px] rounded-[2px] backdrop-blur-[12px] hover:bg-blackinverse-a8 transition-colors"
        aria-label={t('positions.closeHistory')}
      >
        <Icon variant="close" size={16} className="text-blackinverse-a56" />
      </button>
    </div>
  );
};

const PositionsHistoryTable: React.FC = () => {
  const { t, i18n } = useTranslation('statistics');
  const locale = getLocaleTag(i18n.language);

  const selectedInstrument = useStatisticsStore(
    (state) => state.selectedInstrument
  );
  const selectedSecurityId = useStatisticsStore(
    (state) => state.selectedSecurityId
  );
  const selectedCurrency = useStatisticsStore(
    (state) => state.selectedCurrency
  );
  const closeInstrumentHistory = useStatisticsStore(
    (state) => state.closeInstrumentHistory
  );
  const filters = useStatisticsStore((state) => state.positionsFilters);
  const selectedPortfolioId = useStatisticsStore(
    (state) => state.selectedPortfolioId
  );
  const setShowBrokerDialog = useStatisticsStore(
    (state) => state.setShowBrokerDialog
  );
  const [showImportDialog, setShowImportDialog] = useState(false);

  const { data: portfolios } = usePortfoliosWithSummaryQuery();
  const ymStatsContext = useMemo(() => {
    const p = selectedPortfolioId
      ? portfolios?.find((x) => x.id === selectedPortfolioId)
      : undefined;
    return ymPortfolioContextFromCatalog(selectedPortfolioId, p?.fillRule);
  }, [selectedPortfolioId, portfolios]);
  const { trackEvent } = useYandexMetrika();

  const page = filters.page || 1;
  const pageSize = filters.pageSize || 13;

  const tradesFilters = useMemo(
    () => ({
      symbol: selectedInstrument || undefined,
      fromDate: filters.dateFrom || undefined,
      toDate: filters.dateTo || undefined,
      accountIds: filters.accountIds || undefined,
    }),
    [selectedInstrument, filters.dateFrom, filters.dateTo, filters.accountIds]
  );

  const sym = currencySymbol(selectedCurrency);
  const columns = useMemo<ColumnDef<BrokerTrade>[]>(
    () => [
      {
        key: 'instrument',
        header: t('columnsLower.instrument'),
        align: 'left',
        renderCell: (trade) => (
          <TableCellString
            value={formatDateTime(trade.timestamp)}
            className="justify-start"
          />
        ),
      },
      {
        key: 'broker',
        header: t('columnsLower.broker'),
        align: 'right',
        renderCell: (trade) => <TableCellString value={trade.brokerType} />,
      },
      {
        key: 'account',
        header: t('columnsLower.account'),
        align: 'right',
        renderCell: (trade) => <TableCellString value={trade.accountId} />,
      },
      {
        key: 'exchange',
        header: t('columnsLower.exchange'),
        align: 'right',
        renderCell: (trade) => (
          <TableCellString value={getExchange(trade.symbol)} />
        ),
      },
      {
        key: 'quantity',
        header: t('columnsLower.quantity'),
        align: 'right',
        renderCell: (trade) => (
          <TableCellNumbers value={formatNumber(trade.size, 0)} />
        ),
      },
      {
        key: 'side',
        header: t('columns.buySell'),
        align: 'right',
        renderCell: (trade) => (
          <TableCellString
            value={
              trade.side?.toLowerCase() === 'buy'
                ? t('trades.buy')
                : t('trades.sell')
            }
          />
        ),
      },
      {
        key: 'price',
        header: t('columnsLower.price'),
        align: 'right',
        renderCell: (trade) => (
          <TableCellNumbers
            value={`${formatNumber(trade.price, 2, locale)} ${sym}`}
          />
        ),
      },
      {
        key: 'currency',
        header: t('columnsLower.currency'),
        align: 'right',
        renderCell: () => <TableCellString value={sym} />,
      },
      {
        key: 'total',
        header: t('columnsLower.tradeTotal'),
        align: 'right',
        renderCell: (trade) => {
          const total = parseFloat(trade.price) * parseFloat(trade.size);
          const isBuy = trade.side?.toLowerCase() === 'buy';
          return (
            <TableCellNumbers
              value={isBuy ? total : -total}
              isActiveColor={false}
              valueFormatter={(v) =>
                `${formatNumber(Math.abs(v), 2, locale)} ${sym}`
              }
            />
          );
        },
      },
    ],
    [t, locale, sym]
  );

  const { data, isLoading, isSuccess } = useBrokerTradesQuery(tradesFilters, {
    page,
    pageSize,
  });
  const trades = useMemo(() => data?.data || [], [data?.data]);

  usePaginationSync(data?.pagination);

  const tradesLoadedKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const key = `${selectedPortfolioId ?? 0}|${tradesFilters.symbol ?? ''}|${tradesFilters.fromDate ?? ''}|${tradesFilters.toDate ?? ''}|${(tradesFilters.accountIds ?? []).join(',')}|${page}|${pageSize}`;
    if (!isLoading && isSuccess && data !== undefined) {
      if (tradesLoadedKeyRef.current !== key) {
        tradesLoadedKeyRef.current = key;
        trackEvent('trades_loaded', {
          portfolio_id: ymStatsContext.portfolio_id,
          broker_name: ymStatsContext.broker_name,
        });
      }
    }
  }, [
    isLoading,
    isSuccess,
    data,
    page,
    pageSize,
    tradesFilters.symbol,
    tradesFilters.fromDate,
    tradesFilters.toDate,
    tradesFilters.accountIds,
    selectedPortfolioId,
    ymStatsContext.portfolio_id,
    ymStatsContext.broker_name,
    trackEvent,
  ]);

  const tickerSecurityIds = useMemo(
    () =>
      selectedInstrument ? { [selectedInstrument]: selectedSecurityId } : {},
    [selectedInstrument, selectedSecurityId]
  );

  const {
    anchor,
    tradeIds: menuTradeIds,
    selectedKeys,
    handleRowClick,
    close: closeMenu,
  } = useTradeContextMenuByIdsMulti(tickerSecurityIds);
  const tableRef = useRef<HTMLDivElement>(null);

  const tradeYmPrevCountRef = useRef(0);
  useEffect(() => {
    const n = menuTradeIds.length;
    if (n === 0) {
      tradeYmPrevCountRef.current = 0;
    } else if (tradeYmPrevCountRef.current === 0) {
      trackEvent('trade_selected', {
        portfolio_id: ymStatsContext.portfolio_id,
        broker_name: ymStatsContext.broker_name,
      });
      tradeYmPrevCountRef.current = n;
    } else {
      tradeYmPrevCountRef.current = n;
    }
  }, [
    menuTradeIds.length,
    ymStatsContext.portfolio_id,
    ymStatsContext.broker_name,
    trackEvent,
  ]);

  return (
    <div ref={tableRef} className="h-full overflow-hidden">
      <DataTable
        columns={columns}
        rows={trades}
        getRowKey={(trade) => String(trade.id)}
        onRowClick={handleRowClick}
        selectedKeys={selectedKeys}
        header={
          selectedInstrument ? (
            <InstrumentCard
              instrument={selectedInstrument}
              securityId={selectedSecurityId}
              onClose={closeInstrumentHistory}
              className="sticky top-0 z-10 h-[40px] bg-surfacelow-surfacelow1"
            />
          ) : undefined
        }
        tableHeadClassName="sticky top-[40px] z-10"
        isLoading={isLoading}
        isEmpty={trades.length === 0}
        loadingFallback={<PositionsTableSkeletons />}
        emptyFallback={
          <PositionsTableEmptyState
            onConnectBroker={() => setShowBrokerDialog(true)}
            onImportCsv={() => setShowImportDialog(true)}
          />
        }
      />
      <TradeContextMenu
        anchor={anchor}
        tradeIds={menuTradeIds}
        tickerSecurityIds={tickerSecurityIds}
        labelType="trades"
        onClose={closeMenu}
        tableRef={tableRef}
      />
      {showImportDialog && (
        <ImportTradesDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
        />
      )}
    </div>
  );
};

export default PositionsHistoryTable;
