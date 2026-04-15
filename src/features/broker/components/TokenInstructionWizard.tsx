import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import instructionImage1 from '../assets/TokenInstructionWizard-1.png';
import instructionImage2 from '../assets/TokenInstructionWizard-2.png';
import { getAvailableBrokers } from '../constants';
import BrokerLogoBadge from './BrokerLogoBadge';
import StepHeader from './StepHeader';
import WizardTwoPanelLayout from './WizardTwoPanelLayout';

interface TokenInstructionWizardProps {
  brokerType: string;
  onClose: () => void;
}

const TokenInstructionWizard: React.FC<TokenInstructionWizardProps> = ({
  brokerType,
  onClose,
}) => {
  const { t } = useTranslation('broker');
  const [currentPart, setCurrentPart] = useState(0);

  const availableBrokers = useMemo(() => getAvailableBrokers(t), [t]);
  const broker = availableBrokers.find((b) => b.type === brokerType);
  const parts = broker?.tokenManual?.parts || [];

  const part = parts[currentPart];
  const isLastPart = currentPart === parts.length - 1;

  // Calculate step number offset from previous parts
  const stepOffset = parts
    .slice(0, currentPart)
    .reduce((sum, p) => sum + p.steps.length, 0);

  // Close if no parts available (avoid calling onClose during render)
  useEffect(() => {
    if (!part) {
      onClose();
    }
  }, [part, onClose]);

  function handleNext() {
    if (isLastPart) {
      onClose();
    } else {
      setCurrentPart((prev) => prev + 1);
    }
  }

  function handleRestart() {
    setCurrentPart(0);
  }

  if (!part) {
    return null;
  }

  return (
    <WizardTwoPanelLayout
      currentStep={currentPart + 1}
      totalSteps={parts.length}
      onBack={onClose}
      showProgress={false}
      promoContent={
        <Image
          src={currentPart === 0 ? instructionImage1 : instructionImage2}
          alt={part.title}
          className="max-w-[663px] rounded-radius-2 object-contain w-full"
        />
      }
    >
      <div className="flex-1 flex flex-col justify-center max-w-[432px] mx-auto w-full">
        {/* Broker Logo */}
        <div className="mb-base-52">
          <BrokerLogoBadge brokerType={brokerType} />
        </div>

        <div className="flex flex-col gap-base-32 w-full">
          {/* Title + Subtitle + Steps */}
          <div className="flex flex-col gap-base-12">
            <StepHeader title={part.title} description={part.subtitle ?? ''} />

            {/* Steps */}
            <div className="flex flex-col gap-base-12 text-12 leading-16 text-blackinverse-a32">
              {part.steps.map((step, i) => (
                <p key={i}>
                  {stepOffset + i + 1}. {step}
                </p>
              ))}
              <p className="text-blackinverse-a100 font-medium">
                {t('tokenInstruction.followInstructionHint', {
                  action: isLastPart
                    ? t('tokenInstruction.done').toUpperCase()
                    : t('tokenInstruction.next').toUpperCase(),
                })}
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-base-10">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleRestart}
              disabled={currentPart === 0}
              fullWidth
            >
              {t('tokenInstruction.restart')}
            </Button>
            <Button
              type="button"
              variant="accent"
              size="md"
              onClick={handleNext}
              fullWidth
            >
              {isLastPart
                ? t('tokenInstruction.done')
                : t('tokenInstruction.next')}
            </Button>
          </div>
        </div>
      </div>
    </WizardTwoPanelLayout>
  );
};

export default TokenInstructionWizard;
