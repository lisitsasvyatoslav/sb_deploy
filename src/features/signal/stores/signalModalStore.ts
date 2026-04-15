import { create } from 'zustand';

type ModalMode = 'create' | 'edit' | 'view';

interface SignalModalState {
  isOpen: boolean;
  boardId?: number;
  signalId?: number;
  mode: ModalMode;

  // Actions
  openModal: (boardId?: number, signalId?: number, mode?: ModalMode) => void;
  closeModal: () => void;
}

export const useSignalModalStore = create<SignalModalState>((set) => ({
  isOpen: false,
  boardId: undefined,
  signalId: undefined,
  mode: 'create',

  openModal: (boardId?: number, signalId?: number, mode?: ModalMode) =>
    set({
      isOpen: true,
      boardId,
      signalId,
      // If mode is explicitly provided, use it
      // Otherwise auto-determine: signalId exists -> 'edit', no signalId -> 'create'
      mode: mode || (signalId ? 'edit' : 'create'),
    }),

  closeModal: () =>
    set({
      isOpen: false,
      boardId: undefined,
      signalId: undefined,
      mode: 'create',
    }),
}));
