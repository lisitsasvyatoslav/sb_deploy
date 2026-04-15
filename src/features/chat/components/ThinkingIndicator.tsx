import React from 'react';
import { m, Transition } from 'framer-motion';
import { useTranslation } from '@/shared/i18n/client';

interface ThinkingIndicatorProps {
  className?: string;
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  className = '',
}) => {
  const { t } = useTranslation('chat');

  const dotVariants = {
    initial: { opacity: 0.3, y: 0 },
    animate: { opacity: 1, y: -2 },
  };

  const textTransition: Transition = {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  };

  const dotTransition: Transition = {
    duration: 0.4,
    repeat: Infinity,
    repeatType: 'reverse',
    ease: 'easeInOut',
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <m.span
        className="text-sm text-text-secondary"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={textTransition}
      >
        {t('thinking')}
      </m.span>
      <div className="flex items-center">
        {[0, 1, 2].map((index) => (
          <m.span
            key={index}
            className="text-sm text-text-secondary"
            variants={dotVariants}
            initial="initial"
            animate="animate"
            transition={{ ...dotTransition, delay: index * 0.2 }}
          >
            .
          </m.span>
        ))}
      </div>
    </div>
  );
};

export default ThinkingIndicator;
