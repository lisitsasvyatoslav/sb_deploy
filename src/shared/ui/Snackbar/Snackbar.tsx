'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils/cn';
import { Icon } from '@/shared/ui/Icon';
import type { IconVariant } from '@/shared/ui/Icon/Icon.types';

/**
 * Snackbar — Snackbar
 *
 * Figma node: 59206:25398
 */

export type SnackbarType = 'success' | 'danger';

export interface SnackbarProps {
  /** Variant — determines colors and icon */
  type?: SnackbarType;
  /** Message text */
  message: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Action button click handler */
  onAction?: () => void;
  /** Auto-hide duration in ms (0 = no auto-hide). Default: 0 */
  autoHideDuration?: number;
  /** Called when snackbar should close */
  onClose?: () => void;
  /** Show icon. Default: true */
  showIcon?: boolean;
  /** Render in fixed position via portal (bottom center, 40px from edge). Default: true */
  positioned?: boolean;
  /** Additional className for the snackbar element */
  className?: string;
}

const TYPE_CONFIG: Record<
  SnackbarType,
  {
    icon: IconVariant;
    container: string;
    text: string;
    actionText: string;
  }
> = {
  success: {
    icon: 'tickCircle',
    container:
      'bg-surfacewhite-medium shadow-effects-panel backdrop-blur-effects-panel',
    text: 'text-blackinverse-a100',
    actionText: 'text-blackinverse-a56',
  },
  danger: {
    icon: 'exclamationMarkCircle',
    container:
      'bg-colors-status_negative_base shadow-effects-panel backdrop-blur-effects-panel',
    text: 'text-texticon-fixed_white',
    actionText: 'text-texticon-fixed_white',
  },
};

const Snackbar: React.FC<SnackbarProps> = ({
  type = 'success',
  message,
  actionLabel,
  onAction,
  autoHideDuration = 0,
  onClose,
  showIcon = true,
  positioned = true,
  className,
}) => {
  useEffect(() => {
    if (autoHideDuration > 0 && onClose) {
      const timer = setTimeout(onClose, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onClose]);

  const config = TYPE_CONFIG[type];

  const snackbar = (
    <div
      role="alert"
      className={cn(
        'inline-flex items-center rounded-radius-4',
        config.container,
        className
      )}
    >
      {/* Snackbar Message */}
      <div className="flex items-center rounded-l-radius-12 py-spacing-4 px-spacing-12">
        {showIcon && (
          <Icon variant={config.icon} size={20} className={config.text} />
        )}
        <div className="flex gap-spacing-4 py-spacing-6 px-spacing-8">
          <span
            className={cn(
              'text-14 font-regular leading-20 tracking-tight-1',
              config.text
            )}
          >
            {message}
          </span>
        </div>
      </div>

      {/* Action Button */}
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className={cn(
            'flex items-center justify-center gap-spacing-6 py-spacing-10 px-spacing-14',
            'text-14 font-semibold leading-20 tracking-tight-1',
            'bg-transparent cursor-pointer transition-opacity hover:opacity-stateHovered',
            config.actionText
          )}
        >
          <span className="px-spacing-2">{actionLabel}</span>
        </button>
      )}
    </div>
  );

  if (!positioned) return snackbar;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed bottom-spacing-40 left-1/2 -translate-x-1/2 z-50">
      {snackbar}
    </div>,
    document.body
  );
};

export default Snackbar;
