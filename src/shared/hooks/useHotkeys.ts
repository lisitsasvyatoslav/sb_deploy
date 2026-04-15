import { useCallback, useEffect } from 'react';

export interface HotkeyBinding {
  key: string;
  handler: () => void;
  enabled?: boolean;
}

export const useHotkeys = (bindings: HotkeyBinding[]) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      )
        return;

      const hasOpenDialog =
        document.querySelector('[role="dialog"]') !== null ||
        document.querySelector('.MuiDialog-root') !== null;
      if (hasOpenDialog) return;

      const pressedKey = event.key.toLowerCase();
      for (const binding of bindings) {
        if (binding.enabled === false) continue;
        if (pressedKey === binding.key.toLowerCase()) {
          event.preventDefault();
          binding.handler();
          return;
        }
      }
    },
    [bindings]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
