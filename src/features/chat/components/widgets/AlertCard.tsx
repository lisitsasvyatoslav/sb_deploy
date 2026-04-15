import React from 'react';
import { AlertCardProps } from '@/features/chat/types/widget';

const AlertCard: React.FC<AlertCardProps> = ({
  title,
  message,
  type = 'info',
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          iconColor: 'text-amber-500',
          titleColor: 'text-amber-800',
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          iconColor: 'text-green-500',
          titleColor: 'text-green-800',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          iconColor: 'text-red-500',
          titleColor: 'text-red-800',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          iconColor: 'text-blue-500',
          titleColor: 'text-blue-800',
        };
    }
  };

  const styles = getTypeStyles();

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'success':
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'error':
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      default:
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`${styles.bg} ${styles.border} border rounded-lg p-3 flex items-start gap-3`}
    >
      <div className={`${styles.iconColor} flex-shrink-0 mt-0.5`}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${styles.titleColor} font-medium text-sm`}>{title}</p>
        <p className="text-text-secondary text-sm mt-0.5">{message}</p>
      </div>
    </div>
  );
};

export default AlertCard;
