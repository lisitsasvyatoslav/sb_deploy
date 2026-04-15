import { Connection, Edge, Node } from '@xyflow/react';
import { PortConfig, PortDataType } from './types';

/** Checks if two data types are compatible for connection */
function areTypesCompatible(
  source: PortDataType,
  target: PortDataType
): boolean {
  if (source === 'any' || target === 'any') return true;
  return source === target;
}

/**
 * Creates a connection validator function for React Flow's `isValidConnection` prop.
 *
 * Rules:
 * 1. No self-connections
 * 2. If BOTH nodes have no ports (legacy) → deny (connections only allowed for strategy/widget cards)
 * 3. If only ONE node has ports and the other is legacy → deny
 * 4. If both have ports → validate dataType compatibility
 */
export function createConnectionValidator(
  getNodes: () => Node[]
): (connection: Connection | Edge) => boolean {
  return (connection: Connection | Edge): boolean => {
    const { source, target, sourceHandle, targetHandle } = connection;

    // 1. No self-connections
    if (source === target) return false;

    const nodes = getNodes();
    const sourceNode = nodes.find((n) => n.id === source);
    const targetNode = nodes.find((n) => n.id === target);

    if (!sourceNode || !targetNode) return false;

    const sourcePorts = sourceNode.data?.resolvedPorts as
      | PortConfig
      | undefined;
    const targetPorts = targetNode.data?.resolvedPorts as
      | PortConfig
      | undefined;

    const sourceHasPorts =
      sourcePorts &&
      (sourcePorts.outputs.length > 0 || sourcePorts.inputs.length > 0);
    const targetHasPorts =
      targetPorts &&
      (targetPorts.outputs.length > 0 || targetPorts.inputs.length > 0);

    // 2. Both legacy (no ports) → deny
    if (!sourceHasPorts && !targetHasPorts) return false;

    // 3. One side is legacy → deny
    if (!sourceHasPorts || !targetHasPorts) return false;

    // 4. Both have ports → validate data types
    const sourcePort = sourcePorts!.outputs.find((p) => p.id === sourceHandle);
    const targetPort = targetPorts!.inputs.find((p) => p.id === targetHandle);

    if (!sourcePort || !targetPort) return false;

    return areTypesCompatible(sourcePort.dataType, targetPort.dataType);
  };
}
