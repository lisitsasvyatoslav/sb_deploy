import type { BrokerPositionsFilterParams } from '@/types';
import { trackYMEvent } from '@/shared/hooks/useYandexMetrika';
import { create } from 'zustand';

// Helper function to calculate date range
const getDateRange = (
  rangeValue: string
): { dateFrom: string | null; dateTo: string | null } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (rangeValue) {
    case '2days': {
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);
      return { dateFrom: twoDaysAgo.toISOString(), dateTo: now.toISOString() };
    }

    case 'week': {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      return { dateFrom: weekAgo.toISOString(), dateTo: now.toISOString() };
    }

    case 'month': {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      return { dateFrom: monthAgo.toISOString(), dateTo: now.toISOString() };
    }

    case '6month': {
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      return {
        dateFrom: sixMonthsAgo.toISOString(),
        dateTo: now.toISOString(),
      };
    }

    case 'year': {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(today.getFullYear() - 1);
      return { dateFrom: yearAgo.toISOString(), dateTo: now.toISOString() };
    }

    case '3year': {
      const threeYearsAgo = new Date(today);
      threeYearsAgo.setFullYear(today.getFullYear() - 3);
      return {
        dateFrom: threeYearsAgo.toISOString(),
        dateTo: now.toISOString(),
      };
    }

    case 'all':
    default:
      return { dateFrom: null, dateTo: null };
  }
};

interface StatisticsStore {
  // Filters state
  positionsFilters: BrokerPositionsFilterParams;
  dateRange: string; // UI state for date range selector
  selectedAccountIds: string[] | null; // Selected broker account IDs (null = all selected, [] = none selected)

  // UI state
  viewMode: 'portfolio' | 'history';
  selectedInstrument: string | null; // Ticker name when viewing history for a specific instrument
  selectedSecurityId: number | null; // Security ID for ticker icon in history view
  selectedCurrency: string | null; // Currency of selected instrument (USD, RUB, etc.)
  paginationMeta: { totalPages: number; totalCount: number } | null; // Set by active table (portfolio or history)
  showBrokerDialog: boolean; // Broker connection wizard modal state
  showBrokerManagementDialog: boolean; // Broker management modal state
  brokerDialogReturnTo: 'management' | null; // Where to return when going back from wizard
  isDataSyncInProgress: boolean; // Flag to indicate data sync is in progress (triggers polling)
  selectedPortfolioId: number | null; // Selected portfolio for statistics filtering (null = default/all)
  selectedPortfolioName: string | null; // Display name of selected portfolio
  portfolioTotalValue: number | null; // Total portfolio value (last data point from chart)

  // Actions
  setPositionsFilters: (filters: Partial<BrokerPositionsFilterParams>) => void;
  setDateRange: (rangeValue: string) => void;
  setSelectedAccountIds: (accountIds: string[] | null) => void;
  setViewMode: (mode: 'portfolio' | 'history') => void;
  setPaginationMeta: (
    meta: { totalPages: number; totalCount: number } | null
  ) => void;
  openInstrumentHistory: (
    instrument: string,
    securityId?: number,
    currency?: string
  ) => void;
  closeInstrumentHistory: () => void;
  setShowBrokerDialog: (show: boolean) => void;
  setShowBrokerManagementDialog: (show: boolean) => void;
  setBrokerDialogReturnTo: (returnTo: 'management' | null) => void;
  setIsDataSyncInProgress: (inProgress: boolean) => void;
  setSelectedPortfolioId: (id: number | null) => void;
  setSelectedPortfolioName: (name: string | null) => void;
  setPortfolioTotalValue: (value: number | null) => void;
  applyFilter: (params: {
    portfolioId: number | null;
    portfolioName: string | null;
    accountIds: string[] | null;
  }) => void;
  resetPositionsFilters: () => void;
}

const defaultFilters: BrokerPositionsFilterParams = {
  status: 'all',
  search: null,
  instrument: null,
  accountIds: null,
  dateFrom: null,
  dateTo: null,
  sortBy: 'last_trade_at',
  sortOrder: 'desc',
  page: 1,
  pageSize: 13,
};

/** Map UI account selection to filter-ready value: null=all, []=none, [...]= specific */
function normalizeAccountIds(
  accountIds: string[] | null
): string[] | null | undefined {
  if (accountIds === null) return null;
  return accountIds.length > 0 ? accountIds : [];
}

export const useStatisticsStore = create<StatisticsStore>((set) => ({
  positionsFilters: defaultFilters,
  dateRange: 'all',
  selectedAccountIds: null, // null = all accounts selected by default
  viewMode: 'portfolio',
  selectedInstrument: null,
  selectedSecurityId: null,
  selectedCurrency: null,
  paginationMeta: null,
  showBrokerDialog: false,
  showBrokerManagementDialog: false,
  brokerDialogReturnTo: null,
  isDataSyncInProgress: false,
  selectedPortfolioId: null,
  selectedPortfolioName: null,
  portfolioTotalValue: null,

  setPositionsFilters: (filters) =>
    set((state) => {
      const newFilters = {
        ...state.positionsFilters,
        // Reset page to 1 when filters change (except page itself)
        ...(filters.page === undefined && { page: 1 }),
        ...filters, // Then apply incoming filters (page will override if provided)
      };

      // If search is being explicitly changed while viewing a single ticker,
      // clear the single-ticker selection → falls back to grouped history view
      const searchChanged =
        'search' in filters && filters.search !== state.positionsFilters.search;
      const clearInstrument =
        searchChanged && state.selectedInstrument !== null;

      return {
        positionsFilters: newFilters,
        ...(clearInstrument && {
          selectedInstrument: null,
          selectedSecurityId: null,
          selectedCurrency: null,
        }),
      };
    }),

  setDateRange: (rangeValue) => {
    const { dateFrom, dateTo } = getDateRange(rangeValue);
    set((state) => ({
      dateRange: rangeValue,
      positionsFilters: {
        ...state.positionsFilters,
        dateFrom,
        dateTo,
        page: 1, // Reset to first page when date range changes
      },
    }));
  },

  setSelectedAccountIds: (accountIds) => {
    set((state) => ({
      selectedAccountIds: accountIds,
      positionsFilters: {
        ...state.positionsFilters,
        accountIds: normalizeAccountIds(accountIds),
        page: 1,
      },
    }));
  },

  setViewMode: (mode) =>
    set((state) => ({
      viewMode: mode,
      positionsFilters: {
        ...state.positionsFilters,
        page: 1, // Always reset page when switching views
        // When switching to portfolio, also clear search
        ...(mode === 'portfolio' && { search: null }),
      },
      // When switching to portfolio, clear instrument selection
      ...(mode === 'portfolio' && {
        selectedInstrument: null,
        selectedSecurityId: null,
        selectedCurrency: null,
      }),
    })),

  setPaginationMeta: (meta) => set({ paginationMeta: meta }),

  openInstrumentHistory: (instrument, securityId, currency) =>
    set((state) => ({
      viewMode: 'history',
      selectedInstrument: instrument,
      selectedSecurityId: securityId ?? null,
      selectedCurrency: currency ?? null,
      positionsFilters: {
        ...state.positionsFilters,
        search: instrument,
        page: 1,
      },
    })),

  closeInstrumentHistory: () =>
    set((state) => ({
      viewMode: 'history',
      selectedInstrument: null,
      selectedSecurityId: null,
      selectedCurrency: null,
      positionsFilters: { ...state.positionsFilters, search: null, page: 1 },
    })),

  setShowBrokerDialog: (show) =>
    set((state) => {
      if (show && !state.showBrokerDialog) {
        trackYMEvent('broker_connect_started', {});
      }
      return show ? { showBrokerDialog: true } : { showBrokerDialog: false };
    }),

  setShowBrokerManagementDialog: (show) =>
    set({ showBrokerManagementDialog: show }),

  setBrokerDialogReturnTo: (returnTo) =>
    set({ brokerDialogReturnTo: returnTo }),

  setIsDataSyncInProgress: (inProgress) =>
    set({ isDataSyncInProgress: inProgress }),

  setSelectedPortfolioId: (id) => set({ selectedPortfolioId: id }),

  setSelectedPortfolioName: (name) => set({ selectedPortfolioName: name }),

  setPortfolioTotalValue: (value) => set({ portfolioTotalValue: value }),

  applyFilter: ({ portfolioId, portfolioName, accountIds }) =>
    set((state) => ({
      selectedPortfolioId: portfolioId,
      selectedPortfolioName: portfolioName,
      selectedAccountIds: accountIds,
      positionsFilters: {
        ...state.positionsFilters,
        portfolioId,
        accountIds: normalizeAccountIds(accountIds),
        page: 1,
      },
    })),

  resetPositionsFilters: () =>
    set({
      positionsFilters: defaultFilters,
      dateRange: 'all',
      selectedAccountIds: null, // Reset to all accounts
    }),
}));
