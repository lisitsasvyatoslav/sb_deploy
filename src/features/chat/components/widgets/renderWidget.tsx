import React from 'react';
import {
  WidgetType,
  AlertCardProps,
  RiskIndicatorProps,
} from '@/features/chat/types/widget';
import AlertCard from './AlertCard';
import MiniChart from './MiniChart';
import PortfolioSummary from './PortfolioSummary';
import RiskIndicator from './RiskIndicator';
import StrategiesWidget from '@/features/chat/components/StrategiesWidget';

/**
 * Render widget based on type and data
 */
export const renderWidget = (
  type?: WidgetType,
  data?: Record<string, unknown>
): React.ReactNode | null => {
  if (!type || !data) return null;

  switch (type) {
    case 'alert':
      return (
        <AlertCard
          title={data.title as string}
          message={data.message as string}
          type={data.type as AlertCardProps['type']}
        />
      );

    case 'chart':
      return (
        <MiniChart
          data={data.data as number[]}
          label={data.label as string}
          color={data.color as string}
        />
      );

    case 'portfolio':
      return (
        <PortfolioSummary
          totalValue={data.totalValue as number}
          change={data.change as number}
          changePercent={data.changePercent as number}
          positions={data.positions as number}
        />
      );

    case 'risk':
      return (
        <RiskIndicator
          level={data.level as RiskIndicatorProps['level']}
          score={data.score as number}
          label={data.label as string}
        />
      );

    case 'strategies':
      return <StrategiesWidget strategyIds={data.strategyIds as number[]} />;
    default:
      return null;
  }
};
