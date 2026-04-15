'use client';

import React, {
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import classNames from 'classnames';
import Button from '@/shared/ui/Button/Button';
import { Icon } from '@/shared/ui/Icon';
import type { IconVariant } from '@/shared/ui/Icon/Icon.types';

export type DialogIconType = 'add' | 'edit' | 'onBoard' | 'delete';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon?: DialogIconType;
  content?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

const ICON_CONFIG: Record<DialogIconType, { bg: string; icon: IconVariant }> = {
  add: { bg: 'bg-mind-accent', icon: 'plus' },
  edit: { bg: 'bg-mind-accent', icon: 'editBold' },
  onBoard: { bg: 'bg-blackinverse-a12', icon: 'tick' },
  delete: { bg: 'bg-status-negative', icon: 'trashBold' },
} as const;

/**
 * Dialog — confirmation dialog with icon, title, and action buttons
 *
 * Figma node: 55089:9415
 */
const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  title,
  subtitle,
  icon,
  content,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const dialogId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    onCancel?.();
  }, [onOpenChange, onCancel]);

  const handleConfirm = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleClose]);

  const iconConfig = icon ? ICON_CONFIG[icon] : null;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center p-spacing-16"
          style={{ zIndex: 1300 }}
          data-dialog-id={dialogId}
        >
          <motion.div
            className="absolute inset-0 bg-overlay-base backdrop-blur-effects-modal"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`dialog-title-${dialogId}`}
            className={classNames(
              'relative flex flex-col w-full max-w-[424px]',
              'bg-surfacegray-high border border-stroke-a4',
              'rounded-radius-16 shadow-effects-modal backdrop-blur-effects-modal'
            )}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header — 44px: close button */}
            <div className="flex items-center justify-end px-spacing-24 py-spacing-6">
              <button
                type="button"
                onClick={handleClose}
                aria-label="Закрыть диалог"
                data-testid="dialog-close"
                className="flex items-center justify-center w-spacing-32 h-spacing-32 rounded-radius-8 text-blackinverse-a56 hover:bg-blackinverse-a8 hover:text-blackinverse-a88 active:bg-blackinverse-a12 transition-colors"
              >
                <Icon variant="close" size={20} />
              </button>
            </div>

            {/* Middle — icon + title + subtitle + content */}
            <div className="flex flex-col px-spacing-24 pb-spacing-24 gap-spacing-24">
              {iconConfig && (
                <div
                  className={classNames(
                    'flex items-center justify-center w-spacing-64 h-spacing-64 rounded-radius-16',
                    iconConfig.bg
                  )}
                >
                  <Icon
                    variant={iconConfig.icon}
                    size={32}
                    className="text-white"
                  />
                </div>
              )}

              <div className="flex flex-col gap-spacing-8">
                <p
                  id={`dialog-title-${dialogId}`}
                  className="text-20 font-semibold leading-32 text-blackinverse-a100"
                >
                  {title}
                </p>
                {subtitle && (
                  <p className="text-14 font-regular leading-20 text-blackinverse-a56">
                    {subtitle}
                  </p>
                )}
              </div>

              {content && <div>{content}</div>}
            </div>

            {/* Footer — 88px: cancel + confirm */}
            <div className="flex gap-spacing-8 px-spacing-24 py-spacing-24">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={handleClose}
                data-testid="dialog-cancel"
              >
                {cancelLabel}
              </Button>
              <Button
                variant={icon === 'delete' ? 'negative' : 'accent'}
                size="md"
                className="flex-1"
                onClick={handleConfirm}
                loading={loading}
                data-testid="dialog-confirm"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Dialog;
