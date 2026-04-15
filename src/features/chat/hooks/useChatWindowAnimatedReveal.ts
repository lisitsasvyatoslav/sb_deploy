import { useEffect, useState } from 'react';
import { Message } from '@/types';

interface UseChatWindowAnimatedRevealParams {
  animatedReveal: boolean;
  messages: Message[];
}

interface UseChatWindowAnimatedRevealReturn {
  visibleMessageIndices: Set<number>;
}

export function useChatWindowAnimatedReveal({
  animatedReveal,
  messages,
}: UseChatWindowAnimatedRevealParams): UseChatWindowAnimatedRevealReturn {
  const [visibleMessageIndices, setVisibleMessageIndices] = useState<
    Set<number>
  >(new Set());

  useEffect(() => {
    if (!animatedReveal || messages.length === 0) {
      if (!animatedReveal) {
        setVisibleMessageIndices(new Set(messages.map((_, i) => i)));
      }
      return;
    }

    const timeoutIds: ReturnType<typeof setTimeout>[] = [];
    let isMounted = true;
    let currentIndex = 0;
    const indicesSet = new Set<number>();

    const showNextMessage = () => {
      if (!isMounted) return;
      if (currentIndex < messages.length) {
        indicesSet.add(currentIndex);
        setVisibleMessageIndices(new Set(indicesSet));
        currentIndex++;

        const delay =
          currentIndex > 0 && messages[currentIndex - 1]?.role === 'user'
            ? 800
            : 1200;

        if (currentIndex < messages.length) {
          const timeoutId = setTimeout(showNextMessage, delay);
          timeoutIds.push(timeoutId);
        }
      }
    };

    setVisibleMessageIndices(new Set());
    const initialTimeoutId = setTimeout(showNextMessage, 300);
    timeoutIds.push(initialTimeoutId);

    return () => {
      isMounted = false;
      timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, [animatedReveal, messages]);

  return { visibleMessageIndices };
}
