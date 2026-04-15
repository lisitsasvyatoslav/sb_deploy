'use client';

import TickerIcon from '@/shared/ui/TickerIcon';
import Table, { TableColumn } from '@/shared/ui/Table';
import { useTranslation } from '@/shared/i18n/client';
import { getDateLocaleTag, getLocaleTag } from '@/shared/utils/formatLocale';
import type { BrokerTrade } from '@/types';
import React, { useMemo } from 'react';

interface TradesTableProps {
  trades: BrokerTrade[];
  isLoading?: boolean;
  onSort?: (columnKey: string, direction: 'asc' | 'desc' | null) => void;
}

const TradesTable: React.FC<TradesTableProps> = ({
  trades,
  isLoading = false,
  onSort,
}) => {
  const { t, i18n } = useTranslation('statistics');
  const locale = getLocaleTag(i18n.language);
  const dateLocale = getDateLocaleTag(i18n.language);

  const columns: TableColumn<BrokerTrade>[] = useMemo(
    () => [
      {
        key: 'symbol',
        label: t('trades.instrument'),
        sortable: true,
        align: 'left',
        render: (row) => (
          <div className="flex items-center gap-2">
            <TickerIcon symbol={row.symbol} size={48} alt={row.symbol} />
          </div>
        ),
      },
      {
        key: 'timestamp',
        label: t('trades.time'),
        sortable: true,
        align: 'left',
        render: (row) => {
          const date = new Date(row.timestamp);
          const dateStr = date.toLocaleDateString(dateLocale, {
            day: 'numeric',
            month: 'short',
          });
          const timeStr = date.toLocaleTimeString(dateLocale, {
            hour: '2-digit',
            minute: '2-digit',
          });
          return (
            <span className="text-sm text-black">
              {dateStr}, {timeStr}
            </span>
          );
        },
      },
      {
        key: 'side',
        label: t('trades.status'),
        sortable: true,
        align: 'center',
        render: (row) => (
          <span
            className={`text-sm px-2 py-1 rounded ${
              row.side === 'buy'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {row.side === 'buy' ? t('trades.buy') : t('trades.sell')}
          </span>
        ),
      },
      {
        key: 'size',
        label: t('trades.position'),
        sortable: true,
        align: 'right',
        render: (row) => (
          <span className="text-sm text-black">
            {parseFloat(row.size).toLocaleString(locale)}
          </span>
        ),
      },
      {
        key: 'price',
        label: t('trades.entryPrice'),
        sortable: true,
        align: 'right',
        render: (row) =>
          row.side === 'buy' ? (
            <span className="text-sm text-black">
              {parseFloat(row.price).toLocaleString(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          ) : (
            <span className="text-sm text-gray-400">N/A</span>
          ),
      },
      {
        key: 'close_price',
        label: t('trades.closePrice'),
        sortable: false,
        align: 'right',
        render: (row) =>
          row.side === 'sell' ? (
            <span className="text-sm text-black">
              {parseFloat(row.price).toLocaleString(locale, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          ) : (
            <span className="text-sm text-gray-400">N/A</span>
          ),
      },
      {
        key: 'close_date',
        label: t('trades.closeDate'),
        sortable: false,
        align: 'left',
        render: (row) => {
          if (row.side === 'sell') {
            const date = new Date(row.timestamp);
            const dateStr = date.toLocaleDateString(dateLocale, {
              day: 'numeric',
              month: 'short',
            });
            const timeStr = date.toLocaleTimeString(dateLocale, {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <span className="text-sm text-black">
                {dateStr}, {timeStr}
              </span>
            );
          }
          return <span className="text-sm text-gray-400">N/A</span>;
        },
      },
      {
        key: 'current_price',
        label: t('trades.currentPrice'),
        sortable: false,
        align: 'right',
        render: (_row) => (
          <span className="text-sm text-gray-400">
            {/* TODO: Phase 2 - live prices */}—
          </span>
        ),
      },
      {
        key: 'pnl',
        label: 'P&L',
        sortable: false,
        align: 'right',
        render: (_row) => (
          <span className="text-sm text-gray-400">
            {/* TODO: calculated from trade pairs */}—
          </span>
        ),
      },
      {
        key: 'broker_type',
        label: t('trades.broker'),
        sortable: true,
        align: 'left',
        render: (row) => (
          <span className="text-sm text-black capitalize">
            {row.brokerType}
          </span>
        ),
      },
      {
        key: 'card_id',
        label: t('trades.tradingIdea'),
        sortable: false,
        align: 'left',
        render: (row) => {
          if (!row.cardId) {
            return <span className="text-sm text-gray-400">—</span>;
          }
          return (
            <span className="text-sm text-primary-500 underline cursor-pointer">
              {t('trades.ideaPrefix')} {row.cardId}
            </span>
          );
        },
      },
    ],
    [t, locale, dateLocale]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-sm text-gray-400">{t('trades.loading')}</span>
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-sm text-gray-400">{t('trades.noData')}</span>
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      rows={trades}
      onSort={onSort}
      getRowKey={(row) => row.id.toString()}
    />
  );
};

export default TradesTable;
