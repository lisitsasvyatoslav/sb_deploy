import { Card } from '@/types';
import { PortConfig, PortDefinition } from './types';
import { getBasePortConfig } from './portRegistry';

/** Card types that support the port system */
const PORT_ENABLED_TYPES = new Set(['widget', 'strategy', 'trading_idea']);

/** Returns true if this card type supports named ports */
export function isPortEnabledCardType(cardType: string): boolean {
  return PORT_ENABLED_TYPES.has(cardType);
}

/**
 * Resolves the final PortConfig for a card:
 * 1. Starts with base config from the registry (by card.type + meta.widgetType)
 * 2. Applies meta.ports overrides (extraInputs, extraOutputs, removedPortIds)
 */
export function resolvePortConfig(card: Card): PortConfig {
  if (!isPortEnabledCardType(card.type)) {
    return { inputs: [], outputs: [] };
  }

  const base = getBasePortConfig(card.type, card.meta?.widgetType);

  const metaPorts = card.meta?.ports as
    | {
        extraInputs?: PortDefinition[];
        extraOutputs?: PortDefinition[];
        removedPortIds?: string[];
      }
    | undefined;

  if (!metaPorts) {
    return base;
  }

  const removedIds = new Set(metaPorts.removedPortIds ?? []);

  const inputs = [
    ...base.inputs.filter((p) => !removedIds.has(p.id)),
    ...(metaPorts.extraInputs ?? []),
  ];

  const outputs = [
    ...base.outputs.filter((p) => !removedIds.has(p.id)),
    ...(metaPorts.extraOutputs ?? []),
  ];

  return { inputs, outputs };
}

/**
 * For strategy cards: ensures there is always one unconnected `any` input.
 * When all `any` inputs are connected, appends a new empty one.
 *
 * @param ports      - resolved PortConfig (from resolvePortConfig)
 * @param cardType   - card type string
 * @param connectedHandleIds - set of handle IDs that have edges attached
 */
export function expandDynamicInputs(
  ports: PortConfig,
  cardType: string,
  connectedHandleIds: Set<string>
): PortConfig {
  if (cardType !== 'strategy') return ports;

  const anyInputs = ports.inputs.filter((p) => p.dataType === 'any');
  const allAnyConnected =
    anyInputs.length > 0 &&
    anyInputs.every((p) => connectedHandleIds.has(p.id));

  if (!allAnyConnected) return ports;

  // Find next index: max existing index + 1
  const maxIndex = anyInputs.reduce((max, p) => {
    const idx = parseInt(p.id.split('_').pop() ?? '0', 10);
    return Math.max(max, idx);
  }, -1);

  const newPort: PortDefinition = {
    id: `input_any_${maxIndex + 1}`,
    label: '',
    direction: 'input',
    dataType: 'any',
  };

  return {
    ...ports,
    inputs: [...ports.inputs, newPort],
  };
}
