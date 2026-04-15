import { boardQueryKeys } from '@/features/board/queries';
import { edgeApi } from '@/services/api/edges';
import { useBoardStore } from '@/stores/boardStore';
import { logger } from '@/shared/utils/logger';
import { useTranslation } from '@/shared/i18n/client';
import { showErrorToast } from '@/shared/utils/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Connection, MarkerType, Node, addEdge } from '@xyflow/react';

interface UseBoardEdgeConnectConfig {
  nodes: Node[];
}

export const useBoardEdgeConnect = ({ nodes }: UseBoardEdgeConnectConfig) => {
  const queryClient = useQueryClient();
  const { setEdges } = useBoardStore();
  const { t } = useTranslation('board');

  const onConnect = useCallback(
    async (params: Connection) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      if (!sourceNode || !targetNode) {
        logger.error('useBoardHandlers', 'onConnect: nodes not found', {
          source: params.source,
          target: params.target,
        });
        return;
      }

      const handlesMeta = {
        ...(params.sourceHandle ? { sourceHandle: params.sourceHandle } : {}),
        ...(params.targetHandle ? { targetHandle: params.targetHandle } : {}),
      };

      const newEdge = {
        ...params,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'var(--blackinverse-a32)',
        },
        style: {
          strokeWidth: 2,
          stroke: 'var(--blackinverse-a32)',
        },
        data: { meta: handlesMeta },
      };

      // Optimistic UI update
      setEdges((eds) => addEdge(newEdge, eds));

      // Persist to API
      const sourceCardId = parseInt(
        (params.source ?? '').replace('card-', ''),
        10
      );
      const targetCardId = parseInt(
        (params.target ?? '').replace('card-', ''),
        10
      );

      try {
        await edgeApi.createEdge({
          sourceCardId,
          targetCardId,
          edgeType: 'port',
          meta: handlesMeta,
        });
        // Refetch edges to get server-generated IDs
        await queryClient.invalidateQueries({
          queryKey: boardQueryKeys.edges(),
        });
      } catch (error) {
        // Rollback optimistic update (match handles to avoid removing other port-based edges)
        setEdges((eds) =>
          eds.filter(
            (e) =>
              e.source !== params.source ||
              e.target !== params.target ||
              (e.sourceHandle ?? null) !== (params.sourceHandle ?? null) ||
              (e.targetHandle ?? null) !== (params.targetHandle ?? null)
          )
        );
        showErrorToast(t('toast.edgeCreateError'));
        logger.error('useBoardHandlers', 'onConnect: API error', error);
      }
    },
    [setEdges, nodes, queryClient, t]
  );

  return { onConnect };
};
