import React from 'react';
import SurveyStrategyCard from './ui/SurveyStrategyCard';
import LlmResponseActionBar from '@/features/chat/components/LlmResponseActionBar';
import { MOCK_RECOMMENDED_STRATEGIES } from './survey.mock-strategies';

interface StrategySurveyResultsProps {
  onThumbsUp?: ((messageId: number) => void) | null;
  onThumbsDown?: ((messageId: number) => void) | null;
  onCopy?: ((messageId: number, content: string) => void) | null;
  onRefresh?: ((messageId: number) => void) | null;
  onAddToBoard?:
    | ((messageId: number, prompt: string | null, response: string) => void)
    | null;
  showLlmActions?: boolean;
}

const StrategySurveyResults: React.FC<StrategySurveyResultsProps> = ({
  showLlmActions,
}) => {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex flex-col divide-y divide-stroke-a12 rounded-[4px] border border-stroke-a12 overflow-hidden max-w-[300px]">
        {MOCK_RECOMMENDED_STRATEGIES.map((strategy) => (
          <SurveyStrategyCard key={strategy.id} strategy={strategy} />
        ))}
      </div>
      {/* TODO [MOCK]: Enable when survey results come from API instead of mock data */}
      <div className="flex justify-start mt-2 mb-3">
        <button
          type="button"
          disabled
          className="px-3 py-2 rounded-[4px] text-[12px] font-medium text-text-primary bg-blackinverse-a12 backdrop-blur-[12px] hover:bg-blackinverse-a32 disabled:opacity-50 disabled:cursor-not-allowed transition w-fit"
        >
          Сохранить подборку
        </button>
      </div>
      {/* TODO [MOCK]: Re-enable LlmResponseActionBar when strategy results come from API */}
      {showLlmActions && (
        <LlmResponseActionBar
          disabled
          onThumbsUp={() => {}}
          onThumbsDown={() => {}}
          onCopy={() => {}}
          onRefresh={() => {}}
          onAddToBoard={() => {}}
        />
      )}
    </div>
  );
};

export default StrategySurveyResults;
