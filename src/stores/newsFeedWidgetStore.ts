import type { NewsItem } from 'finsignal-feed-explore';
import { create } from 'zustand';

interface NewsFeedWidgetStore {
  /** First 5 loaded news items per news_feed widget card, keyed by cardId */
  itemsByCard: Record<number, NewsItem[]>;
  setItems: (cardId: number, items: NewsItem[]) => void;
  getItems: (cardId: number) => NewsItem[];
  clearItems: (cardId: number) => void;
}

export const useNewsFeedWidgetStore = create<NewsFeedWidgetStore>(
  (set, get) => ({
    itemsByCard: {},

    setItems: (cardId, items) =>
      set((state) => ({
        itemsByCard: { ...state.itemsByCard, [cardId]: items },
      })),

    getItems: (cardId) => get().itemsByCard[cardId] ?? [],

    clearItems: (cardId) =>
      set((state) => {
        const { [cardId]: _, ...rest } = state.itemsByCard;
        return { itemsByCard: rest };
      }),
  })
);
