'use client';

import Button from '@/shared/ui/Button';
import { privacyPolicyApi } from '@/services/api/privacyPolicy';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/shared/i18n/client';
import { cookieStorage } from '@/shared/utils/cookies';
import { logger } from '@/shared/utils/logger';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

/**
 * Cookie Consent Banner Component
 *
 * Flow:
 * - Guest: no cookie → fetch currentVersion, show banner → accept → set cookie with version
 * - Guest with cookie: version up to date → hide; outdated → show banner
 * - Auth: banner based on local cookie only; sync cookie → DB if not yet recorded
 * - On accept: always set cookie + save to DB if authenticated
 */
const CookieBanner: React.FC = () => {
  const { t } = useTranslation('common');
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(1);
  const { isAuthenticated } = useAuthStore();
  const isSyncing = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const cookieVersion = cookieStorage.getCookiePolicyVersion();

    if (!isAuthenticated) {
      privacyPolicyApi
        .checkCookieConsentStatus()
        .then(({ currentVersion: version }) => {
          if (cancelled) return;
          setCurrentVersion(version);
          if (!cookieVersion || cookieVersion < version) {
            setShow(true);
          }
        })
        .catch(() => {
          if (cancelled) return;
          if (!cookieVersion) setShow(true);
        });
      return () => {
        cancelled = true;
      };
    }

    // Authenticated: banner visibility based on local cookie only,
    // sync local cookie → DB if needed
    privacyPolicyApi
      .checkCookieConsentStatus()
      .then(({ accepted, currentVersion: version }) => {
        if (cancelled) return;
        setCurrentVersion(version);

        if (cookieVersion && cookieVersion >= version) {
          // Local cookie exists and is up to date → hide banner
          // Sync to backend if not already recorded
          if (!accepted && !isSyncing.current) {
            isSyncing.current = true;
            privacyPolicyApi
              .acceptCookieConsent(cookieVersion)
              .catch((err) =>
                logger.error(
                  'CookieBanner',
                  'Failed to sync cookie consent',
                  err
                )
              )
              .finally(() => {
                isSyncing.current = false;
              });
          }
        } else {
          // No local cookie or outdated → show banner regardless of backend state
          setShow(true);
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (!cookieVersion) setShow(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const handleAccept = () => {
    setShow(false);
    cookieStorage.setCookiePolicyAcceptance(currentVersion);

    if (isAuthenticated) {
      privacyPolicyApi.acceptCookieConsent(currentVersion).catch((err) => {
        logger.error('CookieBanner', 'Failed to save cookie consent', err);
      });
    }
  };

  if (!show || pathname === '/cookie-policy') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-md w-full px-4">
      <div className="bg-background-card border border-blackinverse-a12 rounded-[16px] shadow-[0px_2px_6px_0px_rgba(57,57,66,0.03),0px_7px_15px_0px_rgba(57,57,66,0.03)] p-6 flex flex-col gap-4">
        {/* Text content */}
        <div className="flex flex-col gap-2 text-[12px] leading-[16px] text-text-primary tracking-[-0.2px]">
          <p>
            {t('cookie.textBefore')}
            <a
              href="/cookie-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary-500 hover:underline"
            >
              {t('cookie.policyLinkText')}
            </a>
            {t('cookie.textAfter')}
          </p>
        </div>

        {/* Accept button */}
        <Button
          onClick={handleAccept}
          variant="primary"
          size="sm"
          className="w-full"
        >
          {t('cookie.accept')}
        </Button>
      </div>
    </div>
  );
};

export default CookieBanner;
