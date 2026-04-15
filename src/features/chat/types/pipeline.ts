/**
 * Pipeline SSE event types and state management types
 * Mirrors backend DTOs from nestjs-backend/src/modules/pipeline/
 */

// Step execution status
export type PipelineStepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';

// Overall pipeline run status
export type PipelineRunStatus =
  | 'idle'
  | 'summarizing_context'
  | 'generating_plan'
  | 'running'
  | 'completed'
  | 'failed';

// Single step in the execution plan
export interface PipelineStep {
  id: string;
  tool: string;
  description: string;
  order: number;
}

// Step with runtime status info
export interface PipelineStepState extends PipelineStep {
  status: PipelineStepStatus;
  startedAt?: string;
  completedAt?: string;
  duration?: number; // ms
  error?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

// Full execution plan
export interface PipelinePlan {
  runId: string;
  steps: PipelineStep[];
  createdAt: string;
}

// SSE Event Types
export interface PipelineEventGeneratingPlan {
  type: 'generating_plan';
}

export interface PipelineEventPlanGenerated {
  type: 'plan_generated';
  runId: string;
  steps: PipelineStep[];
}

export interface PipelineEventStepStarted {
  type: 'step_started';
  stepId: string;
}

export interface PipelineEventStepCompleted {
  type: 'step_completed';
  stepId: string;
  duration: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
}

export interface PipelineEventStepFailed {
  type: 'step_failed';
  stepId: string;
  error: string;
}

export interface PipelineEventStepSkipped {
  type: 'step_skipped';
  stepId: string;
  reason: string;
}

export interface PipelineEventPlanCompleted {
  type: 'plan_completed';
  runId: string;
  finalOutput: Record<string, unknown>;
  totalDuration: number;
}

export interface PipelineEventPlanFailed {
  type: 'plan_failed';
  runId: string;
  error: string;
  failedStepId?: string;
}

export interface PipelineEventSummarizingContext {
  type: 'summarizing_context';
  chatId: number;
}

export interface PipelineEventError {
  type: 'error';
  error: string;
}

export interface PipelineEventChatCreated {
  type: 'chat_created';
  chatId: number;
}

// Union of all SSE events
export type PipelineSSEEvent =
  | PipelineEventChatCreated
  | PipelineEventSummarizingContext
  | PipelineEventGeneratingPlan
  | PipelineEventPlanGenerated
  | PipelineEventStepStarted
  | PipelineEventStepCompleted
  | PipelineEventStepFailed
  | PipelineEventStepSkipped
  | PipelineEventPlanCompleted
  | PipelineEventPlanFailed
  | PipelineEventError;

// State for usePipelineExecution hook
export interface PipelineExecutionState {
  status: PipelineRunStatus;
  chatId: number | null;
  runId: string | null;
  plan: PipelinePlan | null;
  stepStatuses: Record<string, PipelineStepState>;
  finalOutput: Record<string, unknown> | null;
  error: string | null;
  totalDuration: number | null;
}

// Initial context for pipeline execution
export interface PipelineInitialContext {
  chatId?: number;
  boardId?: number;
  activeBoardId?: number;
  cardIds?: number[];
  tradeIds?: number[];
  fileIds?: string[];
}
