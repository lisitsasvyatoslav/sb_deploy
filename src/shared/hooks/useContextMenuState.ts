import { useState, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

export interface ContextMenuState {
  contextMenuOpen: boolean;
  contextMenuPosition: { x: number; y: number };
  contextMenuFlowPosition: { x: number; y: number } | null;
  openContextMenu: (clientX: number, clientY: number) => void;
  closeContextMenu: () => void;
  handleContextMenu: (event: React.MouseEvent) => void;
}

/**
 * Хук для управления состоянием контекстного меню
 * Включает автоматическое преобразование координат для ReactFlow
 */
export const useContextMenuState = (): ContextMenuState => {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [contextMenuFlowPosition, setContextMenuFlowPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const reactFlowInstance = useReactFlow();

  const openContextMenu = useCallback(
    (clientX: number, clientY: number) => {
      setContextMenuPosition({ x: clientX, y: clientY });

      if (reactFlowInstance) {
        const flowPosition = reactFlowInstance.screenToFlowPosition({
          x: clientX,
          y: clientY,
        });
        setContextMenuFlowPosition(flowPosition);
      }

      setContextMenuOpen(true);
    },
    [reactFlowInstance]
  );
  const closeContextMenu = useCallback(() => {
    setContextMenuOpen(false);
    setContextMenuFlowPosition(null);
  }, []);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      openContextMenu(event.clientX, event.clientY);
    },
    [openContextMenu]
  );

  return {
    contextMenuOpen,
    contextMenuPosition,
    contextMenuFlowPosition,
    openContextMenu,
    closeContextMenu,
    handleContextMenu,
  };
};
