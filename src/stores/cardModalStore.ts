import { create } from 'zustand';

interface CardModalState {
  isOpen: boolean;
  cardId: number | null;
  boardId: number | null;
  open: (cardId: number, boardId: number) => void;
  close: () => void;
}

export const useCardModalStore = create<CardModalState>((set) => ({
  isOpen: false,
  cardId: null,
  boardId: null,
  open: (cardId, boardId) => set({ isOpen: true, cardId, boardId }),
  close: () => set({ isOpen: false, cardId: null, boardId: null }),
}));
