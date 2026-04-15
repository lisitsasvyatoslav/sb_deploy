import { create } from 'zustand';

interface TickerFlowExpandedState {
  isExpanded: boolean;
  setExpanded: (value: boolean) => void;
  reset: () => void;
}

export const useTickerFlowExpandedStore = create<TickerFlowExpandedState>(
  (set) => ({
    isExpanded: false,
    setExpanded: (value: boolean) => set({ isExpanded: value }),
    reset: () => set({ isExpanded: false }),
  })
);
