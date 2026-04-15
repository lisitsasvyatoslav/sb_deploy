'use client';

import { useTranslation } from '@/shared/i18n/client';
import { Icon } from '@/shared/ui/Icon';
import { ONBOARDING_SCENES, ONBOARDING_TOTAL_STEPS } from '../constants';
import { OnboardingProgressBar } from './OnboardingProgressBar';

type OnboardingFooterProps = {
  activeSceneIndex: number;
  completedSteps: number;
  onNext: () => void;
  onPrevious?: () => void;
  isNextDisabled?: boolean;
};

export const OnboardingFooter = ({
  activeSceneIndex,
  completedSteps,
  onNext,
  onPrevious,
  isNextDisabled,
}: OnboardingFooterProps) => {
  const { t } = useTranslation('chat') as {
    t: (key: string, opts?: Record<string, unknown>) => string;
  };
  const currentScene = ONBOARDING_SCENES[activeSceneIndex];
  const isLastScene = activeSceneIndex === ONBOARDING_SCENES.length - 1;
  const isFirstScene = activeSceneIndex === 0;

  // Button label
  const nextLabel = isLastScene
    ? t('onboarding.done')
    : currentScene.nextLabelKey
      ? t(currentScene.nextLabelKey)
      : t('onboarding.next');

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[3] backdrop-blur-[20px] bg-gradient-to-b from-background-gray_faded to-background-gray_low flex flex-col gap-5 items-start justify-center px-4 pb-4 pt-2">
      {/* Next button */}
      <button
        type="button"
        onClick={onNext}
        disabled={isNextDisabled}
        className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-[2px] backdrop-blur-[40px] bg-blackinverse-a8 text-[12px] font-medium leading-[16px] tracking-[-0.2px] text-blackinverse-a100 hover:bg-blackinverse-a12 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
      >
        {nextLabel}
      </button>

      {/* Navigation arrows + Progress row */}
      <div className="flex items-center w-full gap-4">
        {/* Arrows */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevious}
            disabled={isFirstScene}
            title={t('onboarding.previous')}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-blackinverse-a8 text-blackinverse-a100 hover:bg-blackinverse-a12 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
          >
            <Icon variant="chevronLeft" size={14} />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled}
            title={t('onboarding.next')}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-blackinverse-a8 text-blackinverse-a100 hover:bg-blackinverse-a12 transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
          >
            <Icon variant="chevronRight" size={14} />
          </button>
        </div>

        {/* Progress */}
        <p className="flex-1 text-[12px] leading-[16px] tracking-[-0.2px] text-blackinverse-a56">
          {t('onboarding.progress', {
            viewed: completedSteps,
            total: ONBOARDING_TOTAL_STEPS,
          })}
        </p>
        <OnboardingProgressBar
          viewed={completedSteps}
          total={ONBOARDING_TOTAL_STEPS}
        />
      </div>
    </div>
  );
};
