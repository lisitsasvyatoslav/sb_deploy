import { useCallback, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { ModalFrame } from './ModalFrame';
import type { ModalProps } from './Modal.types';

// Module-level registry of open modals. Updated synchronously on open/close,
// unaffected by AnimatePresence exit animations that keep DOM overlays alive.
const openModals = new Map<string, number>();

function getTopModalZIndex(): number {
  let max = -1;
  openModals.forEach((z) => {
    if (z > max) max = z;
  });
  return max;
}

export function Modal({
  open,
  onOpenChange,
  children,
  className = '',
  maxWidth = 'lg',
  zIndex = 1300,
  showCloseButton = true,
  floatingCloseButton,
  expandable,
  leftContent,
  editorConfig,
  editableTitle,
  colorWidget,
  onAskAI,
  onAskAIWithFile,
  expandedBounds,
  onExpandToOverlay,
  expanded,
  onExpandedChange,
  header,
  container,
  fullScreen,
}: ModalProps) {
  const modalId = useId();
  const [isMounted, setIsMounted] = useState(open);
  const handleClose = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (open) setIsMounted(true);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    openModals.set(modalId, zIndex);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;

      // Only the topmost modal should handle ESC
      const topZ = getTopModalZIndex();
      if (topZ > zIndex) return;

      e.stopImmediatePropagation();
      onOpenChange(false);
    };

    document.addEventListener('keydown', handleEscape);

    // Scroll lock: off in expanded mode (sidebar/chat must remain interactive), on in modal mode
    if (expanded) {
      document.body.style.overflow = '';
    } else {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      openModals.delete(modalId);
      document.removeEventListener('keydown', handleEscape);
      if (openModals.size === 0) {
        document.body.style.overflow = '';
      }
    };
  }, [open, onOpenChange, zIndex, modalId, expanded]);

  if (!isMounted) return null;

  return createPortal(
    <AnimatePresence
      onExitComplete={() => {
        setIsMounted(false);
        if (openModals.size === 0) {
          document.body.style.overflow = '';
        }
      }}
    >
      {open && (
        <ModalFrame
          className={className}
          maxWidth={maxWidth}
          fullScreen={fullScreen}
          zIndex={zIndex}
          modalId={modalId}
          showCloseButton={showCloseButton}
          floatingCloseButton={floatingCloseButton}
          expandable={expandable}
          leftContent={leftContent}
          editableTitle={editableTitle}
          colorWidget={colorWidget}
          onAskAI={onAskAI}
          onAskAIWithFile={onAskAIWithFile}
          onClose={handleClose}
          editorConfig={editorConfig}
          expandedBounds={expandedBounds}
          onExpandToOverlay={onExpandToOverlay}
          expanded={expanded}
          onExpandedChange={onExpandedChange}
          header={header}
        >
          {children}
        </ModalFrame>
      )}
    </AnimatePresence>,
    container ?? document.body
  );
}
