import React, { useMemo } from 'react';
import PipelineProgress from './PipelineProgress';
import type { Plan, ExecutionStep } from '@/types';
import type { PipelineStepState } from '@/features/chat/types/pipeline';

interface PipelineMessageBlockProps {
  plans: Plan[];
}

/**
 * Renders pipeline steps as a visual block within the chat message list.
 * Takes plans with nested execution steps and flattens them for display.
 * The conclusion text is rendered separately via message.content in ChatMessageList.
 */
const PipelineMessageBlock: React.FC<PipelineMessageBlockProps> = ({
  plans,
}) => {
  // Flatten execution steps from all plans
  const allSteps = useMemo((): ExecutionStep[] => {
    return plans.flatMap((plan) => plan.executionSteps || []);
  }, [plans]);

  // Convert ExecutionStep[] to PipelineStepState[] for PipelineProgress
  const stepStates = useMemo((): PipelineStepState[] => {
    return allSteps.map((step, index) => ({
      id: `step_${step.id}`,
      tool: step.tool,
      description: step.description ?? step.tool,
      order: index,
      status: step.status === 'failed' ? 'failed' : 'completed',
      duration: step.duration,
      input: step.input ?? undefined,
      output: step.output ?? undefined,
      error: step.error ?? undefined,
    }));
  }, [allSteps]);

  // Check if any step has an error
  const failedStep = allSteps.find((s) => s.status === 'failed' && s.error);

  if (stepStates.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Step progress */}
      <div className="px-1">
        <PipelineProgress steps={stepStates} />
      </div>

      {/* Error banner for failed steps */}
      {failedStep && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-600 dark:text-red-400">
          {failedStep.error}
        </div>
      )}
    </div>
  );
};

export default PipelineMessageBlock;
