'use client';

import React, { useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/shared/ui/Icon';
import type { IconVariant } from '@/shared/ui/Icon/Icon.types';
import { useTranslation } from '@/shared/i18n/client';
import type { TranslateFn } from '@/shared/i18n/settings';
import type { CardType } from '@/types/common';

export interface StrategyWidget {
  type: CardType;
  labelKey: string;
  icon: IconVariant;
}

export const STRATEGY_WIDGETS: StrategyWidget[] = [
  {
    type: 'strategy' as CardType,
    labelKey: 'strategy.widgets.strategy',
    icon: 'target',
  },
  {
    type: 'screener_forecast' as CardType,
    labelKey: 'strategy.widgets.forecasts',
    icon: 'chart',
  },
  {
    type: 'strategy_output_ideas' as CardType,
    labelKey: 'strategy.widgets.parameters',
    icon: 'settings',
  },
  {
    type: 'ticker_graph' as CardType,
    labelKey: 'strategy.widgets.charts',
    icon: 'lineChartOutline',
  },
  {
    type: 'strategy_checklist' as CardType,
    labelKey: 'strategy.widgets.checklist',
    icon: 'tickCircle',
  },
];

interface StrategyWidgetCatalogProps {
  isOpen: boolean;
  onSelect: (widgetType: CardType) => void;
}

const StrategyWidgetCatalog: React.FC<StrategyWidgetCatalogProps> = ({
  isOpen,
  onSelect,
}) => {
  const { t } = useTranslation('board');

  const widgets = useMemo(
    () =>
      STRATEGY_WIDGETS.map((w) => ({
        ...w,
        label: (t as TranslateFn)(w.labelKey),
      })),
    [t]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0, x: 8, y: '-50%' }}
          animate={{ opacity: 1, x: 0, y: '-50%' }}
          exit={{ opacity: 0, x: 8, y: '-50%' }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute right-full mr-3 top-1/2 flex flex-col gap-1 bg-[var(--toolbar-bg)] backdrop-blur-effects-panel rounded-[2px] px-1.5 py-2 w-[140px] shadow-e3"
        >
          {widgets.map((widget) => (
            <button
              key={widget.type}
              type="button"
              onClick={() => onSelect(widget.type)}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[var(--bg-hover)] transition-colors text-left w-full"
            >
              <Icon
                variant={widget.icon}
                size={16}
                className="text-text-primary"
              />
              <span className="font-inter text-[12px] font-medium text-[var(--text-primary)] whitespace-nowrap">
                {widget.label}
              </span>
            </button>
          ))}
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default StrategyWidgetCatalog;
