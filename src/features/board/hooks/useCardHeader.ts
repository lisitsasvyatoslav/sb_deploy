import React, { useCallback, useMemo } from 'react';
import { getCardHeaderConfig } from '@/features/board/utils/cardHeaderConfig';
import { getTickerIconUrl } from '@/shared/config/environment';
import { useTickerModalStore } from '@/features/ticker/stores/tickerModalStore';
import { useStatisticsStore } from '@/stores/statisticsStore';
import { useTranslation } from '@/shared/i18n/client';
import { useLocale } from '@/shared/i18n/locale-provider';
import { formatTime } from '@/shared/utils/timeUtils';
import { getCurrencySymbol } from '@/features/ticker/utils/currency';
import { formatCurrencyValue } from '@/features/board/components/cardContent/widgets/PortfolioChart/utils';
import type { TranslateFn } from '@/shared/i18n/settings';
import type {
  CardControlsMode,
  CardControlsProps,
} from '@/shared/ui/CardControls';
import type { Card, CardType } from '@/types';
import type { FundamentalData, TechnicalAnalysisData } from '@/types/ticker';
import { NOTE_MODAL_COLORS } from '@/shared/ui/Modal/SelectColorWidget';

const VALID_LABEL_COLORS = new Set(
  NOTE_MODAL_COLORS.map((c) => c.toLowerCase())
);

const DEFAULT_CARD_COLOR = '#FFFFFF';

/** Default badge colors per card type — used when card.color is not set by user */
export const DEFAULT_BADGE_COLORS: Record<CardType, string> = {
  note: '#7863F6',
  chart: '#7863F6',
  ai_response: '#7863F6',
  news: '#F663C2',
  fundamental: '#FFD43B',
  technical: '#FFD43B',
  strategy: '#4DCFE7',
  trading_idea: '#7863F6',
  signal: '#7863F6',
  file: '#7863F6',
  link: '#7863F6',
  widget: '#7863F6',
};

/** In-scope card types that useCardHeader handles directly */
const IN_SCOPE_TYPES = new Set([
  'note',
  'chart',
  'fundamental',
  'technical',
  'news',
]);

export interface UseCardHeaderCallbacks {
  onClose?: () => void;
  /** Expand handler for modal mode (modal → overlay) */
  onExpand?: () => void;
  /** Collapse handler for fullscreen → modal transition (without closing) */
  onCollapse?: () => void;
  /** Called before collapse in fullscreen mode (e.g. closeDraft for notes) */
  onBeforeCollapse?: () => void;
  /** Title change handler — used in card mode for optimistic node updates */
  onTitleChange?: (title: string) => void;
  /** More (···) button handler — used to open context menu on card nodes */
  onMore?: (e: React.MouseEvent) => void;
}

export interface UseCardHeaderReturn {
  headerProps: CardControlsProps;
}

/**
 * Unified header props builder for CardControls.
 *
 * - mode='card': static label with labelColor (for board nodes)
 * - mode='modal': editable label + colorWidget slot + expand/close buttons
 * - mode='fullscreen': editable label + colorWidget slot + collapse/close buttons
 *
 * For in-scope types (note, chart, fundamental, technical, news):
 *   builds props directly from card data.
 * For out-of-scope types (file, signal, widget, strategy, trading_idea, etc.):
 *   delegates to getCardHeaderConfig as fallback.
 */
export function useCardHeader(
  card: Card | undefined,
  mode: CardControlsMode,
  callbacks: UseCardHeaderCallbacks,
  /** Editable title state — managed externally for controlled input */
  editableTitle?: {
    value: string;
    onChange: (value: string) => void;
    onConfirm?: () => void;
    focusTrigger?: number;
  },
  /** Color widget ReactNode — rendered next to editable label */
  colorWidget?: React.ReactNode
): UseCardHeaderReturn {
  const { t: tBoard } = useTranslation('board');
  const { t: tCommon } = useTranslation('common');
  const { t: tPortfolio } = useTranslation('portfolio');
  const { locale } = useLocale();

  // Portfolio widget check — used to conditionally subscribe to portfolio store slices
  const isPortfolioWidget =
    card?.type === 'widget' &&
    (card?.meta?.widgetType === 'portfolio_chart' ||
      card?.meta?.widgetType === 'positions_table');

  // Subscribe only when rendering a portfolio widget — avoids re-renders on all other card types
  const selectedPortfolioName = useStatisticsStore((state) =>
    isPortfolioWidget ? state.selectedPortfolioName : undefined
  );
  const portfolioTotalValue = useStatisticsStore((state) =>
    isPortfolioWidget ? state.portfolioTotalValue : undefined
  );

  const handleCollapseToModal = useCallback(() => {
    callbacks.onBeforeCollapse?.();
    if (callbacks.onCollapse) {
      callbacks.onCollapse();
    } else {
      callbacks.onClose?.();
    }
  }, [callbacks]);

  const time = useMemo(() => {
    if (!card?.createdAt) return undefined;
    return formatTime(card.createdAt, tCommon as TranslateFn, locale);
  }, [card?.createdAt, tCommon, locale]);

  // ── Ticker info for header tag slot (chart, fundamental, technical, news) ──
  const tickerLogo = useMemo(() => {
    if (!card) return undefined;
    if (card.type === 'chart' && card.meta?.security_id) {
      return getTickerIconUrl(card.meta.security_id as number);
    }
    if (card.type === 'fundamental') {
      const fd = card.meta?.fundamentalData as FundamentalData | undefined;
      if (fd?.securityId != null) return getTickerIconUrl(fd.securityId);
    }
    if (card.type === 'technical') {
      const td = (card.meta?.technicalData || card.meta) as unknown as
        | TechnicalAnalysisData
        | undefined;
      if (td?.securityId != null) return getTickerIconUrl(td.securityId);
    }
    if (card.type === 'news') {
      if (card.meta?.security_id) {
        return getTickerIconUrl(card.meta.security_id as number);
      }
      const tickerTag = card.tags?.find((t) => t.type === 'ticker');
      const sid = tickerTag?.meta?.securityId ?? tickerTag?.meta?.security_id;
      if (sid != null) return getTickerIconUrl(Number(sid));
    }
    return undefined;
  }, [card]);

  const ticker = useMemo(() => {
    if (!card) return undefined;
    if (card.type === 'chart')
      return (card.meta?.tickerSymbol || card.meta?.symbol) as
        | string
        | undefined;
    if (card.type === 'fundamental') {
      const fd = card.meta?.fundamentalData as FundamentalData | undefined;
      return fd?.tickerSymbol;
    }
    if (card.type === 'technical') {
      const td = (card.meta?.technicalData || card.meta) as unknown as
        | TechnicalAnalysisData
        | undefined;
      return td?.tickerSymbol;
    }
    if (card.type === 'news') {
      if (card.meta?.tickerSymbol) return card.meta.tickerSymbol as string;
      const tickerTag = card.tags?.find((t) => t.type === 'ticker');
      return tickerTag?.meta?.symbol as string | undefined;
    }
    return undefined;
  }, [card]);

  const tickerSecurityId = useMemo(() => {
    if (!card) return undefined;
    if (card.type === 'chart' && card.meta?.security_id) {
      return card.meta.security_id as number;
    }
    if (card.type === 'fundamental') {
      const fd = card.meta?.fundamentalData as FundamentalData | undefined;
      return fd?.securityId;
    }
    if (card.type === 'technical') {
      const td = (card.meta?.technicalData || card.meta) as unknown as
        | TechnicalAnalysisData
        | undefined;
      return td?.securityId;
    }
    if (card.type === 'news') {
      if (card.meta?.security_id) return card.meta.security_id as number;
      const tickerTag = card.tags?.find((t) => t.type === 'ticker');
      const sid = tickerTag?.meta?.securityId ?? tickerTag?.meta?.security_id;
      return sid != null ? Number(sid) : undefined;
    }
    return undefined;
  }, [card]);

  const openModalWithSearch = useTickerModalStore(
    (state) => state.openModalWithSearch
  );

  const handleTickerClick = useCallback(
    (tickerSymbol: string) => {
      openModalWithSearch(tickerSymbol);
    },
    [openModalWithSearch]
  );

  const headerProps = useMemo((): CardControlsProps => {
    if (!card) {
      return { mode };
    }

    // ─── Card mode (board node) ───
    if (mode === 'card') {
      // Portfolio chart / positions table widgets: header with portfolio name + total value
      if (
        card.type === 'widget' &&
        (card.meta?.widgetType === 'portfolio_chart' ||
          card.meta?.widgetType === 'positions_table')
      ) {
        const isPortfolioChart = card.meta.widgetType === 'portfolio_chart';
        const labelColor = DEFAULT_BADGE_COLORS.widget;
        const portfolioLabel =
          selectedPortfolioName || tPortfolio('chart.allAssets');
        const totalFormatted =
          portfolioTotalValue != null
            ? `${getCurrencySymbol()} ${formatCurrencyValue(portfolioTotalValue, locale)}`
            : undefined;
        const afterLabelContent = React.createElement(
          'div',
          {
            className:
              'flex items-center gap-spacing-8 text-14 leading-20 tracking-tight-1',
          },
          React.createElement(
            'span',
            {
              className: 'font-medium text-blackinverse-a56 whitespace-nowrap',
            },
            portfolioLabel
          ),
          totalFormatted &&
            React.createElement(
              'span',
              { className: 'text-blackinverse-a32 whitespace-nowrap' },
              totalFormatted
            )
        );

        return {
          mode: 'card',
          label: isPortfolioChart
            ? tPortfolio('chart.title')
            : card.title || tBoard('fallback.widget'),
          labelColor,
          editableLabel: editableTitle
            ? {
                value: editableTitle.value,
                onChange: editableTitle.onChange,
                onConfirm: editableTitle.onConfirm,
                color: labelColor,
                focusTrigger: editableTitle.focusTrigger,
              }
            : undefined,
          colorWidget,
          cardType: card.type,
          time,
          afterLabelContent,
        };
      }

      // Out-of-scope types: delegate to legacy config
      if (!IN_SCOPE_TYPES.has(card.type)) {
        const config = getCardHeaderConfig(
          card,
          DEFAULT_CARD_COLOR,
          callbacks.onTitleChange,
          tBoard as TranslateFn
        );
        const simpleConfig = config.variant === 'simple' ? config : null;
        const outLabelColor = ((): string | undefined => {
          if (card.color === '') return undefined;
          if (card.color && VALID_LABEL_COLORS.has(card.color.toLowerCase())) {
            return card.color;
          }
          if (
            card.type === 'widget' &&
            card.meta?.widgetType === 'ai_screener'
          ) {
            return '#4ED47C';
          }
          return DEFAULT_BADGE_COLORS[card.type as CardType];
        })();
        return {
          mode: 'card',
          label: simpleConfig?.baseTitle || simpleConfig?.title,
          labelColor: outLabelColor,
          editableLabel: editableTitle
            ? {
                value: editableTitle.value,
                onChange: editableTitle.onChange,
                onConfirm: editableTitle.onConfirm,
                color: outLabelColor,
                focusTrigger: editableTitle.focusTrigger,
              }
            : undefined,
          colorWidget,
          cardType: card.type,
          tickerLogo,
          ticker,
          tickerSecurityId,
          onTickerClick: ticker ? handleTickerClick : undefined,
          time,
        };
      }

      // In-scope types: build card mode props
      const label =
        card.title ||
        (card.type === 'note'
          ? tBoard('fallback.note')
          : tBoard('fallback.untitled'));

      const labelColor =
        card.color === ''
          ? undefined
          : card.color && VALID_LABEL_COLORS.has(card.color.toLowerCase())
            ? card.color
            : DEFAULT_BADGE_COLORS[card.type as CardType];

      return {
        mode: 'card',
        label,
        labelColor,
        editableLabel: editableTitle
          ? {
              value: editableTitle.value,
              onChange: editableTitle.onChange,
              onConfirm: editableTitle.onConfirm,
              color: labelColor,
              focusTrigger: editableTitle.focusTrigger,
            }
          : undefined,
        colorWidget,
        cardType: card.type,
        tickerLogo,
        ticker,
        tickerSecurityId,
        onTickerClick: ticker ? handleTickerClick : undefined,
        time,
      };
    }

    // ─── Modal / Fullscreen mode ───
    const expandHandler =
      mode === 'fullscreen' ? handleCollapseToModal : callbacks.onExpand;

    return {
      mode,
      editableLabel: editableTitle
        ? {
            value: editableTitle.value,
            onChange: editableTitle.onChange,
            onConfirm: editableTitle.onConfirm,
            color: card.color,
            focusTrigger: editableTitle.focusTrigger,
          }
        : undefined,
      colorWidget,
      onMore: callbacks.onMore,
      onExpand: expandHandler,
      onClose: callbacks.onClose
        ? (((_e: React.MouseEvent) =>
            callbacks.onClose?.()) as CardControlsProps['onClose'])
        : undefined,
      closeTooltip:
        card.type === 'note'
          ? tBoard('noteEditor.saveAndClose', 'Save and close')
          : undefined,
      tickerLogo,
      ticker,
      tickerSecurityId,
      onTickerClick: ticker ? handleTickerClick : undefined,
      time,
      cardType: card.type,
    };
  }, [
    card,
    mode,
    editableTitle,
    colorWidget,
    callbacks,
    handleCollapseToModal,
    handleTickerClick,
    tickerLogo,
    ticker,
    tickerSecurityId,
    time,
    tBoard,
    tPortfolio,
    selectedPortfolioName,
    portfolioTotalValue,
    locale,
  ]);

  return { headerProps };
}
