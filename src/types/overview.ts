import type { Board } from './board';

/**
 * Props for Overview page views (Grid and Flow)
 */
export interface OverviewViewProps {
  boards: Board[];
  isLoading: boolean;
  error: Error | null;
  onBoardClick: (boardId: number) => void;
  onCreateBoard: () => void;
  detailRoute?: (boardId: number) => string;
}
