import React from 'react';
import { GridListToggle } from '@/shared/ui/GridListToggle';
import { GlowBorder } from '@/features/onboarding';

interface BoardsHeaderProps {
  title: string;
  createButtonLabel: string;
  onCreateBoard: () => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  /** Show glow border around the create button */
  createButtonGlow?: boolean;
}

const BoardsHeader: React.FC<BoardsHeaderProps> = ({
  title,
  createButtonLabel,
  onCreateBoard,
  viewMode,
  onViewModeChange,
  createButtonGlow = false,
}) => {
  return (
    <div className="flex items-center justify-between w-full">
      <h2 className="font-sans font-semibold text-24 leading-[28px] tracking-[-0.384px] theme-text-primary">
        {title}
      </h2>

      <div className="flex gap-[12px] items-center">
        <GlowBorder active={createButtonGlow} borderRadius={4} borderWidth={3}>
          <button
            type="button"
            onClick={onCreateBoard}
            data-testid="create-board-button"
            className="flex items-center justify-center px-3 py-2 rounded-[2px] bg-[var(--wrapper-a8)] backdrop-blur-[40px] font-sans font-medium text-[12px] leading-[16px] tracking-[-0.2px] text-[var(--blackinverse-a100)] hover:bg-[var(--wrapper-a12)] transition-colors whitespace-nowrap"
          >
            {createButtonLabel}
          </button>
        </GlowBorder>
        {onViewModeChange && viewMode && (
          <GridListToggle mode={viewMode} onModeChange={onViewModeChange} />
        )}
      </div>
    </div>
  );
};

export default BoardsHeader;
