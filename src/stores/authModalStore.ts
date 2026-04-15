import { create } from 'zustand';

export type AuthModalMode = 'login' | 'register' | 'forgot-password';

interface AuthModalState {
  isOpen: boolean;
  mode: AuthModalMode;

  // Actions
  openModal: (mode?: AuthModalMode) => void;
  closeModal: () => void;
  setMode: (mode: AuthModalMode) => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  mode: 'login',

  openModal: (mode: AuthModalMode = 'login') => {
    set({ isOpen: true, mode });
  },

  closeModal: () => {
    set({ isOpen: false });
  },

  setMode: (mode: AuthModalMode) => {
    set({ mode });
  },
}));
