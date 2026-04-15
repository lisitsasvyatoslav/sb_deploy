import CardControls, { CardControlsProps } from '@/shared/ui/CardControls';
import { Icon } from '@/shared/ui/Icon';
import Tag from '@/shared/ui/Tag';
import CardContent from '@/features/board/components/CardContent';
import CardContentSkeleton from '@/features/board/components/CardContentSkeleton';
import { useTranslation } from '@/shared/i18n/client';
import { AutoAwesome } from '@mui/icons-material';
import { Resizable } from 're-resizable';
import { Card } from '@/types';
import React from 'react';

const RESIZE_HANDLE_CLASS = 'card-resize-handle';
const SELECTION_COLOR = 'var(--mind-accent)';

interface CardNodeBodyData extends Card {
  showAiResponseFooter?: boolean;
  isContentLoading?: boolean;
  [key: string]: unknown;
}

interface CardNodeBodyProps {
  size: { width: number; height: number };
  headerProps: CardControlsProps;
  isStrategy: boolean;
  isTradingIdea: boolean;
  isWidget: boolean;
  isInteractiveContent: boolean;
  isTickerAdder: boolean;
  isNewsFeed: boolean;
  isAiScreener: boolean;
  data: CardNodeBodyData;
  showIndividualBorder: boolean;
  colorWidget: React.ReactNode;
  handleResizeStart: (
    event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>
  ) => void;
  handleResize: (
    event: MouseEvent | TouchEvent,
    direction: unknown,
    ref: HTMLElement
  ) => void;
  handleResizeStop: (
    event: MouseEvent | TouchEvent,
    direction: unknown,
    ref: HTMLElement
  ) => void;
  handleMoreClick: (e: React.MouseEvent) => void;
  handleAskAI: () => void;
  setTitleFocusTrigger: React.Dispatch<React.SetStateAction<number>>;
  tradingIdeaNav: React.ReactNode | undefined;
}

export const CardNodeBody: React.FC<CardNodeBodyProps> = ({
  size,
  headerProps,
  isStrategy,
  isTradingIdea,
  isWidget,
  isInteractiveContent,
  isTickerAdder,
  isNewsFeed,
  isAiScreener,
  data,
  showIndividualBorder,
  colorWidget,
  handleResizeStart,
  handleResize,
  handleResizeStop,
  handleMoreClick,
  handleAskAI,
  setTitleFocusTrigger,
  tradingIdeaNav,
}) => {
  const { t } = useTranslation('board');
  const useStrategyBg = isStrategy || isTradingIdea;

  return (
    <>
      {/* Controls above card -- all types except ticker_adder.
          card-select-zone is intentionally restricted to this header strip:
          left-click selection fires only when the click originates in the header.
          Any new card type that omits CardControls must handle click selection separately. */}
      {!isTickerAdder && (
        <div
          className="mb-[12px] card-drag-handle card-select-zone"
          style={{ maxWidth: size.width }}
        >
          {isStrategy ? (
            /* Strategy card: ghost button controls bar */
            <div
              className="flex items-center gap-spacing-1 px-spacing-2 h-spacing-36 rounded-radius-4 backdrop-blur-xl"
              style={{ background: 'rgba(44,44,46,0.92)' }}
            >
              <button
                type="button"
                className="flex items-center gap-spacing-4 px-spacing-8 h-spacing-32 rounded-radius-4 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-13 font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  setTitleFocusTrigger((n) => n + 1);
                }}
              >
                <Icon variant="edit" size={16} />
                {t('toolbar.rename')}
              </button>
              <button
                type="button"
                className="flex items-center gap-spacing-4 px-spacing-8 h-spacing-32 rounded-radius-4 text-white/70 hover:text-white hover:bg-white/10 transition-colors text-13 font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAskAI();
                }}
              >
                <Icon variant="ai" size={16} />
                {t('toolbar.askAI')}
              </button>
              <div className="w-px h-spacing-16 bg-white/20 mx-spacing-1" />
              <button
                type="button"
                className="flex items-center justify-center w-spacing-32 h-spacing-32 rounded-radius-4 text-white/50 hover:text-red-400 hover:bg-white/10 transition-colors"
                onClick={handleMoreClick}
              >
                <Icon variant="trash" size={16} />
              </button>
            </div>
          ) : (
            <CardControls
              {...headerProps}
              rightContent={tradingIdeaNav ?? headerProps.rightContent}
            />
          )}
        </div>
      )}

      <div className="relative">
        {/* Selection border overlay (only for single card selection) */}
        {showIndividualBorder && (
          <div
            className="absolute inset-[-1px] rounded-[5px] pointer-events-none z-10"
            style={{
              border: `1px solid ${SELECTION_COLOR}`,
            }}
          />
        )}
        {/* Gradient border overlay while content is loading */}
        {data.isContentLoading && (
          <div
            className="absolute inset-0 rounded-[4px] pointer-events-none z-10"
            style={{
              padding: '1px',
              background:
                'linear-gradient(to bottom right, var(--outline-primary_med_em), white)',
              WebkitMask:
                'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
            }}
          />
        )}
        <Resizable
          size={size}
          minWidth={280}
          minHeight={220}
          enable={{
            right: true,
            bottom: true,
            bottomRight: true,
          }}
          handleClasses={{
            right: `${RESIZE_HANDLE_CLASS} ${RESIZE_HANDLE_CLASS}--right`,
            bottom: `${RESIZE_HANDLE_CLASS} ${RESIZE_HANDLE_CLASS}--bottom`,
            bottomRight: `${RESIZE_HANDLE_CLASS} ${RESIZE_HANDLE_CLASS}--corner`,
          }}
          onResizeStart={handleResizeStart}
          onResize={handleResize}
          onResizeStop={handleResizeStop}
          handleStyles={{
            right: { right: '-4px', width: '8px', cursor: 'ew-resize' },
            bottom: { bottom: '-4px', height: '8px', cursor: 'ns-resize' },
            bottomRight: {
              right: '-6px',
              bottom: '-6px',
              width: '16px',
              height: '16px',
              cursor: 'nwse-resize',
            },
          }}
          className="card-widget-container rounded-[4px] overflow-clip transition-all"
          style={{
            background:
              useStrategyBg || isAiScreener
                ? 'var(--background-bgthin________)'
                : 'var(--background-gray_low)',
            borderWidth: '1px',
            borderStyle: 'solid',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: '0px 16px 32px -8px var(--base-black_blackbasea8)',
          }}
        >
          {/* Draggable content wrapper: body, tags */}
          <div
            className={`${isInteractiveContent ? '' : 'card-drag-handle'} box-border flex flex-col h-full ${
              isTradingIdea ||
              isStrategy ||
              isNewsFeed ||
              data.type === 'chart' ||
              data.type === 'file'
                ? ''
                : 'gap-spacing-10 p-spacing-8'
            } ${
              data.type === 'file' ||
              data.type === 'fundamental' ||
              data.type === 'technical'
                ? 'cursor-pointer hover:bg-blackinverse-a4 rounded-radius-4 transition-colors'
                : ''
            }`}
          >
            {/* Main content leverages shared CardContent component */}
            <div
              className={`flex-1 w-full box-border ${
                isTradingIdea || isStrategy
                  ? 'overflow-hidden'
                  : `${isNewsFeed || data.type === 'chart' || data.type === 'file' ? '' : 'px-[4px]'} ${isInteractiveContent ? 'overflow-auto nowheel' : 'overflow-y-auto'}`
              }`}
            >
              {data.isContentLoading ? (
                <CardContentSkeleton />
              ) : (
                <CardContent card={data} />
              )}
            </div>

            {/* Tags rendered after content as in UI spec */}
            {data.tags &&
              data.tags.length > 0 &&
              !['chart', 'news', 'fundamental', 'technical'].includes(
                data.type
              ) && (
                <div className="flex flex-wrap gap-1 w-full px-[4px]">
                  {data.tags.map((tag) => (
                    <Tag
                      key={tag.id ?? `${tag.type}-${tag.text}-${tag.order}`}
                      tag={tag}
                    />
                  ))}
                </div>
              )}

            {/* AI response footer for demo cards */}
            {data.showAiResponseFooter && (
              <div className="flex justify-between items-center w-full px-[4px] pb-[5px] mt-auto shrink-0">
                <div className="flex items-center gap-[6px]">
                  <div className="flex items-center justify-center size-[20px] rounded-full border border-[rgba(0,0,0,0.12)]">
                    <AutoAwesome
                      className="theme-text-primary"
                      sx={{ fontSize: 10 }}
                    />
                  </div>
                  <span className="text-[10px] font-medium uppercase theme-text-primary leading-[19px]">
                    {t('cardControls.aiResponse')}
                  </span>
                </div>
                <span className="text-[8px] font-medium theme-text-secondary leading-[19px]">
                  {t('cardContent.justNow')}
                </span>
              </div>
            )}
          </div>
        </Resizable>
      </div>
    </>
  );
};
