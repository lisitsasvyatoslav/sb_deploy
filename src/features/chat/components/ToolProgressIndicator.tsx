import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import type { ToolProgressEvent } from '@/services/api/chat';

interface ToolProgressIndicatorProps {
  /** Map of tool progress events by tool type (only latest per tool) */
  toolProgress: Record<string, ToolProgressEvent>;
  className?: string;
}

/**
 * Displays tool execution progress with animated status indicators.
 * Shows one line per tool with loader/checkmark/error icons based on status.
 */
const ToolProgressIndicator: React.FC<ToolProgressIndicatorProps> = ({
  toolProgress,
  className = '',
}) => {
  const entries = Object.entries(toolProgress);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <AnimatePresence mode="popLayout">
        {entries.map(([toolType, event]) => (
          <m.div
            key={toolType}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            {/* Status Icon */}
            <StatusIcon status={event.status} />

            {/* Message */}
            <div className={`text-sm ${getTextColor(event.status)} w-full`}>
              {event.content}
            </div>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Renders animated status icon based on tool status
 */
const StatusIcon: React.FC<{ status: ToolProgressEvent['status'] }> = ({
  status,
}) => {
  switch (status) {
    case 'pending':
      return <LoaderIcon />;
    case 'done':
      return (
        <m.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          <CheckCircleOutlineIcon
            className="text-green-500"
            sx={{ fontSize: 16 }}
          />
        </m.div>
      );
    case 'error':
      return (
        <m.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          <ErrorOutlineIcon className="text-red-500" sx={{ fontSize: 16 }} />
        </m.div>
      );
    default:
      return null;
  }
};

/**
 * Animated loader spinner for pending status
 */
const LoaderIcon: React.FC = () => (
  <m.div
    className="w-4 h-4 border-2 border-border-medium border-t-accent rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  />
);

/**
 * Get text color class based on status
 */
const getTextColor = (status: ToolProgressEvent['status']): string => {
  switch (status) {
    case 'pending':
      return 'text-text-secondary';
    case 'done':
      return 'text-green-600';
    case 'error':
      return 'text-red-600';
    default:
      return 'text-text-secondary';
  }
};

export default ToolProgressIndicator;
