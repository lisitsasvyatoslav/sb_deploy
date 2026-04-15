export const SAVE_DEBOUNCE_MS = 2000;
export const POLL_INTERVAL_MS = 5000;
export const CHART_LOAD_TIMEOUT_MS = 60000;

/**
 * Chart state serialization version.
 * Bumped when the TxChart CDN build changes in a way that makes
 * previously saved state incompatible with fromJson().
 * Old saves with a different version are skipped — chart mounts fresh.
 *
 * History: 3 (TD-825), removed (TD-897 refactor), 4 (restored after
 * TxChart v8 CDN update 2026-03-25 broke fromJson with old format).
 */
export const CHART_STATE_VERSION = 4;

/** Default security_id when none is set in card.meta (SBER) */
export const DEFAULT_SECURITY_ID = 8;

/** Number of candles to display initially (~6 months of daily candles) */
export const DEFAULT_VISIBLE_PERIOD = 104;

/**
 * TxChart built-in palette type IDs (hashed keys from TxChart internal registry).
 * Every instrument on the canvas needs a valid `type` field referencing a palette entry;
 * without it TxChart silently drops the drawing.
 *
 * These are used as fallbacks when injecting AI instruments and there are no
 * existing user-drawn instruments to borrow the type ID from.
 */
export const DEFAULT_LINE_TYPE_ID = 1735939579;
export const DEFAULT_SHAPE_TYPE_ID = -1202652695;

export const LINE_INSTRUMENT_TYPES = [
  'TREND_LINE',
  'HORIZONTAL_RAY',
  'LINE',
  'RAY',
  'HORIZONTAL_LINE',
  'VERTICAL_LINE',
] as const;

export const SHAPE_INSTRUMENT_TYPES = [
  'RECTANGLE',
  'TRIANGLE',
  'PARALLEL_CHANNEL',
  'ELLIPSE',
] as const;

export const LOG_TAG = 'ChartWidget';
