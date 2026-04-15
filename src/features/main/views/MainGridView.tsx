import { GridView } from '@/shared/ui/GridView';
import TickerIconGroup from '@/shared/ui/TickerIconGroup';
import {
  LAYOUT_CONSTANTS,
  getMaxContainerWidthClass,
} from '@/shared/constants/layout';
import { useResponsiveCardSize } from '@/shared/hooks';
import { useTranslation } from '@/shared/i18n/client';
import type { TranslateFn } from '@/shared/i18n/settings';
import Image from 'next/image';
import type { Board, OverviewViewProps } from '@/types';
import { formatBoardDate } from '@/shared/utils/timeUtils';
import React from 'react';

export const MainGridView: React.FC<
  Omit<OverviewViewProps, 'onCreateBoard'>
> = ({ boards, isLoading, error, onBoardClick }) => {
  const { t: tBoard, i18n } = useTranslation('board');

  // Only boards (create button moved to header)
  const items: Board[] = [...boards];

  // Get responsive card dimensions
  const {
    cardWidth: gridCardWidth,
    cardHeight: gridCardHeight,
    screenWidth,
  } = useResponsiveCardSize();

  // Get responsive max container width
  const maxContainerWidthClass = getMaxContainerWidthClass(screenWidth);

  return (
    <GridView
      items={items}
      isLoading={isLoading}
      error={error || undefined}
      sidebarAware={true}
      cardWidth={gridCardWidth}
      cardHeight={gridCardHeight}
      maxCols={LAYOUT_CONSTANTS.MAX_COLS}
      gap={LAYOUT_CONSTANTS.GAP}
      gridPadding={{
        top: 'pt-0',
        bottom: 'pb-[16px]',
        left: 'px-[16px]',
        right: 'px-[16px]',
      }}
      horizontalPadding={32}
      containerClassName="pb-[9px]"
      maxContainerWidth={maxContainerWidthClass}
      getItemConfig={(_item) => {
        return {
          w: 1,
          h: 1,
          minW: 1,
          maxW: 2,
          minH: 1,
          maxH: 2,
          isResizable: false,
          isDraggable: false,
        };
      }}
      renderCard={(board) => (
        <div
          onClick={() => onBoardClick(board.id)}
          className="flex flex-col gap-[10px] items-start cursor-pointer hover:opacity-90 transition-opacity p-[3px] rounded-[5px] w-full"
        >
          {/* Card preview */}
          <div className="relative border border-[var(--border-light)] h-[111px] w-full rounded-[5px] overflow-hidden shrink-0 bg-[var(--bg-card)]">
            <Image
              src="/images/mocks/board-preview.png"
              alt={board.name}
              className="w-full h-full object-cover board-preview-image"
              width={400}
              height={300}
            />
            {board.tickers && board.tickers.length > 0 && (
              <TickerIconGroup
                tickers={board.tickers}
                className="absolute bottom-[8px] right-[8px]"
              />
            )}
          </div>

          {/* Board info */}
          <div className="flex gap-[12px] items-center px-[8px] pb-[6px] pt-0 w-full">
            <div className="flex flex-col gap-[3px] items-start grow min-w-0">
              <p className="font-inter font-semibold text-[var(--text-primary)] text-12 tracking-[-0.12px] leading-[16px] overflow-ellipsis overflow-hidden whitespace-nowrap w-full">
                {board.name}
              </p>
              <p className="font-inter font-medium text-[var(--text-secondary)] text-[11px] tracking-[-0.11px] leading-[16px] opacity-80 w-full">
                {formatBoardDate(
                  board.updatedAt,
                  'updated',
                  tBoard as TranslateFn,
                  i18n.language
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    />
  );
};
