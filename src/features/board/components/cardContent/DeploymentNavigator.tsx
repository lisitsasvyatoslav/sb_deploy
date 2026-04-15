import React from 'react';
import type { Deployment } from '@/types';
import { useTranslation } from '@/shared/i18n/client';
import { getLocaleTag } from '@/shared/utils/formatLocale';

interface DeploymentNavigatorProps {
  deployments: Deployment[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

export const DeploymentNavigator: React.FC<DeploymentNavigatorProps> = ({
  deployments,
  currentIndex,
  onPrev,
  onNext,
}) => {
  const { t, i18n } = useTranslation('board');
  const locale = getLocaleTag(i18n.language);
  const current = deployments[currentIndex];
  if (!current) return null;

  const time = new Date(current.createdAt).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const seqNum = String(current.sequenceNumber).padStart(2, '0');

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        aria-label={t('deployment.previousRun')}
        className="w-5 h-5 flex items-center justify-center text-blackinverse-a32 hover:text-whiteinverse-a100 disabled:opacity-30"
        disabled={currentIndex <= 0}
        onClick={onPrev}
      >
        <svg width="5" height="8" viewBox="0 0 5 8" fill="none">
          <path
            d="M4 1L1 4L4 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="flex items-center gap-2">
        <span className="text-[10px] leading-3 font-medium text-blackinverse-a32 tracking-[-0.2px]">
          {seqNum} {t('deployment.run')}
        </span>
        <span className="w-0.5 h-0.5 rounded-full bg-blackinverse-a32" />
        <span className="text-[10px] leading-3 font-medium text-blackinverse-a32 tracking-[-0.2px]">
          {time}
        </span>
      </div>
      <button
        type="button"
        aria-label={t('deployment.nextRun')}
        className="w-5 h-5 flex items-center justify-center text-blackinverse-a32 hover:text-whiteinverse-a100 disabled:opacity-30"
        disabled={currentIndex >= deployments.length - 1}
        onClick={onNext}
      >
        <svg width="5" height="8" viewBox="0 0 5 8" fill="none">
          <path
            d="M1 1L4 4L1 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};
