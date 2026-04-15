'use client';

import React, { useCallback, useState } from 'react';
import { DropdownBase } from '@/shared/ui/Dropdown/DropdownBase';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';
import { showErrorToast } from '@/shared/utils/toast';
import { cn } from '@/shared/utils/cn';
import { useDeletePortfolioMutation } from '../queries';
import { formatCurrency, formatPnl } from '../utils/formatCurrency';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import EntityActionMenuContent from './EntityActionMenu';

interface PortfolioCardProps {
  id: number;
  name: string;
  totalValue: number | null;
  unrealizedPnl: number | null;
  positionCount?: number;
  currency?: string;
  isDefault?: boolean;
  onClick?: () => void;
  /** Configure instruments / fill rule (portfolio catalog modal) */
  onEdit?: () => void;
}

/**
 * PortfolioCard — single portfolio row in catalog list
 *
 * Figma node: 3664:32401
 */
const PortfolioCard: React.FC<PortfolioCardProps> = ({
  id,
  name,
  totalValue,
  unrealizedPnl,
  positionCount,
  currency,
  isDefault = false,
  onClick,
  onEdit,
}) => {
  const { t } = useTranslation('common');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteMutation = useDeletePortfolioMutation();

  const pnlColor =
    (unrealizedPnl ?? 0) >= 0 ? 'text-status-success' : 'text-status-negative';

  const handleDelete = useCallback(async () => {
    try {
      await deleteMutation.mutateAsync(id);
      setShowDeleteDialog(false);
    } catch {
      showErrorToast(
        t(
          'portfolioCatalog.deletePortfolio.error',
          'Failed to delete portfolio'
        )
      );
    }
  }, [deleteMutation, id, t]);

  const menuContent = (
    <EntityActionMenuContent
      showDelete={!isDefault}
      onEdit={
        onEdit
          ? () => {
              setMenuOpen(false);
              onEdit();
            }
          : undefined
      }
      onDelete={() => {
        setMenuOpen(false);
        setShowDeleteDialog(true);
      }}
    />
  );

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        className="group flex items-center gap-[9px] /* no token for 9 */ p-spacing-12 border-b border-blackinverse-a4 rounded-radius-2 cursor-pointer hover:bg-blackinverse-a2 transition-colors"
        data-testid="portfolio-card"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
      >
        {/* Content */}
        <div className="flex flex-col gap-spacing-4 flex-1">
          {/* Value row */}
          <div className="flex items-center gap-spacing-8">
            <span className="text-14 leading-20 font-semibold tracking-tight-1 text-blackinverse-a100">
              {formatCurrency(totalValue ?? 0, currency)}
            </span>
            <span
              className={cn(
                'text-12 leading-16 font-normal tracking-tight-1',
                pnlColor
              )}
            >
              {formatPnl(unrealizedPnl ?? 0, currency)}
            </span>
          </div>
          {/* Name row */}
          <span className="text-8 leading-12 font-semibold uppercase tracking-tight-1 text-blackinverse-a32">
            {name}
            {positionCount != null &&
              ` (${t('portfolioCatalog.assetsCount', { count: positionCount })})`}
          </span>
        </div>

        {/* Menu button — visible on hover only */}
        <DropdownBase
          open={menuOpen}
          onOpenChange={setMenuOpen}
          trigger={({ onClick: toggleMenu, triggerRef }) => (
            <button
              ref={triggerRef}
              type="button"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-spacing-4 rounded-radius-4 hover:bg-blackinverse-a8"
              data-testid="portfolio-card-menu"
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
              aria-label="Portfolio menu"
            >
              <Icon
                variant="more"
                size={16}
                className="text-blackinverse-a56"
              />
            </button>
          )}
          menu={menuContent}
          placement="bottom-right"
          offset={4}
        />
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        title={t('portfolioCatalog.deletePortfolio.title', 'Delete portfolio')}
        description={t('portfolioCatalog.deletePortfolio.body', {
          defaultValue:
            'Are you sure you want to delete "{{name}}"? This action cannot be undone.',
          name,
        })}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
};

export default PortfolioCard;
