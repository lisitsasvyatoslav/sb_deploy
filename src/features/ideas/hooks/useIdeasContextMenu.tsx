'use client';

import IdeasContextMenu from '../components/IdeasContextMenu';
import { useHomeBoardQuery } from '@/features/board/queries';
import React, { useState, useCallback } from 'react';

interface ContextMenuState {
  position: { x: number; y: number };
  boardId: number;
  boardName: string;
}

interface UseIdeasContextMenuOptions {
  detailRoute?: (boardId: number) => string;
  onPublish?: (boardId: number) => void;
}

export function useIdeasContextMenu({
  detailRoute,
  onPublish,
}: UseIdeasContextMenuOptions) {
  const { data: homeBoard } = useHomeBoardQuery();
  const [contextMenuState, setContextMenuState] =
    useState<ContextMenuState | null>(null);

  const openMenuBoardId = contextMenuState?.boardId ?? null;

  const handleMenuOpen = useCallback(
    (boardId: number, boardName: string, position: { x: number; y: number }) =>
      setContextMenuState({ boardId, boardName, position }),
    []
  );

  const handleMenuClose = useCallback(() => setContextMenuState(null), []);

  const renderContextMenu = useCallback(() => {
    if (!contextMenuState) return null;
    return (
      <IdeasContextMenu
        position={contextMenuState.position}
        boardId={contextMenuState.boardId}
        boardName={contextMenuState.boardName}
        onClose={handleMenuClose}
        detailRoute={detailRoute}
        onPublish={onPublish}
        isHomeBoard={homeBoard?.id === contextMenuState.boardId}
      />
    );
  }, [
    contextMenuState,
    handleMenuClose,
    detailRoute,
    onPublish,
    homeBoard?.id,
  ]);

  return {
    openMenuBoardId,
    handleMenuOpen,
    handleMenuClose,
    renderContextMenu,
  };
}
