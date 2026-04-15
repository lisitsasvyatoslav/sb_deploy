import Button from '@/shared/ui/Button';
import { useYandexMetrika } from '@/shared/hooks/useYandexMetrika';
import { useAuthModalStore } from '@/stores/authModalStore';
import { Icon } from '@/shared/ui/Icon';
import { AnimatePresence, m } from 'framer-motion';
import React from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { useDemoChatStore } from '@/stores/demoChatStore';
import { WELCOME_STORAGE_KEYS } from '@/features/welcome/constants';

interface AuthNoticeBannerProps {
  /** Whether to show the banner */
  show: boolean;
  /** Children (input) that will be rendered on top of the banner */
  children: React.ReactNode;
}

const AuthNoticeBanner: React.FC<AuthNoticeBannerProps> = ({
  show,
  children,
}) => {
  const { t } = useTranslation('chat');
  const { openModal } = useAuthModalStore();
  const { trackEvent } = useYandexMetrika();

  const handleRegisterClick = () => {
    try {
      const sparkleId = localStorage.getItem(
        WELCOME_STORAGE_KEYS.DEMO_SPARKLE_CONTEXT
      );
      const messageCount = useDemoChatStore.getState().userMessageCount;

      trackEvent('sparkle_register_click', {
        dialog_id: sparkleId || undefined,
        questions_answered: messageCount || undefined,
      });
    } catch {
      // Ignore localStorage errors
    }

    openModal('register');
  };

  return (
    <div>
      <AnimatePresence initial={false}>
        {show && (
          <m.div
            key="auth-notice"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div
              className="h-[37px] rounded-lg bg-surface-s3 border border-outline-primary_low_em_alpha shadow-top-nav flex items-center justify-between px-2 py-1 pointer-events-auto"
              style={{ color: 'var(--text-primary)' }}
            >
              <span className="text-[10px] font-medium leading-3 tracking-tight truncate">
                {t('authBanner.pleaseLogin')}
              </span>
              <Button
                type="button"
                onClick={handleRegisterClick}
                variant="ghost"
                size="sm"
                icon={<Icon variant="chevronRight" size={16} />}
                iconSide="right"
                className="!p-0 px-1 h-auto shrink-0 !text-[10px] !font-medium !leading-3 ![color:var(--text-primary)]"
                aria-label={t('authBanner.loginAriaLabel')}
              >
                {t('authBanner.login')}
              </Button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
};

export default AuthNoticeBanner;
