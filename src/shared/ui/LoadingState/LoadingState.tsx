'use client';

import React from 'react';
import { useTranslation } from '@/shared/i18n/client';

interface LoadingStateProps {
  message?: string;
  className?: string;
  fullHeight?: boolean;
}

/**
 * LoadingState - universal loading component
 * Can be used for any loading state in the application
 *
 * @param message - custom loading message (defaults to translated "Loading...")
 * @param className - additional CSS classes
 * @param fullHeight - if true, uses h-full, otherwise min-h-[200px]
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  className = '',
  fullHeight = true,
}) => {
  const { t } = useTranslation('common');
  const heightClass = fullHeight ? 'h-full' : 'min-h-[200px]';

  return (
    <div
      className={`flex justify-center items-center ${heightClass} ${className}`}
    >
      <p className="text-gray-500">{message ?? t('loading')}</p>
    </div>
  );
};
