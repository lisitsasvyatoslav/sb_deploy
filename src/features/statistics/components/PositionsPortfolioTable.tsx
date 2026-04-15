'use client';

import { useTranslation } from '@/shared/i18n/client';
import DataTable, { DataTableRow, DataTableCell } from '@/shared/ui/DataTable';
import type { ColumnDef } from '@/shared/ui/DataTable';
import { useStatisticsStore } from '@/stores/statisticsStore';
import type { InstrumentGroup, BrokerGroup } from '@/types';
import {
  TableCellTicker,
  TableCellString,
  TableCellNumbers,
  TableCellNA,
  TableCellButton,
} from '@/shared/ui/DataTable/cells';

import React, { useMemo, useRef, useState } from 'react';
import TradeContextMenu from './TradeContextMenu';
import {
  useTradeContextMenuBySymbol,
  makeChildKey,
  type ChildInfo,
} from '../hooks/useTradeContextMenu';
import { useBrokerAccountsQuery } from '@/features/broker/queries';
import { useGroupedPositionsQuery } from '../queries';
import {
  formatCurrency,
  formatNumber,
  formatQuantity,
  currencySymbol,
} from '@/features/statistics/utils/positionsTableUtils';
import { usePaginationSync } from '../hooks/usePaginationSync';
import ImportTradesDialog from '@/features/broker/components/ImportTradesDialog';
import PositionsTableEmptyState from './PositionsTableEmptyState';
import PositionsTableSkeletons from './PositionsTableSkeletons';
import PortfolioFirstLoadState from './PortfolioFirstLoadState';

// ===== BrokerRow — renders expanded child rows (<tr> per account) =====

interface BrokerRowProps {
  instrumentKey: string;
  broker: BrokerGroup;
  currency?: string;
  isSelected?: boolean;
  onActionClick: (
    instrument: string,
    securityId?: number,
    currency?: string
  ) => void;
  childSelectedKeys?: Set<string>;
  allSiblings?: ChildInfo[];
  onChildRowClick?: (
    instrument: string,
    brokerType: string,
    accountId: string,
    securityId: number | null | undefined,
    e: React.MouseEvent,
    positionIds?: number[],
    allSiblings?: ChildInfo[]
  ) => void;
}

const BrokerRow = React.memo<BrokerRowProps>(
  ({
    instrumentKey,
    broker,
    currency,
    isSelected,
    onActionClick,
    childSelectedKeys,
    allSiblings,
    onChildRowClick,
  }) => (
    <>
      {broker.accounts.map((account) => {
        const childKey = makeChildKey(
          instrumentKey,
          broker.brokerType,
          account.accountId
        );
        const isChildSelected = childSelectedKeys?.has(childKey) ?? false;
        const pct = account.unrealizedPnlPct
          ? parseFloat(account.unrealizedPnlPct)
          : null;
        const money = account.unrealizedPnlMoney
          ? parseFloat(account.unrealizedPnlMoney)
          : null;
        const realPnl = parseFloat(account.realizedPnl || '0');
        const sym = currencySymbol(account.currency);

        return (
          <DataTableRow
            key={`broker-${instrumentKey}-${broker.brokerType}-${account.accountId}`}
            state={isSelected || isChildSelected ? 'active' : 'default'}
            onClick={
              onChildRowClick
                ? (e) => {
                    e.stopPropagation();
                    onChildRowClick(
                      instrumentKey,
                      broker.brokerType,
                      account.accountId,
                      undefined,
                      e,
                      account.positionIds,
                      allSiblings
                    );
                  }
                : undefined
            }
          >
            {/* Instrument (empty, indent) */}
            <DataTableCell className="pl-12" />

            {/* Broker */}
            <DataTableCell align="right">
              <TableCellString value={broker.brokerType} />
            </DataTableCell>

            {/* Account */}
            <DataTableCell align="right">
              <TableCellString
                value={
                  account.accountName
                    ? `${account.accountId} (${account.accountName})`
                    : account.accountId
                }
              />
            </DataTableCell>

            {/* Exchange */}
            <DataTableCell align="right">
              <TableCellString value={account.exchange} />
            </DataTableCell>

            {/* Quantity */}
            <DataTableCell align="right">
              <TableCellNumbers value={formatQuantity(account.quantity)} />
            </DataTableCell>

            {/* Avg Open Price */}
            <DataTableCell align="right">
              <TableCellNumbers
                value={formatCurrency(
                  account.avgOpenPrice,
                  2,
                  account.currency
                )}
              />
            </DataTableCell>

            {/* Current Price */}
            <DataTableCell align="right">
              <TableCellNumbers
                value={formatCurrency(
                  account.currentPrice,
                  2,
                  account.currency
                )}
              />
            </DataTableCell>

            {/* Unrealized PnL % */}
            <DataTableCell align="right">
              <TableCellNumbers
                value={pct}
                valueFormatter={(v) =>
                  `${v >= 0 ? '+' : ''}${formatNumber(v)}%`
                }
              />
            </DataTableCell>

            {/* Unrealized PnL Money */}
            <DataTableCell align="right">
              <TableCellNumbers
                value={money}
                valueFormatter={(v) =>
                  `${v >= 0 ? '+' : ''}${formatNumber(v)} ${sym}`
                }
              />
            </DataTableCell>

            {/* Realized PnL */}
            <DataTableCell align="right">
              <TableCellNumbers
                value={realPnl === 0 ? null : realPnl}
                valueFormatter={(v) =>
                  `${v >= 0 ? '+' : ''}${formatNumber(v)} ${sym}`
                }
              />
            </DataTableCell>

            {/* Action */}
            <DataTableCell className="w-12">
              <TableCellButton
                icon="folder"
                onClick={() =>
                  onActionClick(instrumentKey, undefined, currency)
                }
              />
            </DataTableCell>
          </DataTableRow>
        );
      })}
    </>
  )
);

BrokerRow.displayName = 'BrokerRow';

// ===== Main Component =====

const PositionsPortfolioTable: React.FC = () => {
  const { t } = useTranslation('statistics');
  const filters = useStatisticsStore((state) => state.positionsFilters);
  const openInstrumentHistory = useStatisticsStore(
    (state) => state.openInstrumentHistory
  );
  const setShowBrokerDialog = useStatisticsStore(
    (state) => state.setShowBrokerDialog
  );
  const [showImportDialog, setShowImportDialog] = useState(false);
  const isDataSyncInProgress = useStatisticsStore(
    (state) => state.isDataSyncInProgress
  );
  const { data: accounts } = useBrokerAccountsQuery();
  const hasAutoSync = useMemo(
    () => accounts?.some((a) => a.autoSync) ?? false,
    [accounts]
  );

  const selectedPortfolioId = useStatisticsStore(
    (state) => state.selectedPortfolioId
  );

  // Portfolio tab always shows only open positions, optionally filtered by selected portfolio
  const portfolioFilters = useMemo(
    () => ({
      ...filters,
      status: 'open' as const,
      ...(selectedPortfolioId ? { portfolioId: selectedPortfolioId } : {}),
    }),
    [filters, selectedPortfolioId]
  );

  const { data, isLoading } = useGroupedPositionsQuery(portfolioFilters, {
    enablePolling: isDataSyncInProgress,
    hasAutoSync,
  });
  const instruments = useMemo(() => data?.data || [], [data?.data]);

  usePaginationSync(data?.pagination);

  const columns = useMemo<ColumnDef<InstrumentGroup>[]>(
    () => [
      {
        key: 'instrument',
        header: t('columns.instrument'),
        align: 'left',
        renderCell: (instrument, isExpanded, toggle, isSelected) => (
          <TableCellTicker
            ticker={instrument.instrument}
            securityId={instrument.securityId}
            iconUrl={instrument.iconUrl}
            isExpanded={isExpanded}
            onToggle={toggle}
            isSelected={isSelected}
          />
        ),
      },
      {
        key: 'broker',
        header: t('columns.broker'),
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
        header: t('columns.account'),
        align: 'right',
        renderCell: (instrument, isExpanded) => {
          const allAccounts = instrument.brokers.flatMap((b) => b.accounts);
          const firstAccount = allAccounts[0];
          const extraAccounts = allAccounts.length - 1;
          if (isExpanded || !firstAccount) return null;
          return (
            <TableCellString
              value={
                firstAccount.accountName
                  ? `${firstAccount.accountId} (${firstAccount.accountName})`
                  : firstAccount.accountId
              }
              count={extraAccounts > 0 ? extraAccounts : undefined}
            />
          );
        },
      },
      {
        key: 'exchange',
        header: t('columns.exchange'),
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
        header: t('columns.quantity'),
        align: 'right',
        renderCell: (instrument) => (
          <TableCellNumbers value={formatQuantity(instrument.totalQuantity)} />
        ),
      },
      {
        key: 'avgOpenPrice',
        header: t('columns.purchasePrice'),
        align: 'right',
        renderCell: (instrument) => (
          <TableCellNumbers
            value={formatCurrency(
              instrument.avgOpenPrice,
              2,
              instrument.currency
            )}
          />
        ),
      },
      {
        key: 'currentPrice',
        header: t('columns.currentPrice'),
        align: 'right',
        renderCell: (instrument) =>
          instrument.currentPrice ? (
            <TableCellNumbers
              value={formatCurrency(
                instrument.currentPrice,
                2,
                instrument.currency
              )}
            />
          ) : (
            <TableCellNA />
          ),
      },
      {
        key: 'unrealizedPnlPct',
        header: t('columns.changePct'),
        align: 'right',
        renderCell: (instrument) => (
          <TableCellNumbers
            value={
              instrument.unrealizedPnlPct
                ? parseFloat(instrument.unrealizedPnlPct)
                : null
            }
            valueFormatter={(v) => `${v >= 0 ? '+' : ''}${formatNumber(v)}%`}
          />
        ),
      },
      {
        key: 'unrealizedPnlMoney',
        header: t('columns.unrealizedPnl'),
        align: 'right',
        renderCell: (instrument) => (
          <TableCellNumbers
            value={
              instrument.totalUnrealizedPnlMoney
                ? parseFloat(instrument.totalUnrealizedPnlMoney)
                : null
            }
            valueFormatter={(v) =>
              `${v >= 0 ? '+' : ''}${formatNumber(v)} ${currencySymbol(instrument.currency)}`
            }
          />
        ),
      },
      {
        key: 'realizedPnl',
        header: t('columns.realizedPnl'),
        align: 'right',
        renderCell: (instrument) => {
          const pnl = parseFloat(instrument.totalRealizedPnl || '0');
          return (
            <TableCellNumbers
              value={pnl === 0 ? null : pnl}
              valueFormatter={(v) =>
                `${v >= 0 ? '+' : ''}${formatNumber(v)} ${currencySymbol(instrument.currency)}`
              }
            />
          );
        },
      },
      {
        key: 'action',
        header: '',
        align: 'right',
        className: 'w-12',
        renderCell: (instrument) => (
          <TableCellButton
            icon="folder"
            onClick={() =>
              openInstrumentHistory(
                instrument.instrument,
                instrument.securityId,
                instrument.currency
              )
            }
          />
        ),
      },
    ],
    [openInstrumentHistory, t]
  );

  const {
    anchor,
    symbols: menuSymbols,
    tickerSecurityIds,
    selectedKeys,
    childSelectedKeys,
    childSelections,
    handleRowClick,
    handleChildRowClick,
    close: closeMenu,
  } = useTradeContextMenuBySymbol();
  const tableRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={tableRef} className="h-full overflow-hidden">
        <DataTable
          columns={columns}
          rows={instruments}
          getRowKey={(instrument) => instrument.instrument}
          onRowClick={(row, e) => {
            const allChildren: ChildInfo[] = row.brokers.flatMap((b) =>
              b.accounts.map((a) => ({
                brokerType: b.brokerType,
                accountId: a.accountId,
                securityId: row.securityId ?? null,
                positionIds: a.positionIds,
              }))
            );
            handleRowClick(row, e, allChildren);
          }}
          selectedKeys={selectedKeys}
          renderExpandedRows={(instrument, isSelected) => {
            const allSiblings: ChildInfo[] = instrument.brokers.flatMap((b) =>
              b.accounts.map((a) => ({
                brokerType: b.brokerType,
                accountId: a.accountId,
                securityId: instrument.securityId ?? null,
                positionIds: a.positionIds,
              }))
            );
            return (
              <>
                {instrument.brokers.map((broker) => (
                  <BrokerRow
                    key={`broker-${instrument.instrument}-${broker.brokerType}`}
                    instrumentKey={instrument.instrument}
                    broker={broker}
                    currency={instrument.currency}
                    isSelected={isSelected}
                    onActionClick={openInstrumentHistory}
                    childSelectedKeys={childSelectedKeys}
                    allSiblings={allSiblings}
                    onChildRowClick={handleChildRowClick}
                  />
                ))}
              </>
            );
          }}
          isLoading={
            isLoading || (isDataSyncInProgress && instruments.length === 0)
          }
          isEmpty={instruments.length === 0}
          loadingFallback={
            instruments.length === 0 ? (
              <PortfolioFirstLoadState />
            ) : (
              <PositionsTableSkeletons />
            )
          }
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
        tickerSecurityIds={tickerSecurityIds}
        childSelections={childSelections}
        labelType="positions"
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

export default PositionsPortfolioTable;
