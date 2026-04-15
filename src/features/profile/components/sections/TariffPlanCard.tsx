'use client';

/**
 * TariffPlanCard — tariff plan card in the profile section
 *
 * Figma nodes: 962:238999 (Basic/Active), 962:239000 (Pro), 962:239001 (Premium)
 *
 * Layout variants (per Figma structure):
 *  - basic (active):    header → features; gradient bg + purple dot, no illustration
 *  - pro (recommended): header → illustration+badge (80px, overflow hidden) → features; glow shadow
 *  - premium:           header → illustration (80px SVG) → features; glass bg
 */

import React from 'react';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import { getCurrencySymbol } from '@/features/ticker/utils/currency';
import { currentRegionConfig } from '@/shared/config/region';

type FeatureKey =
  | 'unlimitedDataSources'
  | 'advancedAiAnalysis'
  | 'customizableDashboards'
  | 'securityCompliance';

interface TariffPlanCardProps {
  id: 'basic' | 'pro' | 'premium';
  price: number;
  recommended?: boolean;
  active?: boolean;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  featureKeys: readonly FeatureKey[];
  onChoosePlan?: () => void;
}

// Basic Active — Figma fill_IU7TBW: tile + linear-gradient(-12deg) + white tint + blur(48)
const BASIC_ACTIVE_BG = [
  'linear-gradient(rgba(255,255,255,0.04), rgba(255,255,255,0.04))',
  'linear-gradient(-12deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 0%, transparent) 72%)',
  "url('/images/profile-banner-bg.png')",
].join(', ');

// Pro — Figma fill_UOROLJ: tile + two corner gradients + white tint
const PRO_BG = [
  'linear-gradient(rgba(255,255,255,0.04), rgba(255,255,255,0.04))',
  'linear-gradient(212deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 0%, transparent) 36%)',
  'linear-gradient(25deg, var(--brand-primary) 0%, color-mix(in srgb, var(--brand-primary) 0%, transparent) 31%)',
  "url('/images/profile-banner-bg.png')",
].join(', ');

const TariffPlanCard: React.FC<TariffPlanCardProps> = ({
  id,
  price,
  recommended,
  active,
  icon: IllustrationIcon,
  featureKeys,
  onChoosePlan,
}) => {
  const { t, i18n } = useTranslation('profile');

  // Basic → Title/3XL (20px), Pro/Premium → Title/4XL (24px)
  const priceFontSize = id === 'basic' ? 20 : 24;

  const background = recommended
    ? PRO_BG
    : active
      ? BASIC_ACTIVE_BG
      : 'var(--wrapper-a2, rgba(4,4,5,0.02))';

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        // Basic: stretch (Figma layout_MQY9O8), Pro/Premium: center (layout_5KPR2T)
        alignItems: active ? 'stretch' : 'center',
        width: 256,
        height: 382,
        padding: '12px 14px',
        borderRadius: 4,
        background,
        backdropFilter: recommended ? undefined : 'blur(48px)',
        boxShadow: recommended
          ? `0px 0px 30px -1px var(--brand-primary-glow)`
          : undefined,
      }}
    >
      {/* Active indicator — Figma Ellipse 5766, absolute at x:233 y:12 */}
      {active && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 11,
            height: 11,
            borderRadius: '50%',
            backgroundColor: 'var(--brand-primary)',
            flexShrink: 0,
          }}
        />
      )}

      {/* Section 1: plan name + price — Figma Text_wrap, alignSelf: stretch */}
      <div
        className="flex items-end justify-between gap-5 pt-2"
        style={{ alignSelf: 'stretch' }}
      >
        <div className="flex flex-col min-w-0">
          {/* Title/XL: 16px 600, lh 1.5, ls -2.5% */}
          <span
            className="font-inter font-semibold text-blackinverse-a100"
            style={{
              fontSize: 16,
              lineHeight: '1.5em',
              letterSpacing: '-0.025em',
            }}
          >
            {t(`tariff.plans.${id}.name`)}
          </span>
          {/* Body/S: 10px 400, lh 1.2, ls -2% */}
          <span
            className="font-inter font-normal text-blackinverse-a56"
            style={{
              fontSize: 10,
              lineHeight: '1.2em',
              letterSpacing: '-0.02em',
            }}
          >
            {t(`tariff.plans.${id}.tokens`)}
          </span>
        </div>

        <div className="flex items-end gap-0.5 shrink-0">
          {/* Title/3XL or Title/4XL */}
          <span
            className="font-inter font-semibold text-blackinverse-a100"
            style={{
              fontSize: priceFontSize,
              lineHeight: '1.2em',
              letterSpacing: '-0.02em',
            }}
          >
            {price.toLocaleString(i18n.language)}
            {getCurrencySymbol(currentRegionConfig.baseCurrency)}
          </span>
          {/* Body/S with 4px bottom padding to baseline-align */}
          <span
            className="font-inter font-normal pb-1 text-blackinverse-a56"
            style={{
              fontSize: 10,
              lineHeight: '1.2em',
              letterSpacing: '-0.02em',
            }}
          >
            {t('tariff.perMonth')}
          </span>
        </div>
      </div>

      {/* Section 2: illustration */}

      {/* Pro: illustration + badge label below — Figma Frame 2147224172, height 80px fixed, no clip */}
      {recommended && IllustrationIcon && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 80,
            gap: 10,
            width: 228,
            overflow: 'visible',
          }}
        >
          <IllustrationIcon style={{ width: 228 }} />
          {/* Title/S: 10px 500, lh 1.2, ls -2% */}
          <span
            className="font-inter font-medium text-blackinverse-a100"
            style={{
              fontSize: 10,
              lineHeight: '1.2em',
              letterSpacing: '-0.02em',
            }}
          >
            {t('tariff.recommended')}
          </span>
        </div>
      )}

      {/* Premium: 80px SVG sits directly as flex child — Figma Frame 2147224049 */}
      {!recommended && !active && IllustrationIcon && (
        <IllustrationIcon style={{ width: 228 }} />
      )}

      {/* Section 3: features + CTA — Figma Frame 2147224152/148/154, alignSelf: stretch */}
      <div className="flex flex-col gap-3" style={{ alignSelf: 'stretch' }}>
        {/* Features: gap-1 between items + py-1 each = effective 12px between text lines */}
        <div className="flex flex-col gap-1">
          {featureKeys.map((key) => (
            <div key={key} className="flex items-start gap-1 py-1">
              {/* Figma tick component 878:44981 — 12×12, stroke rgba(255,255,255,0.9) */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
                className="shrink-0 mt-px"
              >
                <path
                  d="M2.09 5.23L5.09 8.54L9.77 3.23"
                  stroke="var(--blackinverse-a100)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* Body/S */}
              <span
                className="font-inter font-normal text-blackinverse-a100"
                style={{
                  fontSize: 10,
                  lineHeight: '1.2em',
                  letterSpacing: '-0.02em',
                }}
              >
                {t(`tariff.features.${key}`)}
              </span>
            </div>
          ))}
        </div>

        {/* buttonGhost/XS — layout_Z81INJ: row, center, gap 2px, py 4px */}
        <Button
          variant="ghost"
          size="xs"
          iconRight="chevronRightSmall"
          onClick={onChoosePlan}
          className="self-start"
        >
          {active ? t('tariff.cancelPlan') : t('tariff.choosePlan')}
        </Button>
      </div>
    </div>
  );
};

export default TariffPlanCard;
