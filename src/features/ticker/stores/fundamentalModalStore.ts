import { create } from 'zustand';
import { FundamentalData } from '@/types/ticker';

interface FundamentalModalState {
  isOpen: boolean;
  selectedFundamentalData: FundamentalData | null;
  showBackButton: boolean;
  cardId: number | null;
  openModal: (
    fundamentalData: FundamentalData,
    showBackButton?: boolean,
    cardId?: number
  ) => void;
  closeModal: () => void;
}

export const useFundamentalModalStore = create<FundamentalModalState>(
  (set) => ({
    isOpen: false,
    selectedFundamentalData: null,
    showBackButton: false,
    cardId: null,
    openModal: (fundamentalData, showBackButton = false, cardId?) =>
      set({
        isOpen: true,
        selectedFundamentalData: fundamentalData,
        showBackButton,
        cardId: cardId ?? null,
      }),
    closeModal: () =>
      set({
        isOpen: false,
        selectedFundamentalData: null,
        showBackButton: false,
        cardId: null,
      }),
  })
);
