import { PortConfig, PortDataType, PortDefinition } from './types';
import { WidgetType } from '@/types/board';

/* palette-color: from tokens */
export const PORT_COLORS: Record<PortDataType, string> = {
  ticker: '#3B82F6', // blue
  signal: '#F59E0B', // amber
  price: '#10B981', // emerald
  direction: '#8B5CF6', // violet
  timeframe: '#EC4899', // pink
  any: '#6B7280', // gray
};

/** Returns the color for a port (explicit override or palette fallback) */
export function getPortColor(port: PortDefinition): string {
  return port.color ?? PORT_COLORS[port.dataType];
}

// ─── Helper to build PortDefinition ──────────────────────────────

function makePort(
  direction: 'input' | 'output',
  dataType: PortDataType,
  label: string,
  index: number
): PortDefinition {
  return {
    id: `${direction}_${dataType}_${index}`,
    label,
    direction,
    dataType,
  };
}

// ─── Widget port configs by widgetType ───────────────────────────

const WIDGET_PORT_CONFIGS: Record<string, PortConfig> = {
  portfolio_chart: {
    inputs: [
      makePort('input', 'ticker', 'ports.ticker', 0),
      makePort('input', 'timeframe', 'ports.period', 0),
    ],
    outputs: [makePort('output', 'price', 'ports.price', 0)],
  },
  positions_table: {
    inputs: [makePort('input', 'ticker', 'ports.ticker', 0)],
    outputs: [
      makePort('output', 'ticker', 'ports.ticker', 0),
      makePort('output', 'direction', 'ports.direction', 0),
    ],
  },
  ticker_adder: {
    inputs: [],
    outputs: [makePort('output', 'ticker', '', 0)],
  },
  ticker_card: {
    inputs: [],
    outputs: [makePort('output', 'ticker', '', 0)],
  },
  ai_screener: {
    inputs: [],
    outputs: [makePort('output', 'signal', 'ports.signal', 0)],
  },
  screener_forecast: {
    inputs: [],
    outputs: [],
  },
  ticker_graph: {
    inputs: [],
    outputs: [],
  },
  strategy_output_ideas: {
    inputs: [],
    outputs: [],
  },
  strategy_checklist: {
    inputs: [],
    outputs: [],
  },
};

// ─── Strategy base port config ───────────────────────────────────

const STRATEGY_PORT_CONFIG: PortConfig = {
  inputs: [
    makePort('input', 'ticker', 'ports.ticker', 0),
    makePort('input', 'any', '', 0),
  ],
  outputs: [makePort('output', 'signal', 'ports.signal', 0)],
};

// ─── Trading idea port config ────────────────────────────────────

const TRADING_IDEA_PORT_CONFIG: PortConfig = {
  inputs: [makePort('input', 'signal', '', 0)],
  outputs: [],
};

// ─── Empty config for legacy card types ──────────────────────────

const EMPTY_PORT_CONFIG: PortConfig = { inputs: [], outputs: [] };

// ─── Public API ──────────────────────────────────────────────────

/**
 * Returns the base PortConfig for a given card type + optional widgetType.
 * Returns an empty config for card types that don't support ports.
 */
export function getBasePortConfig(
  cardType: string,
  widgetType?: WidgetType | string
): PortConfig {
  if (cardType === 'strategy') {
    return STRATEGY_PORT_CONFIG;
  }

  if (cardType === 'trading_idea') {
    return TRADING_IDEA_PORT_CONFIG;
  }

  if (cardType === 'widget' && widgetType) {
    return WIDGET_PORT_CONFIGS[widgetType] ?? EMPTY_PORT_CONFIG;
  }

  return EMPTY_PORT_CONFIG;
}
