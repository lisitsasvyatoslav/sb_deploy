'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/shared/i18n/client';
import type { TFunction } from 'i18next';
import { z } from 'zod';

export const createPasswordSchema = (t: TFunction<'auth'>) =>
  z
    .string()
    .refine(
      (val) =>
        val.length >= 8 &&
        /[A-Z]/.test(val) &&
        /[a-z]/.test(val) &&
        /[0-9]/.test(val) &&
        /[@$!%*#?&-]/.test(val),
      { message: t('validation.passwordRequirements') }
    );

const CloseIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-spacing-20 h-spacing-20 shrink-0"
  >
    <path
      d="M5.31 5.31L14.69 14.69M14.69 5.31L5.31 14.69"
      stroke="var(--color-negative)"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-spacing-20 h-spacing-20 shrink-0 overflow-hidden rounded-radius-2"
  >
    <path
      d="M5 10L8.5 13.5L15 7"
      stroke="var(--color-success)"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ARROW_MASK_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='20' viewBox='0 0 6 20'%3E%3Cpath d='M0.320859 10.7632C2.06192 12.0389 5.06349 12.8512 6 20L6 0C5.06349 7.14882 2.06192 7.96108 0.320859 9.23681C-0.106953 9.55028-0.106953 10.4497 0.320859 10.7632Z' fill='white'/%3E%3C/svg%3E\")";
const PANEL_MASK_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' rx='8' ry='8' fill='white'/%3E%3C/svg%3E\")";

interface ValidationRule {
  test: (password: string) => boolean;
  prefix: string;
  badge: string;
}

interface PasswordValidationPanelProps {
  password: string;
}

const PasswordValidationPanel: React.FC<PasswordValidationPanelProps> = ({
  password,
}) => {
  const { t } = useTranslation('auth');
  const anchorRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<DOMRect | null>(null);

  const validationRules: ValidationRule[] = useMemo(
    () => [
      {
        test: (p) => p.length >= 8,
        prefix: t('validation.min8chars'),
        badge: t('validation.min8charsBadge'),
      },
      {
        test: (p) => /[A-Z]/.test(p),
        prefix: t('validation.atLeastUppercase'),
        badge: t('validation.uppercaseBadge'),
      },
      {
        test: (p) => /[a-z]/.test(p),
        prefix: t('validation.atLeastLowercase'),
        badge: t('validation.lowercaseBadge'),
      },
      {
        test: (p) => /[0-9]/.test(p),
        prefix: t('validation.atLeastDigit'),
        badge: t('validation.digitBadge'),
      },
      {
        test: (p) => /[@$!%*#?&-]/.test(p),
        prefix: t('validation.specialCharPrefix'),
        badge: t('validation.specialCharBadge'),
      },
    ],
    [t]
  );

  const allPassed = validationRules.every((rule) => rule.test(password));
  const visible = !!password && !allPassed;

  useEffect(() => {
    if (!visible || !anchorRef.current) {
      setPos(null);
      return;
    }

    const inputEl = anchorRef.current.parentElement?.querySelector('input');
    if (!inputEl) return;
    const surfaceEl = inputEl.parentElement;
    if (!surfaceEl) return;

    const update = () => setPos(surfaceEl.getBoundingClientRect());
    update();

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    const observer = new ResizeObserver(update);
    const form = anchorRef.current.closest('form');
    if (form) observer.observe(form);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      observer.disconnect();
    };
  }, [visible, password]);

  const panelContent = visible && pos && (
    <div
      className="fixed z-[1400] pointer-events-none"
      style={{
        top: pos.top + pos.height / 2,
        left: pos.right + 8,
        transform: 'translateY(-50%)',
      }}
    >
      <div
        className="bg-blackinverse-a6 backdrop-blur-40 shadow-effects-modal pl-[22px] pr-spacing-16 py-spacing-20 flex flex-col gap-spacing-14"
        style={{
          WebkitMaskImage: `${ARROW_MASK_SVG}, ${PANEL_MASK_SVG}`,
          maskImage: `${ARROW_MASK_SVG}, ${PANEL_MASK_SVG}`,
          WebkitMaskSize: '6px 20px, calc(100% - 6px) 100%',
          maskSize: '6px 20px, calc(100% - 6px) 100%',
          WebkitMaskPosition: 'left center, 6px 0',
          maskPosition: 'left center, 6px 0',
          WebkitMaskRepeat: 'no-repeat, no-repeat',
          maskRepeat: 'no-repeat, no-repeat',
        }}
      >
        {validationRules.map((rule, index) => {
          const passed = rule.test(password);
          return (
            <div
              key={index}
              className="flex items-center gap-spacing-10 whitespace-nowrap"
            >
              {passed ? <CheckIcon /> : <CloseIcon />}
              <div className="flex items-center gap-spacing-6">
                <span className="font-sans text-12 leading-16 tracking-tight-1 font-regular text-blackinverse-a100">
                  {rule.prefix}
                </span>
                <span
                  className={`${passed ? 'bg-blackinverse-a12' : 'bg-blackinverse-a4'} px-spacing-6 py-spacing-4 rounded-radius-2 font-display text-10 leading-12 tracking-tight-1 font-medium text-blackinverse-a100`}
                >
                  {rule.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={anchorRef}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />
      {panelContent && createPortal(panelContent, document.body)}
    </>
  );
};

export default PasswordValidationPanel;
