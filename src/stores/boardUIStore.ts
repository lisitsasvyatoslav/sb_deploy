import { create } from 'zustand';

interface SelectionBox {
  isSelecting: boolean;
  start: { x: number; y: number } | null;
  current: { x: number; y: number } | null;
}

interface ToolbarState {
  visible: boolean;
  x: number;
  y: number;
}

interface GroupOutline {
  visible: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
  borderWidth: number;
  borderRadius: number;
}

interface BoardUIState {
  selectionBox: SelectionBox;
  setSelectionBox: (
    box: SelectionBox | ((prev: SelectionBox) => SelectionBox)
  ) => void;

  toolbarState: ToolbarState;
  setToolbarState: (
    state: ToolbarState | ((prev: ToolbarState) => ToolbarState)
  ) => void;

  groupOutline: GroupOutline;
  setGroupOutline: (
    outline: GroupOutline | ((prev: GroupOutline) => GroupOutline)
  ) => void;

  /** Card ID that should enter inline title-edit mode. Cleared after consumed. */
  titleEditCardId: number | null;
  setTitleEditCardId: (id: number | null) => void;

  resetUI: () => void;
}

export const useBoardUIStore = create<BoardUIState>((set) => ({
  selectionBox: { isSelecting: false, start: null, current: null },
  setSelectionBox: (box) =>
    set((state) => ({
      selectionBox: typeof box === 'function' ? box(state.selectionBox) : box,
    })),

  toolbarState: { visible: false, x: 0, y: 0 },
  setToolbarState: (toolbar) =>
    set((state) => ({
      toolbarState:
        typeof toolbar === 'function' ? toolbar(state.toolbarState) : toolbar,
    })),

  groupOutline: {
    visible: false,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    borderWidth: 0,
    borderRadius: 0,
  },
  setGroupOutline: (outline) =>
    set((state) => ({
      groupOutline:
        typeof outline === 'function' ? outline(state.groupOutline) : outline,
    })),

  titleEditCardId: null,
  setTitleEditCardId: (id) => set({ titleEditCardId: id }),

  resetUI: () =>
    set({
      selectionBox: { isSelecting: false, start: null, current: null },
      toolbarState: { visible: false, x: 0, y: 0 },
      titleEditCardId: null,
      groupOutline: {
        visible: false,
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        borderWidth: 0,
        borderRadius: 0,
      },
    }),
}));
