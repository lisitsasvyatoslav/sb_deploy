/**
 * Type declarations for TxChart widget (Finam chart-web CDN).
 * Reference: https://widgets-cdn.finam.ru/chart/showcase
 *
 * TxChart is loaded at runtime via Module Federation (mf-loader).
 * These types describe the public API surface we consume.
 *
 * Base types from @finam/chart-web are re-exported and refined
 * with stricter signatures where the library uses `any`.
 */

import type { ChartHandlerInstance } from '@finam/chart-web/types';

// ─── Enums / Unions ──────────────────────────────────────────────────────────

/** Pitch (timeframe) values supported by TxChart */
export type TxChartPitch =
  | 'D'
  | 'W'
  | 'MN'
  | 'QR'
  | 'MAX'
  | 'MIN'
  | 'H1'
  | 'H2'
  | 'H3'
  | 'H4'
  | 'H6'
  | 'H8'
  | 'H12'
  | 'M1'
  | 'M2'
  | 'M3'
  | 'M4'
  | 'M5'
  | 'M6'
  | 'M10'
  | 'M12'
  | 'M15'
  | 'M20'
  | 'M30';

/** Theme identifiers (mirrors @finam/chart-web Theme enum values) */
export type TxChartTheme =
  | 'white'
  | 'black'
  | 'mobile'
  | 'white_mobile'
  | 'black_mobile';

// ─── Chart Handler (returned by onDataLoaded / onSuccess) ────────────────────

export interface TxChartSnapshotOptions {
  drawLegend?: boolean;
  drawWatermark?: boolean;
  drawNavigation?: boolean;
  drawAxisX?: boolean;
  drawAxisY?: boolean;
  drawAxisV?: boolean;
  drawMinMaxLabels?: boolean;
  drawControls?: boolean;
  drawBorders?: boolean;
  drawTrades?: boolean;
}

/**
 * Chart handler instance — primary API for interacting with a mounted chart.
 * Extends @finam/chart-web ChartHandlerInstance with stricter return types
 * (library uses `any` for getJson/fromJson).
 */
export interface TxChartHandler extends Omit<
  ChartHandlerInstance,
  'getJson' | 'fromJson' | 'takeSnapshot'
> {
  getJson(): TxChartState;
  fromJson(state: TxChartState): void;
  takeSnapshot(
    width: number,
    height: number,
    options?: TxChartSnapshotOptions
  ): HTMLCanvasElement;
}

// ─── Chart State (getJson / fromJson) ────────────────────────────────────────

/** Drawing instrument on the chart canvas */
export interface TxChartInstrument {
  type?: number;
  instrumentType: string;
  locked?: boolean;
  hasDependency?: boolean;
  allowUserMove?: boolean;
  allowUserChange?: boolean;
  points?: { list: Array<{ pos: { date: number; value: number } }> };
  line?: { color: number; width: number; applyPaletteTo?: { s: string } };
  fill?: { color: number };
  displayType?: string;
}

/** Main section of serialized chart state */
export interface TxChartMainSection {
  instruments?: TxChartInstrument[];
  [key: string]: unknown;
}

/**
 * Serialized chart state from getJson().
 * May be versioned (has `_v` + `data`) or flat (fields at top level).
 */
export interface TxChartState {
  _v?: number;
  data?: TxChartState;
  main?: TxChartMainSection;
  pitch?: TxChartPitch;
  [key: string]: unknown;
}

// ─── Mount Options ───────────────────────────────────────────────────────────

export interface TxChartMountOptions {
  containerId: string;
  theme?: TxChartTheme;
  issueId?: string;
  pitch?: TxChartPitch | string;
  /** Chart view type: CANDLE, FOREST (bars), LINE, AREA, etc. */
  landmarkType?: string;
  /** Saved chart state from getJson() — restores all settings on mount */
  config?: TxChartState;
  visiblePeriod?: number;
  width?: number | string;
  height?: number | string;
  enableStorage?: boolean;

  // View settings (from API.md MountOptions)
  logScaleEnabled?: boolean;
  volumeEnabled?: boolean;
  dragNavigationEnabled?: boolean;
  priceLineEnabled?: boolean;
  gridEnabled?: boolean;
  rightPadding?: number;
  topPadding?: number;
  bottomPadding?: number;
  axesEnabled?: boolean;
  externalsEnabled?: boolean;
  priceDistanceEnabled?: boolean;

  onDataLoaded?: (handler: TxChartHandler) => void;
  onSuccess?: (handler: TxChartHandler) => void;
  onFail?: (error: Error) => void;
  [key: string]: unknown;
}

// ─── Config Options (TxChart constructor) ────────────────────────────────────

export interface TxChartTokenProvider {
  getFreshToken(): Promise<string>;
}

export interface TxChartConfigOptions {
  tokenProvider: TxChartTokenProvider;
  taHosts?: string[];
  referenceHosts?: string[];
  mdHosts?: string[];
  txtaHosts?: string[];
  txsavesHosts?: string[];
  screenerHosts?: string[];
  scheduleHosts?: string[];
  language?: 'ru' | 'en';
  tzOffset?: number;
  withDeltas?: boolean;
  [key: string]: unknown;
}

// ─── Widget Instance ─────────────────────────────────────────────────────────

export interface TxChartWidgetInstance {
  mount(options: TxChartMountOptions): Promise<unknown>;
  update(
    options: Partial<TxChartMountOptions>,
    containerId?: string
  ): Promise<void>;
  unmount(containerId?: string): void;
  updateConfigOptions(options: Partial<TxChartConfigOptions>): void;
}

// ─── Module Federation modules ───────────────────────────────────────────────

export interface TxChartModule {
  TxChart: new (options: TxChartConfigOptions) => TxChartWidgetInstance;
}

export interface TxGlobalAuth {
  authorizeAnonymously(): Promise<void>;
  getTokenProvider(): TxChartTokenProvider | string | unknown;
}

export interface TxAuthModule {
  TxGlobalAuth: {
    init(options: Record<string, unknown>): Promise<TxGlobalAuth>;
  };
}

// ─── Window augmentation ─────────────────────────────────────────────────────

declare global {
  interface Window {
    /** mf-loader: loads federated modules from CDN */
    loadFederatedModule?(url: string, scope: string): Promise<unknown>;
    /** Dev-only: last registered chart handler (for console debugging) */
    __chartHandler?: TxChartHandler;
  }
}
