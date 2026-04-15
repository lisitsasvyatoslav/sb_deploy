import React from 'react';
import SurveyStrategyCard from '@/features/chat/components/chatWindow/strategySurvey/ui/SurveyStrategyCard';
import { useGetStrategyCatalogById } from '@/features/strategies-catalog/queries';
import type { MockStrategyWithMatch } from '@/features/chat/components/chatWindow/strategySurvey/survey.mock-strategies';

const StrategiesWidgetCard: React.FC<{ strategyId: number }> = ({
  strategyId,
}) => {
  const { data, isLoading } = useGetStrategyCatalogById(strategyId);

  if (isLoading) {
    return (
      <div className="px-4 py-6 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-stroke-a12 border-t-text-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const strategy: MockStrategyWithMatch = { ...data, matchLabel: '' };

  return <SurveyStrategyCard strategy={strategy} />;
};

const StrategiesWidgetCards: React.FC<{ strategyIds: number[] }> = ({
  strategyIds,
}) => {
  if (strategyIds.length === 0) return null;

  return (
    <div className="flex flex-col divide-y divide-stroke-a12 rounded-[4px] border border-stroke-a12 overflow-hidden max-w-[300px]">
      {strategyIds.map((id) => (
        <StrategiesWidgetCard key={id} strategyId={id} />
      ))}
    </div>
  );
};

export default StrategiesWidgetCards;
