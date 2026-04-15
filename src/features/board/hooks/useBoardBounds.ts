import { useEffect, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useNewsSidebarStore } from '@/stores/newsSidebarStore';

const BOARD_SELECTOR = '.lmx__home__reactflow-wrapper';

export function useBoardBounds() {
  const [bounds, setBounds] = useState<{ left: number; right: number } | null>(
    null
  );

  const { isChatSidebarOpen, chatWidth } = useChatStore();
  const isNavCollapsed = useSidebarStore((s) => s.isCollapsed);
  const isExploreOpen = useNewsSidebarStore((s) => s.isOpen);

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector(BOARD_SELECTOR);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setBounds({ left: rect.left, right: window.innerWidth - rect.right });
    };

    const ro = new ResizeObserver(() => measure());

    // Use requestAnimationFrame to let the DOM update after sidebar state changes
    const raf = requestAnimationFrame(() => {
      measure();
      const el = document.querySelector(BOARD_SELECTOR);
      if (el) ro.observe(el);
    });

    window.addEventListener('resize', measure);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [isChatSidebarOpen, chatWidth, isNavCollapsed, isExploreOpen]);

  return bounds;
}
