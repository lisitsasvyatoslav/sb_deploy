import { Icon } from '@/shared/ui/Icon';
import type { IconVariant } from '@/shared/ui/Icon/Icon.types';
import { DeleteBoardDialog } from '@/features/ideas/components/DeleteBoardDialog';
import React, { useEffect, useRef, useState } from 'react';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import {
  useDeleteBoardMutation,
  useDuplicateBoardMutation,
} from '@/features/board/queries';
import { useTranslation } from '@/shared/i18n/client';
import { logger } from '@/shared/utils/logger';
import { useCopyToClipboard } from '@/shared/hooks/useCopyToClipboard';

const PublishIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.5828 0C13.8597 0 15.5145 0.485197 16.5975 1.5682C17.6805 2.6512 18.1657 4.30602 18.1657 6.58284V11.5828C18.1657 13.8597 17.6805 15.5145 16.5975 16.5975C15.5145 17.6805 13.8597 18.1657 11.5828 18.1657H6.58284C4.30602 18.1657 2.6512 17.6805 1.5682 16.5975C0.485197 15.5145 0 13.8597 0 11.5828V6.58284C0 4.30602 0.485197 2.6512 1.5682 1.5682C2.6512 0.485197 4.30602 0 6.58284 0H11.5828ZM6.58284 1.49902C4.67084 1.49902 3.41167 1.84061 2.62614 2.62614C1.84061 3.41167 1.49902 4.67084 1.49902 6.58284V11.5828C1.49902 13.4949 1.84061 14.754 2.62614 15.5396C3.41167 16.3251 4.67084 16.6667 6.58284 16.6667H11.5828C13.4949 16.6667 14.754 16.3251 15.5396 15.5396C16.3251 14.754 16.6667 13.4949 16.6667 11.5828V6.58284C16.6667 4.67084 16.3251 3.41167 15.5396 2.62614C14.754 1.84061 13.4949 1.49902 11.5828 1.49902H6.58284ZM6.16618 7.5C6.80715 7.5 7.42116 7.75482 7.87435 8.20801C8.32754 8.6612 8.58236 9.2752 8.58236 9.91618V12.8369L8.57096 13.0672V13.0697C8.54784 13.3055 8.49095 13.5375 8.40006 13.7573C8.27873 14.0505 8.09967 14.3173 7.87516 14.5418C7.65066 14.7663 7.38385 14.9454 7.09066 15.0667C6.87079 15.1576 6.63886 15.2145 6.40299 15.2376H6.40055L6.16781 15.2482L6.16211 15.249C5.84641 15.2487 5.53353 15.1874 5.2417 15.0667C4.9485 14.9454 4.6817 14.7663 4.45719 14.5418C4.23269 14.3173 4.05363 14.0505 3.93229 13.7573C3.8641 13.5923 3.81504 13.4206 3.78499 13.2454L3.76139 13.0697V13.0672L3.75 12.8345L3.74919 12.8288L3.75 9.91618C3.75 9.2752 4.00482 8.6612 4.45801 8.20801C4.9112 7.75482 5.5252 7.5 6.16618 7.5ZM12.002 2.91667L12.2363 2.92806L12.4455 2.95817C12.9205 3.04746 13.361 3.27802 13.7077 3.62467C14.1609 4.07786 14.4157 4.69187 14.4157 5.33284V12.8369L14.4043 13.0672V13.0697C14.3812 13.3055 14.3243 13.5375 14.2334 13.7573C14.1121 14.0505 13.933 14.3173 13.7085 14.5418C13.484 14.7663 13.2172 14.9454 12.924 15.0667C12.7041 15.1576 12.4722 15.2145 12.2363 15.2376H12.2339L12.0011 15.2482L11.9954 15.249C11.6797 15.2487 11.3669 15.1874 11.075 15.0667C10.7818 14.9454 10.515 14.7663 10.2905 14.5418C10.066 14.3173 9.88696 14.0505 9.76562 13.7573C9.69743 13.5923 9.64837 13.4206 9.61833 13.2454L9.59473 13.0697V13.0672L9.58333 12.8345L9.58252 12.8288L9.58333 5.33284C9.58333 4.69187 9.83815 4.07786 10.2913 3.62467C10.7445 3.17149 11.3585 2.91667 11.9995 2.91667H12.002ZM6.16618 8.99902C5.9231 8.99902 5.68951 9.09564 5.51758 9.26758C5.34564 9.43951 5.24902 9.6731 5.24902 9.91618V12.8328C5.24902 13.0759 5.34564 13.3095 5.51758 13.4814C5.68951 13.6534 5.9231 13.75 6.16618 13.75C6.40926 13.75 6.64285 13.6534 6.81478 13.4814C6.98671 13.3095 7.08333 13.0759 7.08333 12.8328V9.91618C7.08333 9.6731 6.98671 9.43951 6.81478 9.26758C6.64284 9.09564 6.40926 8.99902 6.16618 8.99902ZM11.9995 4.41569C11.7564 4.41569 11.5228 4.51231 11.3509 4.68424C11.179 4.85618 11.0824 5.08977 11.0824 5.33284V12.8328C11.0824 13.0759 11.179 13.3095 11.3509 13.4814C11.5228 13.6534 11.7564 13.75 11.9995 13.75C12.2426 13.75 12.4762 13.6534 12.6481 13.4814C12.82 13.3095 12.9167 13.0759 12.9167 12.8328V5.33284C12.9167 5.08977 12.82 4.85618 12.6481 4.68424C12.4762 4.51231 12.2426 4.41569 11.9995 4.41569Z"
      fill="currentColor"
    />
  </svg>
);

interface IdeasContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  boardId: number;
  boardName: string;
  detailRoute?: (boardId: number) => string;
  onRename?: (boardId: number) => void;
  onAskAI?: (boardId: number) => void;
  onPublish?: (boardId: number) => void;
  isHomeBoard?: boolean;
}

const IdeasContextMenu: React.FC<IdeasContextMenuProps> = ({
  position,
  onClose,
  boardId,
  boardName,
  detailRoute,
  onRename,
  onAskAI,
  onPublish,
  isHomeBoard,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('common');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteBoardMutation = useDeleteBoardMutation();
  const duplicateBoardMutation = useDuplicateBoardMutation();
  const copyToClipboard = useCopyToClipboard();

  useClickOutside(menuRef, () => {
    if (!showDeleteDialog) onClose();
  });

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const menuWidth = 256;
  const menuHeight = 192;

  const adjustedPosition = {
    x: Math.min(position.x + 10, window.innerWidth - menuWidth),
    y: Math.min(position.y + 10, window.innerHeight - menuHeight),
  };

  const handleAskAI = () => {
    onAskAI?.(boardId);
    onClose();
  };

  const handleRename = () => {
    onRename?.(boardId);
    onClose();
  };

  const handleDuplicate = async () => {
    try {
      await duplicateBoardMutation.mutateAsync(boardId);
      showSuccessToast(t('ideas.duplicateSuccess'));
      onClose();
    } catch (error) {
      logger.error('IdeasContextMenu', 'Failed to duplicate board', error);
      showErrorToast(t('ideas.duplicateError'));
    }
  };

  const handleCopyLink = () => {
    const path = detailRoute ? detailRoute(boardId) : `/ideas/${boardId}`;
    const url = `${window.location.origin}${path}`;
    copyToClipboard(url);
    onClose();
  };

  const handlePublish = () => {
    onPublish?.(boardId);
    onClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBoardMutation.mutateAsync(boardId);
      showSuccessToast(t('ideas.deleteSuccess'));
      onClose();
    } catch (error) {
      logger.error('IdeasContextMenu', 'Failed to delete board', error);
      showErrorToast(t('ideas.deleteError'));
    }
  };

  const menuItems = [
    {
      label: t('ideas.contextMenu.askAI'),
      icon: 'ai' as const,
      onClick: handleAskAI,
      hidden: !onAskAI,
    },
    {
      label: t('ideas.contextMenu.rename'),
      icon: 'edit' as const,
      onClick: handleRename,
      hidden: !onRename,
    },
    {
      label: t('ideas.contextMenu.duplicate'),
      icon: 'copy' as const,
      onClick: handleDuplicate,
      hidden: true,
    },
    {
      label: t('ideas.contextMenu.copyLink'),
      icon: 'share' as const,
      onClick: handleCopyLink,
    },
    {
      label: t('ideas.contextMenu.publishToMarketplace'),
      icon: (<PublishIcon />) as React.ReactNode,
      onClick: handlePublish,
      hidden: !onPublish,
    },
    {
      label: t('ideas.contextMenu.delete'),
      icon: 'trash' as const,
      onClick: handleDeleteClick,
      hidden: isHomeBoard,
    },
  ];

  return (
    <>
      <div
        ref={menuRef}
        className="fixed z-50 flex flex-col gap-spacing-4 p-spacing-8 rounded-radius-4 bg-surfacemedium-surfacemedium3 border border-blackinverse-a12 shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.08),0px_5px_12px_0px_rgba(0,0,0,0.18),0px_1px_3px_0px_rgba(0,0,0,0.18)]"
        style={{
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
          width: `${menuWidth}px`,
        }}
      >
        {menuItems
          .filter((item) => !item.hidden)
          .map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex items-center gap-[12px] py-[6px] px-[8px] rounded-[2px] hover:bg-blackinverse-a4 transition-colors text-left w-full"
            >
              <span className="text-blackinverse-a72 shrink-0 flex items-center justify-center w-[20px] h-[20px]">
                {typeof item.icon === 'string' ? (
                  <Icon variant={item.icon as IconVariant} size={20} />
                ) : (
                  item.icon
                )}
              </span>
              <span className="font-inter font-normal text-[13px] leading-[20px] text-blackinverse-a72 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          ))}
      </div>

      <DeleteBoardDialog
        open={showDeleteDialog}
        boardName={boardName}
        onClose={() => {
          setShowDeleteDialog(false);
          onClose();
        }}
        onConfirm={handleConfirmDelete}
        isLoading={deleteBoardMutation.isPending}
      />
    </>
  );
};

export default IdeasContextMenu;
