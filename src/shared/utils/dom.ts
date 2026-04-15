import React from 'react';

// Checks if an element is an editable field (input, textarea, contenteditable).
// Used to prevent keyboard/mouse event handlers from interfering with user typing.
export const isEditableElement = (element: HTMLElement | null): boolean => {
  if (!element) return false;
  return Boolean(element.closest('input, textarea, [contenteditable="true"]'));
};

/**
 * Stop all event propagation including immediate propagation.
 * Necessary because ReactFlow listens on both capture and bubble phases.
 * Use for buttons where we want to block ReactFlow selection completely.
 */
export const stopAllPropagation = (
  e: React.MouseEvent | React.PointerEvent
) => {
  e.stopPropagation();
  e.preventDefault();
  e.nativeEvent.stopImmediatePropagation();
};
