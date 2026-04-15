'use client';

/**
 * SelectBoardForNewsDialog — выбор доски для добавления новости
 *
 * Figma node: 3018:22803
 */

import Image from 'next/image';
import Button from '@/shared/ui/Button';
import SearchInput from '@/shared/ui/SearchInput';
import { useTranslation } from '@/shared/i18n/client';
import {
  useBoardsAllQuery,
  useCreateBoardMutation,
} from '@/features/board/queries';
import { formatBoardDate } from '@/shared/utils/timeUtils';
import { CreateBoardDialog } from '@/shared/ui/CreateBoardDialog';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/shared/ui/Modal';
import type { Board } from '@/types';
import type { TranslateFn } from '@/shared/i18n/settings';
import React, { useState, useCallback, useMemo, useEffect } from 'react';

interface BoardRowProps {
  board: Board;
  isSelected: boolean;
  isDragOver: boolean;
  onToggle: (id: number) => void;
  onDragOver: (e: React.DragEvent, id: number) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, id: number) => void;
  locale: string;
  t: TranslateFn;
}

const BoardRow: React.FC<BoardRowProps> = ({
  board,
  isSelected,
  isDragOver,
  onToggle,
  onDragOver,
  onDragLeave,
  onDrop,
  locale,
  t,
}) => {
  const rowStyle: React.CSSProperties = isDragOver
    ? {
        border: '2px dashed var(--brand-primary)',
        background: 'var(--brand-bg_deep)',
        borderRadius: '4px',
      }
    : isSelected
      ? {
          border: '1px solid var(--brand-primary)',
          background: 'var(--brand-bg)',
          borderRadius: '4px',
        }
      : {
          border: '1px solid transparent',
          background: 'var(--blackinverse-a4)',
          borderRadius: '4px',
        };

  return (
    <div
      onClick={() => onToggle(board.id)}
      onDragOver={(e) => onDragOver(e, board.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, board.id)}
      className="flex items-center cursor-pointer transition-all duration-150 select-none"
      style={{ height: '62px', padding: '3px 12px 3px 3px', ...rowStyle }}
    >
      {/* Preview with checkbox overlay */}
      <div className="relative flex-shrink-0 w-[56px] h-[56px] rounded-[4px] overflow-hidden bg-[var(--bg-card)]">
        <Image
          src="/images/mocks/board-preview.png"
          alt={board.name}
          className="w-full h-full object-cover"
          width={56}
          height={56}
        />
        {/* Checkbox positioned at top-left of preview */}
        <div
          className="absolute"
          style={{ left: '4px', top: '4px', width: '16px', height: '16px' }}
        >
          {isSelected ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="16" height="16" rx="2" fill="var(--brand-primary)" />
              <path
                d="M3.5 8L6.5 11L12.5 5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '2px',
                border: '2px solid var(--blackinverse-a8)',
              }}
            />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col gap-[2px] min-w-0 ml-[16px]">
        <p className="font-medium text-[13px] leading-[16px] tracking-[-0.13px] text-[var(--text-primary)] truncate">
          {board.name}
        </p>
        <p className="text-[11px] leading-[14px] text-[var(--text-secondary)]">
          {formatBoardDate(board.updatedAt, 'updated', t, locale)}
        </p>
      </div>

      {/* Created date */}
      <p className="flex-shrink-0 text-[11px] leading-[14px] text-[var(--text-secondary)] whitespace-nowrap ml-[16px]">
        {formatBoardDate(board.createdAt, 'created', t, locale)}
      </p>
    </div>
  );
};

export interface SelectBoardForNewsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (boardIds: number[]) => Promise<void> | void;
}

export const SelectBoardForNewsDialog: React.FC<
  SelectBoardForNewsDialogProps
> = ({ isOpen, onClose, onAdd }) => {
  const { t, i18n } = useTranslation('common');
  const { t: tBoard } = useTranslation('board');
  const { data: boards = [] } = useBoardsAllQuery({ enabled: isOpen });
  const createBoardMutation = useCreateBoardMutation();

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIds(new Set());
      setDragOverId(null);
    }
  }, [isOpen]);

  const filteredBoards = useMemo(() => {
    if (!search.trim()) return boards;
    const q = search.toLowerCase();
    return boards.filter((b) => b.name.toLowerCase().includes(q));
  }, [boards, search]);

  const handleToggle = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: number) => {
    if (!e.dataTransfer.types.includes('application/news-data')) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverId(id);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node))
      return;
    e.preventDefault();
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, id: number) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverId(null);
      try {
        await onAdd([id]);
      } finally {
        onClose();
      }
    },
    [onAdd, onClose]
  );

  const handleAdd = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setIsSubmitting(true);
    try {
      await onAdd(Array.from(selectedIds));
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedIds, onAdd, onClose]);

  // After creating a board: keep SelectBoardForNewsDialog open, auto-select the new board
  const handleCreateBoard = useCallback(
    async (data: { name: string }) => {
      try {
        const newBoard = await createBoardMutation.mutateAsync({
          name: data.name,
        });
        setIsCreateOpen(false);
        setSelectedIds((prev) => new Set([...prev, newBoard.id]));
      } catch {
        // Error toast is shown by the mutation's onError handler
      }
    },
    [createBoardMutation]
  );

  const selectedCount = selectedIds.size;

  return (
    <>
      <Modal
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        maxWidth="sm"
        zIndex={1200}
      >
        <ModalHeader>
          <ModalTitle>{t('selectBoardForNews.title')}</ModalTitle>
          <p className="text-[var(--text-secondary)] text-sm leading-[18px] mt-1">
            {t('selectBoardForNews.subtitle')}
          </p>

          {/* Search */}
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder={t('selectBoardForNews.searchPlaceholder')}
            size="sm"
            className="mt-4"
            autoFocus
          />
        </ModalHeader>

        <ModalBody padding="none" className="px-6 pb-2">
          <div className="flex flex-col gap-[4px]">
            {filteredBoards.map((board) => (
              <BoardRow
                key={board.id}
                board={board}
                isSelected={selectedIds.has(board.id)}
                isDragOver={dragOverId === board.id}
                onToggle={handleToggle}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                locale={i18n.language}
                t={tBoard as TranslateFn}
              />
            ))}
            {filteredBoards.length === 0 && (
              <p className="text-center py-6 text-[13px] text-[var(--text-secondary)]">
                {t('selectBoardForNews.noBoards')}
              </p>
            )}
          </div>
        </ModalBody>

        <ModalFooter
          className="!px-6 !py-6"
          leftContent={
            <button
              onClick={() => setIsCreateOpen(true)}
              className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {t('selectBoardForNews.createNew')}
            </button>
          }
        >
          <Button onClick={onClose} variant="secondary" size="sm">
            {t('modal.cancel')}
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedCount === 0 || isSubmitting}
            variant="primary"
            size="sm"
          >
            {selectedCount > 1
              ? t('selectBoardForNews.addToMany', { count: selectedCount })
              : t('selectBoardForNews.addToOne')}
          </Button>
        </ModalFooter>
      </Modal>

      <CreateBoardDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateBoard}
      />
    </>
  );
};
