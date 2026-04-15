import Button from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import ProgressBar from '@/shared/ui/ProgressBar';
import { useTranslation } from '@/shared/i18n/client';
import Image from 'next/image';
import React from 'react';

interface WizardTwoPanelLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps?: number;
  onBack?: () => void;
  promoContent?: React.ReactNode;
  showProgress?: boolean;
}

const WizardTwoPanelLayout: React.FC<WizardTwoPanelLayoutProps> = ({
  children,
  currentStep,
  totalSteps = 3,
  onBack,
  promoContent,
  showProgress = true,
}) => {
  const { t } = useTranslation('broker');

  return (
    <div className="flex h-full min-h-[600px]">
      {/* Left Panel — Content */}
      <div className="relative flex-1 flex flex-col overflow-y-auto lg:min-w-[640px] w-full flex-grow bg-background-white_low shadow-effects-modal backdrop-blur-effects-modal">
        {/* Gradient right border — dividerGradients/vertical */}
        <div className="divider-gradient-vertical absolute top-0 right-0 w-px h-full pointer-events-none z-10" />
        {/* Header: Back + Progress Bar + Step Counter */}
        <div className="flex items-center justify-between mt-[46px] lg:mt-0 px-base-12 py-[27px] h-[86px]">
          {onBack ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<Icon variant="chevronLeft" size={16} />}
              onClick={onBack}
              aria-label={t('addDialog.back')}
            >
              {t('addDialog.back')}
            </Button>
          ) : (
            <div className="w-base-32 shrink-0" />
          )}
          {showProgress && (
            <>
              <ProgressBar
                current={currentStep}
                total={totalSteps}
                title={t('wizard.stepsLabel')}
                barOnly
                className="w-[148px] shrink-0"
              />
              <span className="text-12 font-medium text-blackinverse-a56 shrink-0">
                {t('wizard.stepsProgress', {
                  current: currentStep,
                  total: totalSteps,
                })}
              </span>
            </>
          )}
        </div>

        {/* Step Content */}
        <div className="flex-1 flex flex-col px-base-24 pb-base-24">
          {children}
        </div>
      </div>
      {/* Background/BG/bgWeb */}
      {/* Right Panel — Promo */}
      <div className="hidden lg:flex w-[50%] flex-grow flex-shrink-0 bg-background-bgweb items-center justify-center p-base-32">
        {promoContent ?? (
          // TODO: no max-w token for 600px — add to sizes.js if needed
          <div className="flex flex-col items-center text-center gap-base-16 max-w-[600px]">
            <Image
              src="/images/broker-wizard-promo.svg"
              alt=""
              width={460}
              height={560}
              className="w-full h-auto"
            />
            <p className="text-16 leading-24 font-regular tracking-tight-1 text-blackinverse-a32">
              {t('wizard.promoDescription')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WizardTwoPanelLayout;
