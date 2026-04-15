/**
 * useCenterOnCard - Hook for centering viewport on a specific card
 *
 * Used when navigating to a board with cardId in URL (e.g., from SSE notification)
 * Automatically centers the viewport on the specified card and removes cardId from URL
 */

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Node, ReactFlowInstance } from '@xyflow/react';

interface UseCenterOnCardProps {
  cardId?: number;
  reactFlowInstance: ReactFlowInstance | null;
  nodes: Node[];
  isLoading: boolean;
  isLoaded: boolean;
}

export const useCenterOnCard = ({
  cardId,
  reactFlowInstance,
  nodes,
  isLoading,
  isLoaded,
}: UseCenterOnCardProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lastCardIdRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset lastCardIdRef when cardId is cleared from URL
    if (!cardId) {
      lastCardIdRef.current = undefined;
      return;
    }

    if (!reactFlowInstance) {
      return;
    }

    // Wait until data is fully loaded (not loading AND successfully loaded)
    if (isLoading || !isLoaded) {
      return;
    }

    // Skip if this is the same cardId we just processed
    if (lastCardIdRef.current === cardId) {
      return;
    }

    // Find the node with the specified card ID
    const targetNode = nodes.find((node) => node.id === `card-${cardId}`);

    if (targetNode) {
      // Mark as processed immediately to prevent duplicate attempts
      lastCardIdRef.current = cardId;

      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Delay centering to ensure it happens after other viewport operations
      timerRef.current = setTimeout(() => {
        reactFlowInstance.fitView({
          nodes: [targetNode],
          duration: 800,
          padding: 0.5,
          maxZoom: 1,
        });

        // Remove cardId from URL after centering completes
        if (searchParams.has('cardId')) {
          const newParams = new URLSearchParams(searchParams.toString());
          newParams.delete('cardId');
          const queryString = newParams.toString();
          router.replace(
            window.location.pathname + (queryString ? `?${queryString}` : ''),
            { scroll: false }
          );
        }

        timerRef.current = null;
      }, 300);
    }
  }, [
    cardId,
    reactFlowInstance,
    nodes,
    isLoading,
    isLoaded,
    searchParams,
    router,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
};
