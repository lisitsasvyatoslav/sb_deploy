import { createChartInstance } from '@/services/chartWidget';
import {
  registerChartHandler,
  unregisterChartHandler,
} from '@/services/chartHandlerRegistry';
import { logger } from '@/shared/utils/logger';
import type {
  TxChartHandler,
  TxChartState,
  TxChartWidgetInstance,
  TxChartMountOptions,
} from '@/types/txchart';
import type {
  ChartWidgetControllerOptions,
  ChartCardData,
  ChartTheme,
  ChartErrorCode,
  AiInstrument,
} from './types';
import {
  getValidatedChartState,
  getValidatedChartStateRaw,
  sanitizeChartStateRaw,
  hasRestorableContent,
  extractMountOptions,
  stripUndefined,
  buildAiInstruments,
  filterUserInstruments,
  buildSaveMeta,
} from './utils';
import {
  LOG_TAG,
  SAVE_DEBOUNCE_MS,
  POLL_INTERVAL_MS,
  CHART_LOAD_TIMEOUT_MS,
  DEFAULT_SECURITY_ID,
  DEFAULT_VISIBLE_PERIOD,
} from './constants';

/** Map ChartTheme to TxChart's theme identifier */
function toTxTheme(theme: ChartTheme): 'black' | 'white' {
  return theme === 'dark' ? 'black' : 'white';
}

export class ChartWidgetController {
  private widget: TxChartWidgetInstance | null = null;
  private handler: TxChartHandler | null = null;
  private container: HTMLDivElement;
  private containerId: string;
  private card: ChartCardData;
  private theme: ChartTheme;
  private destroyed = false;
  private errored = false;

  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private loadTimeout: ReturnType<typeof setTimeout> | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private lastSavedJson = '';
  private lastAiFingerprint = '';

  private unhandledRejectionHandler:
    | ((e: PromiseRejectionEvent) => void)
    | null = null;

  private contextMenuHandler: ((e: Event) => void) | null = null;

  private readonly onSave: ChartWidgetControllerOptions['onSave'];
  private readonly onSaveKeepalive: ChartWidgetControllerOptions['onSaveKeepalive'];
  private readonly onMounted: ChartWidgetControllerOptions['onMounted'];
  private readonly onLoadingChange: ChartWidgetControllerOptions['onLoadingChange'];
  private readonly onError: ChartWidgetControllerOptions['onError'];

  constructor(options: ChartWidgetControllerOptions) {
    this.container = options.container;
    this.containerId = options.containerId;
    this.card = options.card;
    this.theme = options.theme;
    this.onSave = options.onSave;
    this.onSaveKeepalive = options.onSaveKeepalive;
    this.onMounted = options.onMounted;
    this.onLoadingChange = options.onLoadingChange;
    this.onError = options.onError;
  }

  async init(): Promise<void> {
    if (this.destroyed || this.widget) return;
    this.setupUnhandledRejectionListener();
    this.setupContextMenuBlocker();

    this.loadTimeout = setTimeout(() => {
      if (this.destroyed || this.handler) return;
      logger.error(
        LOG_TAG,
        `[${this.containerId}] Load timeout (${CHART_LOAD_TIMEOUT_MS}ms)`
      );
      this.handleError('load_timeout');
    }, CHART_LOAD_TIMEOUT_MS);

    try {
      const instance = await createChartInstance();
      // Assign early so destroy() can unmount even if we bail out below
      this.widget = instance;
      if (this.destroyed || this.errored) return;

      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      if (this.destroyed || this.errored || !this.container) return;

      const unwrapped = getValidatedChartState(this.card);
      const rawForRestore = getValidatedChartStateRaw(this.card);

      await this.mountChart(instance, unwrapped);
      if (this.destroyed || this.errored) return;

      await this.restoreDrawings(rawForRestore, unwrapped);
      if (this.destroyed || this.errored) return;

      // Initialize fingerprint from server-saved state if available.
      // When fromJson() is disabled (TxChart bug), the chart mounts fresh
      // without instruments. Using getJson() as fingerprint would cause
      // polling to detect a "change" and overwrite the DB with fresh state,
      // erasing the user's saved instruments.
      this.initFingerprint(rawForRestore);
      this.clearLoadTimeout();
      this.onMounted();
      this.onLoadingChange(false);
      this.setupResizeObserver();
      this.startStatePolling();
    } catch (err) {
      if (this.destroyed || this.errored) return;
      logger.error(LOG_TAG, `[${this.containerId}] Init failed`, err);
      const detail =
        err instanceof Error
          ? err.message + (err.cause ? ` (${String(err.cause)})` : '')
          : String(err);
      this.handleError('load_failed', detail);
    } finally {
      this.clearLoadTimeout();
    }
  }

  /** Full cleanup — save state, unregister handler, disconnect observers, unmount widget */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    this.removeUnhandledRejectionListener();
    this.removeContextMenuBlocker();
    this.persistState(this.onSaveKeepalive);
    unregisterChartHandler(this.card.id);

    if (process.env.NODE_ENV === 'development') {
      delete window.__chartHandler;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.clearLoadTimeout();

    if (this.widget) {
      try {
        this.widget.unmount(this.containerId);
      } catch {
        /* ignore */
      }
      this.widget = null;
    }
    this.handler = null;
  }

  /** Persist current chart state immediately via the mutation callback */
  saveState(): void {
    this.persistState(this.onSave);
  }

  /** Trigger a debounced save (resets the debounce timer) */
  saveStateDebounced(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveState(), SAVE_DEBOUNCE_MS);
  }

  /** Update chart theme in-place via widget.update() */
  async changeTheme(newTheme: ChartTheme): Promise<void> {
    if (this.destroyed || !this.widget || newTheme === this.theme) return;

    try {
      await this.widget.update(
        { theme: toTxTheme(newTheme) },
        this.containerId
      );
      this.theme = newTheme;
      logger.debug(LOG_TAG, `[${this.containerId}] Theme updated`);
    } catch (err) {
      logger.error(LOG_TAG, `[${this.containerId}] Theme update failed`, err);
    }
  }

  /** Inject AI instruments into the chart state */
  injectAiInstruments(aiInstruments: AiInstrument[]): void {
    if (!this.handler || this.destroyed || aiInstruments.length === 0) return;
    const fingerprint = JSON.stringify(
      aiInstruments.map((i) => i._aiPatternId ?? '')
    );
    if (fingerprint === this.lastAiFingerprint) return;
    this.lastAiFingerprint = fingerprint;

    try {
      const state = this.handler.getJson();
      const mainSection = state?.main;
      if (!mainSection) return;

      const existingInstruments = mainSection.instruments || [];
      const aiForChart = buildAiInstruments(aiInstruments, existingInstruments);
      const userInstruments = filterUserInstruments(existingInstruments);

      mainSection.instruments = [...userInstruments, ...aiForChart];

      logger.debug(LOG_TAG, 'Injecting AI instruments', {
        user: userInstruments.length,
        ai: aiForChart.length,
      });

      this.handler.fromJson(state);
    } catch (err) {
      logger.error(LOG_TAG, 'Failed to inject AI instruments', err);
    }
  }

  getHandler(): TxChartHandler | null {
    return this.handler;
  }

  updateCard(card: ChartCardData): void {
    this.card = card;
  }

  private async mountChart(
    instance: TxChartWidgetInstance,
    unwrapped: TxChartState | null
  ): Promise<void> {
    const rect = this.container.getBoundingClientRect();
    const width = Math.round(rect.width) || 800;
    const height = Math.round(rect.height) || 500;
    const mountOpts = extractMountOptions(unwrapped, this.card);
    const { pitch, ...optionalMountOpts } = mountOpts;

    // Two-condition latch: both onDataLoaded and onSuccess must fire
    // before we proceed. Their firing order is not guaranteed.
    // onFail rejects the promise so init() doesn't hang forever.
    let resolveReady: () => void;
    let rejectReady: (err: Error) => void;
    const ready = new Promise<void>((resolve, reject) => {
      resolveReady = resolve;
      rejectReady = reject;
    });
    let gotHandler = false;
    let gotSuccess = false;
    const tryResolve = () => {
      if (gotHandler && gotSuccess) resolveReady();
    };

    const mountOptions: TxChartMountOptions = {
      containerId: this.containerId,
      theme: toTxTheme(this.theme),
      issueId: String(this.card.meta?.security_id || DEFAULT_SECURITY_ID),
      pitch,
      ...stripUndefined(optionalMountOpts),
      // Only set default visible range for fresh charts.
      // Saved charts get their view range from extractMountOptions.
      ...(unwrapped ? {} : { visiblePeriod: DEFAULT_VISIBLE_PERIOD }),
      width: width + 'px',
      height: height + 'px',
      enableStorage: false,
      onDataLoaded: (chartHandler: TxChartHandler) => {
        if (this.destroyed) return;
        logger.debug(LOG_TAG, `[${this.containerId}] onDataLoaded`);
        this.clearLoadTimeout();
        this.handler = chartHandler;
        registerChartHandler(this.card.id, chartHandler);
        if (process.env.NODE_ENV === 'development') {
          window.__chartHandler = chartHandler;
        }
        gotHandler = true;
        tryResolve();
      },
      onFail: (err: Error) => {
        logger.error(LOG_TAG, `[${this.containerId}] onFail`, err);
        rejectReady(err);
      },
      onSuccess: () => {
        logger.debug(LOG_TAG, `[${this.containerId}] onSuccess`);
        gotSuccess = true;
        tryResolve();
      },
    };

    await instance.mount(mountOptions);
    if (this.destroyed) return;
    await ready;
  }

  /**
   * Restore user drawings (instruments/externals) via fromJson().
   *
   * DISABLED: TxChart v8 CDN build (updated 2026-03-25) has a broken fromJson() —
   * even getJson() → fromJson(same unmodified state) triggers an infinite
   * 'isRebasedIssuesEnabled' TypeError loop that crashes the chart.
   * This is a TxChart bug, not a state format issue.
   *
   * State IS saved to the DB via the polling pipeline. View settings (pitch,
   * chart type, grid, log scale, etc.) are restored via mount options.
   * Full instrument/drawing restoration will resume when Finam fixes fromJson().
   */
  private async restoreDrawings(
    rawForRestore: TxChartState | null,
    unwrapped: TxChartState | null
  ): Promise<void> {
    if (!this.handler || !rawForRestore || !hasRestorableContent(unwrapped)) {
      return;
    }

    logger.debug(LOG_TAG, `[${this.containerId}] State restore skipped`, {
      reason: 'TxChart fromJson() broken in current CDN build',
    });
  }

  /**
   * Initialize the fingerprint for change detection.
   * If server-saved state exists, use it as the baseline so polling won't
   * overwrite the DB when fromJson() is disabled and the chart is fresh.
   */
  private initFingerprint(serverState: TxChartState | null): void {
    if (!this.handler) return;
    if (serverState) {
      // Use server state as baseline — prevents polling from overwriting
      // saved instruments/colors when fromJson() restore is skipped
      this.lastSavedJson = JSON.stringify(serverState);
    } else {
      this.lastSavedJson = JSON.stringify(
        sanitizeChartStateRaw(this.handler.getJson())
      );
    }
  }

  private persistState(
    send: (cardId: number, meta: Record<string, unknown>) => void
  ): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    try {
      const chartState = this.getChangedState();
      if (!chartState) return;
      send(this.card.id, buildSaveMeta(this.card.meta, chartState));
    } catch {
      /* best effort */
    }
  }

  /** Get current state if it differs from last saved. Updates the fingerprint. */
  private getChangedState(): TxChartState | null {
    if (!this.handler) return null;
    const chartState = sanitizeChartStateRaw(this.handler.getJson());
    if (!chartState) return null;
    const json = JSON.stringify(chartState);
    if (json === this.lastSavedJson) return null;
    this.lastSavedJson = json;
    return chartState;
  }

  /** Check if state has changed without updating the fingerprint. */
  private hasStateChanged(): boolean {
    if (!this.handler) return false;
    const chartState = sanitizeChartStateRaw(this.handler.getJson());
    if (!chartState) return false;
    return JSON.stringify(chartState) !== this.lastSavedJson;
  }

  private startStatePolling(): void {
    this.pollTimer = setInterval(() => {
      if (this.hasStateChanged()) this.saveStateDebounced();
    }, POLL_INTERVAL_MS);
  }

  private handleError(code: ChartErrorCode, detail?: string): void {
    if (this.destroyed || this.errored) return;
    this.errored = true;
    logger.error(
      LOG_TAG,
      `[${this.containerId}] Error [${code}]: ${detail || ''}`
    );
    this.onError(code, detail);
    this.onLoadingChange(false);
  }

  private resize(width: number, height: number): void {
    if (!this.widget || this.destroyed) return;
    try {
      this.widget.update(
        { width: Math.round(width) + 'px', height: Math.round(height) + 'px' },
        this.containerId
      );
    } catch {
      /* ignore */
    }
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          this.resize(width, height);
        }
      }
    });
    this.resizeObserver.observe(this.container);
  }

  private setupUnhandledRejectionListener(): void {
    this.unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      if (this.handler || this.destroyed) return;
      if (!this.isFinamAuthError(event.reason)) return;
      event.preventDefault();
      const detail =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason);
      this.handleError('auth_error', detail);
    };
    window.addEventListener(
      'unhandledrejection',
      this.unhandledRejectionHandler
    );
  }

  private removeUnhandledRejectionListener(): void {
    if (this.unhandledRejectionHandler) {
      window.removeEventListener(
        'unhandledrejection',
        this.unhandledRejectionHandler
      );
      this.unhandledRejectionHandler = null;
    }
  }

  /**
   * Block TxChart's native context menu (legacy FinamTrade UI).
   * Uses capture phase so the handler fires before TxChart's own bubble-phase
   * listeners on inner elements.
   */
  private setupContextMenuBlocker(): void {
    this.contextMenuHandler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    this.container.addEventListener(
      'contextmenu',
      this.contextMenuHandler,
      true
    );
  }

  private removeContextMenuBlocker(): void {
    if (this.contextMenuHandler) {
      this.container.removeEventListener(
        'contextmenu',
        this.contextMenuHandler,
        true
      );
      this.contextMenuHandler = null;
    }
  }

  private isFinamAuthError(reason: unknown): boolean {
    const stack = reason instanceof Error ? reason.stack : String(reason);
    return (
      typeof stack === 'string' &&
      (stack.includes('ga-cdn.finam') ||
        stack.includes('global-auth') ||
        stack.includes('TxGlobalAuth'))
    );
  }

  private clearLoadTimeout(): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }
  }
}
