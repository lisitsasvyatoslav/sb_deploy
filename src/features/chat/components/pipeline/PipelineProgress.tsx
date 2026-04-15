import type {
  PipelineStepState,
  PipelineStepStatus,
} from '@/features/chat/types/pipeline';
import { m } from 'framer-motion';
import React from 'react';

interface PipelineProgressProps {
  steps: PipelineStepState[];
}

const StatusIcon: React.FC<{ status: PipelineStepStatus }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <div className="w-4 h-4 rounded-full bg-gray-400 flex-shrink-0" />;
    case 'running':
      return (
        <div className="w-4 h-4 flex-shrink-0">
          <svg
            className="animate-spin w-4 h-4 text-[var(--color-accent)]"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      );
    case 'completed':
      return (
        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      );
    case 'failed':
      return (
        <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M12 9v2m0 4h.01"
            />
          </svg>
        </div>
      );
    case 'skipped':
      return (
        <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M20 12H4"
            />
          </svg>
        </div>
      );
    default:
      return null;
  }
};

const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 100) / 10;
  return `${seconds}s`;
};

const formatOutputValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') {
    return value.length > 200 ? `"${value.slice(0, 200)}..."` : `"${value}"`;
  }
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const first =
      typeof value[0] === 'string' ? `"${value[0]}"` : JSON.stringify(value[0]);
    const preview = first.length > 80 ? first.slice(0, 80) + '...' : first;
    return value.length === 1
      ? `[${preview}]`
      : `[${preview}, ... ${value.length} items]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value as object);
    return `{${keys.length} keys: ${keys.join(', ')}}`;
  }
  return String(value);
};

const formatStepOutput = (
  output: Record<string, unknown>
): { summary: string; full: string } => {
  const entries = Object.entries(output);
  if (entries.length === 0) return { summary: 'empty', full: '{}' };

  const [firstKey, firstVal] = entries[0];
  const summary = `${firstKey}: ${formatOutputValue(firstVal)}`;

  // For full view, truncate large nested values
  const truncated: Record<string, unknown> = {};
  for (const [k, v] of entries) {
    if (typeof v === 'string' && v.length > 500) {
      truncated[k] = v.slice(0, 500) + '... (truncated)';
    } else if (
      typeof v === 'object' &&
      v !== null &&
      JSON.stringify(v).length > 1000
    ) {
      truncated[k] = Array.isArray(v)
        ? `[${v.length} items]`
        : `{${Object.keys(v as object).join(', ')}}`;
    } else {
      truncated[k] = v;
    }
  }

  return { summary, full: JSON.stringify(truncated, null, 2) };
};

const PipelineProgress: React.FC<PipelineProgressProps> = ({ steps }) => {
  const completedCount = steps.filter(
    (s) =>
      s.status === 'completed' ||
      s.status === 'failed' ||
      s.status === 'skipped'
  ).length;
  const totalCount = steps.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs theme-text-secondary">
          <span>Progress</span>
          <span>
            {completedCount}/{totalCount} steps
          </span>
        </div>
        <div className="h-1.5 bg-[var(--color-surface-secondary)] rounded-full overflow-hidden">
          <m.div
            className="h-full bg-[var(--color-accent)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-2">
        {steps.map((step) => (
          <m.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              flex items-start gap-2 p-2 rounded-lg
              ${step.status === 'running' ? 'bg-[var(--color-surface-secondary)]' : ''}
              ${step.status === 'skipped' ? 'opacity-50' : ''}
            `}
          >
            <div className="mt-0.5">
              <StatusIcon status={step.status} />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className={`
                text-sm font-medium
                ${step.status === 'skipped' ? 'line-through theme-text-secondary' : 'theme-text-primary'}
              `}
              >
                {step.tool}
              </div>
              {step.description && (
                <div className="text-xs theme-text-secondary mt-0.5 line-clamp-2">
                  {step.description}
                </div>
              )}
              {step.status === 'failed' && step.error && (
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {step.error}
                </div>
              )}
              {step.status === 'completed' && step.duration !== undefined && (
                <div className="text-xs theme-text-secondary mt-0.5">
                  {formatDuration(step.duration)}
                </div>
              )}
              {step.status === 'completed' &&
                step.input &&
                Object.keys(step.input).length > 0 && (
                  <details className="mt-1 group/input">
                    <summary className="cursor-pointer text-xs theme-text-secondary hover:theme-text-primary transition-colors list-none flex items-center gap-1">
                      <svg
                        className="w-3 h-3 transition-transform group-open/input:rotate-90"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      <span className="truncate">
                        Input: {formatStepOutput(step.input).summary}
                      </span>
                    </summary>
                    <pre className="mt-1 p-2 text-xs rounded bg-[var(--color-surface-secondary)] theme-text-secondary overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap break-words">
                      {formatStepOutput(step.input).full}
                    </pre>
                  </details>
                )}
              {step.status === 'completed' &&
                step.output &&
                Object.keys(step.output).length > 0 && (
                  <details className="mt-1 group/output">
                    <summary className="cursor-pointer text-xs theme-text-secondary hover:theme-text-primary transition-colors list-none flex items-center gap-1">
                      <svg
                        className="w-3 h-3 transition-transform group-open/output:rotate-90"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      <span className="truncate">
                        Output: {formatStepOutput(step.output).summary}
                      </span>
                    </summary>
                    <pre className="mt-1 p-2 text-xs rounded bg-[var(--color-surface-secondary)] theme-text-secondary overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap break-words">
                      {formatStepOutput(step.output).full}
                    </pre>
                  </details>
                )}
            </div>
          </m.div>
        ))}
      </div>
    </div>
  );
};

export default PipelineProgress;
