'use client';

import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/shared/i18n/client';
import { Logo } from '@/shared/ui/Logo';
import { Icon } from '@/shared/ui/Icon/index';
import Button from '@/shared/ui/Button';

interface MobileGuardProps {
  children: React.ReactNode;
}

const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
];
const STUB_URL = `${process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://beta.comon.ru'}/login`;

/**
 * MobileGuard — shows a "desktop only" stub screen on viewports < 800px.
 * Uses CSS media queries for SSR-safe show/hide (no hydration mismatch).
 *
 * Figma node: 3272:16125 (Registration file)
 */
export function MobileGuard({ children }: MobileGuardProps) {
  const pathname = usePathname();
  const { t } = useTranslation('common');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(STUB_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable in this context
    }
  }, []);

  const handleSendLink = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: STUB_URL });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        // Other share failures — fall through to clipboard
      }
    }
    await copyToClipboard();
  }, [copyToClipboard]);

  // On auth routes show the form directly on mobile — no stub needed
  if (AUTH_ROUTES.includes(pathname ?? '')) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Shown only on < 800px via globals.css media query */}
      <div className="mobile-guard-stub">
        {/* Logo + text + input + button grouped in center */}
        <div className="flex flex-col justify-center w-full max-w-[361px] flex-1 gap-spacing-40">
          {/* Center: logo + title + subtitle */}
          <div className="flex flex-col items-center gap-spacing-32">
            <Logo />
            <div className="flex flex-col items-center gap-spacing-12 text-center">
              <h1 className="text-20 font-semibold leading-6 tracking-[-0.4px] text-blackinverse-a100 text-center">
                {t('mobileStub.title')}
              </h1>
              <p className="text-16 font-normal leading-6 tracking-[-0.2px] text-blackinverse-a56 text-center">
                {t('mobileStub.subtitle')}
              </p>
            </div>
          </div>

          {/* URL input + send button */}
          <div className="flex flex-col gap-spacing-16">
            {/* URL row with copy icon */}
            <div className="flex items-center gap-spacing-8 px-spacing-16 h-12 rounded-[var(--Radius-radius-2,2px)] border border-[var(--border-light)] bg-[var(--bg-card)]">
              <span className="flex-1 text-14 text-[var(--text-secondary)] truncate min-w-0">
                {STUB_URL}
              </span>
              <button
                type="button"
                onClick={copyToClipboard}
                className="shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label={t('mobileStub.copyLink')}
              >
                <Icon variant="copy" size={20} />
              </button>
            </div>

            {/* Send / share button */}
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={handleSendLink}
            >
              {copied ? t('mobileStub.copied') : t('mobileStub.sendLink')}
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden on < 800px via globals.css media query */}
      <div className="mobile-guard-content">{children}</div>
    </>
  );
}
