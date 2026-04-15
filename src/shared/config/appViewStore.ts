import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'grid' | 'list';

interface ViewState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  containerWidth: number | undefined;
  setContainerWidth: (width: number) => void;
}

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      viewMode: 'grid',
      containerWidth: undefined,

      setViewMode: (mode) => set({ viewMode: mode }),

      toggleViewMode: () =>
        set((state) => ({
          viewMode: state.viewMode === 'grid' ? 'list' : 'grid',
        })),

      setContainerWidth: (width) => set({ containerWidth: width }),
    }),
    {
      name: 'app-view-state',
      partialize: (state) => ({ viewMode: state.viewMode }),
      onRehydrateStorage: () => (state) => {
        // Migrate legacy 'flow' value from localStorage to 'grid'
        if (state && (state.viewMode as string) === 'flow') {
          state.viewMode = 'grid';
        }
      },
    }
  )
);
