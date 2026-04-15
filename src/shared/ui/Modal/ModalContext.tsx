'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Editor } from '@tiptap/react';

interface ModalContextValue {
  showCloseButton?: boolean;
  floatingCloseButton?: boolean;
  expandable?: boolean;
  leftContent?: ReactNode;
  onAskAI?: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onExpandToOverlay?: () => void;
  onClose: () => void;
  editor: Editor | null;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function useModalContext(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('useModalContext must be used within a ModalFrame');
  }
  return ctx;
}

export const ModalContextProvider = ModalContext.Provider;
