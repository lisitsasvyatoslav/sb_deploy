import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { logger } from '@/shared/utils/logger';

/** Account-level selection passed from child rows to TradeContextMenu */
export interface ChildSelection {
  symbol: string;
  accountId: string;
  brokerType: string;
  securityId?: number | null;
  positionIds?: number[];
}

/** Builds a stable composite key for a child row */
export const makeChildKey = (
  instrument: string,
  brokerType: string,
  accountId: string
): string => `${instrument}__${brokerType}__${accountId}`;

// ===== Symbol-based multi-select (Portfolio only) =====

interface SelectedSymbolRow {
  instrument: string;
  securityId?: number | null;
  rowBottom: number;
  /** All child keys for this parent — used to expand selection when a child is toggled */
  allChildKeys: string[];
  /** All child rows for this parent (rowBottom is a placeholder from parent) */
  allChildRows: ChildSelectedRow[];
}

interface ChildSelectedRow {
  instrument: string;
  brokerType: string;
  accountId: string;
  securityId?: number | null;
  positionIds?: number[];
  rowBottom: number;
}

/** Minimal child info passed from component when clicking a parent row */
export interface ChildInfo {
  brokerType: string;
  accountId: string;
  securityId?: number | null;
  positionIds?: number[];
}

interface SymbolSelectionState {
  selected: Map<string, SelectedSymbolRow>;
  childSelected: Map<string, ChildSelectedRow>;
  lastAnchor: { clickX: number; rowBottom: number } | null;
}

type SymbolAction =
  | { type: 'toggle'; key: string; row: SelectedSymbolRow; clickX: number }
  | {
      type: 'toggleChild';
      key: string;
      row: ChildSelectedRow;
      clickX: number;
      allSiblings: ChildInfo[];
    }
  | { type: 'clear' };

function symbolReducer(
  state: SymbolSelectionState,
  action: SymbolAction
): SymbolSelectionState {
  if (action.type === 'clear') {
    logger.debug('useTradeContextMenu', 'symbolReducer: clear');
    return { selected: new Map(), childSelected: new Map(), lastAnchor: null };
  }

  if (action.type === 'toggleChild') {
    const parentKey = action.row.instrument;
    const parentRow = state.selected.get(parentKey);
    const nextSelected = new Map(state.selected);
    const nextChild = new Map(state.childSelected);

    if (parentRow) {
      // Parent was selected → child is implicitly selected → user wants to DESELECT it.
      // Expand all siblings into childSelected, exclude the clicked child.
      nextSelected.delete(parentKey);
      for (const childRow of parentRow.allChildRows) {
        const childKey = makeChildKey(
          childRow.instrument,
          childRow.brokerType,
          childRow.accountId
        );
        if (childKey !== action.key) {
          nextChild.set(childKey, {
            ...childRow,
            rowBottom: parentRow.rowBottom,
          });
        }
      }
    } else {
      // No parent selected → simple toggle.
      const wasSelected = nextChild.has(action.key);
      if (wasSelected) {
        nextChild.delete(action.key);
      } else {
        nextChild.set(action.key, action.row);

        // Auto-promote: if all siblings are now selected, collapse into parent selection.
        if (action.allSiblings.length > 0) {
          const allSelected = action.allSiblings.every((s) =>
            nextChild.has(
              makeChildKey(action.row.instrument, s.brokerType, s.accountId)
            )
          );
          if (allSelected) {
            for (const s of action.allSiblings) {
              nextChild.delete(
                makeChildKey(action.row.instrument, s.brokerType, s.accountId)
              );
            }
            const promotedParent: SelectedSymbolRow = {
              instrument: action.row.instrument,
              securityId: action.row.securityId,
              rowBottom: action.row.rowBottom,
              allChildKeys: action.allSiblings.map((s) =>
                makeChildKey(action.row.instrument, s.brokerType, s.accountId)
              ),
              allChildRows: action.allSiblings.map((s) => ({
                instrument: action.row.instrument,
                brokerType: s.brokerType,
                accountId: s.accountId,
                securityId: s.securityId,
                positionIds: s.positionIds,
                rowBottom: 0,
              })),
            };
            nextSelected.set(parentKey, promotedParent);
            logger.debug(
              'useTradeContextMenu',
              'symbolReducer: toggleChild auto-promoted to parent',
              { parentKey }
            );
          }
        }
      }
    }

    const hasAny = nextSelected.size > 0 || nextChild.size > 0;
    logger.debug('useTradeContextMenu', 'symbolReducer: toggleChild', {
      key: action.key,
      parentWasSelected: !!parentRow,
      childCount: nextChild.size,
    });
    return {
      selected: nextSelected,
      childSelected: nextChild,
      lastAnchor: hasAny
        ? { clickX: action.clickX, rowBottom: action.row.rowBottom }
        : null,
    };
  }

  // toggle (parent click)
  const next = new Map(state.selected);
  const wasSelected = next.has(action.key);
  const nextChild = new Map(state.childSelected);

  if (wasSelected) {
    // Deselect: remove parent and clean up any residual child selections
    next.delete(action.key);
    for (const childKey of action.row.allChildKeys) {
      nextChild.delete(childKey);
    }
  } else {
    // Select all: store parent with children info, clear any partial child selections
    next.set(action.key, action.row);
    for (const childKey of action.row.allChildKeys) {
      nextChild.delete(childKey);
    }
  }

  const hasAny = next.size > 0 || nextChild.size > 0;
  const lastAnchor = hasAny
    ? { clickX: action.clickX, rowBottom: action.row.rowBottom }
    : null;

  logger.debug('useTradeContextMenu', 'symbolReducer: toggle', {
    key: action.key,
    wasSelected,
    selectedCount: next.size,
    selectedKeys: Array.from(next.keys()),
    lastAnchor,
  });

  return { selected: next, childSelected: nextChild, lastAnchor };
}

const SYMBOL_INITIAL: SymbolSelectionState = {
  selected: new Map(),
  childSelected: new Map(),
  lastAnchor: null,
};

/**
 * Multi-select context menu state for positions tables (by symbol).
 * - Click parent → selects all its children (stored as parent-level selection).
 * - Click child when parent is selected → deselects that child, keeps siblings selected.
 * - Click child when parent is not selected → simple toggle; if all siblings are now
 *   selected, auto-promotes to parent-level selection.
 * The dropdown appears below the last selected row (parent or child).
 */
export function useTradeContextMenuBySymbol() {
  const [state, dispatch] = useReducer(symbolReducer, SYMBOL_INITIAL);

  const handleRowClick = useCallback(
    <T extends { instrument: string; securityId?: number | null }>(
      row: T,
      e: React.MouseEvent,
      allChildren: ChildInfo[] = []
    ) => {
      const rowBottom = (e.currentTarget as HTMLElement).getBoundingClientRect()
        .bottom;
      const allChildRows: ChildSelectedRow[] = allChildren.map((c) => ({
        instrument: row.instrument,
        brokerType: c.brokerType,
        accountId: c.accountId,
        securityId: c.securityId,
        positionIds: c.positionIds,
        rowBottom: 0,
      }));
      const allChildKeys = allChildren.map((c) =>
        makeChildKey(row.instrument, c.brokerType, c.accountId)
      );
      dispatch({
        type: 'toggle',
        key: row.instrument,
        row: {
          instrument: row.instrument,
          securityId: row.securityId,
          rowBottom,
          allChildKeys,
          allChildRows,
        },
        clickX: e.clientX,
      });
    },
    []
  );

  const handleChildRowClick = useCallback(
    (
      instrument: string,
      brokerType: string,
      accountId: string,
      securityId: number | null | undefined,
      e: React.MouseEvent,
      positionIds?: number[],
      allSiblings?: ChildInfo[]
    ) => {
      const rowBottom = (e.currentTarget as HTMLElement).getBoundingClientRect()
        .bottom;
      const key = makeChildKey(instrument, brokerType, accountId);
      dispatch({
        type: 'toggleChild',
        key,
        row: {
          instrument,
          brokerType,
          accountId,
          securityId: securityId ?? null,
          positionIds,
          rowBottom,
        },
        clickX: e.clientX,
        allSiblings: allSiblings ?? [],
      });
    },
    []
  );

  const close = useCallback(() => dispatch({ type: 'clear' }), []);

  const selectedKeys = useMemo(
    () => new Set(state.selected.keys()),
    [state.selected]
  );
  const childSelectedKeys = useMemo(
    () => new Set(state.childSelected.keys()),
    [state.childSelected]
  );

  const totalSize = state.selected.size + state.childSelected.size;
  const anchor = totalSize > 0 ? state.lastAnchor : null;

  const symbols = useMemo(
    () => Array.from(state.selected.keys()),
    [state.selected]
  );

  const tickerSecurityIds = useMemo(() => {
    const ids: Record<string, number | null> = {};
    for (const row of state.selected.values()) {
      ids[row.instrument] = row.securityId ?? null;
    }
    for (const row of state.childSelected.values()) {
      if (!(row.instrument in ids)) {
        ids[row.instrument] = row.securityId ?? null;
      }
    }
    return ids;
  }, [state.selected, state.childSelected]);

  const childSelections = useMemo<ChildSelection[]>(
    () =>
      Array.from(state.childSelected.values()).map((r) => ({
        symbol: r.instrument,
        accountId: r.accountId,
        brokerType: r.brokerType,
        securityId: r.securityId,
        positionIds: r.positionIds,
      })),
    [state.childSelected]
  );

  return {
    anchor,
    symbols,
    tickerSecurityIds,
    selectedKeys,
    childSelectedKeys,
    childSelections,
    handleRowClick,
    handleChildRowClick,
    close,
  };
}

// ===== History Grouped: parent (instrument) + child (trade) multi-select =====

interface HistoryParentRow {
  instrument: string;
  securityId?: number | null;
  rowBottom: number;
}

interface HistoryChildRow {
  tradeId: number;
  instrument: string;
  rowBottom: number;
}

interface HistoryGroupedState {
  parentSelected: Map<string, HistoryParentRow>;
  childSelected: Map<number, HistoryChildRow>;
  lastAnchor: { clickX: number; rowBottom: number } | null;
}

type HistoryGroupedAction =
  | { type: 'toggleParent'; key: string; row: HistoryParentRow; clickX: number }
  | {
      type: 'toggleChild';
      tradeId: number;
      row: HistoryChildRow;
      clickX: number;
      siblingTradeIds?: number[];
    }
  | { type: 'setParentSelection'; instruments: string[] }
  | { type: 'clear' };

function historyGroupedReducer(
  state: HistoryGroupedState,
  action: HistoryGroupedAction
): HistoryGroupedState {
  if (action.type === 'clear') {
    return {
      parentSelected: new Map(),
      childSelected: new Map(),
      lastAnchor: null,
    };
  }

  if (action.type === 'setParentSelection') {
    const nextParent = new Map<string, HistoryParentRow>();
    for (const instrument of action.instruments) {
      nextParent.set(instrument, {
        instrument,
        securityId: null,
        rowBottom: 0,
      });
    }
    return {
      parentSelected: nextParent,
      childSelected: new Map(),
      lastAnchor: null,
    };
  }

  if (action.type === 'toggleParent') {
    const nextParent = new Map(state.parentSelected);
    const wasSelected = nextParent.has(action.key);

    if (wasSelected) {
      nextParent.delete(action.key);
    } else {
      nextParent.set(action.key, action.row);
    }

    // When parent is selected, remove any child selections for this instrument
    const nextChild = new Map(state.childSelected);
    if (!wasSelected) {
      for (const [id, child] of nextChild) {
        if (child.instrument === action.key) nextChild.delete(id);
      }
    }

    const hasAny = nextParent.size > 0 || nextChild.size > 0;
    return {
      parentSelected: nextParent,
      childSelected: nextChild,
      lastAnchor: hasAny
        ? { clickX: action.clickX, rowBottom: action.row.rowBottom }
        : null,
    };
  }

  // toggleChild
  const parentKey = action.row.instrument;
  const parentRow = state.parentSelected.get(parentKey);
  const nextParent = new Map(state.parentSelected);
  const nextChild = new Map(state.childSelected);

  if (
    parentRow &&
    action.siblingTradeIds &&
    action.siblingTradeIds.length > 0
  ) {
    // Parent was selected → child is implicitly selected → user wants to DESELECT it.
    // Expand all siblings into childSelected, exclude the clicked child.
    nextParent.delete(parentKey);
    for (const sibId of action.siblingTradeIds) {
      nextChild.set(sibId, {
        tradeId: sibId,
        instrument: action.row.instrument,
        rowBottom: parentRow.rowBottom,
      });
    }
    // clicked child is NOT added → it gets deselected
  } else {
    // No parent selected → simple toggle.
    nextParent.delete(parentKey);
    const wasSelected = nextChild.has(action.tradeId);

    if (wasSelected) {
      nextChild.delete(action.tradeId);
    } else {
      nextChild.set(action.tradeId, action.row);

      // Auto-promote: if all sibling trades are now selected too → collapse into parent
      if (action.siblingTradeIds && action.siblingTradeIds.length > 0) {
        const allSiblingsSelected = action.siblingTradeIds.every((id) =>
          nextChild.has(id)
        );
        if (allSiblingsSelected) {
          nextChild.delete(action.tradeId);
          for (const sibId of action.siblingTradeIds) {
            nextChild.delete(sibId);
          }
          nextParent.set(parentKey, {
            instrument: action.row.instrument,
            securityId: null, // parent was not in selectedState when this branch runs
            rowBottom: action.row.rowBottom,
          });
        }
      }
    }
  }

  const hasAny = nextParent.size > 0 || nextChild.size > 0;
  return {
    parentSelected: nextParent,
    childSelected: nextChild,
    lastAnchor: hasAny
      ? { clickX: action.clickX, rowBottom: action.row.rowBottom }
      : null,
  };
}

const HISTORY_GROUPED_INITIAL: HistoryGroupedState = {
  parentSelected: new Map(),
  childSelected: new Map(),
  lastAnchor: null,
};

export type UseTradeContextMenuBySymbolSingleOptions = {
  /**
   * Called when parent/child selection changes (unique instrument tickers).
   * Skipped once on mount so parents can pre-fill state (e.g. portfolio edit) before the table runs.
   */
  onInstrumentSelectionChange?: (instruments: string[]) => void;
  /**
   * Parent-row selection for edit prefill (e.g. portfolio symbols). Applied when the signature changes.
   */
  initialParentInstruments?: string[];
  /**
   * When true, clicking a child trade row selects the whole parent instrument
   * instead of an individual trade. Used in the portfolio creation modal.
   */
  parentOnlySelection?: boolean;
};

function uniqueInstrumentsFromHistoryGroupedState(
  state: HistoryGroupedState
): string[] {
  const set = new Set<string>();
  for (const key of state.parentSelected.keys()) {
    set.add(key);
  }
  for (const child of state.childSelected.values()) {
    set.add(child.instrument);
  }
  return [...set];
}

/**
 * Multi-select for history grouped table.
 * - Click parent row (instrument) → select all trades for that symbol
 * - Click child row (individual trade) → select specific trade
 * - Parent click clears child selections for that instrument
 * - Child click clears parent selection for that instrument
 */
export function useTradeContextMenuBySymbolSingle(
  options?: UseTradeContextMenuBySymbolSingleOptions
) {
  const [state, dispatch] = useReducer(
    historyGroupedReducer,
    HISTORY_GROUPED_INITIAL
  );

  const onChangeRef = useRef(options?.onInstrumentSelectionChange);
  onChangeRef.current = options?.onInstrumentSelectionChange;
  const skipInitialNotifyRef = useRef(
    Boolean(options?.onInstrumentSelectionChange)
  );
  const prefillSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    const list = options?.initialParentInstruments;
    if (list == null || list.length === 0) {
      prefillSignatureRef.current = null;
      return;
    }
    const sig = [...list].sort().join('\0');
    if (prefillSignatureRef.current === sig) return;
    prefillSignatureRef.current = sig;
    dispatch({ type: 'setParentSelection', instruments: list });
  }, [options?.initialParentInstruments]);

  useEffect(() => {
    const cb = onChangeRef.current;
    if (!cb) return;
    if (skipInitialNotifyRef.current) {
      skipInitialNotifyRef.current = false;
      return;
    }
    cb(uniqueInstrumentsFromHistoryGroupedState(state));
  }, [state]);

  const handleRowClick = useCallback(
    <T extends { instrument: string; securityId?: number | null }>(
      row: T,
      e: React.MouseEvent
    ) => {
      const rowBottom = (e.currentTarget as HTMLElement).getBoundingClientRect()
        .bottom;
      dispatch({
        type: 'toggleParent',
        key: row.instrument,
        row: {
          instrument: row.instrument,
          securityId: row.securityId,
          rowBottom,
        },
        clickX: e.clientX,
      });
    },
    []
  );

  const parentOnlyRef = useRef(options?.parentOnlySelection ?? false);
  parentOnlyRef.current = options?.parentOnlySelection ?? false;

  const handleChildTradeClick = useCallback(
    (
      tradeId: number,
      instrument: string,
      e: React.MouseEvent,
      siblingTradeIds?: number[]
    ) => {
      const rowBottom = (e.currentTarget as HTMLElement).getBoundingClientRect()
        .bottom;
      if (parentOnlyRef.current) {
        dispatch({
          type: 'toggleParent',
          key: instrument,
          row: { instrument, securityId: null, rowBottom },
          clickX: e.clientX,
        });
      } else {
        dispatch({
          type: 'toggleChild',
          tradeId,
          row: { tradeId, instrument, rowBottom },
          clickX: e.clientX,
          siblingTradeIds,
        });
      }
    },
    []
  );

  const close = useCallback(() => dispatch({ type: 'clear' }), []);

  const setSelection = useCallback((instruments: string[]) => {
    dispatch({ type: 'setParentSelection', instruments });
  }, []);

  const totalSize = state.parentSelected.size + state.childSelected.size;
  const anchor = totalSize > 0 ? state.lastAnchor : null;

  // Symbols from parent selections (full instrument fetch)
  const symbols = useMemo(
    () => Array.from(state.parentSelected.keys()),
    [state.parentSelected]
  );

  // Trade IDs from child selections (specific trades)
  const childTradeIds = useMemo(
    () => Array.from(state.childSelected.keys()),
    [state.childSelected]
  );

  const tickerSecurityIds = useMemo(() => {
    const ids: Record<string, number | null> = {};
    for (const row of state.parentSelected.values()) {
      ids[row.instrument] = row.securityId ?? null;
    }
    // Also add instruments from child selections for chip display
    for (const child of state.childSelected.values()) {
      if (!(child.instrument in ids)) {
        ids[child.instrument] = null;
      }
    }
    return ids;
  }, [state.parentSelected, state.childSelected]);

  // Parent-level keys for DataTable row highlighting
  const selectedKeys = useMemo(
    () => new Set(state.parentSelected.keys()),
    [state.parentSelected]
  );

  // Child trade IDs for TradeRow highlighting
  const childSelectedTradeIds = useMemo(
    () => new Set(state.childSelected.keys()),
    [state.childSelected]
  );

  return {
    anchor,
    symbols,
    childTradeIds,
    tickerSecurityIds,
    selectedKeys,
    childSelectedTradeIds,
    handleRowClick,
    handleChildTradeClick,
    setSelection,
    close,
  };
}

// ===== Multi-select by trade ID (History flat) =====

interface MultiTradeEntry {
  id: number;
  rowBottom: number;
}

interface MultiTradeState {
  selected: Map<number, MultiTradeEntry>;
  lastAnchor: { clickX: number; rowBottom: number } | null;
}

type MultiTradeAction =
  | { type: 'toggle'; id: number; rowBottom: number; clickX: number }
  | { type: 'clear' };

function multiTradeReducer(
  state: MultiTradeState,
  action: MultiTradeAction
): MultiTradeState {
  if (action.type === 'clear') {
    return { selected: new Map(), lastAnchor: null };
  }
  const next = new Map(state.selected);
  if (next.has(action.id)) {
    next.delete(action.id);
  } else {
    next.set(action.id, { id: action.id, rowBottom: action.rowBottom });
  }
  const hasAny = next.size > 0;
  return {
    selected: next,
    lastAnchor: hasAny
      ? { clickX: action.clickX, rowBottom: action.rowBottom }
      : null,
  };
}

const MULTI_TRADE_INITIAL: MultiTradeState = {
  selected: new Map(),
  lastAnchor: null,
};

/**
 * Multi-select context menu for flat trades table (by trade ID).
 * Each click toggles the selection of the clicked trade.
 */
export function useTradeContextMenuByIdsMulti(
  tickerSecurityIds: Record<string, number | null>
) {
  const [state, dispatch] = useReducer(multiTradeReducer, MULTI_TRADE_INITIAL);

  const handleRowClick = useCallback(
    <T extends { id: string | number }>(row: T, e: React.MouseEvent) => {
      const rowBottom = (e.currentTarget as HTMLElement).getBoundingClientRect()
        .bottom;
      dispatch({
        type: 'toggle',
        id: Number(row.id),
        rowBottom,
        clickX: e.clientX,
      });
    },
    []
  );

  const close = useCallback(() => dispatch({ type: 'clear' }), []);

  const anchor = state.lastAnchor;
  const tradeIds = useMemo(
    () => Array.from(state.selected.keys()),
    [state.selected]
  );
  const selectedKeys = useMemo(
    () => new Set(Array.from(state.selected.keys()).map(String)),
    [state.selected]
  );

  return {
    anchor,
    tradeIds,
    tickerSecurityIds,
    selectedKeys,
    handleRowClick,
    close,
  };
}
