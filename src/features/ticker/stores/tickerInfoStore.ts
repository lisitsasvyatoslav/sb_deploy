import { create } from 'zustand';

interface TickerInfoModalState {
  isOpen: boolean;
  securityId: number | null;
  cardId: number | null;
  savedPeriod: string | null;
  showBackButton: boolean;
  openModal: (
    securityId: number,
    showBackButton?: boolean,
    cardId?: number,
    savedPeriod?: string
  ) => void;
  closeModal: () => void;
}

export const useTickerInfoStore = create<TickerInfoModalState>((set) => ({
  isOpen: false,
  securityId: null,
  cardId: null,
  savedPeriod: null,
  showBackButton: false,

  openModal: (
    securityId: number,
    showBackButton = false,
    cardId?: number,
    savedPeriod?: string
  ) =>
    set({
      isOpen: true,
      securityId,
      cardId: cardId || null,
      savedPeriod: savedPeriod || null,
      showBackButton,
    }),

  closeModal: () =>
    set({
      isOpen: false,
      securityId: null,
      cardId: null,
      savedPeriod: null,
      showBackButton: false,
    }),
}));
