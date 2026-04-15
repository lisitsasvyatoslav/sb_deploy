import { RefObject, useEffect } from 'react';

/**
 * Hook to detect clicks outside of a specified element
 * Useful for closing dropdowns, modals, popovers, etc.
 *
 * @param ref - React ref to the element
 * @param handler - Callback function to execute when click outside is detected
 * @param active - Whether the hook is active (default: true)
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setIsOpen(false), isOpen);
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  active = true
): void {
  useEffect(() => {
    if (!active) return;

    const listener = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // Do nothing if clicking ref's element or its descendants
      if (!ref.current || ref.current.contains(target)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, active]);
}
