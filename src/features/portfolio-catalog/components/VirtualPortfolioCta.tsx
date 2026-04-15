// TODO: This component is not yet used — will be wired into the catalog page in the next task
'use client';

import React from 'react';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';

interface VirtualPortfolioCtaProps {
  onClick?: () => void;
}

/**
 * VirtualPortfolioCta — CTA card for creating virtual/analytical portfolio
 *
 * Figma node: 3664:32431
 *
 * Gradient border trick (3 background layers):
 * 1. brand-bg (semi-transparent purple tint) on padding-box — visible fill
 * 2. bg-base (opaque dark) on padding-box — blocks gradient bleed-through
 * 3. gradient on border-box — visible only through 1px transparent border
 */
const VirtualPortfolioCta: React.FC<VirtualPortfolioCtaProps> = ({
  onClick,
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="p-3 px-2">
      <div
        className="flex items-center gap-[9px] p-[10px_8px] rounded"
        style={{
          border: '1px solid transparent',
          backgroundImage: `
            linear-gradient(var(--brand-bg), var(--brand-bg)),
            linear-gradient(var(--bg-base), var(--bg-base)),
            linear-gradient(156deg, #8A7CF8 0%, #1B144E 100%)
          `,
          backgroundOrigin: 'padding-box, padding-box, border-box',
          backgroundClip: 'padding-box, padding-box, border-box',
        }}
      >
        <div className="flex flex-col gap-1 flex-1">
          <span className="text-12 leading-16 font-normal tracking-tight-1 text-blackinverse-a100">
            {t('portfolioCatalog.virtualCta.title')}
          </span>
          <span className="text-[10px] leading-12 font-normal tracking-tight-2 text-blackinverse-a56">
            {t('portfolioCatalog.virtualCta.description')}
          </span>
        </div>
        <Button
          variant="ghost"
          size="xs"
          icon="plus"
          onClick={onClick}
          aria-label="Create virtual portfolio"
        />
      </div>
    </div>
  );
};

export default VirtualPortfolioCta;
