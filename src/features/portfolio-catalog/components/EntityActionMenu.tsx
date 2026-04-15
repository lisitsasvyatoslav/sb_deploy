'use client';

import React from 'react';
import { DROPDOWN_CONTAINER_CLASSES } from '@/shared/ui/Dropdown';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';
import { cn } from '@/shared/utils/cn';

interface EntityActionMenuContentProps {
  onEdit?: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
  showEditHide?: boolean;
}

/**
 * Reusable dropdown menu content for portfolio/account/broker action menus.
 *
 * Edit is enabled when onEdit is provided, disabled otherwise.
 * Hide is always disabled (to be implemented later).
 * Delete is optional via `showDelete` (default true).
 */
const EntityActionMenuContent: React.FC<EntityActionMenuContentProps> = ({
  onEdit,
  onDelete,
  showDelete = true,
  showEditHide = true,
}) => {
  const { t } = useTranslation('common');

  return (
    <div
      className={cn(
        DROPDOWN_CONTAINER_CLASSES,
        'py-spacing-6 min-w-[160px] /* no spacing token for 160 */'
      )}
    >
      {showEditHide && (
        <>
          <button
            type="button"
            disabled={!onEdit}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="flex items-center gap-spacing-8 w-full px-spacing-6 min-h-spacing-32 text-left hover:bg-blackinverse-a4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon
              variant="editMicro"
              size={16}
              className={cn(
                'ml-spacing-8',
                onEdit ? 'text-blackinverse-a100' : 'text-blackinverse-a56'
              )}
            />
            <span
              className={cn(
                'text-14 leading-20 font-normal tracking-tight-1',
                onEdit ? 'text-blackinverse-a100' : 'text-blackinverse-a56'
              )}
            >
              {t('portfolioCatalog.menu.edit', 'Configure')}
            </span>
          </button>
        </>
      )}
      {showDelete && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="flex items-center gap-spacing-8 w-full px-spacing-6 min-h-spacing-32 text-left hover:bg-blackinverse-a4 transition-colors"
        >
          <Icon
            variant="trash"
            size={16}
            className="text-status-negative ml-spacing-8"
          />
          <span className="text-14 leading-20 font-normal tracking-tight-1 text-status-negative">
            {t('portfolioCatalog.menu.delete', 'Delete')}
          </span>
        </button>
      )}
    </div>
  );
};

export default EntityActionMenuContent;
