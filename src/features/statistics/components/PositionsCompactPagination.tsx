'use client';

import React from 'react';
import classNames from 'classnames';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from '@/shared/i18n/client';

interface PositionsCompactPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  'data-testid'?: string;
}

/**
 * PositionsCompactPagination - compact pagination specifically for PositionsBlockV2
 *
 * From Figma node-id=2001:2044 (buttonSecondary/XS/[XS] Icon Left)
 *
 * Specs:
 * - Size: ~79x20px (auto width)
 * - Background: rgba(255,255,255,0.12)
 * - Border radius: 2px
 * - Padding: 4/6/4/6px
 * - Gap: 4px
 * - Icons: 12x12px rgba(255,255,255,0.40)
 * - Text: 10px/12px weight:500 rgba(255,255,255,0.40)
 */
const PositionsCompactPagination: React.FC<PositionsCompactPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  'data-testid': dataTestId = 'positions-compact-pagination',
}) => {
  const { t } = useTranslation('statistics');

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const handlePrev = () => {
    if (hasPrev) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onPageChange(currentPage + 1);
    }
  };

  const containerClasses = classNames(
    // Base styles
    'inline-flex items-center',

    'rounded-sm', // 2px
    // Padding: 4/6/4/6px
    'py-spacing-4 px-spacing-6',
    // Gap: 4px
    'gap-spacing-4',
    // Height: ~20px
    'h-[20px]',
    // User override
    className
  );

  const buttonClasses = (disabled: boolean) =>
    classNames(
      // Size: 12x12px
      'w-[12px] h-[12px]',
      'flex items-center justify-center',
      'cursor-pointer',
      'transition-opacity duration-200',
      {
        'opacity-30 cursor-not-allowed': disabled,
        'hover:opacity-80': !disabled,
      }
    );

  const textClasses = classNames(
    // Font: 10px/12px weight:500
    'text-[10px] leading-3 font-medium',
    'text-blackinverse-a56',
    'whitespace-nowrap',
    'select-none'
  );

  return (
    <div className={containerClasses} data-testid={dataTestId}>
      {/* Previous button - 12x12px, color: rgba(255,255,255,0.40) */}
      <div
        className={buttonClasses(!hasPrev)}
        onClick={handlePrev}
        data-testid={`${dataTestId}-prev`}
        role="button"
        aria-label="Previous page"
        aria-disabled={!hasPrev}
      >
        <ChevronLeftIcon
          sx={{ width: 12, height: 12, color: 'var(--blackinverse-a56)' }}
        />
      </div>

      {/* Page indicator */}
      <span className={textClasses} data-testid={`${dataTestId}-text`}>
        {currentPage} {t('positions.pageOf')} {totalPages}
      </span>

      {/* Next button */}
      <div
        className={buttonClasses(!hasNext)}
        onClick={handleNext}
        data-testid={`${dataTestId}-next`}
        role="button"
        aria-label="Next page"
        aria-disabled={!hasNext}
      >
        <ChevronRightIcon
          sx={{ width: 12, height: 12, color: 'var(--blackinverse-a56)' }}
        />
      </div>
    </div>
  );
};

PositionsCompactPagination.displayName = 'PositionsCompactPagination';

export default PositionsCompactPagination;
