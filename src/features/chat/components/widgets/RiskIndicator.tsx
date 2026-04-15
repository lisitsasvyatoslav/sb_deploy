import React from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { RiskIndicatorProps } from '@/features/chat/types/widget';

/**
 * NOTE: This component uses inline styles intentionally.
 * The style values are calculated dynamically at runtime and cannot be
 * replaced with static Tailwind classes.
 */

const RiskIndicator: React.FC<RiskIndicatorProps> = ({
  level,
  score,
  label,
}) => {
  const { t } = useTranslation('chat');
  const getLevelStyles = () => {
    switch (level) {
      case 'low':
        return {
          color: 'text-green-600',
          bg: 'bg-green-100',
          barColor: 'bg-green-500',
          label: label || t('risk.low'),
        };
      case 'high':
        return {
          color: 'text-red-600',
          bg: 'bg-red-100',
          barColor: 'bg-red-500',
          label: label || t('risk.high'),
        };
      default:
        return {
          color: 'text-amber-600',
          bg: 'bg-amber-100',
          barColor: 'bg-amber-500',
          label: label || t('risk.medium'),
        };
    }
  };

  const styles = getLevelStyles();
  const clampedScore = Math.min(Math.max(score, 0), 100);

  return (
    <div className="bg-background-card border border-border-light rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary">{t('risk.level')}</span>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${styles.bg} ${styles.color}`}
        >
          {styles.label}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-end gap-2">
          <span className={`text-3xl font-bold ${styles.color}`}>{score}</span>
          <span className="text-sm text-text-muted mb-1">/ 100</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-background-hover rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full ${styles.barColor} rounded-full transition-all duration-500`}
          style={{ width: `${clampedScore}%` }}
        />
        {/* Markers */}
        <div className="absolute left-[33%] top-0 w-px h-full bg-border-medium" />
        <div className="absolute left-[66%] top-0 w-px h-full bg-border-medium" />
      </div>

      {/* Legend */}
      <div className="flex justify-between mt-2 text-xs text-text-muted">
        <span>{t('risk.labelLow')}</span>
        <span>{t('risk.labelMedium')}</span>
        <span>{t('risk.labelHigh')}</span>
      </div>
    </div>
  );
};

export default RiskIndicator;
