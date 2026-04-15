import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsNavState {
  referrer: string | null;
  saveReferrer: () => void;
  consumeReferrer: () => string;
}

export const useSettingsNavStore = create<SettingsNavState>()(
  persist(
    (set, get) => ({
      referrer: null,
      saveReferrer: () => set({ referrer: window.location.pathname }),
      consumeReferrer: () => {
        const ref = get().referrer || '/';
        set({ referrer: null });
        return ref;
      },
    }),
    {
      name: 'settings-referrer',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
