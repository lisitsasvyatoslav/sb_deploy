import CardNode from '@/features/board/components/nodes/CardNode';
import { NodeTypes } from '@xyflow/react';

// Константы
export const SAVE_DELAY = 300; // миллисекунды
export const DUPLICATE_CARD_X_OFFSET = 352; // px offset for duplicated cards

// Типы узлов ReactFlow
export const NODE_TYPES: NodeTypes = {
  cardNode: CardNode,
};

// CSS для плавной анимации перетаскивания узлов
export const DRAG_ANIMATION_CSS = `
  .react-flow__node {
    transition: transform 0.1s ease-out;
  }
  
  .react-flow__node.dragging {
    transition: none;
    transform: scale(1.05);
    z-index: 1000;
  }
  
  .react-flow__node.dragging * {
    pointer-events: none;
  }
`;

// Добавляем CSS в head (выполняется один раз при импорте)
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = DRAG_ANIMATION_CSS;
  document.head.appendChild(style);
}
