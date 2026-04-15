'use client';

import BoardsHeader from '@/features/ideas/components/BoardsHeader';
import { GridView } from '@/shared/ui/GridView';
import { Icon } from '@/shared/ui/Icon';
import TickerIconGroup from '@/shared/ui/TickerIconGroup';
import Image from 'next/image';
import {
  LAYOUT_CONSTANTS,
  getMaxContainerWidthClass,
} from '@/shared/constants/layout';
import { useResponsiveCardSize } from '@/shared/hooks';
import { useTranslation } from '@/shared/i18n/client';
import type { Board, OverviewViewProps } from '@/types';
import { formatBoardDate } from '@/shared/utils/timeUtils';
import type { NewsItemForCard } from '@/features/board/utils/newsCardBuilder';
import React, { useState, useCallback, useMemo } from 'react';
import { GlowBorder, useGlowTarget } from '@/features/onboarding';
import { useIdeasContextMenu } from '../hooks/useIdeasContextMenu';

interface IdeasGridViewProps extends OverviewViewProps {
  gridSubMode?: 'grid' | 'list';
  onGridSubModeChange?: (mode: 'grid' | 'list') => void;
  title?: string;
  createButtonLabel?: string;
  previewImage?: string;
  onNewsDrop?: (board: Board, newsData: NewsItemForCard) => void;
  onBoardDragActiveChange?: (active: boolean) => void;
  onPublish?: (boardId: number) => void;
  showCreateCard?: boolean;
  embedded?: boolean;
}

interface BoardCardProps {
  board: Board;
  previewImage: string;
  isMenuOpen: boolean;
  onBoardClick: (id: number) => void;
  onMenuOpen: (
    boardId: number,
    boardName: string,
    position: { x: number; y: number }
  ) => void;
  onNewsDrop?: (board: Board, newsData: NewsItemForCard) => void;
  onBoardDragActiveChange?: (active: boolean) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({
  board,
  previewImage,
  isMenuOpen,
  onBoardClick,
  onMenuOpen,
  onNewsDrop,
  onBoardDragActiveChange,
}) => {
  const { t, i18n } = useTranslation('board');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (!e.dataTransfer.types.includes('application/news-data')) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
      onBoardDragActiveChange?.(true);
    },
    [onBoardDragActiveChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('application/news-data')) return;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node))
        return;
      e.stopPropagation();
      setIsDragOver(false);
      onBoardDragActiveChange?.(false);
    },
    [onBoardDragActiveChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      onBoardDragActiveChange?.(false);
      const newsDataStr = e.dataTransfer.getData('application/news-data');
      if (!newsDataStr || !onNewsDrop) return;
      try {
        const newsData = JSON.parse(newsDataStr);
        onNewsDrop(board, newsData);
      } catch {
        // malformed drag data
      }
    },
    [board, onNewsDrop, onBoardDragActiveChange]
  );

  const borderClass = isDragOver
    ? 'border-[2px] border-dashed border-brand-base'
    : isMenuOpen
      ? 'border-[2px] border-solid border-brand-base'
      : 'border-[2px] border-solid border-transparent hover:border-brand-base';

  const bgClass = isDragOver ? 'bg-brand-bg_deep' : 'bg-surfacelow-surfacelow1';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onBoardClick(board.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onBoardClick(board.id);
        }
      }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid={`board-card-${board.id}`}
      className={`group relative flex flex-col gap-[10px] items-start cursor-pointer p-[3px] rounded-[4px] w-full text-left transition-colors duration-150 ${borderClass} ${bgClass}`}
    >
      {/* Card preview */}
      <div className="relative h-[111px] w-full rounded-radius-2 overflow-hidden shrink-0">
        <Image
          src={previewImage}
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

      {/* Menu button (three dots) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onMenuOpen(board.id, board.name, { x: e.clientX, y: e.clientY });
        }}
        data-testid={`board-menu-${board.id}`}
        className="absolute top-spacing-6 right-spacing-6 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-radius-2 bg-surfacewhite-medium"
        aria-label={t('boardMenu', 'Board menu')}
      >
        <Icon variant="more" size={16} className="text-blackinverse-a88" />
      </button>

      {/* Board info */}
      <div className="flex flex-col gap-spacing-4 items-start pl-spacing-8 pr-spacing-4 pb-spacing-6 w-full">
        <p className="font-sans font-regular text-12 leading-16 tracking-tight-1 text-blackinverse-a100 overflow-ellipsis overflow-hidden whitespace-nowrap w-full">
          {board.name}
        </p>
        <p className="font-sans font-regular text-10 leading-12 tracking-[-0.12px] text-blackinverse-a56 w-full">
          {formatBoardDate(board.updatedAt, 'updated', t, i18n.language)}
        </p>
      </div>
    </div>
  );
};

// Sentinel for the "Create Board" CTA card in the grid
const CREATE_BOARD_SENTINEL = { __type: 'create-board' as const, id: -1 };
type CreateBoardSentinel = typeof CREATE_BOARD_SENTINEL;
type GridItemType = Board | CreateBoardSentinel;

const BOARD_ITEM_CONFIG = {
  w: 1,
  h: 1,
  minW: 1,
  maxW: 2,
  minH: 1,
  maxH: 2,
  isResizable: false,
  isDraggable: false,
};

function isCreateSentinel(item: GridItemType): item is CreateBoardSentinel {
  return '__type' in item && item.__type === 'create-board';
}

interface CreateBoardCardProps {
  label: string;
  onClick: () => void;
}

const CreateBoardCard: React.FC<CreateBoardCardProps> = ({
  label,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="create-board-card"
      className="flex flex-col items-center justify-center cursor-pointer p-[3px] rounded-[4px] w-full h-full border-[2px] border-transparent bg-surfacewhite-low hover:border-brand-base transition-colors duration-150"
    >
      <span className="flex items-center gap-spacing-4 px-3 py-2 bg-transparent backdrop-blur-[24px] rounded-radius-2">
        <Icon variant="plusSmall" size={16} className="text-blackinverse-a56" />
        <span className="font-sans font-medium text-12 leading-16 tracking-tight-1 text-blackinverse-a56">
          {label}
        </span>
      </span>
    </button>
  );
};

export const IdeasGridView: React.FC<IdeasGridViewProps> = ({
  boards,
  isLoading,
  error,
  onBoardClick,
  onCreateBoard,
  gridSubMode = 'grid',
  onGridSubModeChange,
  title = 'Ideas',
  createButtonLabel = 'Create board',
  previewImage = '/images/mocks/board-preview.png',
  detailRoute,
  onNewsDrop,
  onBoardDragActiveChange,
  onPublish,
  showCreateCard,
  embedded,
}) => {
  const boardOrCreateGlow = useGlowTarget('board-or-create');
  const hasBoards = boards.length > 0;
  const { openMenuBoardId, handleMenuOpen, renderContextMenu } =
    useIdeasContextMenu({ detailRoute, onPublish });

  const items: GridItemType[] = useMemo(
    () => (showCreateCard ? [...boards, CREATE_BOARD_SENTINEL] : boards),
    [boards, showCreateCard]
  );

  const {
    cardWidth: gridCardWidth,
    cardHeight: gridCardHeight,
    screenWidth,
  } = useResponsiveCardSize();

  const maxContainerWidthClass = getMaxContainerWidthClass(screenWidth);

  const getItemKey = useCallback(
    (item: GridItemType) =>
      isCreateSentinel(item) ? 'create' : String(item.id),
    []
  );

  const getItemConfig = useCallback(() => BOARD_ITEM_CONFIG, []);

  const renderCard = useCallback(
    (item: GridItemType) => {
      if (isCreateSentinel(item)) {
        return (
          <CreateBoardCard label={createButtonLabel} onClick={onCreateBoard} />
        );
      }
      const board = item as Board;
      return (
        <GlowBorder
          active={boardOrCreateGlow && hasBoards}
          borderRadius={4}
          borderWidth={3}
        >
          <BoardCard
            board={board}
            previewImage={previewImage}
            isMenuOpen={openMenuBoardId === board.id}
            onBoardClick={onBoardClick}
            onMenuOpen={handleMenuOpen}
            onNewsDrop={onNewsDrop}
            onBoardDragActiveChange={onBoardDragActiveChange}
          />
        </GlowBorder>
      );
    },
    [
      createButtonLabel,
      onCreateBoard,
      previewImage,
      openMenuBoardId,
      onBoardClick,
      handleMenuOpen,
      onNewsDrop,
      onBoardDragActiveChange,
      boardOrCreateGlow,
      hasBoards,
    ]
  );

  return (
    <>
      <GridView
        items={items}
        isLoading={isLoading}
        error={error || undefined}
        sidebarAware={true}
        cardWidth={gridCardWidth}
        cardHeight={gridCardHeight}
        maxCols={LAYOUT_CONSTANTS.MAX_COLS}
        gap={LAYOUT_CONSTANTS.GAP}
        verticalGap={24}
        gridPadding={
          embedded
            ? {
                top: 'pt-0',
                bottom: 'pb-6',
                left: 'pl-4',
                right: 'pr-4',
              }
            : { bottom: 'pb-6' }
        }
        containerClassName={embedded ? '' : 'pb-[9px]'}
        maxContainerWidth={maxContainerWidthClass}
        headerControls={
          <BoardsHeader
            title={title}
            createButtonLabel={createButtonLabel}
            onCreateBoard={onCreateBoard}
            viewMode={gridSubMode}
            onViewModeChange={onGridSubModeChange}
            createButtonGlow={boardOrCreateGlow}
          />
        }
        getItemKey={getItemKey}
        getItemConfig={getItemConfig}
        renderCard={renderCard}
      />
      {renderContextMenu()}
    </>
  );
};
