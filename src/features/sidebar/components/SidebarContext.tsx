'use client';

import { createContext, useContext } from 'react';

export interface SidebarContextValue {
  isDemo: boolean;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const SidebarProvider = SidebarContext.Provider;

export function useSidebarContext(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebarContext must be used within SidebarProvider');
  }
  return ctx;
}
