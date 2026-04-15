import React from 'react';
import { useTranslation } from '@/shared/i18n/client';

interface DisclaimerProps {
  variant: 'full' | 'short';
  className?: string;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ variant, className = '' }) => {
  const { t } = useTranslation('chat');
  const text =
    variant === 'full' ? t('disclaimer.full') : t('disclaimer.short');

  if (variant === 'full') {
    return (
      <p
        className={`text-10 leading-[14px] text-text-muted text-center max-w-[432px] ${className}`}
      >
        {text}
      </p>
    );
  }

  return (
    <p
      className={`text-[8px] leading-[12px] text-text-muted font-semibold uppercase text-center tracking-tight ${className}`}
    >
      {text}
    </p>
  );
};

export default Disclaimer;
