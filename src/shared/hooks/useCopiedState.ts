import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Returns [isCopied, markCopied] — call markCopied() after a successful
 * clipboard write; isCopied will be true for `durationMs` then revert.
 */
export function useCopiedState(durationMs = 2000): [boolean, () => void] {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const markCopied = useCallback(() => {
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
      timeoutRef.current = null;
    }, durationMs);
  }, [durationMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return [copied, markCopied];
}
