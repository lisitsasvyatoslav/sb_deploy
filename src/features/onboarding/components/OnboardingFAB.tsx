'use client';

import { useTranslation } from '@/shared/i18n/client';
import { Icon } from '@/shared/ui/Icon/Icon';

type OnboardingFABProps = {
  onClick: () => void;
};

export const OnboardingFAB = ({ onClick }: OnboardingFABProps) => {
  const { t } = useTranslation('chat');

  return (
    <div className="fixed bottom-[72px] right-4 pointer-events-none z-[1100]">
      <button
        type="button"
        onClick={onClick}
        className="pointer-events-auto size-[40px] rounded-[2px] bg-[#D946C7] backdrop-blur-[12px] flex items-center justify-center shadow-effects-panel hover:brightness-110 transition-all"
        aria-label={t('onboarding.openGuide')}
        title={t('onboarding.openGuide')}
      >
        <Icon variant="questionMarkCircle" size={20} className="text-white" />
      </button>
    </div>
  );
};
