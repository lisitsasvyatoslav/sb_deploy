import Button from '@/shared/ui/Button';
import {
  formatSignalTime,
  getSignalTitle,
} from '@/features/board/utils/signalHelpers';
import { useSwipeNavigation } from '@/features/board/hooks/useSwipeNavigation';
import { useSignalModalStore } from '@/features/signal/stores/signalModalStore';
import { useTranslation } from '@/shared/i18n/client';
import { useBoardStore } from '@/stores/boardStore';
import { getDateLocaleTag } from '@/shared/utils/formatLocale';
import { SignalItem } from '@/types';
import React, { useCallback } from 'react';
import SignalInstructions from '../SignalInstructions';

interface SignalContentProps {
  meta?: {
    sourceType?: 'tradingview' | 'telegram';
  };
  signalWebhookId?: number;
  signals?: SignalItem[];
}

export const SignalContent: React.FC<SignalContentProps> = ({
  meta,
  signalWebhookId,
  signals = [],
}) => {
  const boardId = useBoardStore((state) => state.boardId);
  const { t, i18n } = useTranslation('board');
  const locale = getDateLocaleTag(i18n.language);
  const recentSignals = signals.slice(0, 3);
  const sourceType = meta?.sourceType;
  const hasSignals = recentSignals.length > 0;

  const { currentIndex, isTransitioning, handlers, goToIndex } =
    useSwipeNavigation({
      itemsCount: recentSignals.length,
    });

  const openSignalModal = useSignalModalStore((state) => state.openModal);

  const handleViewSignal = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (signalWebhookId && boardId) {
        openSignalModal(boardId, signalWebhookId, 'view');
      }
    },
    [signalWebhookId, boardId, openSignalModal]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      handlers.onTouchStart(e);
    },
    [handlers]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      handlers.onTouchMove(e);
    },
    [handlers]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      handlers.onTouchEnd(e);
    },
    [handlers]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handlers.onMouseDown(e);
    },
    [handlers]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handlers.onMouseMove(e);
    },
    [handlers]
  );

  const handleMouseUp = useCallback(() => {
    handlers.onMouseUp();
  }, [handlers]);

  const handleMouseLeave = useCallback(() => {
    handlers.onMouseLeave();
  }, [handlers]);

  if (!hasSignals) {
    return (
      <div className="box-border flex flex-col gap-[6px] h-full items-start px-[12px] py-[2px] w-full overflow-y-auto">
        <SignalInstructions sourceType={sourceType || 'tradingview'} compact />
      </div>
    );
  }

  // Current signal to display
  const currentSignal = recentSignals[currentIndex];
  const signalTitle = getSignalTitle(currentSignal.payload);
  const signalTime = formatSignalTime(currentSignal.createdAt, locale);

  // Show carousel with current signal
  return (
    <div className="box-border flex flex-col gap-[8px] h-full items-start w-full overflow-y-auto">
      {/* Signal preview with swipe */}
      <div
        className="flex flex-col gap-[8px] items-start justify-center p-[8px] w-full select-none touch-none cursor-pointer nodrag"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`flex flex-col gap-[4px] items-start w-full transition-all duration-300 ${
            isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <div className="flex flex-col gap-[6px] w-full">
            <div className="flex items-center justify-between w-full">
              <p className="font-semibold leading-[12px] shrink-0 theme-text-secondary text-8 text-nowrap tracking-[-0.2px] uppercase ml-auto">
                {signalTime}
              </p>
            </div>
            <p className="font-semibold leading-[18px] text-[13px] theme-text-primary tracking-[-0.2px] line-clamp-3 whitespace-pre-wrap">
              {signalTitle}
            </p>
          </div>
        </div>

        {/* View button */}
        <Button
          onClick={handleViewSignal}
          variant="ghost"
          size="sm"
          className={`transition-all duration-300 ${
            isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {t('cardContent.view')}
        </Button>
      </div>

      {/* Pagination dots */}
      {recentSignals.length > 1 && (
        <div className="flex gap-[0px] items-center justify-center opacity-100 overflow-clip px-[8px] py-[4px] rounded-[6px] shrink-0 w-full">
          <div className="h-[4px] flex gap-[4px] items-center justify-center w-[36px]">
            {recentSignals.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  goToIndex(idx);
                }}
                className={`h-[4px] rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-3 bg-[var(--text-primary)]'
                    : 'w-1 bg-[var(--border-medium)]'
                }`}
                aria-label={`Go to signal ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
