import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '@/types';

interface DemoChatState {
  messages: Message[];
  userMessageCount: number;
  neededAuth: boolean;
  initialQuestion: string | null;
  isStreaming: boolean;

  setMessages: (msgs: Message[]) => void;
  addMessage: (msg: Message) => void;
  updateMessageById: (id: number, content: string) => void;
  updateLastAssistantMessage: (
    content: string,
    extra?: Partial<Message>
  ) => void;
  removeMessageById: (id: number) => void;
  setUserMessageCount: (count: number) => void;
  setNeededAuth: (v: boolean) => void;
  setStreaming: (v: boolean) => void;
  setInitialQuestion: (q: string | null) => void;
  reset: () => void;
}

export const useDemoChatStore = create<DemoChatState>()(
  persist(
    (set) => ({
      messages: [],
      userMessageCount: 0,
      neededAuth: false,
      initialQuestion: null,
      isStreaming: false,

      setMessages: (messages) => set({ messages }),
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      updateMessageById: (id, content) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, content } : m
          ),
        })),
      updateLastAssistantMessage: (content, extra) =>
        set((s) => ({
          messages: s.messages.map((m, i) =>
            i === s.messages.length - 1 && m.role === 'assistant'
              ? { ...m, content, ...extra }
              : m
          ),
        })),
      removeMessageById: (id) =>
        set((s) => ({
          messages: s.messages.filter((m) => m.id !== id),
        })),
      setUserMessageCount: (userMessageCount) => set({ userMessageCount }),
      setNeededAuth: (neededAuth) => set({ neededAuth }),
      setStreaming: (isStreaming) => set({ isStreaming }),
      setInitialQuestion: (initialQuestion) => set({ initialQuestion }),
      reset: () =>
        set({
          messages: [],
          userMessageCount: 0,
          neededAuth: false,
          initialQuestion: null,
          isStreaming: false,
        }),
    }),
    {
      name: 'demo-welcome',
      partialize: (state) => ({
        messages: state.isStreaming ? [] : state.messages,
        userMessageCount: state.isStreaming ? 0 : state.userMessageCount,
        neededAuth: state.neededAuth,
        initialQuestion: state.initialQuestion,
      }),
    }
  )
);
