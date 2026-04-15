import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/shared/i18n/client';

interface RelevanceTimerProps {
  createdAt: string;
  ttlSeconds: number;
  onExpire?: () => void;
}

export const RelevanceTimer: React.FC<RelevanceTimerProps> = ({
  createdAt,
  ttlSeconds,
  onExpire,
}) => {
  const { t } = useTranslation('board');
  const [remaining, setRemaining] = useState(() => {
    const expiresAt = new Date(createdAt).getTime() + ttlSeconds * 1000;
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  });

  useEffect(() => {
    const expiresAt = new Date(createdAt).getTime() + ttlSeconds * 1000;
    const initial = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    if (initial <= 0) {
      setRemaining(0);
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      const left = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);

    // including it would restart the interval on every parent render (callback identity changes);
    // the timer should only reset when createdAt or ttlSeconds change.
  }, [createdAt, ttlSeconds]);

  if (remaining <= 0) {
    return (
      <span className="text-[10px] leading-3 font-medium text-red-400 tracking-[-0.2px]">
        {t('relevance.expired')}
      </span>
    );
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <span className="text-[10px] leading-3 font-medium text-green-400 tracking-[-0.2px]">
      {t('relevance.active')}&nbsp;&nbsp;{timeStr}
    </span>
  );
};
