'use client';

import React from 'react';
import classNames from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';

export interface OverlayProps {
  /** Whether the overlay is visible */
  open: boolean;
  /** Called when the overlay is clicked */
  onClick?: () => void;
  /** Z-index class override. Default: z-[1200] */
  zClassName?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Overlay — animated backdrop for modals, drawers and dialogs.
 *
 * Uses overlay-base + backdrop-blur-effects-modal tokens (theme-aware).
 * Renders via AnimatePresence for smooth fade-in/out.
 *
 * @example
 * <Overlay open={isOpen} onClick={close} />
 */
const Overlay: React.FC<OverlayProps> = ({
  open,
  onClick,
  zClassName = 'z-[1200]',
  className,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={classNames(
            'fixed inset-0',
            'bg-overlay-base backdrop-blur-effects-modal',
            zClassName,
            className
          )}
          onClick={onClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        />
      )}
    </AnimatePresence>
  );
};

export default Overlay;
