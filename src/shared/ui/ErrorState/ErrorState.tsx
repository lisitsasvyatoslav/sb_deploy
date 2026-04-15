'use client';

import React from 'react';
import { useTranslation } from '@/shared/i18n/client';

interface ErrorStateProps {
  message?: string;
  error?: Error | null;
  className?: string;
  fullHeight?: boolean;
}

/**
 * ErrorState - universal error component
 * Can be used for any error state in the application
 *
 * @param message - custom error message (defaults to translated "Loading error")
 * @param error - error object to display details
 * @param className - additional CSS classes
 * @param fullHeight - if true, uses h-full, otherwise min-h-[200px]
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  error,
  className = '',
  fullHeight = true,
}) => {
  const { t } = useTranslation('common');
  const heightClass = fullHeight ? 'h-full' : 'min-h-[200px]';
  const displayMessage = error?.message || message || t('errorLoading');

  return (
    <div
      className={`flex justify-center items-center ${heightClass} ${className}`}
    >
      <p className="text-red-500">{displayMessage}</p>
    </div>
  );
};
