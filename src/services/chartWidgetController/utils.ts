import type { TxChartState, TxChartInstrument } from '@/types/txchart';
import type { AiInstrument, ChartCardData } from './types';
import {
  CHART_STATE_VERSION,
  DEFAULT_LINE_TYPE_ID,
  DEFAULT_SHAPE_TYPE_ID,
  LINE_INSTRUMENT_TYPES,
  SHAPE_INSTRUMENT_TYPES,
} from './constants';

/**
 * Unwrap versioned chart state.
 * TxChart's getJson() may return { _v: N, data: {...} } or flat state.
 */
export function unwrapChartState(state: unknown): TxChartState | null {
  if (!state || typeof state !== 'object') return null;
  const obj = state as TxChartState;
  if ('_v' in obj && obj.data) return obj.data;
  return obj;
}

/**
 * Validate that a value looks like a valid chart state object
 * suitable for fromJson() or DB persistence.
 *
 * Checks:
 * - Must be a non-null plain object
 * - Must contain at least one known top-level section (main, view, or pitch)
 * - Known sections must be the correct type when present
 */
export function isValidChartState(state: unknown): state is TxChartState {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return false;
  const obj = state as Record<string, unknown>;

  const hasKnownSection = 'main' in obj || 'view' in obj || 'pitch' in obj;
  if (!hasKnownSection) return false;

  if ('main' in obj && obj.main != null && typeof obj.main !== 'object')
    return false;
  if ('view' in obj && obj.view != null && typeof obj.view !== 'object')
    return false;
  if ('pitch' in obj && obj.pitch != null && typeof obj.pitch !== 'string')
    return false;

  return true;
}

/**
 * Check whether a flat chart state has user-created drawings worth restoring via fromJson().
 *
 * IMPORTANT: Only instruments/externals (user drawings) require fromJson().
 * View settings (view type, zoom, grid, etc.) are restored via mount options
 * in extractMountOptions(). Calling fromJson() for view-only state feeds stale
 * viewport data into the freshly loaded chart and clears the display.
 */
export function hasRestorableContent(state: TxChartState | null): boolean {
  if (!state) return false;
  const main = state.main as Record<string, unknown> | undefined;
  const instruments = main?.instruments;
  const externals = state.externals;
  return (
    (Array.isArray(instruments) && instruments.length > 0) ||
    (Array.isArray(externals) && externals.length > 0)
  );
}

/**
 * Sanitize raw chart state for safe restoration or persistence.
 *
 * 1. JSON round-trip — breaks internal object references that survive
 *    getJson() and would point to destroyed widget internals after remount.
 * 2. Unwrap versioned {_v, data} envelope — fromJson() expects flat state.
 * 3. Structural validation — reject obviously corrupt data early.
 *
 * Returns null if the input is invalid or cannot be sanitized.
 */
export function sanitizeChartState(raw: unknown): TxChartState | null {
  if (!raw || typeof raw !== 'object') return null;

  let clean: unknown;
  try {
    clean = JSON.parse(JSON.stringify(raw));
  } catch {
    return null;
  }

  const unwrapped = unwrapChartState(clean);
  if (!unwrapped) return null;

  if (!isValidChartState(unwrapped)) return null;

  return unwrapped;
}

/**
 * Validate and extract chart state from card meta (server data).
 * Returns null if the card has no chart state, the version doesn't match,
 * or the data is structurally invalid.
 */
export function getValidatedChartState(
  card: ChartCardData
): TxChartState | null {
  const isValid = card.meta?.chartStateVersion === CHART_STATE_VERSION;
  const serverState = isValid ? card.meta?.chartState || null : null;
  return sanitizeChartState(serverState);
}

/**
 * Sanitize chart state for persistence — preserves the versioned {_v, data} envelope.
 *
 * Use this when:
 * - Saving to DB (so the envelope is stored and available on restore)
 * - Passing state to fromJson() (TxChart may need _v to select the right deserializer)
 *
 * Use sanitizeChartState() only when you need flat inner keys (e.g. extractMountOptions).
 *
 * Returns null if the input is invalid or cannot be sanitized.
 */
export function sanitizeChartStateRaw(raw: unknown): TxChartState | null {
  if (!raw || typeof raw !== 'object') return null;

  let clean: unknown;
  try {
    clean = JSON.parse(JSON.stringify(raw));
  } catch {
    return null;
  }

  // Validate by checking the inner (unwrapped) state
  const unwrapped = unwrapChartState(clean);
  if (!unwrapped || !isValidChartState(unwrapped)) return null;

  // Return in the ORIGINAL format (with _v envelope preserved if present)
  return clean as TxChartState;
}

/**
 * Validate and extract chart state from card meta — preserves the {_v, data} envelope.
 * Use for passing to fromJson(), which may require the versioned format.
 */
export function getValidatedChartStateRaw(
  card: ChartCardData
): TxChartState | null {
  const isValid = card.meta?.chartStateVersion === CHART_STATE_VERSION;
  const serverState = isValid ? card.meta?.chartState || null : null;
  return sanitizeChartStateRaw(serverState);
}

/**
 * Extract TxChart mount options from saved state.
 * These ensure both the engine and the React settings UI are in sync on mount.
 */
export function extractMountOptions(
  unwrapped: TxChartState | null,
  card: ChartCardData
): {
  pitch: string;
  landmarkType?: string;
  logScaleEnabled?: boolean;
  volumeEnabled?: boolean;
  rightPadding?: number;
  priceLineEnabled?: boolean;
  gridEnabled?: boolean;
  dragNavigationEnabled?: boolean;
} {
  const pitch: string = unwrapped?.pitch || card.meta?.pitch || 'D';

  let landmarkType: string | undefined;
  let logScaleEnabled: boolean | undefined;
  let volumeEnabled: boolean | undefined;
  let rightPadding: number | undefined;
  let priceLineEnabled: boolean | undefined;
  let gridEnabled: boolean | undefined;
  let dragNavigationEnabled: boolean | undefined;

  if (unwrapped?.main) {
    const mainSection = unwrapped.main as Record<string, unknown>;
    const series = mainSection.series as
      | Array<{
          landmarkType?: string;
          style?: { landmarkType?: string };
          seriesType?: string;
          visible?: boolean;
        }>
      | undefined;

    if (series?.[0]) {
      landmarkType = series[0].landmarkType || series[0].style?.landmarkType;
    }

    if (typeof mainSection.logScale === 'boolean') {
      logScaleEnabled = mainSection.logScale;
    }

    const volumeSeries = series?.find((s) => s.seriesType === 'VOLUME_SERIES');
    if (volumeSeries && typeof volumeSeries.visible === 'boolean') {
      volumeEnabled = volumeSeries.visible;
    }
  }

  if (unwrapped?.view) {
    const view = unwrapped.view as Record<string, unknown>;
    if (typeof view.rightGap === 'number') rightPadding = view.rightGap;

    const landmarkTicket = view.landmarkTicket as
      | { hasLine?: boolean; hasLabel?: boolean }
      | undefined;
    if (landmarkTicket && typeof landmarkTicket.hasLine === 'boolean') {
      priceLineEnabled = landmarkTicket.hasLine;
    }

    if (typeof view.xGrid === 'boolean' && typeof view.yGrid === 'boolean') {
      gridEnabled = (view.xGrid as boolean) && (view.yGrid as boolean);
    }

    if (typeof view.enableScroll === 'boolean') {
      dragNavigationEnabled = view.enableScroll;
    }
  }

  return {
    pitch,
    landmarkType,
    logScaleEnabled,
    volumeEnabled,
    rightPadding,
    priceLineEnabled,
    gridEnabled,
    dragNavigationEnabled,
  };
}

/**
 * Remove keys with undefined values from an object.
 * Useful for building mount options where undefined means "don't pass this key".
 */
export function stripUndefined<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

/**
 * Build chart-compatible AI instruments from raw AI instrument data.
 * Assigns correct type IDs and strips internal tracking fields.
 */
export function buildAiInstruments(
  aiInstruments: AiInstrument[],
  existingInstruments: TxChartInstrument[]
): TxChartInstrument[] {
  const lineTypeId =
    existingInstruments.find((i) =>
      (LINE_INSTRUMENT_TYPES as readonly string[]).includes(i.instrumentType)
    )?.type ?? DEFAULT_LINE_TYPE_ID;

  const shapeTypeId =
    existingInstruments.find((i) =>
      (SHAPE_INSTRUMENT_TYPES as readonly string[]).includes(i.instrumentType)
    )?.type ?? DEFAULT_SHAPE_TYPE_ID;

  return aiInstruments.map((inst) => {
    const { _aiPatternId, ...cleanInst } = inst;
    const isShape = (SHAPE_INSTRUMENT_TYPES as readonly string[]).includes(
      inst.instrumentType
    );
    return { ...cleanInst, type: isShape ? shapeTypeId : lineTypeId };
  });
}

/**
 * Filter out previously injected AI instruments (identified by locked + no user interaction flags).
 */
export function filterUserInstruments(
  instruments: TxChartInstrument[]
): TxChartInstrument[] {
  return instruments.filter(
    (i) =>
      !(
        i.locked === true &&
        i.allowUserMove === false &&
        i.allowUserChange === false
      )
  );
}

/**
 * Build the full meta object for persistence.
 */
export function buildSaveMeta(
  currentMeta: Record<string, unknown>,
  chartState: TxChartState
): Record<string, unknown> {
  return { ...currentMeta, chartState, chartStateVersion: CHART_STATE_VERSION };
}
