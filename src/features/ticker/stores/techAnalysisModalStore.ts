import { create } from 'zustand';
import { TechnicalAnalysisData } from '@/types/ticker';

interface TechAnalysisModalState {
  isOpen: boolean;
  selectedTechData: TechnicalAnalysisData | null;
  showBackButton: boolean;
  cardId: number | null;
  openModal: (
    techData: TechnicalAnalysisData,
    showBackButton?: boolean,
    cardId?: number
  ) => void;
  closeModal: () => void;
}

export const useTechAnalysisModalStore = create<TechAnalysisModalState>(
  (set) => ({
    isOpen: false,
    selectedTechData: null,
    showBackButton: false,
    cardId: null,
    openModal: (techData, showBackButton = false, cardId?) =>
      set({
        isOpen: true,
        selectedTechData: techData,
        showBackButton,
        cardId: cardId ?? null,
      }),
    closeModal: () =>
      set({
        isOpen: false,
        selectedTechData: null,
        showBackButton: false,
        cardId: null,
      }),
  })
);
