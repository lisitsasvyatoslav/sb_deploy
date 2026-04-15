import BoardsHeader from '@/features/ideas/components/BoardsHeader';
import { Icon } from '@/shared/ui/Icon';
import TickerIconGroup from '@/shared/ui/TickerIconGroup';
import { getMaxContainerWidthClass } from '@/shared/constants/layout';
import Image from 'next/image';
import { useResponsiveCardSize } from '@/shared/hooks';
import { useTranslation } from '@/shared/i18n/client';
import { useChatStore } from '@/stores/chatStore';
import { useNewsSidebarStore } from '@/stores/newsSidebarStore';
import type { Board, OverviewViewProps } from '@/types';
import { formatBoardDate } from '@/shared/utils/timeUtils';
import React from 'react';
import { useIdeasContextMenu } from '../hooks/useIdeasContextMenu';

interface ListItemProps {
  board: Board;
  previewImage: string;
  isMenuOpen: boolean;
  onBoardClick: (id: number) => void;
  onMenuOpen: (
    boardId: number,
    boardName: string,
    position: { x: number; y: number }
  ) => void;
}

const ListItem: React.FC<ListItemProps> = ({
  board,
  previewImage,
  isMenuOpen,
  onBoardClick,
  onMenuOpen,
}) => {
  const { t, i18n } = useTranslation('board');

  return (
    <button
      type="button"
      onClick={() => onBoardClick(board.id)}
      className={`box-border flex items-center justify-between pt-[3px] pb-[3px] pl-[3px] pr-[12px] rounded-[4px] w-full cursor-pointer transition-colors duration-150 border-[2px] bg-surfacewhite-medium hover:border-brand-base text-left ${
        isMenuOpen ? 'border-brand-base' : 'border-transparent'
      }`}
    >
      {/* Left section: Preview + Title */}
      <div className="flex gap-[16px] items-center w-[280px]">
        <div className="border border-surfacewhite-medium h-[56px] rounded-[2px] w-[92px] overflow-hidden shrink-0">
          <Image
            src={previewImage}
            alt={board.name}
            className="w-full h-full object-cover board-preview-image"
            width={400}
            height={300}
          />
        </div>

        <div className="flex flex-col gap-[4px] items-start min-w-0 flex-1">
          <p className="font-inter font-medium text-[12px] leading-[16px] tracking-[-0.12px] text-blackinverse-a100 overflow-ellipsis overflow-hidden whitespace-nowrap w-full">
            {board.name}
          </p>
          <p className="font-inter font-normal text-[10px] leading-[12px] tracking-[-0.12px] text-blackinverse-a56">
            {formatBoardDate(board.updatedAt, 'updated', t, i18n.language)}
          </p>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-[16px]">
        {/* Ticker symbols */}
        <div className="flex items-center min-w-[38px] h-[20px]">
          <TickerIconGroup tickers={board.tickers ?? []} />
        </div>

        {/* Created date */}
        <div className="flex items-center justify-end w-[136px]">
          <p className="font-inter font-normal text-[10px] leading-[12px] tracking-[-0.12px] text-blackinverse-a56 whitespace-nowrap text-right">
            {formatBoardDate(board.createdAt, 'created', t, i18n.language)}
          </p>
        </div>

        {/* Menu button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMenuOpen(board.id, board.name, { x: e.clientX, y: e.clientY });
          }}
          className="flex items-center justify-center w-6 h-6 p-[2px] rounded-[2px] shrink-0"
          aria-label="Menu"
        >
          <Icon variant="more" size={20} className="text-blackinverse-a88" />
        </button>
      </div>
    </button>
  );
};

interface CreateBoardListItemProps {
  label: string;
  onClick: () => void;
}

const CreateBoardListItem: React.FC<CreateBoardListItemProps> = ({
  label,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="box-border flex items-center justify-center pt-[3px] pb-[3px] pl-[3px] pr-[12px] rounded-[4px] w-full cursor-pointer transition-colors duration-150 border-[2px] border-transparent bg-surfacewhite-low hover:bg-surfacewhite-medium hover:border-brand-base"
      style={{ minHeight: 64 }}
    >
      <div className="flex items-center gap-[4px]">
        <Icon variant="plusSmall" size={16} className="text-blackinverse-a56" />
        <span className="font-inter font-medium text-[12px] leading-[16px] tracking-[-0.2px] text-blackinverse-a56">
          {label}
        </span>
      </div>
    </button>
  );
};

interface IdeasListViewProps extends OverviewViewProps {
  gridSubMode?: 'grid' | 'list';
  onGridSubModeChange?: (mode: 'grid' | 'list') => void;
  title?: string;
  createButtonLabel?: string;
  previewImage?: string;
  onPublish?: (boardId: number) => void;
  showCreateCard?: boolean;
  embedded?: boolean;
}

export const IdeasListView: React.FC<IdeasListViewProps> = ({
  boards,
  isLoading,
  error,
  onBoardClick,
  onCreateBoard,
  gridSubMode = 'list',
  onGridSubModeChange,
  title,
  createButtonLabel,
  previewImage = '/images/mocks/board-preview.png',
  detailRoute,
  onPublish,
  showCreateCard,
  embedded,
}) => {
  const { t } = useTranslation('common');
  const resolvedTitle = title || t('ideas.title');
  const resolvedCreateButtonLabel = createButtonLabel || t('ideas.createBoard');
  const { isChatSidebarOpen } = useChatStore();
  const { isOpen: isNewsOpen } = useNewsSidebarStore();
  const { openMenuBoardId, handleMenuOpen, renderContextMenu } =
    useIdeasContextMenu({ detailRoute, onPublish });

  const { screenWidth } = useResponsiveCardSize();
  const maxContainerWidthClass = getMaxContainerWidthClass(screenWidth);

  const paddingLeftClass = embedded ? '' : isNewsOpen ? 'pl-4' : 'pl-10';
  const paddingRightClass = embedded
    ? ''
    : isChatSidebarOpen
      ? 'pr-4'
      : 'pr-10';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">{t('errorLoading')}</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full ${embedded ? 'px-4' : 'pt-[84px] overflow-auto'} flex flex-col pb-4 ${paddingLeftClass} ${paddingRightClass}`}
    >
      <div
        className={`w-full ${embedded ? '' : `${maxContainerWidthClass} mx-auto`} flex flex-col gap-[24px] items-start`}
      >
        {/* Header */}
        <BoardsHeader
          title={resolvedTitle}
          createButtonLabel={resolvedCreateButtonLabel}
          onCreateBoard={onCreateBoard}
          viewMode={gridSubMode}
          onViewModeChange={onGridSubModeChange}
        />

        {/* List */}
        <div className="box-border flex flex-col gap-[4px] items-start w-full">
          {boards.map((board) => (
            <ListItem
              key={board.id}
              board={board}
              previewImage={previewImage}
              isMenuOpen={openMenuBoardId === board.id}
              onBoardClick={onBoardClick}
              onMenuOpen={handleMenuOpen}
            />
          ))}
          {showCreateCard && (
            <CreateBoardListItem
              label={resolvedCreateButtonLabel}
              onClick={onCreateBoard}
            />
          )}
        </div>
      </div>

      {renderContextMenu()}
    </div>
  );
};
