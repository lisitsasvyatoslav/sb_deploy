import { create } from 'zustand';

interface DemoNoteState {
  title: string;
  content: string;
  isLoading: boolean;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useDemoNoteStore = create<DemoNoteState>((set) => ({
  title: '',
  content: '',
  isLoading: false,
  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  setIsLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ title: '', content: '', isLoading: false }),
}));
