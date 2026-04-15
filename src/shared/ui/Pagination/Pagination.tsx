'use client';

import React from 'react';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsCount: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  itemsCount,
  onPageChange,
  itemName,
}) => {
  const { t } = useTranslation('common');
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 mt-4 px-4">
      {/* Left: Item count */}
      <span className="text-sm text-gray-400">
        {t('pagination.showing', {
          count: itemsCount,
          total: totalCount,
          itemName: itemName ?? t('pagination.defaultItemName'),
        })}
      </span>

      {/* Center: Navigation controls */}
      <div className="flex items-center gap-2 justify-end">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="secondary"
          size="sm"
        >
          {t('pagination.previous')}
        </Button>
        <span className="text-sm text-black">
          {t('pagination.pageOf', { current: currentPage, total: totalPages })}
        </span>
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          variant="secondary"
          size="sm"
        >
          {t('pagination.next')}
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
