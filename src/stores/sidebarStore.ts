import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SidebarSection = 'boards' | 'portfolios' | 'strategies' | null;

interface SidebarState {
  // Collapsed mode (only icons, 48px)
  isCollapsed: boolean;

  // Currently expanded section (shows submenu items)
  expandedSection: SidebarSection;

  // Actions
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  expand: () => void;
  collapse: () => void;

  toggleSection: (section: SidebarSection) => void;
  setExpandedSection: (section: SidebarSection) => void;
  closeSection: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      expandedSection: null,

      toggleCollapsed: () =>
        set((state) => ({
          isCollapsed: !state.isCollapsed,
          // Close expanded section when collapsing
          expandedSection: state.isCollapsed ? state.expandedSection : null,
        })),

      setCollapsed: (collapsed) =>
        set((state) => ({
          isCollapsed: collapsed,
          expandedSection: collapsed ? null : state.expandedSection,
        })),

      expand: () => set({ isCollapsed: false }),
      collapse: () => set({ isCollapsed: true, expandedSection: null }),

      toggleSection: (section) =>
        set((state) => ({
          expandedSection: state.expandedSection === section ? null : section,
          // Auto-expand sidebar when opening a section
          isCollapsed: false,
        })),

      setExpandedSection: (section) =>
        set({
          expandedSection: section,
          isCollapsed: false,
        }),

      closeSection: () => set({ expandedSection: null }),
    }),
    {
      name: 'sidebar-state',
      partialize: (state) => ({
        isCollapsed: state.isCollapsed,
        // Don't persist expandedSection - always start collapsed
      }),
    }
  )
);
