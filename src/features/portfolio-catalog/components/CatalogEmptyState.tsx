'use client';

import React from 'react';
import Button from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';

interface CatalogEmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  variant?: 'default' | 'accent';
}

/**
 * Empty state placeholder for portfolio catalog sections.
 *
 * - `default` — neutral border + background (portfolios list)
 * - `accent` — purple accent border + dot-grid background (accounts tree)
 */
const CatalogEmptyState: React.FC<CatalogEmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}) => {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center rounded-radius-4 py-spacing-32',
        variant === 'accent'
          ? 'border border-mind-accent/50 bg-[radial-gradient(circle,rgba(138,124,248,0.15)_1px,transparent_1px)] bg-[length:12px_12px]'
          : 'border border-blackinverse-a8 bg-blackinverse-a6'
      )}
    >
      <div className="flex flex-col items-center gap-spacing-20 py-spacing-8 max-w-[480px] /* no spacing token for 480 */">
        <div className="flex flex-col items-center gap-spacing-8 px-spacing-24">
          <span className="text-16 leading-24 font-semibold tracking-tight-2 text-blackinverse-a100">
            {title}
          </span>
          <span className="text-10 leading-12 font-medium tracking-tight-1 text-blackinverse-a56 text-center">
            {description}
          </span>
        </div>
        <Button variant="primary" size="xs" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    </div>
  );
};

export default CatalogEmptyState;
