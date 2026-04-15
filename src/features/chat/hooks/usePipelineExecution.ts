import { useCallback, useReducer, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { pipelineApi } from '@/services/api/pipeline';
import { chatQueryKeys } from '@/features/chat/queries';
import { logger } from '@/shared/utils/logger';
import type {
  PipelineExecutionState,
  PipelineInitialContext,
  PipelineSSEEvent,
  PipelineStep,
  PipelineStepState,
} from '@/features/chat/types/pipeline';

// Action types for reducer
type PipelineAction =
  | { type: 'RESET' }
  | { type: 'CHAT_CREATED'; chatId: number }
  | { type: 'START_SUMMARIZING_CONTEXT' }
  | { type: 'START_GENERATING_PLAN' }
  | { type: 'PLAN_GENERATED'; runId: string; steps: PipelineStep[] }
  | { type: 'STEP_STARTED'; stepId: string }
  | {
      type: 'STEP_COMPLETED';
      stepId: string;
      duration: number;
      input?: Record<string, unknown>;
      output?: Record<string, unknown>;
    }
  | { type: 'STEP_FAILED'; stepId: string; error: string }
  | { type: 'STEP_SKIPPED'; stepId: string; reason: string }
  | {
      type: 'PLAN_COMPLETED';
      finalOutput: Record<string, unknown>;
      totalDuration: number;
    }
  | { type: 'PLAN_FAILED'; error: string; failedStepId?: string }
  | { type: 'ERROR'; error: string };

const initialState: PipelineExecutionState = {
  status: 'idle',
  chatId: null,
  runId: null,
  plan: null,
  stepStatuses: {},
  finalOutput: null,
  error: null,
  totalDuration: null,
};

function pipelineReducer(
  state: PipelineExecutionState,
  action: PipelineAction
): PipelineExecutionState {
  switch (action.type) {
    case 'RESET':
      return initialState;

    case 'CHAT_CREATED':
      return {
        ...state,
        chatId: action.chatId,
      };

    case 'START_SUMMARIZING_CONTEXT':
      return {
        ...state,
        status: 'summarizing_context',
      };

    case 'START_GENERATING_PLAN':
      return {
        ...initialState,
        chatId: state.chatId,
        status: 'generating_plan',
      };

    case 'PLAN_GENERATED': {
      // Initialize step statuses from plan
      const stepStatuses: Record<string, PipelineStepState> = {};
      action.steps.forEach((step) => {
        stepStatuses[step.id] = {
          ...step,
          status: 'pending',
        };
      });

      return {
        ...state,
        status: 'running',
        runId: action.runId,
        plan: {
          runId: action.runId,
          steps: action.steps,
          createdAt: new Date().toISOString(),
        },
        stepStatuses,
      };
    }

    case 'STEP_STARTED':
      return {
        ...state,
        stepStatuses: {
          ...state.stepStatuses,
          [action.stepId]: {
            ...state.stepStatuses[action.stepId],
            status: 'running',
            startedAt: new Date().toISOString(),
          },
        },
      };

    case 'STEP_COMPLETED':
      return {
        ...state,
        stepStatuses: {
          ...state.stepStatuses,
          [action.stepId]: {
            ...state.stepStatuses[action.stepId],
            status: 'completed',
            completedAt: new Date().toISOString(),
            duration: action.duration,
            input: action.input,
            output: action.output,
          },
        },
      };

    case 'STEP_FAILED':
      return {
        ...state,
        stepStatuses: {
          ...state.stepStatuses,
          [action.stepId]: {
            ...state.stepStatuses[action.stepId],
            status: 'failed',
            completedAt: new Date().toISOString(),
            error: action.error,
          },
        },
      };

    case 'STEP_SKIPPED':
      return {
        ...state,
        stepStatuses: {
          ...state.stepStatuses,
          [action.stepId]: {
            ...state.stepStatuses[action.stepId],
            status: 'skipped',
            error: action.reason,
          },
        },
      };

    case 'PLAN_COMPLETED':
      return {
        ...state,
        status: 'completed',
        finalOutput: action.finalOutput,
        totalDuration: action.totalDuration,
      };

    case 'PLAN_FAILED':
    case 'ERROR':
      return {
        ...state,
        status: 'failed',
        error: action.error,
      };

    default:
      return state;
  }
}

export function usePipelineExecution() {
  const [state, dispatch] = useReducer(pipelineReducer, initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const handleSSEEvent = useCallback((event: PipelineSSEEvent) => {
    switch (event.type) {
      case 'chat_created':
        dispatch({ type: 'CHAT_CREATED', chatId: event.chatId });
        break;

      case 'summarizing_context':
        dispatch({ type: 'START_SUMMARIZING_CONTEXT' });
        break;

      case 'generating_plan':
        dispatch({ type: 'START_GENERATING_PLAN' });
        break;

      case 'plan_generated':
        dispatch({
          type: 'PLAN_GENERATED',
          runId: event.runId,
          steps: event.steps,
        });
        break;

      case 'step_started':
        dispatch({
          type: 'STEP_STARTED',
          stepId: event.stepId,
        });
        break;

      case 'step_completed':
        dispatch({
          type: 'STEP_COMPLETED',
          stepId: event.stepId,
          duration: event.duration,
          input: event.input,
          output: event.output,
        });
        break;

      case 'step_failed':
        dispatch({
          type: 'STEP_FAILED',
          stepId: event.stepId,
          error: event.error,
        });
        break;

      case 'step_skipped':
        dispatch({
          type: 'STEP_SKIPPED',
          stepId: event.stepId,
          reason: event.reason,
        });
        break;

      case 'plan_completed':
        dispatch({
          type: 'PLAN_COMPLETED',
          finalOutput: event.finalOutput,
          totalDuration: event.totalDuration,
        });
        break;

      case 'plan_failed':
        dispatch({
          type: 'PLAN_FAILED',
          error: event.error,
          failedStepId: event.failedStepId,
        });
        break;

      case 'error':
        dispatch({
          type: 'ERROR',
          error: event.error,
        });
        break;
    }
  }, []);

  const execute = useCallback(
    async (
      instruction: string,
      initialContext: PipelineInitialContext | null = null
    ) => {
      // Abort any in-flight execution before starting a new one
      abortControllerRef.current?.abort();
      dispatch({ type: 'RESET' });
      abortControllerRef.current = new AbortController();

      dispatch({ type: 'START_GENERATING_PLAN' });

      try {
        await pipelineApi.executeStream(
          instruction,
          initialContext,
          handleSSEEvent,
          abortControllerRef.current.signal
        );
      } catch (error) {
        if (error instanceof Error && error.message === 'ABORTED') {
          dispatch({ type: 'RESET' });
          return;
        }
        dispatch({
          type: 'ERROR',
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        });
      } finally {
        abortControllerRef.current = null;
        // Invalidate chat list so it reflects the new/updated pipeline chat
        queryClient.invalidateQueries({ queryKey: chatQueryKeys.chats() });
      }
    },
    [handleSSEEvent, queryClient]
  );

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const resume = useCallback(
    async (chatId: number): Promise<boolean> => {
      try {
        dispatch({ type: 'RESET' });
        const resumed = await pipelineApi.resumeSession(chatId, handleSSEEvent);
        if (resumed) {
          // SSE stream ended — if state is still 'running', pipeline completed
          // but terminal event wasn't received. Force completion.
          dispatch({
            type: 'PLAN_COMPLETED',
            finalOutput: {},
            totalDuration: 0,
          });
          queryClient.invalidateQueries({ queryKey: chatQueryKeys.chats() });
        }
        return resumed;
      } catch (error) {
        logger.warn('usePipelineExecution', 'Pipeline resume failed', {
          chatId,
          error,
        });
        return false;
      }
    },
    [handleSSEEvent, queryClient]
  );

  const reset = useCallback(() => {
    stop();
    dispatch({ type: 'RESET' });
  }, [stop]);

  return {
    state,
    execute,
    resume,
    stop,
    reset,
  };
}
