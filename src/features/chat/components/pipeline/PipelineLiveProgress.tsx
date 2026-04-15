import React from 'react';
import PipelineProgress from './PipelineProgress';
import { useTranslation } from '@/shared/i18n/client';
import type {
  PipelineRunStatus,
  PipelineStepState,
} from '@/features/chat/types/pipeline';

interface PipelineLiveProgressProps {
  status: PipelineRunStatus;
  error: string | null;
  steps: PipelineStepState[];
}

/**
 * Live pipeline progress rendered inside the chat message area
 * during active pipeline execution.
 */
const PipelineLiveProgress: React.FC<PipelineLiveProgressProps> = ({
  status,
  error,
  steps,
}) => {
  const { t } = useTranslation('chat');
  const isExecuting =
    status === 'summarizing_context' ||
    status === 'generating_plan' ||
    status === 'running';

  return (
    <>
      {status === 'summarizing_context' && (
        <div className="text-xs theme-text-secondary text-center py-2 animate-pulse">
          {t('pipeline.summarizingContext')}
        </div>
      )}
      {status === 'generating_plan' && (
        <div className="text-xs theme-text-secondary text-center py-2 animate-pulse">
          {t('pipeline.generatingPlan')}
        </div>
      )}
      {isExecuting && steps.length > 0 && (
        <div className="px-4 py-2">
          <PipelineProgress steps={steps} />
        </div>
      )}
      {status === 'failed' && error && (
        <div className="mx-4 mb-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </>
  );
};

export default PipelineLiveProgress;
