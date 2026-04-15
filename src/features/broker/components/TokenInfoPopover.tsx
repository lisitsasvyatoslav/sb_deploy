import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';
import React, { useRef, useState } from 'react';
import Tooltip from '@/shared/ui/Tooltip';

const TokenInfoPopover: React.FC = () => {
  const { t } = useTranslation('broker');
  const [isOpen, setIsOpen] = useState(false);
  const isHovering = useRef(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex items-center w-full">
      <button
        ref={anchorRef}
        type="button"
        onMouseEnter={() => {
          isHovering.current = true;
          setIsOpen(true);
        }}
        onMouseLeave={() => {
          isHovering.current = false;
          setIsOpen(false);
        }}
        onClick={() => setIsOpen((prev) => !prev)}
        data-testid="token-info-popover"
        className="group/help flex items-center gap-base-6 text-16 leading-24 tracking-tight-1 text-blackinverse-a32"
      >
        <span>{t('enterToken.whatIsToken')}</span>
        <span className="flex items-center justify-center p-base-4 group-hover/help:text-white transition-colors">
          <Icon variant="questionMarkCircle" size={16} />
        </span>
      </button>
      <Tooltip
        content={
          <div className="flex flex-col max-w-[240px]">
            <div className="flex flex-col gap-base-4 px-spacing-8 pt-spacing-8 pb-spacing-4">
              <p className="text-12 leading-16 tracking-tight-1 text-white">
                {t('enterToken.whatIsToken')}
              </p>
              <p className="text-10 leading-12 tracking-tight-1 text-blackinverse-a56 whitespace-pre-line">
                {t('enterToken.tokenIntro')}
                {'\n'}
                {t('enterToken.tokenDescBefore')}
                <strong className="font-semibold">
                  {t('enterToken.tokenDescBold')}
                </strong>
                {t('enterToken.tokenDescAfter')}
                {'\n'}
                {t('enterToken.tokenExampleLabel')}
              </p>
            </div>
            <div className="px-spacing-4 pb-spacing-4">
              <div className="rounded-radius-2 px-spacing-8 py-spacing-6 bg-colors-status_success_bg">
                <p className="text-10 leading-12 tracking-tight-1 font-mono select-all text-colors-status_success_base">
                  {t('enterToken.tokenExample')}
                </p>
              </div>
            </div>
          </div>
        }
        show={isOpen}
        portal
        anchorRef={anchorRef}
        position="right"
        variant="compact"
        className="!whitespace-normal !p-0 !rounded-radius-4 !bg-background-gray_high"
      />
    </div>
  );
};

export default TokenInfoPopover;
