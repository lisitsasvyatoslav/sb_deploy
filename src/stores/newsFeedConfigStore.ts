import { create } from 'zustand';

interface NewsFeedConfigStore {
  configuringCardId: number | null;
  openConfig: (cardId: number) => void;
  closeConfig: () => void;
}

export const useNewsFeedConfigStore = create<NewsFeedConfigStore>((set) => ({
  configuringCardId: null,

  openConfig: (cardId) => set({ configuringCardId: cardId }),

  closeConfig: () => set({ configuringCardId: null }),
}));
