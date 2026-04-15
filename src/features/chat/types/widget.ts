// Widget types for chat messages

export type WidgetType =
  | 'alert'
  | 'chart'
  | 'portfolio'
  | 'risk'
  | 'strategies'
  | 'instrument_selection'
  | null;

// Widget props
export interface AlertCardProps {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
}

export interface InstrumentSelectionProps {
  options: string[]; // Available instruments: ['stocks_ru', 'bonds', 'futures', 'forex']
  allowCustomText?: boolean;
  step?: number;
}

export interface MiniChartProps {
  data: number[];
  label?: string;
  color?: string;
}

export interface PortfolioSummaryProps {
  totalValue: number;
  change: number;
  changePercent: number;
  positions: number;
}

export interface RiskIndicatorProps {
  level: 'low' | 'medium' | 'high';
  score: number;
  label?: string;
}
