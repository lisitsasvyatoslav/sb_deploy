import { Edge, MarkerType, Node } from '@xyflow/react';

/**
 * Types for working with edges
 */
export interface DBEdge {
  id?: number;
  source_id: number;
  target_id: number;
  source_type: string;
  target_type: string;
  edge_type: string;
  meta: Record<string, unknown>;
}

/** Edge shape returned by the NestJS API (camelCase) */
export interface APIEdgeResponse {
  id: number;
  sourceId: number;
  targetId: number;
  sourceType: string;
  targetType: string;
  edgeType: string;
  meta: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

export interface AINodeCardConnection {
  ai_node_id: number;
  card_id: number;
}

/**
 * Creates edges for AI Node from connections with cards
 */
export function createAINodeEdges(aiNodeCards: AINodeCardConnection[]): Edge[] {
  return aiNodeCards.map((connection) => ({
    id: `edge-ai-${connection.ai_node_id}-${connection.card_id}`,
    source: `card-${connection.card_id}`,
    target: `ai-node-${connection.ai_node_id}`,
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'var(--blackinverse-a32)',
    },
    style: {
      stroke: 'var(--blackinverse-a32)',
      strokeWidth: 2,
    },
    data: {
      dbId: `ai-${connection.ai_node_id}-${connection.card_id}`,
      edgeType: 'context',
      meta: {},
    },
  }));
}

/**
 * Converts node ID from DB format to ReactFlow format
 */
function convertNodeId(id: number, type: string): string {
  switch (type) {
    case 'card':
      return `card-${id}`;
    case 'ai_node':
      return `ai-node-${id}`;
    default:
      return `${type}-${id}`;
  }
}

/**
 * Builds a ReactFlow Edge from normalized parameters.
 * Shared by convertEdgeFromDB and convertEdgeFromAPI.
 */
function buildReactFlowEdge(params: {
  id: string;
  source: string;
  target: string;
  sourceHandle: string | null;
  targetHandle: string | null;
  edgeType: string;
  meta: Record<string, unknown>;
  dbId: number | undefined;
}): Edge {
  const isPortEdge =
    params.sourceHandle ||
    params.targetHandle ||
    params.edgeType === 'strategy_ideas';
  const edgeColor = isPortEdge
    ? 'var(--mind-accent)'
    : 'var(--blackinverse-a32)';

  return {
    id: params.id,
    source: params.source,
    target: params.target,
    sourceHandle: params.sourceHandle,
    targetHandle: params.targetHandle,
    type: 'smoothstep',
    markerEnd: isPortEdge
      ? undefined
      : { type: MarkerType.ArrowClosed, color: edgeColor },
    style: {
      stroke: edgeColor,
      strokeWidth: 2,
    },
    data: {
      dbId: params.dbId,
      edgeType: params.edgeType,
      meta: params.meta,
    },
  };
}

/**
 * Converts edge from DB format to ReactFlow format
 */
export function convertEdgeFromDB(edge: DBEdge | Edge): Edge {
  if ('source' in edge && 'target' in edge && !('source_type' in edge)) {
    return edge as Edge;
  }

  const dbEdge = edge as DBEdge;
  const edgeId =
    dbEdge.id != null
      ? `edge-${dbEdge.id}`
      : `edge-${dbEdge.source_id}-${dbEdge.target_id}`;

  return buildReactFlowEdge({
    id: edgeId,
    source: convertNodeId(dbEdge.source_id, dbEdge.source_type),
    target: convertNodeId(dbEdge.target_id, dbEdge.target_type),
    sourceHandle: (dbEdge.meta?.sourceHandle as string) ?? null,
    targetHandle: (dbEdge.meta?.targetHandle as string) ?? null,
    edgeType: dbEdge.edge_type,
    meta: dbEdge.meta,
    dbId: dbEdge.id,
  });
}

/**
 * Converts edge from API format (camelCase) to ReactFlow format
 */
export function convertEdgeFromAPI(edge: APIEdgeResponse): Edge {
  return buildReactFlowEdge({
    id: `edge-${edge.id}`,
    source: convertNodeId(edge.sourceId, edge.sourceType),
    target: convertNodeId(edge.targetId, edge.targetType),
    sourceHandle: (edge.meta?.sourceHandle as string) ?? null,
    targetHandle: (edge.meta?.targetHandle as string) ?? null,
    edgeType: edge.edgeType,
    meta: edge.meta,
    dbId: edge.id,
  });
}

/**
 * Converts array of edges from DB format to ReactFlow format
 */
export function convertEdgesFromDB(edges: (DBEdge | Edge)[]): Edge[] {
  if (!edges || edges.length === 0) {
    return [];
  }
  return edges.map(convertEdgeFromDB);
}

/**
 * Removes duplicates of edges (same source, target, sourceHandle, targetHandle).
 * Keeps edge with the highest dbId (last created).
 */
export function deduplicateEdges(edges: Edge[]): Edge[] {
  const byKey = new Map<string, Edge>();
  for (const edge of edges) {
    const key = `${edge.source}-${edge.target}-${edge.sourceHandle ?? ''}-${edge.targetHandle ?? ''}`;
    const existing = byKey.get(key);
    const existingDbId = (existing?.data?.dbId as number) ?? 0;
    const edgeDbId = (edge.data?.dbId as number) ?? 0;
    if (!existing || edgeDbId > existingDbId) {
      byKey.set(key, edge);
    }
  }
  return Array.from(byKey.values());
}

/**
 * Filters edges, leaving only those where both nodes (source and target) exist
 */
export function filterValidEdges(edges: Edge[], nodes: Node[]): Edge[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  return edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
  );
}

/**
 * Combines edges from DB and AI Node into a single array
 */
export function combineEdges(
  dbEdges: (DBEdge | Edge)[],
  aiNodeEdges: Edge[]
): Edge[] {
  const convertedDBEdges = convertEdgesFromDB(dbEdges || []);
  return [...convertedDBEdges, ...aiNodeEdges];
}

/**
 * Creates a new edge in ReactFlow format from API data
 */
export function createEdgeFromAPIData(edgeData: {
  source_id: number;
  target_id: number;
  source_type: string;
  target_type: string;
  edge_type: string;
  meta: Record<string, unknown>;
  id?: number;
}): Edge {
  const sourceId =
    edgeData.source_type === 'card'
      ? `card-${edgeData.source_id}`
      : `ai-node-${edgeData.source_id}`;

  const targetId =
    edgeData.target_type === 'card'
      ? `card-${edgeData.target_id}`
      : `ai-node-${edgeData.target_id}`;

  return {
    id: `edge-${edgeData.source_id}-${edgeData.target_id}`,
    source: sourceId,
    target: targetId,
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'var(--blackinverse-a32)',
    },
    style: {
      stroke: 'var(--blackinverse-a32)',
      strokeWidth: 2,
    },
    data: {
      dbId: edgeData.id,
      edgeType: edgeData.edge_type,
      meta: edgeData.meta,
    },
  };
}

/**
 * Checks if a card is connected to an AI Node
 */
export function isCardConnected(cardId: number, edges: Edge[]): boolean {
  return edges.some(
    (edge) =>
      edge.source === `card-${cardId}` && edge.target.startsWith('ai-node-')
  );
}

/**
 * Checks if a specific handle of a card is connected
 */
export function isHandleConnected(
  cardId: number,
  position: 'left' | 'right',
  edges: Edge[]
): boolean {
  if (position === 'left') {
    // Left handle - target (cards are connected to the card)
    return edges.some(
      (edge) =>
        edge.target === `card-${cardId}` && edge.source.startsWith('ai-node-')
    );
  } else {
    // Right handle - source (cards are connected to the card)
    return edges.some(
      (edge) =>
        edge.source === `card-${cardId}` && edge.target.startsWith('ai-node-')
    );
  }
}
