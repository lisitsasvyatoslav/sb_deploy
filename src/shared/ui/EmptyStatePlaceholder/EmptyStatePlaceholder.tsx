'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslation } from '@/shared/i18n/client';

interface EmptyStatePlaceholderProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * EmptyStatePlaceholder - placeholder for development pages
 * Used on pages: Strategies, Execution, Learning
 * Figma: https://www.figma.com/design/DjwUE4wL1Jd0CH3vTPPebE/%E2%9C%8F%EF%B8%8F-Diary?node-id=4160-76286&m=dev
 */
export const EmptyStatePlaceholder: React.FC<EmptyStatePlaceholderProps> = ({
  title,
  subtitle,
  className = '',
}) => {
  const { t } = useTranslation('common');
  const displayTitle = title ?? t('emptyState.title');
  const displaySubtitle = subtitle ?? t('emptyState.subtitle');
  return (
    <div
      className={`theme-surface flex flex-col items-center justify-center gap-[40px] pb-[32px] min-h-[calc(100vh-200px)] ${className}`}
    >
      {/* decorative: no-theme -- illustration colors are design-specific and don't change with theme */}
      {/* Illustration */}
      <div className="h-[240px] relative w-[560px]">
        {/* Central mockup */}
        <div className="absolute h-[240px] left-1/2 top-0 -translate-x-1/2 w-[156px]">
          {/* Shadow */}
          <div className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-[120px] h-[30px] rounded-[16px] opacity-50 blur-[27px] bg-[rgba(95,112,149,0.3)] mix-blend-multiply" />
          {/* Background with gradient */}
          <div className="absolute h-[240px] w-[156px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[24px] border-2 border-[rgba(185,198,223,0.5)] bg-[linear-gradient(56.98deg,rgb(255,255,255)_59.97%,rgb(124,75,229)_99.72%)]" />
          {/* Inner white card */}
          <div className="absolute bg-surface-medium border-2 border-[rgba(185,198,223,0.5)] h-[188px] w-[136px] left-1/2 top-[calc(50%-16px)] -translate-x-1/2 -translate-y-1/2 rounded-[14px]" />{' '}
          {/* decorative: no-theme -- border is illustration-specific */}
          {/* Numbers grid - flex-wrap with fixed row height */}
          <div className="absolute box-border flex flex-wrap gap-[8px] h-[122px] items-start left-[10px] p-[16px] top-[10px] w-[136px]">
            <div className="basis-0 bg-[rgba(81,194,117,0.25)] flex gap-[8px] grow items-center justify-center max-w-[32px] min-w-[25px] relative rounded-[8px] shrink-0 h-[calc((100%-16px)/3)]">
              <p className="font-['JetBrains_Mono'] font-bold leading-normal relative shrink-0 text-gray-500 text-[6px] whitespace-nowrap">
                100%
              </p>
            </div>
            <div className="basis-0 bg-[rgba(81,194,117,0.25)] flex gap-[8px] grow items-center justify-center max-w-[32px] min-w-[25px] relative rounded-[8px] shrink-0 h-[calc((100%-16px)/3)]">
              <p className="font-['JetBrains_Mono'] font-bold leading-normal relative shrink-0 text-gray-500 text-[6px] whitespace-nowrap">
                88%
              </p>
            </div>
            <div className="basis-0 bg-[rgba(148,108,243,0.25)] flex gap-[8px] grow items-center justify-center max-w-[32px] min-w-[25px] relative rounded-[8px] shrink-0 h-[calc((100%-16px)/3)]">
              <p className="font-['JetBrains_Mono'] font-bold leading-normal relative shrink-0 text-gray-500 text-[6px] whitespace-nowrap">
                24.8%
              </p>
            </div>
            <div className="basis-0 bg-[rgba(81,194,117,0.25)] flex gap-[8px] grow items-center justify-center max-w-[32px] min-w-[25px] relative rounded-[8px] shrink-0 h-[calc((100%-16px)/3)]">
              <p className="font-['JetBrains_Mono'] font-bold leading-normal relative shrink-0 text-gray-500 text-[6px] whitespace-nowrap">
                98%
              </p>
            </div>
            <div className="basis-0 bg-[rgba(81,194,117,0.25)] flex gap-[8px] grow items-center justify-center max-w-[32px] min-w-[25px] relative rounded-[8px] shrink-0 h-[calc((100%-16px)/3)]">
              <p className="font-['JetBrains_Mono'] font-bold leading-normal relative shrink-0 text-gray-500 text-[6px] whitespace-nowrap">
                96%
              </p>
            </div>
            <div className="basis-0 bg-[rgba(227,97,42,0.25)] flex gap-[8px] grow items-center justify-center max-w-[32px] min-w-[25px] relative rounded-[8px] shrink-0 h-[calc((100%-16px)/3)]">
              <p className="font-['JetBrains_Mono'] font-bold leading-normal relative shrink-0 text-gray-500 text-[6px] whitespace-nowrap">
                24%
              </p>
            </div>
            <div className="basis-0 bg-[rgba(81,194,117,0.25)] flex gap-[8px] grow items-center justify-center max-w-[32px] min-w-[25px] relative rounded-[8px] shrink-0 h-[calc((100%-16px)/3)]">
              <p className="font-['JetBrains_Mono'] font-bold leading-normal relative shrink-0 text-gray-500 text-[6px] whitespace-nowrap">
                90%
              </p>
            </div>
            <div className="basis-0 bg-[rgba(81,194,117,0.25)] flex gap-[8px] grow items-center justify-center max-w-[32px] min-w-[25px] relative rounded-[8px] shrink-0 h-[calc((100%-16px)/3)]">
              <p className="font-['JetBrains_Mono'] font-bold leading-normal relative shrink-0 text-gray-500 text-[6px] whitespace-nowrap">
                32.4%
              </p>
            </div>
            <div className="basis-0 bg-gray-100 flex gap-[8px] grow items-center justify-center max-w-[32px] min-w-[25px] relative rounded-[8px] shrink-0 h-[calc((100%-16px)/3)]">
              <Image
                src="/images/placeholders/AddIcon.svg"
                alt=""
                className="w-3 h-3"
                width={12}
                height={12}
              />
            </div>
          </div>
          {/* Bottom rows */}
          <div className="absolute flex flex-col gap-[4px] left-1/2 -translate-x-1/2 top-[162px] w-[104px]">
            <div className="bg-[rgba(185,198,223,0.7)] h-[4px] w-[42px] rounded-[2px]" />
            <div className="bg-[rgba(185,198,223,0.7)] h-[4px] w-full rounded-[2px] opacity-40" />
            <div className="bg-[rgba(185,198,223,0.7)] h-[4px] w-full rounded-[2px] opacity-40" />
          </div>
          {/* Bottom button */}
          <div className="absolute bottom-[11px] left-1/2 -translate-x-1/2 w-[64px] h-[20px] rounded-[10px] flex items-center justify-center px-[16px] py-[9px] overflow-hidden bg-[linear-gradient(to_bottom,#ebeff5_27.27%,#b9c6df_127.27%)]">
            <div className="bg-surface-medium h-full w-full rounded-[2px]" />
          </div>
        </div>

        {/* Feature cards - positioned absolutely */}
        {/* Top left */}
        <div className="absolute bg-surface-medium border-2 border-[rgba(185,198,223,0.5)] h-[48px] w-[140px] left-[32px] top-[20px] rounded-[16px]">
          {' '}
          {/* decorative: no-theme -- border is illustration-specific */}
          <div className="absolute left-[4px] top-1/2 -translate-y-1/2 w-[40px] h-[40px]">
            <Image
              src="/images/placeholders/BrainIcon.svg"
              alt=""
              className="w-full h-full"
              width={40}
              height={40}
            />
          </div>
          <div className="absolute left-[54px] top-1/2 -translate-y-1/2 flex flex-col gap-[4px]">
            <div className="bg-[rgba(185,198,223,0.7)] h-[4px] w-[32px] rounded-[2px]" />
            <div className="bg-[rgba(185,198,223,0.7)] h-[4px] w-[64px] rounded-[2px] opacity-40" />
          </div>
        </div>

        {/* Middle left */}
        <div className="absolute bg-surface-medium border-2 border-[rgba(185,198,223,0.5)] h-[48px] w-[140px] left-0 top-1/2 -translate-y-1/2 rounded-[16px]">
          {' '}
          {/* decorative: no-theme -- border is illustration-specific */}
          <div className="absolute left-[4px] top-1/2 -translate-y-1/2 w-[40px] h-[40px]">
            <Image
              src="/images/placeholders/ImageIcon.svg"
              alt=""
              className="w-full h-full"
              width={40}
              height={40}
            />
          </div>
          <div className="absolute left-[54px] top-1/2 -translate-y-1/2 flex flex-col gap-[4px]">
            <div className="bg-[rgba(185,198,223,0.7)] h-[4px] w-[32px] rounded-[2px]" />
            <div className="bg-[rgba(185,198,223,0.7)] h-[4px] w-[64px] rounded-[2px] opacity-40" />
          </div>
        </div>

        {/* Bottom left */}
        <div className="absolute bg-surface-medium border-2 border-[rgba(185,198,223,0.5)] h-[48px] w-[140px] left-[32px] bottom-[20px] rounded-[16px]">
          {' '}
          {/* decorative: no-theme -- border is illustration-specific */}
          <div className="absolute left-[4px] top-1/2 -translate-y-1/2 w-[40px] h-[40px]">
            <Image
              src="/images/placeholders/ArrowsHorizontalIcon.svg"
              alt=""
              className="w-full h-full"
              width={40}
              height={40}
            />
          </div>
          <div className="absolute left-[54px] top-1/2 -translate-y-1/2 flex flex-col gap-[4px]">
            <div className="bg-[rgba(185,198,223,0.7)] h-[4px] w-[32px] rounded-[2px]" />
            <div className="bg-[rgba(185,198,223,0.7)] h-[4px] w-[64px] rounded-[2px] opacity-40" />
          </div>
        </div>

        {/* Top right */}
        <div className="absolute bg-surface-medium border-2 border-[rgba(185,198,223,0.5)] h-[48px] w-[140px] right-[32px] top-[20px] rounded-[16px]">
          {' '}
          {/* decorative: no-theme -- border is illustration-specific */}
          <div className="absolute left-[4px] top-1/2 -translate-y-1/2 w-[40px] h-[40px]">
            <Image
              src="/images/placeholders/FlagIcon.svg"
              alt=""
              className="w-full h-full"
              width={40}
              height={40}
            />
          </div>
          <div className="absolute left-[54px] top-1/2 -translate-y-1/2 flex flex-col gap-[4px]">
            <div className="bg-[rgba(185,198,223,0.7)] h-[4px] w-[32px] rounded-[2px]" />
            <div className="bg-[rgba(185,198,223,0.7)] h-[4px] w-[64px] rounded-[2px] opacity-40" />
          </div>
        </div>

        {/* Middle right */}
        <div className="absolute bg-surface-medium border-2 border-[rgba(185,198,223,0.5)] h-[48px] w-[140px] right-0 top-1/2 -translate-y-1/2 rounded-[16px]">
          {' '}
          {/* decorative: no-theme -- border is illustration-specific */}
          <div className="absolute left-[4px] top-1/2 -translate-y-1/2 w-[40px] h-[40px]">
            <Image
              src="/images/placeholders/ListIcon.svg"
              alt=""
              className="w-full h-full"
              width={40}
              height={40}
            />
          </div>
          <div className="absolute left-[54px] top-1/2 -translate-y-1/2 flex flex-col gap-[4px]">
            <div className="bg-[rgba(185,198,223,0.7)] h-[4px] w-[32px] rounded-[2px]" />
            <div className="bg-[rgba(185,198,223,0.7)] h-[4px] w-[64px] rounded-[2px] opacity-40" />
          </div>
        </div>

        {/* Bottom right */}
        <div className="absolute bg-surface-medium border-2 border-[rgba(185,198,223,0.5)] h-[48px] w-[140px] right-[32px] bottom-[20px] rounded-[16px]">
          {' '}
          {/* decorative: no-theme -- border is illustration-specific */}
          <div className="absolute left-[4px] top-1/2 -translate-y-1/2 w-[40px] h-[40px]">
            <Image
              src="/images/placeholders/ChartBarIcon.svg"
              alt=""
              className="w-full h-full"
              width={40}
              height={40}
            />
          </div>
          <div className="absolute left-[54px] top-1/2 -translate-y-1/2 flex flex-col gap-[4px]">
            <div className="bg-[rgba(185,198,223,0.7)] h-[4px] w-[32px] rounded-[2px]" />
            <div className="bg-[rgba(185,198,223,0.7)] h-[4px] w-[64px] rounded-[2px] opacity-40" />
          </div>
        </div>
      </div>

      {/* Text content */}
      <div className="flex flex-col gap-[24px] items-center">
        <div className="flex flex-col gap-[8px] items-center justify-center text-center w-[400px] px-[32px]">
          <h2 className="font-inter font-semibold text-[20px] leading-[24px] tracking-[-0.4px] theme-text-primary">
            {displayTitle}
          </h2>
          <p className="font-inter font-normal text-[14px] leading-[20px] tracking-[-0.2px] theme-text-secondary">
            {displaySubtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
