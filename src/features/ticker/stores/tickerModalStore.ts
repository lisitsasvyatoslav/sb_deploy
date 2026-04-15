import { create } from 'zustand';

type TickerModalMode = 'default' | 'board_ticker';

interface BoardTickerConfig {
  cardId: number;
  boardId: number;
}

interface TickerModalState {
  isOpen: boolean;
  mode: TickerModalMode;
  boardTickerConfig: BoardTickerConfig | null;
  initialSearchQuery: string;
  selectedTickers: string[];
  selectedSecurityIds: number[];
  selectedTickerNames: string[];
  openModal: () => void;
  openModalWithSearch: (query: string) => void;
  openForBoardTicker: (cardId: number, boardId: number) => void;
  closeModal: () => void;
  toggleTicker: (symbol: string, securityId: number, name?: string) => void;
  removeTicker: (symbol: string, securityId: number) => void;
  clearSelection: () => void;
}

const MAX_SELECTION_DEFAULT = 5;
const MAX_SELECTION_BOARD = 1;

export const useTickerModalStore = create<TickerModalState>((set) => ({
  isOpen: false,
  mode: 'default',
  boardTickerConfig: null,
  initialSearchQuery: '',
  selectedTickers: [],
  selectedSecurityIds: [],
  selectedTickerNames: [],

  openModal: () =>
    set({
      isOpen: true,
      mode: 'default',
      boardTickerConfig: null,
      initialSearchQuery: '',
      selectedTickers: [],
      selectedSecurityIds: [],
      selectedTickerNames: [],
    }),

  openModalWithSearch: (query: string) =>
    set({
      isOpen: true,
      mode: 'default',
      boardTickerConfig: null,
      initialSearchQuery: query,
      selectedTickers: [],
      selectedSecurityIds: [],
      selectedTickerNames: [],
    }),

  openForBoardTicker: (cardId: number, boardId: number) =>
    set({
      isOpen: true,
      mode: 'board_ticker',
      boardTickerConfig: { cardId, boardId },
      initialSearchQuery: '',
      selectedTickers: [],
      selectedSecurityIds: [],
      selectedTickerNames: [],
    }),

  closeModal: () =>
    set({
      isOpen: false,
      mode: 'default',
      boardTickerConfig: null,
      initialSearchQuery: '',
    }),

  toggleTicker: (symbol: string, securityId: number, name?: string) =>
    set((state) => {
      const maxSelection =
        state.mode === 'board_ticker'
          ? MAX_SELECTION_BOARD
          : MAX_SELECTION_DEFAULT;
      const index = state.selectedSecurityIds.indexOf(securityId);

      if (index !== -1) {
        return {
          selectedTickers: state.selectedTickers.filter((_, i) => i !== index),
          selectedSecurityIds: state.selectedSecurityIds.filter(
            (_, i) => i !== index
          ),
          selectedTickerNames: state.selectedTickerNames.filter(
            (_, i) => i !== index
          ),
        };
      } else {
        if (state.mode === 'board_ticker') {
          return {
            selectedTickers: [symbol],
            selectedSecurityIds: [securityId],
            selectedTickerNames: [name || symbol],
          };
        }
        if (state.selectedSecurityIds.length < maxSelection) {
          return {
            selectedTickers: [...state.selectedTickers, symbol],
            selectedSecurityIds: [...state.selectedSecurityIds, securityId],
            selectedTickerNames: [...state.selectedTickerNames, name || symbol],
          };
        }
        return state;
      }
    }),

  removeTicker: (symbol: string, securityId: number) =>
    set((state) => {
      const index = state.selectedSecurityIds.indexOf(securityId);
      if (index !== -1) {
        return {
          selectedTickers: state.selectedTickers.filter((_, i) => i !== index),
          selectedSecurityIds: state.selectedSecurityIds.filter(
            (_, i) => i !== index
          ),
          selectedTickerNames: state.selectedTickerNames.filter(
            (_, i) => i !== index
          ),
        };
      }
      return state;
    }),

  clearSelection: () =>
    set({
      selectedTickers: [],
      selectedSecurityIds: [],
      selectedTickerNames: [],
    }),
}));
