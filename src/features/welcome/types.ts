// Re-export widget types from chat feature
export type {
  WidgetType,
  AlertCardProps,
  MiniChartProps,
  PortfolioSummaryProps,
  RiskIndicatorProps,
} from '@/features/chat/types/widget';

// Message type for welcome scenarios
export interface WelcomeMessage {
  id: string;
  type: 'USER' | 'COPILOT';
  content: string;
  createdAt: string;
  widget?: import('@/features/chat/types/widget').WidgetType;
  widgetData?: Record<string, unknown>;
}

// Sparkly (scenario) type
export interface Sparkly {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  messages: WelcomeMessage[];
}
