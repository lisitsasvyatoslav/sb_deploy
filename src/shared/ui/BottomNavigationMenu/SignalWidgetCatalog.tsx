import React, { useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Icon } from '@/shared/ui/Icon';
import type { IconVariant } from '@/shared/ui/Icon/Icon.types';
import { useTranslation } from '@/shared/i18n/client';

export type SignalSourceType = 'telegram' | 'tradingview' | 'ai_screener';

export interface SignalWidget {
  type: SignalSourceType;
  label: string;
  icon: IconVariant;
  status?: 'active' | 'inactive';
}

interface SignalWidgetCatalogProps {
  isOpen: boolean;
  onSelect: (signalType: SignalSourceType) => void;
}

const SignalWidgetCatalog: React.FC<SignalWidgetCatalogProps> = ({
  isOpen,
  onSelect,
}) => {
  const { t } = useTranslation('board');
  const signalWidgets: SignalWidget[] = useMemo(
    () => [
      { type: 'telegram', label: 'Telegram', icon: 'share' },
      { type: 'tradingview', label: 'TradingView', icon: 'lineChartOutline' },
      {
        type: 'ai_screener',
        label: t('cardContent.aiScreener'),
        icon: 'activityOutline',
      },
    ],
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
          {signalWidgets.map((widget) => (
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
              {widget.status === 'active' && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[var(--status-success)] shrink-0" />
              )}
            </button>
          ))}
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default SignalWidgetCatalog;
