import { create } from 'zustand';
import { Card } from '@/types';
import { NewsArticle } from '@/types/ticker';

interface NewsPreviewModalState {
  isOpen: boolean;
  card: Card | null;
  news: NewsArticle | null;
  openWithCard: (card: Card) => void;
  openWithNews: (news: NewsArticle) => void;
  closeModal: () => void;
}

export const useNewsPreviewStore = create<NewsPreviewModalState>((set) => ({
  isOpen: false,
  card: null,
  news: null,

  openWithCard: (card: Card) =>
    set({
      isOpen: true,
      card,
      news: null,
    }),

  openWithNews: (news: NewsArticle) =>
    set({
      isOpen: true,
      news,
      card: null,
    }),

  closeModal: () =>
    set({
      isOpen: false,
      card: null,
      news: null,
    }),
}));
