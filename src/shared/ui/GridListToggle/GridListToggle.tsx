import React from 'react';

interface GridListToggleProps {
  mode: 'grid' | 'list';
  onModeChange: (mode: 'grid' | 'list') => void;
  className?: string;
}

/**
 * GridListToggle - toggle between Grid and List modes
 * Used on the Ideas page to switch between grid and list view
 */
export const GridListToggle: React.FC<GridListToggleProps> = ({
  mode,
  onModeChange,
  className = '',
}) => {
  const activeIconColor = 'var(--blackinverse-a100)';

  return (
    <div
      className={`flex gap-[2px] items-center p-[2px] rounded-[2px] bg-wrapper-a8 backdrop-blur-normal ${className}`}
    >
      {/* Grid button */}
      <button
        onClick={() => onModeChange('grid')}
        className={`flex items-center justify-center px-2 py-1 min-h-[28px] rounded-[1px] transition-colors ${
          mode === 'grid'
            ? 'bg-background-white_high shadow-200'
            : 'bg-transparent'
        }`}
        aria-label="Grid view"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="3"
            width="6"
            height="6"
            rx="1"
            fill={mode === 'grid' ? activeIconColor : 'var(--blackinverse-a32)'}
          />
          <rect
            x="11"
            y="3"
            width="6"
            height="6"
            rx="1"
            fill={mode === 'grid' ? activeIconColor : 'var(--blackinverse-a32)'}
          />
          <rect
            x="3"
            y="11"
            width="6"
            height="6"
            rx="1"
            fill={mode === 'grid' ? activeIconColor : 'var(--blackinverse-a32)'}
          />
          <rect
            x="11"
            y="11"
            width="6"
            height="6"
            rx="1"
            fill={mode === 'grid' ? activeIconColor : 'var(--blackinverse-a32)'}
          />
        </svg>
      </button>

      {/* List button */}
      <button
        onClick={() => onModeChange('list')}
        className={`flex items-center justify-center px-2 py-1 min-h-[28px] rounded-[1px] transition-colors ${
          mode === 'list'
            ? 'bg-background-white_high shadow-200'
            : 'bg-transparent'
        }`}
        aria-label="List view"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="4"
            cy="5.5"
            r="1.5"
            fill={mode === 'list' ? activeIconColor : 'var(--blackinverse-a32)'}
          />
          <rect
            x="8"
            y="4.5"
            width="8"
            height="2"
            rx="1"
            fill={mode === 'list' ? activeIconColor : 'var(--blackinverse-a32)'}
          />
          <circle
            cx="4"
            cy="10"
            r="1.5"
            fill={mode === 'list' ? activeIconColor : 'var(--blackinverse-a32)'}
          />
          <rect
            x="8"
            y="9"
            width="8"
            height="2"
            rx="1"
            fill={mode === 'list' ? activeIconColor : 'var(--blackinverse-a32)'}
          />
          <circle
            cx="4"
            cy="14.5"
            r="1.5"
            fill={mode === 'list' ? activeIconColor : 'var(--blackinverse-a32)'}
          />
          <rect
            x="8"
            y="13.5"
            width="8"
            height="2"
            rx="1"
            fill={mode === 'list' ? activeIconColor : 'var(--blackinverse-a32)'}
          />
        </svg>
      </button>
    </div>
  );
};
