import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import type { BrokerPositionsFilterParams } from '@/types';
import { showErrorToast, showUiToast } from '@/shared/utils/toast';
import { useStatisticsStore } from '@/stores/statisticsStore';
import { useGroupedPositionsQuery } from '@/features/statistics/queries';
import { useBrokerAccountsQuery } from '@/features/broker/queries';
import { transformAccountsToBrokers } from '@/shared/utils/brokerTransform';
import {
  useCreateInstrumentPortfolioMutation,
  usePortfolioDetailQuery,
  useUpdateInstrumentPortfolioMutation,
} from '../queries';
import { symbolsFromPortfolioFillRule } from '../utils/instrumentFillRule';
import type { CreatePortfolioFromDataModalMode } from '../components/CreatePortfolioFromDataModal';
import { useYandexMetrika } from '@/shared/hooks';
import { ymBrokerNameFromPortfolioFillRule } from '../utils/ymPortfolioAnalytics';

type ModalSnapshot = {
  positionsFilters: BrokerPositionsFilterParams;
  dateRange: string;
  selectedAccountIds: string[] | null;
};

interface UsePortfolioFormModalParams {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: CreatePortfolioFromDataModalMode;
  portfolioId?: number | null;
}

export function usePortfolioFormModal({
  open,
  onOpenChange,
  mode,
  portfolioId,
}: UsePortfolioFormModalParams) {
  const { t } = useTranslation('common');
  const [name, setName] = useState('');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedBrokerTypes, setSelectedBrokerTypes] = useState<
    string[] | null
  >(null);

  const { trackEvent } = useYandexMetrika();

  const setPositionsFilters = useStatisticsStore(
    (state) => state.setPositionsFilters
  );
  const setDateRange = useStatisticsStore((state) => state.setDateRange);
  const positionsFilters = useStatisticsStore(
    (state) => state.positionsFilters
  );
  const dateRange = useStatisticsStore((state) => state.dateRange);
  const selectedAccountIds = useStatisticsStore(
    (state) => state.selectedAccountIds
  );
  const setSelectedAccountIds = useStatisticsStore(
    (state) => state.setSelectedAccountIds
  );

  const snapshotRef = useRef<ModalSnapshot | null>(null);
  const capturedForOpenSessionRef = useRef(false);
  const userTouchedRef = useRef(false);

  const { data: accounts, isSuccess: accountsSuccess } =
    useBrokerAccountsQuery();
  const hasBrokers = accountsSuccess && !!accounts && accounts.length > 0;

  const brokers = useMemo(
    () => (accounts ? transformAccountsToBrokers(accounts) : []),
    [accounts]
  );

  const availableAccounts = useMemo(() => {
    if (selectedBrokerTypes === null) {
      return brokers.flatMap((b) => b.accounts);
    }
    return brokers
      .filter((b) => selectedBrokerTypes.includes(b.type))
      .flatMap((b) => b.accounts);
  }, [brokers, selectedBrokerTypes]);

  const { data: positionsData } = useGroupedPositionsQuery(positionsFilters);
  const securityIdMap = useMemo(() => {
    const map: Record<string, number | undefined> = {};
    for (const group of positionsData?.data ?? []) {
      if (group.securityId) {
        map[group.instrument] = group.securityId;
      }
    }
    return map;
  }, [positionsData?.data]);

  const detailEnabled =
    open && mode === 'edit' && portfolioId != null && portfolioId > 0;
  const {
    data: portfolio,
    isLoading: isPortfolioLoading,
    isError: isPortfolioError,
  } = usePortfolioDetailQuery(
    detailEnabled ? portfolioId! : null,
    detailEnabled
  );

  const createMutation = useCreateInstrumentPortfolioMutation();
  const updateMutation = useUpdateInstrumentPortfolioMutation();

  const handleSetName = useCallback((value: string) => {
    userTouchedRef.current = true;
    setName(value);
  }, []);

  const handleSetSelectedInstruments = useCallback((instruments: string[]) => {
    userTouchedRef.current = true;
    setSelectedInstruments(instruments);
  }, []);

  // Snapshot store state on open, restore on close
  useEffect(() => {
    if (!open) {
      capturedForOpenSessionRef.current = false;
      userTouchedRef.current = false;
      if (snapshotRef.current) {
        setPositionsFilters(snapshotRef.current.positionsFilters);
        setDateRange(snapshotRef.current.dateRange);
        setSelectedAccountIds(snapshotRef.current.selectedAccountIds);
        snapshotRef.current = null;
      }
      setSelectedBrokerTypes(null);
      return;
    }
    if (!capturedForOpenSessionRef.current) {
      capturedForOpenSessionRef.current = true;
      const st = useStatisticsStore.getState();
      snapshotRef.current = {
        positionsFilters: structuredClone(st.positionsFilters),
        dateRange: st.dateRange,
        selectedAccountIds: st.selectedAccountIds,
      };
      setPositionsFilters({
        page: 1,
        pageSize: 200,
        search: null,
        portfolioId: null,
        accountIds: null,
      });
      setSelectedAccountIds(null);
      setSelectedBrokerTypes(null);
    }
    // Restore on unmount (e.g. navigation while modal is open)
    return () => {
      if (snapshotRef.current) {
        setPositionsFilters(snapshotRef.current.positionsFilters);
        setDateRange(snapshotRef.current.dateRange);
        setSelectedAccountIds(snapshotRef.current.selectedAccountIds);
        snapshotRef.current = null;
        capturedForOpenSessionRef.current = false;
      }
    };
  }, [open, setPositionsFilters, setDateRange, setSelectedAccountIds]);

  // Sync selected accounts when available accounts change:
  // - Remove accounts that no longer belong to selected brokers
  // - Auto-select new accounts that appeared (e.g. when adding a broker)
  const prevAvailableIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (selectedAccountIds === null) {
      prevAvailableIdsRef.current = new Set(availableAccounts.map((a) => a.id));
      return;
    }
    const validIds = new Set(availableAccounts.map((a) => a.id));
    const newIds = [...validIds].filter(
      (id) => !prevAvailableIdsRef.current.has(id)
    );
    prevAvailableIdsRef.current = validIds;

    // Prune invalid + auto-select newly appeared accounts
    const pruned = selectedAccountIds.filter((id) => validIds.has(id));
    const merged = [...pruned, ...newIds];

    // Normalize to null when all available accounts are selected
    if (validIds.size > 0 && merged.length >= validIds.size) {
      setSelectedAccountIds(null);
      return;
    }

    if (merged.length !== selectedAccountIds.length || newIds.length > 0) {
      setSelectedAccountIds(merged.length > 0 ? merged : null);
    }
  }, [availableAccounts, selectedAccountIds, setSelectedAccountIds]);

  // Sync API filters when broker/account selection changes
  useEffect(() => {
    if (selectedBrokerTypes !== null) {
      const availableIds = availableAccounts.map((a) => a.id);
      setPositionsFilters({
        accountIds: selectedAccountIds ?? availableIds,
        page: 1,
      });
    } else if (selectedAccountIds === null) {
      setPositionsFilters({ accountIds: null, page: 1 });
    }
  }, [
    availableAccounts,
    selectedBrokerTypes,
    selectedAccountIds,
    setPositionsFilters,
  ]);

  const applyPortfolioData = useCallback(
    (p: NonNullable<typeof portfolio>) => {
      portfolioAppliedIdRef.current = p.id;
      setName(p.name);
      setSelectedInstruments(symbolsFromPortfolioFillRule(p.fillRule));
      const filter = p.fillRule?.filter;
      if (filter) {
        if (filter.brokerTypes && filter.brokerTypes.length > 0) {
          setSelectedBrokerTypes(filter.brokerTypes);
        }
        if (filter.selectedAccountIds && filter.selectedAccountIds.length > 0) {
          setSelectedAccountIds(filter.selectedAccountIds);
          setPositionsFilters({
            accountIds: filter.selectedAccountIds,
            page: 1,
          });
        }
        if (filter.dateRange) {
          setDateRange(filter.dateRange);
        }
      }
    },
    [setSelectedAccountIds, setPositionsFilters, setDateRange]
  );

  // Reset form state only when modal opens (not on every dep change)
  const prevOpenRef = useRef(false);
  const portfolioAppliedIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!open) {
      prevOpenRef.current = false;
      portfolioAppliedIdRef.current = null;
      return;
    }
    if (prevOpenRef.current) {
      // Portfolio arrived async — apply only if user hasn't interacted yet
      if (
        mode === 'edit' &&
        portfolio &&
        portfolioAppliedIdRef.current !== portfolio.id &&
        !userTouchedRef.current
      ) {
        applyPortfolioData(portfolio);
      }
      return;
    }
    prevOpenRef.current = true;

    if (mode === 'create') {
      setName('');
      setSelectedInstruments([]);
    } else if (mode === 'edit' && portfolio) {
      applyPortfolioData(portfolio);
    }
  }, [open, mode, portfolio, applyPortfolioData]);

  const initialParentInstruments = useMemo(() => {
    if (mode !== 'edit' || !portfolio) return undefined;
    return symbolsFromPortfolioFillRule(portfolio.fillRule);
  }, [mode, portfolio]);

  const handleSearchChange = useCallback(
    (value: string) => {
      const q = value.trim();
      setPositionsFilters({
        search: q.length > 0 ? q : null,
        page: 1,
      });
    },
    [setPositionsFilters]
  );

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSubmit = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showErrorToast(
        t('portfolioCatalog.createFromData.errorName', 'Enter portfolio name')
      );
      return;
    }

    // Preserve dynamic fill rules (e.g. "all") when editing — only require
    // instrument selection for create mode or portfolios that already use instruments.
    const isAllTypePortfolio =
      mode === 'edit' && portfolio?.fillRule?.type === 'all';

    if (selectedInstruments.length === 0 && !isAllTypePortfolio) {
      showErrorToast(
        t(
          'portfolioCatalog.createFromData.errorInstruments',
          'Select at least one instrument'
        )
      );
      return;
    }

    const fillRule =
      isAllTypePortfolio && selectedInstruments.length === 0
        ? undefined // preserve original fill rule — only update name
        : {
            type: 'instrument' as const,
            instrumentFilter: {
              symbols: selectedInstruments,
              ...(selectedBrokerTypes
                ? { brokerTypes: selectedBrokerTypes }
                : {}),
              ...(selectedAccountIds ? { selectedAccountIds } : {}),
              ...(dateRange && dateRange !== 'all' ? { dateRange } : {}),
            },
          };

    try {
      if (mode === 'create') {
        const created = await createMutation.mutateAsync({
          name: trimmed,
          fillRule: fillRule!,
        });
        trackEvent('portfolio_created', {
          portfolio_id: created.id,
          broker_name: ymBrokerNameFromPortfolioFillRule(created.fillRule),
        });
        showUiToast({
          type: 'success',
          title: t('portfolioCatalog.createFromData.successToastTitle'),
          caption: t('portfolioCatalog.createFromData.successToastCaption'),
        });
      } else if (portfolioId != null) {
        await updateMutation.mutateAsync({
          id: portfolioId,
          data: { name: trimmed, ...(fillRule ? { fillRule } : {}) },
        });
      }
      handleClose();
    } catch {
      showErrorToast(
        t(
          'portfolioCatalog.createFromData.errorSave',
          'Could not save portfolio. Try again.'
        )
      );
    }
  }, [
    name,
    selectedInstruments,
    selectedBrokerTypes,
    selectedAccountIds,
    dateRange,
    mode,
    portfolio,
    portfolioId,
    createMutation,
    updateMutation,
    handleClose,
    t,
  ]);

  const searchValue = positionsFilters.search ?? '';
  const title =
    mode === 'create'
      ? t('portfolioCatalog.createFromData.titleCreate')
      : t('portfolioCatalog.createFromData.titleEdit');
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const showEditLoader =
    mode === 'edit' && detailEnabled && isPortfolioLoading && !portfolio;
  const tableMountKey = `pf-modal-${open ? '1' : '0'}-${mode}-${portfolioId ?? 'new'}`;

  return {
    t,
    name,
    setName: handleSetName,
    selectedInstruments,
    setSelectedInstruments: handleSetSelectedInstruments,
    securityIdMap,
    initialParentInstruments,
    searchValue,
    dateRange,
    setDateRange,
    hasBrokers,
    brokers,
    selectedBrokerTypes,
    setSelectedBrokerTypes,
    availableAccounts,
    selectedAccountIds,
    setSelectedAccountIds,
    title,
    isSaving,
    showEditLoader,
    isPortfolioError,
    tableMountKey,
    handleSearchChange,
    handleClose,
    handleSubmit,
  };
}
