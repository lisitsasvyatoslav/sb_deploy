/**
 * Utility functions for viewport calculations
 */

import { ReactFlowInstance } from '@xyflow/react';

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Default card size used to center the card on the viewport.
 * Position (x, y) stored in DB is the card's TOP-LEFT corner.
 * To place the card visually centered we offset by half its dimensions.
 *
 * Matches Figma "small card" dimensions (338 × 390).
 */
const DEFAULT_CARD_SIZE = { width: 338, height: 390 };

/**
 * Default viewport used during initialization and board transitions
 */
export const DEFAULT_VIEWPORT: Viewport = {
  x: 0,
  y: 0,
  zoom: 1,
};

/**
 * Calculate the center position of the visible viewport in flow coordinates.
 * Uses window dimensions as a fallback — prefer getFlowCenterPosition when
 * a ReactFlowInstance is available for pixel-accurate results.
 * @param viewport - Current ReactFlow viewport
 * @param windowSize - Optional window size, defaults to current window
 * @returns Center position in flow coordinates
 */
export const getViewportCenter = (
  viewport: Viewport,
  windowSize?: { width: number; height: number }
): { x: number; y: number } => {
  const width =
    windowSize?.width ??
    (typeof window !== 'undefined' ? window.innerWidth : 1920);
  const height =
    windowSize?.height ??
    (typeof window !== 'undefined' ? window.innerHeight : 1080);

  // Convert screen center to flow coordinates
  // Formula: flowPosition = (screenPosition - viewport.offset) / viewport.zoom
  const centerX = (width / 2 - viewport.x) / viewport.zoom;
  const centerY = (height / 2 - viewport.y) / viewport.zoom;

  return { x: centerX, y: centerY };
};

/**
 * Get the screen-space center of the visible ReactFlow board canvas.
 * Accounts for sidebar and other UI chrome by using the actual element bounds.
 */
const getBoardScreenCenter = (): { x: number; y: number } => {
  const boardEl =
    typeof document !== 'undefined'
      ? document.querySelector('.react-flow')
      : null;
  const rect = boardEl?.getBoundingClientRect();
  return rect
    ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    : {
        x: typeof window !== 'undefined' ? window.innerWidth / 2 : 960,
        y: typeof window !== 'undefined' ? window.innerHeight / 2 : 540,
      };
};

/**
 * Calculate the top-left position so that a card is visually centered in the
 * visible board canvas. Uses the actual ReactFlow container bounds (accounting
 * for sidebar width and other chrome).
 * @param reactFlowInstance - ReactFlow instance for coordinate conversion
 * @param cardSize - Card dimensions in flow units (defaults to 338×390)
 * @returns Top-left position in flow coordinates that centers the card
 */
export const getFlowCenterPosition = (
  reactFlowInstance: ReactFlowInstance,
  cardSize?: { width: number; height: number }
): { x: number; y: number } => {
  const center = reactFlowInstance.screenToFlowPosition(getBoardScreenCenter());
  const { width, height } = cardSize ?? DEFAULT_CARD_SIZE;
  return {
    x: center.x - width / 2,
    y: center.y - height / 2,
  };
};

/**
 * Calculate the top-left position so that a card is visually centered in the
 * visible board canvas, without a ReactFlowInstance (for components outside
 * ReactFlowProvider, e.g. global modals in AppLayout).
 * @param viewport - Current ReactFlow viewport from useBoardStore
 * @param cardSize - Card dimensions in flow units (defaults to 338×390)
 * @returns Top-left position in flow coordinates that centers the card
 */
export const getBoardCenterWithoutInstance = (
  viewport: Viewport,
  cardSize?: { width: number; height: number }
): { x: number; y: number } => {
  const screen = getBoardScreenCenter();
  const { width, height } = cardSize ?? DEFAULT_CARD_SIZE;
  return {
    x: (screen.x - viewport.x) / viewport.zoom - width / 2,
    y: (screen.y - viewport.y) / viewport.zoom - height / 2,
  };
};

/**
 * Smoothly pan the viewport to center on a newly created card.
 * Preserves current zoom (minimum 0.75) so the card is clearly visible.
 * Call this immediately after a card creation mutation resolves.
 * @param reactFlowInstance - ReactFlow instance for viewport control
 * @param card - Created card with position and optional dimensions
 */
export const panToCreatedCard = (
  reactFlowInstance: ReactFlowInstance,
  card: { x: number; y: number; width?: number; height?: number }
): void => {
  const width = card.width ?? DEFAULT_CARD_SIZE.width;
  const height = card.height ?? DEFAULT_CARD_SIZE.height;
  const zoom = Math.max(reactFlowInstance.getZoom(), 0.75);
  reactFlowInstance.setCenter(card.x + width / 2, card.y + height / 2, {
    zoom,
    duration: 500,
  });
};
