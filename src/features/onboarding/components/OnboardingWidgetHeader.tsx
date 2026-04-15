'use client';

import { useTranslation } from '@/shared/i18n/client';
import { Icon } from '@/shared/ui/Icon/Icon';
import { useOnboardingUIStore } from '../stores/onboardingUIStore';

type OnboardingWidgetHeaderProps = {
  title: string;
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
};

export const OnboardingWidgetHeader = ({
  title,
  onClose,
  onDragStart,
}: OnboardingWidgetHeaderProps) => {
  const { t } = useTranslation('chat');
  const widgetMode = useOnboardingUIStore((s) => s.widgetMode);
  const toggleWidgetMode = useOnboardingUIStore((s) => s.toggleWidgetMode);

  const bgClass =
    widgetMode === 'docked'
      ? 'bg-background-gray_low'
      : 'bg-background-gray_high';

  return (
    <div
      className={`absolute backdrop-blur-[60px] ${bgClass} flex gap-2 items-center left-0 right-0 top-0 z-[4] pl-4 pr-1.5 py-2`}
      onMouseDown={widgetMode === 'floating' ? onDragStart : undefined}
      style={{ cursor: widgetMode === 'floating' ? 'grab' : 'default' }}
    >
      <p className="flex-1 font-semibold text-[14px] leading-[20px] tracking-[-0.2px] text-blackinverse-a100 uppercase truncate min-w-0">
        {title}
      </p>

      <div className="flex items-center shrink-0">
        {/* Minimize/Maximize toggle */}
        <button
          type="button"
          onClick={toggleWidgetMode}
          className="size-[32px] flex items-center justify-center text-blackinverse-a100 hover:text-blackinverse-a100 transition-colors"
          aria-label={
            widgetMode === 'docked'
              ? t('onboarding.undock')
              : t('onboarding.dock')
          }
        >
          <Icon
            variant={widgetMode === 'docked' ? 'collapse' : 'expand'}
            size={20}
          />
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="size-[32px] flex items-center justify-center text-blackinverse-a100 hover:text-blackinverse-a100 transition-colors"
          aria-label={t('onboarding.close')}
        >
          <Icon variant="close" size={20} />
        </button>
      </div>
    </div>
  );
};
