import Image from 'next/image';
import React from 'react';
import { m } from 'framer-motion';
import { useTranslation } from '@/shared/i18n/client';

interface SendButtonProps {
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

const SendButton: React.FC<SendButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  label,
}) => {
  const { t } = useTranslation('chat');
  const isDisabled = disabled || loading;

  return (
    <m.button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative w-9 h-9 flex items-center justify-center rounded-[2px]
        transition-colors duration-200 disabled:cursor-not-allowed p-2
        ${
          isDisabled
            ? 'bg-background-hover text-text-muted'
            : 'bg-accent text-white hover:bg-accent-hover active:bg-accent-active'
        }
      `}
      aria-label={label ?? t('input.send')}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
    >
      <Image src="/images/arrow_up.svg" alt="" width={20} height={20} />
    </m.button>
  );
};

export default SendButton;
