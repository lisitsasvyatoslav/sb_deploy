import { create } from 'zustand';
import { AnalyticsTab } from '@/types/ticker';
import { REGION } from '@/shared/config/region';

const DEFAULT_TAB: AnalyticsTab = REGION === 'us' ? 'fundamental' : 'news';

interface NewsAnalyticsModalState {
  isOpen: boolean;
  selectedTickers: string[]; // Ticker symbols passed from TickerPickerModal
  selectedSecurityIds: number[]; // Security IDs of selected tickers
  activeTab: AnalyticsTab;
  selectedNewsIds: string[];
  selectedFundamentalIds: string[];
  selectedTechnicalIds: string[];

  // Actions
  openModal: (tickers: string[], securityIds: number[]) => void;
  closeModal: () => void;
  setActiveTab: (tab: AnalyticsTab) => void;

  // Ticker management
  removeTicker: (
    symbol: string,
    securityId: number,
    relatedNewsIds?: string[],
    relatedFundamentalIds?: string[],
    relatedTechnicalIds?: string[]
  ) => void;

  // Row selection per tab
  toggleNewsRow: (id: string) => void;
  toggleFundamentalRow: (id: string) => void;
  toggleTechnicalRow: (id: string) => void;

  // Utility
  getTotalSelectedCount: () => number;
  clearSelection: () => void;
}

export const useNewsAnalyticsModalStore = create<NewsAnalyticsModalState>(
  (set, get) => ({
    isOpen: false,
    selectedTickers: [],
    selectedSecurityIds: [],
    activeTab: DEFAULT_TAB,
    selectedNewsIds: [],
    selectedFundamentalIds: [],
    selectedTechnicalIds: [],

    openModal: (tickers: string[], securityIds: number[]) =>
      set({
        isOpen: true,
        selectedTickers: tickers,
        selectedSecurityIds: securityIds,
        activeTab: DEFAULT_TAB,
        selectedNewsIds: [],
        selectedFundamentalIds: [],
        selectedTechnicalIds: [],
      }),

    closeModal: () =>
      set({
        isOpen: false,
        selectedTickers: [],
        selectedSecurityIds: [],
        selectedNewsIds: [],
        selectedFundamentalIds: [],
        selectedTechnicalIds: [],
      }),

    setActiveTab: (tab: AnalyticsTab) => set({ activeTab: tab }),

    removeTicker: (
      symbol: string,
      securityId: number,
      relatedNewsIds?: string[],
      relatedFundamentalIds?: string[],
      relatedTechnicalIds?: string[]
    ) =>
      set((state) => {
        const index = state.selectedSecurityIds.indexOf(securityId);
        if (index !== -1) {
          return {
            selectedTickers: state.selectedTickers.filter(
              (_, i) => i !== index
            ),
            selectedSecurityIds: state.selectedSecurityIds.filter(
              (_, i) => i !== index
            ),
            selectedNewsIds: relatedNewsIds
              ? state.selectedNewsIds.filter(
                  (id) => !relatedNewsIds.includes(id)
                )
              : state.selectedNewsIds,
            selectedFundamentalIds: relatedFundamentalIds
              ? state.selectedFundamentalIds.filter(
                  (id) => !relatedFundamentalIds.includes(id)
                )
              : state.selectedFundamentalIds,
            selectedTechnicalIds: relatedTechnicalIds
              ? state.selectedTechnicalIds.filter(
                  (id) => !relatedTechnicalIds.includes(id)
                )
              : state.selectedTechnicalIds,
          };
        }
        return state;
      }),

    toggleNewsRow: (id: string) =>
      set((state) => {
        if (state.selectedNewsIds.includes(id)) {
          return {
            selectedNewsIds: state.selectedNewsIds.filter((i) => i !== id),
          };
        } else {
          return {
            selectedNewsIds: [...state.selectedNewsIds, id],
          };
        }
      }),

    toggleFundamentalRow: (id: string) =>
      set((state) => {
        if (state.selectedFundamentalIds.includes(id)) {
          return {
            selectedFundamentalIds: state.selectedFundamentalIds.filter(
              (i) => i !== id
            ),
          };
        } else {
          return {
            selectedFundamentalIds: [...state.selectedFundamentalIds, id],
          };
        }
      }),

    toggleTechnicalRow: (id: string) =>
      set((state) => {
        if (state.selectedTechnicalIds.includes(id)) {
          return {
            selectedTechnicalIds: state.selectedTechnicalIds.filter(
              (i) => i !== id
            ),
          };
        } else {
          return {
            selectedTechnicalIds: [...state.selectedTechnicalIds, id],
          };
        }
      }),

    getTotalSelectedCount: () => {
      const state = get();
      const rowCount =
        state.selectedNewsIds.length +
        state.selectedFundamentalIds.length +
        state.selectedTechnicalIds.length;
      return state.selectedTickers.length + rowCount;
    },

    clearSelection: () =>
      set({
        selectedNewsIds: [],
        selectedFundamentalIds: [],
        selectedTechnicalIds: [],
      }),
  })
);
