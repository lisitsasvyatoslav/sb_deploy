import { create } from 'zustand';

interface CardSelectionState {
  selectedCards: number[];
  setSelectedCards: (cards: number[]) => void;
  addSelectedCard: (cardId: number) => void;
  removeSelectedCard: (cardId: number) => void;
  toggleSelectedCard: (cardId: number) => void;
  clearSelection: () => void;
}

export const useCardSelectionStore = create<CardSelectionState>((set) => ({
  selectedCards: [],

  setSelectedCards: (cards: number[]) => set({ selectedCards: cards }),

  addSelectedCard: (cardId: number) =>
    set((state) => ({
      selectedCards: state.selectedCards.includes(cardId)
        ? state.selectedCards
        : [...state.selectedCards, cardId],
    })),

  removeSelectedCard: (cardId: number) =>
    set((state) => ({
      selectedCards: state.selectedCards.filter((id) => id !== cardId),
    })),

  toggleSelectedCard: (cardId: number) =>
    set((state) => ({
      selectedCards: state.selectedCards.includes(cardId)
        ? state.selectedCards.filter((id) => id !== cardId)
        : [...state.selectedCards, cardId],
    })),

  clearSelection: () => set({ selectedCards: [] }),
}));
