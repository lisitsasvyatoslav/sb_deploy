'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { DropdownBase } from '@/shared/ui/Dropdown/DropdownBase';
import { useTranslation } from '@/shared/i18n/client';
import { formatCurrency } from '../utils/formatCurrency';
import EntityActionMenuContent from './EntityActionMenu';
import DataTable from '@/shared/ui/DataTable';
import type { ColumnDef } from '@/shared/ui/DataTable';
import { DataTableRow, DataTableCell } from '@/shared/ui/DataTable';
import { TableCellString, TableCellNumbers } from '@/shared/ui/DataTable/cells';
import { CloseOpenRow } from '@/shared/ui/DataTable/primitives';
import BrokerIcon from '@/shared/ui/BrokerIcon';
import {
  useBrokerConnectionsQuery,
  useBrokerAccountsQuery,
  useDeleteBrokerConnectionMutation,
  useDeleteAccountMutation,
} from '@/features/broker/queries';
import { useStatisticsStore } from '@/stores/statisticsStore';
import { getClientRegionConfig } from '@/shared/config/region';
import { showErrorToast } from '@/shared/utils/toast';
import CatalogEmptyState from './CatalogEmptyState';
import type { BrokerConnection, TradingAccount } from '@/types';
import { useAccountsSummaryQuery, type AccountSummaryItem } from '../queries';
import SectionHeader from './SectionHeader';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface AccountWithValue extends TradingAccount {
  marketValue: number | null;
  currency: string | null;
}

interface BrokerNode {
  connectionId: number;
  brokerName: string;
  brokerCode: string;
  brokerValue: number | null;
  brokerCurrency: string | null;
  primaryAccountId: string;
  extraAccountsCount: number;
  accounts: AccountWithValue[];
  status: BrokerConnection['status'];
}

interface AccountSummaryAggregate {
  value: number;
  currency: string | null;
}

function formatValue(
  value: number | null,
  currency: string | null,
  fallback: string
): string {
  return formatCurrency(value, currency ?? fallback);
}

function buildSummaryMap(items: AccountSummaryItem[]) {
  const byAccount = new Map<string, AccountSummaryAggregate>();
  const byConnection = new Map<number, AccountSummaryAggregate>();

  for (const item of items) {
    if (item.accountId) {
      const key = `${item.brokerType}:${item.accountId}`;
      const existing = byAccount.get(key);
      byAccount.set(key, {
        value: (existing?.value ?? 0) + item.marketValue,
        // Backend guarantees same-account rows share currency via deriveEffectiveCurrency;
        // keep the first non-null.
        currency: existing?.currency ?? item.currency,
      });
    }
    if (item.connectionId != null) {
      const existing = byConnection.get(item.connectionId);
      byConnection.set(item.connectionId, {
        value: (existing?.value ?? 0) + item.marketValue,
        currency: existing?.currency ?? item.currency,
      });
    }
  }

  return { byAccount, byConnection };
}

function groupAccountsByBroker(
  connections: BrokerConnection[],
  accounts: TradingAccount[],
  summaryMap: ReturnType<typeof buildSummaryMap> | null
): BrokerNode[] {
  return connections.map((conn) => {
    const connAccounts = accounts.filter((a) => a.connectionId === conn.id);
    const primary = connAccounts[0];
    const brokerCode = conn.brokerCode;

    const allAccountsWithValues: AccountWithValue[] = connAccounts.map((a) => {
      const entry = summaryMap?.byAccount.get(`${a.brokerType}:${a.accountId}`);
      return {
        ...a,
        marketValue: entry?.value ?? null,
        currency: entry?.currency ?? null,
      };
    });

    const brokerEntry = summaryMap?.byConnection.get(conn.id);
    return {
      connectionId: conn.id,
      brokerName: conn.brokerName || brokerCode,
      brokerCode,
      brokerValue: brokerEntry?.value ?? null,
      brokerCurrency: brokerEntry?.currency ?? null,
      primaryAccountId: primary?.accountName
        ? `${primary.accountId} (${primary.accountName})`
        : (primary?.accountId ?? '—'),
      extraAccountsCount: Math.max(0, connAccounts.length - 1),
      accounts: allAccountsWithValues,
      status: conn.status,
    };
  });
}

/** Three-dot menu for broker/account rows */
function ActionMenu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownBase
      open={open}
      onOpenChange={setOpen}
      trigger={({ onClick, triggerRef }) => (
        <button
          ref={triggerRef}
          type="button"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-spacing-4 rounded-radius-4 hover:bg-blackinverse-a8"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          aria-label="Account menu"
        >
          <Icon variant="more" size={16} className="text-blackinverse-a56" />
        </button>
      )}
      menu={
        <EntityActionMenuContent
          onDelete={() => {
            setOpen(false);
            onDelete();
          }}
          showEditHide={false}
        />
      }
      placement="bottom-right"
      offset={4}
    />
  );
}

/**
 * AccountsTreeSection — broker/accounts tree table for portfolio catalog
 *
 * Figma node: 3664:33911
 */
const AccountsTreeSection: React.FC = () => {
  const { t } = useTranslation('common');
  const { baseCurrency } = getClientRegionConfig();
  const setShowBrokerDialog = useStatisticsStore(
    (state) => state.setShowBrokerDialog
  );
  const { data: connections, isLoading: isLoadingConnections } =
    useBrokerConnectionsQuery();
  const { data: accounts, isLoading: isLoadingAccounts } =
    useBrokerAccountsQuery();
  const { data: accountsSummary } = useAccountsSummaryQuery();

  const deleteConnectionMutation = useDeleteBrokerConnectionMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'connection' | 'account';
    id: number;
    name: string;
  } | null>(null);

  const isLoading = isLoadingConnections || isLoadingAccounts;

  const summaryMap = useMemo(
    () => (accountsSummary ? buildSummaryMap(accountsSummary) : null),
    [accountsSummary]
  );

  const brokerNodes = useMemo(
    () => groupAccountsByBroker(connections ?? [], accounts ?? [], summaryMap),
    [connections, accounts, summaryMap]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'connection') {
        await deleteConnectionMutation.mutateAsync(deleteTarget.id);
      } else {
        await deleteAccountMutation.mutateAsync(deleteTarget.id);
      }
      setDeleteTarget(null);
    } catch {
      showErrorToast(
        t('boardSections.portfolio.createError', 'Failed to delete')
      );
    }
  }, [deleteTarget, deleteConnectionMutation, deleteAccountMutation, t]);

  const columns = useMemo<ColumnDef<BrokerNode>[]>(
    () => [
      {
        key: 'broker',
        header: '',
        align: 'left',
        renderCell: (row, isExpanded, toggle) => (
          <div className="flex items-center gap-spacing-6 p-spacing-4">
            {row.accounts.length > 1 ? (
              <CloseOpenRow isOpen={isExpanded} onClick={toggle} />
            ) : (
              <div className="w-3" />
            )}
            <BrokerIcon broker={row.brokerCode} size={24} />
            <span className="text-12 leading-16 font-medium text-blackinverse-a100">
              {row.brokerName}
            </span>
            {/* {row.status === 'expired' && (
              <span
                title={t('boardSections.portfolio.connectionExpired')}
                className="text-10 leading-12 tracking-tight-1 font-medium text-status-negative px-spacing-4 py-spacing-2 bg-colors-status_negative_bg rounded-radius-4"
              >
                {t('boardSections.portfolio.expired')}
              </span>
            )} */}
          </div>
        ),
      },
      {
        key: 'value',
        header: '',
        align: 'right',
        renderCell: (row) => (
          <TableCellNumbers
            value={formatValue(
              row.brokerValue,
              row.brokerCurrency,
              baseCurrency
            )}
          />
        ),
      },
      {
        key: 'account',
        header: '',
        align: 'right',
        renderCell: (row) => (
          <TableCellString
            value={row.primaryAccountId}
            count={
              row.extraAccountsCount > 0
                ? `+${row.extraAccountsCount}`
                : undefined
            }
          />
        ),
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        className: 'w-8',
        renderCell: (row) => (
          <ActionMenu
            onDelete={() =>
              setDeleteTarget({
                type: 'connection',
                id: row.connectionId,
                name: row.brokerName,
              })
            }
          />
        ),
      },
    ],
    [baseCurrency]
  );

  const renderExpandedRows = (broker: BrokerNode) =>
    broker.accounts.slice(1).map((account) => (
      <DataTableRow key={`account-${account.id}`}>
        {/* Empty broker cell */}
        <DataTableCell />
        {/* Value */}
        <DataTableCell align="right">
          <TableCellNumbers
            value={formatValue(
              account.marketValue,
              account.currency,
              baseCurrency
            )}
          />
        </DataTableCell>
        {/* Account ID */}
        <DataTableCell align="right">
          <TableCellString
            value={
              account.accountName
                ? `${account.accountId} (${account.accountName})`
                : account.accountId
            }
          />
        </DataTableCell>
        {/* Actions */}
        <DataTableCell align="right" className="w-8">
          <ActionMenu
            onDelete={() =>
              setDeleteTarget({
                type: 'account',
                id: account.id,
                name: account.accountId,
              })
            }
          />
        </DataTableCell>
      </DataTableRow>
    ));

  const isDeleting =
    deleteConnectionMutation.isPending || deleteAccountMutation.isPending;

  return (
    <>
      <div className="flex flex-col gap-spacing-4 rounded-radius-4 pt-spacing-6 pb-spacing-12">
        <SectionHeader
          title={t('boardSections.portfolio.accountsTitle')}
          onAction={() => setShowBrokerDialog(true)}
          actionLabel={t('boardSections.portfolio.connectBroker')}
          actionAriaLabel="Add account"
        />
        {isLoading ? (
          <div className="px-spacing-16 py-spacing-32 text-center text-blackinverse-a32 text-12">
            {t('loading')}
          </div>
        ) : brokerNodes.length > 0 ? (
          <div className="bg-wrapper-a4 rounded-radius-4 overflow-hidden">
            <DataTable
              key={`loaded-${brokerNodes[0].connectionId}`}
              columns={columns}
              rows={brokerNodes}
              getRowKey={(row) => String(row.connectionId)}
              renderExpandedRows={renderExpandedRows}
              tableHeadClassName="hidden"
              defaultExpandedKeys={
                new Set([String(brokerNodes[0].connectionId)])
              }
            />
          </div>
        ) : (
          <CatalogEmptyState
            variant="accent"
            title={t('portfolioCatalog.empty.title', 'No data')}
            description={t(
              'portfolioCatalog.empty.brokerDescription',
              'Connect a broker to effectively manage your assets.'
            )}
            actionLabel={t(
              'portfolioCatalog.empty.connectBroker',
              'Connect broker'
            )}
            onAction={() => setShowBrokerDialog(true)}
          />
        )}
      </div>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title={
          deleteTarget?.type === 'connection'
            ? t('portfolioCatalog.deleteConnection.title', 'Delete broker')
            : t('portfolioCatalog.deleteAccount.title', 'Delete account')
        }
        description={
          deleteTarget?.type === 'connection'
            ? t('portfolioCatalog.deleteConnection.body', {
                defaultValue:
                  'Are you sure you want to delete "{{name}}"?\nThis action cannot be undone',
                name: deleteTarget?.name ?? '',
              })
            : t('portfolioCatalog.deleteAccount.body', {
                defaultValue:
                  'Are you sure you want to delete account "{{name}}"?\nThis action cannot be undone',
                name: deleteTarget?.name ?? '',
              })
        }
        warning={
          deleteTarget?.type === 'connection'
            ? t(
                'portfolioCatalog.deleteConnection.warning',
                'All trade and account history will be permanently deleted'
              )
            : t(
                'portfolioCatalog.deleteAccount.warning',
                'All trade history will be permanently deleted'
              )
        }
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default AccountsTreeSection;
