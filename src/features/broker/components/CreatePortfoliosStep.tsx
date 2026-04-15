'use client';

import Checkbox from '@/shared/ui/Checkbox';
import Button from '@/shared/ui/Button';
import {
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from '@/shared/ui/DataTable';
import { TableCellNumbers } from '@/shared/ui/DataTable/cells';
import { Icon } from '@/shared/ui/Icon';
import SearchInput from '@/shared/ui/SearchInput';
import Tooltip from '@/shared/ui/Tooltip';
import { useTranslation } from '@/shared/i18n/client';
import { formatCurrency } from '@/features/portfolio-catalog/utils/formatCurrency';
import type { DiscoveredAccount } from '@/types/broker';
import { cn } from '@/shared/utils/cn';
import React, { useMemo, useRef, useState } from 'react';
import StepHeader from './StepHeader';
import WizardTwoPanelLayout from './WizardTwoPanelLayout';
import type { SortDirection, SortState } from '@/shared/ui/DataTable';

export interface PortfolioFormData {
  unifiedName: string;
  selectedAccountIds: Set<string>;
}

interface CreatePortfoliosStepProps {
  accounts: DiscoveredAccount[];
  onSave: (data: PortfolioFormData) => void;
  onBack?: () => void;
  isSaving: boolean;
  existingDefaultPortfolioName?: string;
  /**
   * Account IDs that are already attached to an existing connection for this
   * same token. Rendered as checked+disabled rows; the user cannot toggle them.
   */
  existingAccountIds?: string[];
}

const CreatePortfoliosStep: React.FC<CreatePortfoliosStepProps> = ({
  accounts,
  onSave,
  onBack,
  isSaving,
  existingDefaultPortfolioName,
  existingAccountIds,
}) => {
  const { t } = useTranslation('broker');

  // Unified portfolio name (read-only)
  const i18nDefault = t('wizard.createPortfolios.unifiedDefault');
  const unifiedName =
    existingDefaultPortfolioName &&
    existingDefaultPortfolioName !== 'Default portfolio'
      ? existingDefaultPortfolioName
      : i18nDefault;

  const existingSet = useMemo(
    () => new Set(existingAccountIds ?? []),
    [existingAccountIds]
  );
  const allAlreadyAdded = useMemo(
    () =>
      accounts.length > 0 &&
      accounts.every((a) => existingSet.has(a.accountId)),
    [accounts, existingSet]
  );

  // Selectable (not-yet-added) accounts — these drive default selection and
  // the "select all" logic. Pre-existing accounts are excluded: they are shown
  // in the table as checked+disabled but cannot be toggled.
  const selectableAccountIds = useMemo(
    () =>
      accounts
        .filter((a) => !existingSet.has(a.accountId))
        .map((a) => a.accountId),
    [accounts, existingSet]
  );

  // Account selection — all selectable accounts selected by default
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(
    () => new Set(selectableAccountIds)
  );
  const [accountSearch, setAccountSearch] = useState('');
  const [sortState, setSortState] = useState<SortState>({
    key: '',
    direction: 'asc',
  });

  // Build balance display map from inline balances (included in validate
  // response). Uses the shared `formatCurrency` util so the output matches
  // what AccountsTreeSection renders on the /portfolio page — symbol-first
  // format (e.g. "₽ 2 147,51, $ 0,23") instead of the bespoke amount-first
  // style that used to live here.
  const balanceMap = useMemo(() => {
    const map = new Map<string, { display: string; raw: number }>();
    for (const account of accounts) {
      const entries = Object.entries(account.balances || {});
      if (entries.length === 0) {
        map.set(account.accountId, { display: '—', raw: 0 });
        continue;
      }
      const parts: string[] = [];
      let primaryAmount = 0;
      let isFirst = true;
      for (const [currency, amount] of entries) {
        const num = parseFloat(amount);
        // Use only the first (primary) currency amount for sorting
        // to avoid mixing different currencies into a meaningless total
        if (isFirst) {
          primaryAmount = num;
          isFirst = false;
        }
        parts.push(formatCurrency(num, currency));
      }
      map.set(account.accountId, {
        display: parts.join(', '),
        raw: primaryAmount,
      });
    }
    return map;
  }, [accounts]);

  // Filtered + sorted accounts
  const displayAccounts = useMemo(() => {
    let filtered = accounts;
    if (accountSearch.trim()) {
      const q = accountSearch.toLowerCase();
      filtered = accounts.filter(
        (a) =>
          a.accountId.toLowerCase().includes(q) ||
          (a.accountName && a.accountName.toLowerCase().includes(q))
      );
    }
    if (sortState.key) {
      filtered = [...filtered].sort((a, b) => {
        const dir = sortState.direction === 'asc' ? 1 : -1;
        if (sortState.key === 'account') {
          const nameA = a.accountName || a.accountId;
          const nameB = b.accountName || b.accountId;
          return nameA.localeCompare(nameB) * dir;
        }
        if (sortState.key === 'amount') {
          const rawA = balanceMap.get(a.accountId)?.raw ?? 0;
          const rawB = balanceMap.get(b.accountId)?.raw ?? 0;
          return (rawA - rawB) * dir;
        }
        return 0;
      });
    }
    return filtered;
  }, [accounts, accountSearch, sortState, balanceMap]);

  // Header checkbox state reflects only the *selectable* accounts (pre-existing
  // rows are always considered checked and can't be toggled from here).
  const allSelected =
    selectableAccountIds.length > 0 &&
    selectedAccountIds.size === selectableAccountIds.length;
  const someSelected =
    selectedAccountIds.size > 0 &&
    selectedAccountIds.size < selectableAccountIds.length;

  const toggleAccount = (accountId: string) => {
    if (existingSet.has(accountId)) return;
    setSelectedAccountIds((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) {
        next.delete(accountId);
      } else {
        next.add(accountId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allAlreadyAdded || selectableAccountIds.length === 0) return;
    if (allSelected) {
      setSelectedAccountIds(new Set());
    } else {
      setSelectedAccountIds(new Set(selectableAccountIds));
    }
  };

  const handleSort = (key: string, direction: SortDirection) => {
    setSortState({ key, direction });
  };

  const handleSave = () => {
    onSave({
      unifiedName,
      selectedAccountIds,
    });
  };

  return (
    <WizardTwoPanelLayout
      currentStep={3}
      totalSteps={3}
      onBack={onBack}
      showProgress={!!onBack}
    >
      <div className="flex-1 flex flex-col max-w-[432px] mx-auto w-full">
        {/* Header */}
        <div className="mb-base-32 mt-[112px]">
          <StepHeader
            title={t('wizard.createPortfolios.title')}
            description={t('wizard.createPortfolios.subtitle')}
          />
        </div>

        {/* Section 1: Unified portfolio (always ON, read-only) */}
        <PortfolioSection
          label={`${t('wizard.createPortfolios.unifiedLabel')} - "${unifiedName}"`}
          tooltipTitle={t('wizard.createPortfolios.unifiedTooltipTitle')}
          tooltipBody={t('wizard.createPortfolios.unifiedTooltipBody')}
          className="gap-base-10 pt-base-10 pb-base-20"
        >
          <p className="text-12 leading-16 tracking-tight-1 text-blackinverse-a56">
            {t('wizard.createPortfolios.unifiedDisclaimer')}
          </p>
        </PortfolioSection>

        {/* Section 2: Account selection table */}
        <div className="flex flex-col gap-base-14 pt-base-10 pb-base-20">
          <div className="flex items-center justify-between gap-base-6">
            <span className="text-14 font-semibold text-[var(--text-primary)]">
              {t('wizard.createPortfolios.accountsTitle')}
            </span>
            <SearchInput
              size="sm"
              value={accountSearch}
              onChange={(e) => setAccountSearch(e.target.value)}
              onClear={() => setAccountSearch('')}
              placeholder={t(
                'wizard.createPortfolios.accountsSearchPlaceholder'
              )}
              className="w-[140px] !h-[24px] [&_svg]:!w-3 [&_svg]:!h-3 [&_input]:!text-10 [&_input]:!leading-[1.2em] [&_input]:!tracking-tight-1 [&_input]:placeholder:!text-blackinverse-a40"
            />
          </div>

          {accounts.length > 0 && (
            <div className="bg-background-gray_low p-base-6 rounded-radius-2">
              <table className="w-full border-collapse">
                <DataTableHead>
                  <DataTableHeaderCell
                    checkbox
                    checked={allSelected || allAlreadyAdded}
                    indeterminate={someSelected && !allAlreadyAdded}
                    onCheckboxChange={toggleAll}
                    sortKey="account"
                    sortState={sortState}
                    onSort={handleSort}
                  >
                    {t('wizard.createPortfolios.accountsColumnAccount')}
                  </DataTableHeaderCell>
                  <DataTableHeaderCell
                    align="right"
                    sortKey="amount"
                    sortState={sortState}
                    onSort={handleSort}
                  >
                    {t('wizard.createPortfolios.accountsColumnAmount')}
                  </DataTableHeaderCell>
                </DataTableHead>
                <tbody>
                  {displayAccounts.map((account) => {
                    const isAlreadyAdded = existingSet.has(account.accountId);
                    // Pre-existing rows are rendered as checked (they *are* in
                    // the portfolio) but disabled — the user can't untick them
                    // from this wizard.
                    const isSelected =
                      isAlreadyAdded ||
                      selectedAccountIds.has(account.accountId);
                    const balance = balanceMap.get(account.accountId);
                    return (
                      <DataTableRow
                        key={account.accountId}
                        onClick={
                          isAlreadyAdded
                            ? undefined
                            : () => toggleAccount(account.accountId)
                        }
                        className={cn(isAlreadyAdded && 'opacity-50')}
                      >
                        <DataTableCell className="!py-spacing-16 !pl-spacing-8">
                          <div className="flex items-center gap-spacing-8">
                            <div className="pointer-events-none">
                              <Checkbox
                                size="sm"
                                variant="accent"
                                checked={isSelected}
                                disabled={isAlreadyAdded}
                                onChange={() =>
                                  toggleAccount(account.accountId)
                                }
                              />
                            </div>
                            <span className="text-12 font-medium leading-16 tracking-tight-1 text-blackinverse-a100">
                              {account.accountName || account.accountId}
                            </span>
                            {isAlreadyAdded && (
                              <span className="text-10 leading-12 tracking-tight-1 text-blackinverse-a56">
                                {t(
                                  'wizard.createPortfolios.accountAlreadyAdded'
                                )}
                              </span>
                            )}
                          </div>
                        </DataTableCell>
                        <DataTableCell
                          align="right"
                          className="!py-spacing-16 !pr-spacing-8"
                        >
                          <TableCellNumbers
                            value={balance?.display ?? '—'}
                            className="overflow-hidden [&>span]:truncate"
                          />
                        </DataTableCell>
                      </DataTableRow>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-base-8 mt-base-32">
          {allAlreadyAdded && (
            <p
              className="text-12 leading-16 tracking-tight-1 text-status-negative text-center"
              data-testid="all-accounts-already-added"
            >
              {t('wizard.createPortfolios.allAlreadyAdded')}
            </p>
          )}
          <Button
            variant="accent"
            fullWidth
            onClick={handleSave}
            loading={isSaving}
            disabled={
              isSaving || allAlreadyAdded || selectedAccountIds.size === 0
            }
            data-testid="portfolio-save-button"
          >
            {isSaving
              ? t('wizard.createPortfolios.saving')
              : t('wizard.createPortfolios.save')}
          </Button>
          <p className="text-10 leading-12 tracking-tight-1 text-blackinverse-a56 text-center">
            {t('wizard.createPortfolios.hint')}
          </p>
        </div>
      </div>
    </WizardTwoPanelLayout>
  );
};

// --- Internal sub-component for portfolio sections ---

interface PortfolioSectionProps {
  label: string;
  tooltipTitle: string;
  tooltipBody: string;
  className?: string;
  children: React.ReactNode;
}

const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  label,
  tooltipTitle,
  tooltipBody,
  className,
  children,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const iconRef = useRef<HTMLButtonElement>(null);

  const tooltipContent = (
    <div className="flex flex-col gap-base-4 w-[172px] whitespace-normal">
      <span className="text-12 font-normal leading-16 tracking-tight-1 text-blackinverse-a100">
        {tooltipTitle}
      </span>
      <span className="text-10 font-normal leading-12 tracking-tight-1 text-blackinverse-a56">
        {tooltipBody}
      </span>
    </div>
  );

  return (
    <div className={cn('flex flex-col', className ?? 'gap-base-14 pt-base-10')}>
      <div className="flex items-center gap-base-2">
        <span className="text-14 font-semibold text-[var(--text-primary)]">
          {label}
        </span>
        <div className="relative">
          <button
            ref={iconRef}
            type="button"
            className="flex items-center justify-center p-base-4 text-blackinverse-a32 hover:text-blackinverse-a56 transition-colors"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            aria-label={tooltipTitle}
          >
            <Icon variant="questionMarkCircle" size={16} />
          </button>
          <Tooltip
            content={tooltipContent}
            show={showTooltip}
            position="right"
            className="!whitespace-normal !px-spacing-8 !py-spacing-8 !rounded-radius-4 !bg-background-gray_high"
            portal
            anchorRef={iconRef}
          />
        </div>
      </div>
      {children}
    </div>
  );
};

export default CreatePortfoliosStep;
