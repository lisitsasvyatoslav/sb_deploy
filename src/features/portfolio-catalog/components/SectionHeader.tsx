'use client';

import React from 'react';
import Button from '@/shared/ui/Button';

interface SectionHeaderProps {
  title: string;
  onAction?: () => void;
  actionLabel?: string;
  actionAriaLabel?: string;
}

/**
 * SectionHeader — reusable header for catalog sections (Портфели, Счета)
 *
 * Figma node: 3664:32397 / 3664:33912
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  onAction,
  actionLabel,
  actionAriaLabel,
}) => (
  <div className="flex items-center justify-between py-[10px] pr-2">
    <h2 className="text-20 leading-[1.2em] font-semibold tracking-tight-2 text-blackinverse-a100">
      {title}
    </h2>
    <div className="group/header flex items-center">
      {actionLabel && (
        <span className="text-[8px] leading-12 font-semibold uppercase tracking-tight-1 text-blackinverse-a32 opacity-0 group-hover/header:opacity-100 transition-opacity">
          {actionLabel}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        icon="plus"
        onClick={onAction}
        aria-label={actionAriaLabel}
      />
    </div>
  </div>
);

export default SectionHeader;
