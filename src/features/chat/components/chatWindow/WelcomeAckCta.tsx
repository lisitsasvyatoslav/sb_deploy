import React from 'react';
import AnswerOptionButton from '@/shared/ui/AnswerOptionButton';
import { useTranslation } from '@/shared/i18n/client';

interface WelcomeAckCtaProps {
  onAck: () => void;
  disabled?: boolean;
}

const WelcomeAckCta: React.FC<WelcomeAckCtaProps> = ({
  onAck,
  disabled = false,
}) => {
  const { t } = useTranslation('chat');

  return (
    <div className="mt-4">
      <AnswerOptionButton onClick={onAck} disabled={disabled}>
        {t('welcomeAck')}
      </AnswerOptionButton>
    </div>
  );
};

export default WelcomeAckCta;
