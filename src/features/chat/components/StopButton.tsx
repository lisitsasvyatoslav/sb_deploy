import Button from '@/shared/ui/Button';
import { m } from 'framer-motion';
import React from 'react';
import { useTranslation } from '@/shared/i18n/client';

interface StopButtonProps {
  onClick?: () => void;
  label?: string;
}

const StopButton: React.FC<StopButtonProps> = ({ onClick, label }) => {
  const { t } = useTranslation('chat');
  return (
    <m.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        type="button"
        onClick={onClick}
        variant="accent"
        size="md"
        className="!rounded-full !w-10 !h-10 !p-0"
        aria-label={label ?? t('input.stopGeneration')}
        icon={<div className="w-[14px] h-[14px] rounded-[2px] bg-white" />}
      />
    </m.div>
  );
};

export default StopButton;
