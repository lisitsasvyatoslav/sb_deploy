import React from 'react';
import { cn } from '@/shared/utils/cn';
import { Icon } from '@/shared/ui/Icon';

interface ChipsGroupProps {
  /** Number of attached items */
  count: number;
  /** Label to display (e.g., "добавлено") */
  label: string;
  /** Size variant: sm for web, lg for app */
  size?: 'sm' | 'lg';
  /** Optional click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ChipsGroup — chipsGroup/Web + chipsGroup/App
 *
 * Summary chip in input bottom bar showing total attachment count.
 * Web: shows chevron on hover. App: larger size, pressed state.
 *
 * Figma node: 56218:6634 (web), 59430:26172 (app)
 */
const ChipsGroup: React.FC<ChipsGroupProps> = ({
  count,
  label,
  size = 'sm',
  onClick,
  className = '',
}) => {
  const isLg = size === 'lg';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group/chips-group inline-flex items-center rounded-radius-2 bg-transparent',
        'transition-colors duration-150 hover:bg-blackinverse-a4 active:bg-blackinverse-a4 cursor-pointer',
        isLg ? 'gap-1.5 py-2.5 pl-2.5 pr-3.5' : 'gap-1 py-2 pl-2 pr-2.5',
        className
      )}
    >
      <Icon
        variant="attachement"
        size={isLg ? 20 : 16}
        className="text-blackinverse-a56 shrink-0"
      />

      <span
        className={cn(
          'whitespace-nowrap text-blackinverse-a56',
          isLg
            ? 'text-14 font-semibold leading-5'
            : 'text-12 font-medium leading-4'
        )}
      >
        {count} {label}
      </span>

      {/* Chevron — web only, visible on hover */}
      {!isLg && (
        <Icon
          variant="chevronRightSmall"
          size={16}
          className="
            text-blackinverse-a56
            opacity-0 group-hover/chips-group:opacity-100
            transition-opacity duration-150
            -ml-0.5
          "
        />
      )}
    </button>
  );
};

export default ChipsGroup;
