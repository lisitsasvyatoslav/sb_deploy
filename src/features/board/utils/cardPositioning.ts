import { Card } from '@/types';

/**
 * Card dimensions for positioning calculations.
 *
 * Values from Figma (Workspaces → "как появляются карточки", node 1858:55366):
 *   "small card": 338 × 390, horizontal step 394, vertical step 446 → gap 56 px.
 */
const CARD_DIMENSIONS = {
  width: 338,
  height: 390,
  spacing: 56,
};

/**
 * Calculate grid spacing including card dimensions and spacing
 */
const GRID = {
  horizontal: CARD_DIMENSIONS.width + CARD_DIMENSIONS.spacing, // 394px
  vertical: CARD_DIMENSIONS.height + CARD_DIMENSIONS.spacing, // 446px
};

/**
 * Default starting position for first card on board
 */
const DEFAULT_START_POSITION = { x: 100, y: 100 };

/**
 * Calculate non-overlapping grid positions for new cards
 * @param existingCards - Array of existing cards on the board
 * @param count - Number of new card positions to calculate
 * @returns Array of {x, y} positions in grid layout
 */
export const calculateGridPositions = (
  existingCards: Card[],
  count: number
): Array<{ x: number; y: number }> => {
  const positions: Array<{ x: number; y: number }> = [];

  // If board is empty, start at default position
  if (existingCards.length === 0) {
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 3); // 3 cards per row
      const col = i % 3;
      positions.push({
        x: DEFAULT_START_POSITION.x + col * GRID.horizontal,
        y: DEFAULT_START_POSITION.y + row * GRID.vertical,
      });
    }
    return positions;
  }

  // Find occupied grid positions
  const occupiedPositions = new Set<string>();
  existingCards.forEach((card) => {
    // Round to nearest grid position
    const gridX = Math.round(card.x / GRID.horizontal) * GRID.horizontal;
    const gridY = Math.round(card.y / GRID.vertical) * GRID.vertical;
    occupiedPositions.add(`${gridX},${gridY}`);
  });

  // Find the bottom-right most card to start placing new cards nearby
  let maxX = DEFAULT_START_POSITION.x;
  let maxY = DEFAULT_START_POSITION.y;
  existingCards.forEach((card) => {
    if (card.x > maxX) maxX = card.x;
    if (card.y > maxY) maxY = card.y;
  });

  // Start from the next row after the bottom-most card
  const startY =
    Math.ceil(maxY / GRID.vertical) * GRID.vertical + GRID.vertical;
  let currentX = DEFAULT_START_POSITION.x;
  let currentY = startY;
  let cardsInRow = 0;

  // Generate positions in grid layout
  for (let i = 0; i < count; i++) {
    // Check if current position is occupied
    while (occupiedPositions.has(`${currentX},${currentY}`)) {
      currentX += GRID.horizontal;
      cardsInRow++;

      // Move to next row after 5 cards
      if (cardsInRow >= 5) {
        currentY += GRID.vertical;
        currentX = DEFAULT_START_POSITION.x;
        cardsInRow = 0;
      }
    }

    positions.push({ x: currentX, y: currentY });
    occupiedPositions.add(`${currentX},${currentY}`);

    // Move to next position
    currentX += GRID.horizontal;
    cardsInRow++;

    // Move to next row after 5 cards
    if (cardsInRow >= 5) {
      currentY += GRID.vertical;
      currentX = DEFAULT_START_POSITION.x;
      cardsInRow = 0;
    }
  }

  return positions;
};

/**
 * Calculate a single position for a new card
 * Convenience wrapper around calculateGridPositions
 */
export const calculateSingleCardPosition = (
  existingCards: Card[]
): { x: number; y: number } => {
  return calculateGridPositions(existingCards, 1)[0];
};

/**
 * Find a non-overlapping position near the target point.
 * If the target overlaps an existing card, searches nearby grid-aligned
 * positions in a spiral pattern to find the closest free spot.
 * @param targetPosition - Desired position for the new card
 * @param existingCards - Array of existing cards on the board
 * @returns Position that doesn't overlap any existing card
 */
/**
 * Tracks positions of cards that are being created (mutation in-flight)
 * but not yet reflected in allCards from the store.
 * Prevents rapid sequential creates from overlapping.
 */
const pendingPositions: Set<string> = new Set();

const posKey = (x: number, y: number) => `${Math.round(x)},${Math.round(y)}`;

const isPendingOverlap = (pos: { x: number; y: number }) => {
  for (const key of pendingPositions) {
    const [px, py] = key.split(',').map(Number);
    if (
      Math.abs(px - pos.x) < CARD_DIMENSIONS.width &&
      Math.abs(py - pos.y) < CARD_DIMENSIONS.height
    )
      return true;
  }
  return false;
};

export const findNonOverlappingPosition = (
  targetPosition: { x: number; y: number },
  existingCards: Card[]
): { x: number; y: number } => {
  if (existingCards.length === 0 && pendingPositions.size === 0)
    return targetPosition;

  // Check if a position overlaps any existing card or pending creation
  const hasOverlap = (pos: { x: number; y: number }) =>
    isPendingOverlap(pos) ||
    existingCards.some(
      (card) =>
        Math.abs((card.x ?? 0) - pos.x) < CARD_DIMENSIONS.width &&
        Math.abs((card.y ?? 0) - pos.y) < CARD_DIMENSIONS.height
    );

  if (!hasOverlap(targetPosition)) {
    pendingPositions.add(posKey(targetPosition.x, targetPosition.y));
    return targetPosition;
  }

  // Spiral search: check positions in expanding rings around target
  // 3 rings × 394px ≈ 1182px max displacement from center — enough for dense boards
  const maxRings = 3;
  for (let ring = 1; ring <= maxRings; ring++) {
    for (let dx = -ring; dx <= ring; dx++) {
      for (let dy = -ring; dy <= ring; dy++) {
        // Only check cells on the current ring perimeter
        if (Math.abs(dx) !== ring && Math.abs(dy) !== ring) continue;

        const candidate = {
          x: targetPosition.x + dx * GRID.horizontal,
          y: targetPosition.y + dy * GRID.vertical,
        };

        if (!hasOverlap(candidate)) {
          pendingPositions.add(posKey(candidate.x, candidate.y));
          return candidate;
        }
      }
    }
  }

  // Fallback: offset by one grid cell to the right (should never reach here)
  const fallback = {
    x: targetPosition.x + GRID.horizontal,
    y: targetPosition.y,
  };
  pendingPositions.add(posKey(fallback.x, fallback.y));
  return fallback;
};

/**
 * Remove a single pending position (e.g. when a card creation fails).
 */
export const removePendingPosition = (key: string) => {
  pendingPositions.delete(key);
};

/** Exported for use in error-handling paths */
export { posKey };

/**
 * Clear pending positions after board data is refreshed from the server.
 * Should be called when allCards is updated (query invalidation).
 */
export const clearPendingPositions = () => {
  pendingPositions.clear();
};

/**
 * Calculate grid positions centered around a specific point (e.g., viewport center)
 * @param centerPosition - Center point for positioning cards
 * @param count - Number of card positions to calculate
 * @returns Array of {x, y} positions in grid layout centered around the given point
 */
export const calculateGridPositionsFromCenter = (
  centerPosition: { x: number; y: number },
  count: number
): Array<{ x: number; y: number }> => {
  const positions: Array<{ x: number; y: number }> = [];

  // Calculate grid dimensions
  const cardsPerRow = Math.min(count, 3); // Max 3 cards per row
  const rows = Math.ceil(count / cardsPerRow);

  // Calculate total grid width and height
  const totalWidth = cardsPerRow * GRID.horizontal - CARD_DIMENSIONS.spacing;
  const totalHeight = rows * GRID.vertical - CARD_DIMENSIONS.spacing;

  // Calculate starting position to center the grid
  const startX = centerPosition.x - totalWidth / 2;
  const startY = centerPosition.y - totalHeight / 2;

  // Generate positions in grid layout
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cardsPerRow);
    const col = i % cardsPerRow;

    positions.push({
      x: startX + col * GRID.horizontal,
      y: startY + row * GRID.vertical,
    });
  }

  return positions;
};
