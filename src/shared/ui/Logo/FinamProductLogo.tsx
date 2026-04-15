'use client';

/**
 * FinamProductLogo — Finam product family logos
 *
 * Figma nodes:
 *   finam-diary    → 60367:42971
 *   finam-dnevnik  → 65195:108123
 *   finam-space    → 60367:42992
 *
 * Layout (matches Figma exactly):
 *   flex row, items-end, gap 6.5px
 *   ├── gradient flame icon (26×24, single Union path)
 *   └── flex col, items-start, gap 2.8px
 *       ├── ФИНАМ wordmark (52×10, SVG path from Figma Logo/Master)
 *       └── subtitle text (6.94px, 600, tracking 0.694px, uppercase)
 *
 * isCollapsed=true → flame icon only (26×24)
 */

import React, { useId } from 'react';
import { cn } from '@/shared/utils/cn';
import type { FinamProductVariant, FinamProductLogoProps } from './Logo.types';

const SUBTITLE: Record<FinamProductVariant, string> = {
  'finam-diary': 'Diary',
  'finam-dnevnik': 'Дневник',
  'finam-space': 'space',
};

// Single merged Union flame path from Figma (viewBox 0 0 26.0605 24)
const UNION_PATH =
  'M26.0605 10.3633C26.0605 10.3633 24.6671 12.7277 22.5459 14.3643C19.2371 16.9171 16.4089 16.9106 14.0605 18.9092C11.7125 20.9075 10.7683 23.0301 10.5459 24L7.81836 21.8789C8.04064 20.9092 8.98495 18.7865 11.333 16.7881C13.6813 14.7895 16.6636 14.9832 19.8184 12.2422C22.9728 9.50138 23.333 8.24219 23.333 8.24219L26.0605 10.3633ZM24.1211 2.96973C24.1119 3.00685 22.8928 7.89161 18.5459 11.333C15.2693 13.927 12.4089 13.8803 10.0605 15.8789C7.71242 17.8774 6.76811 20.0001 6.5459 20.9697L3.81836 18.8486C4.04058 17.8789 4.98566 15.7564 7.33398 13.7578C9.6823 11.7593 12.6637 11.9529 15.8184 9.21191C20.4055 5.22636 21.3875 0.879993 21.3945 0.848633L24.1211 2.96973ZM19.333 2.12109C19.333 2.12109 18.4243 5.03015 14.7275 8.24219C11.5728 10.9832 8.59052 10.7895 6.24219 12.7881C3.89403 14.7866 2.94975 16.9092 2.72754 17.8789L0 15.7578C0.222223 14.7881 1.1673 12.6656 3.51562 10.667C5.86393 8.66853 8.84533 8.86203 12 6.12109C15.6969 2.90898 16.6064 0 16.6064 0L19.333 2.12109Z';

// ФИНАМ wordmark paths — Figma "Logo/Master" node (viewBox 0 0 52.4174 10.0175)
const FINAM_WORDMARK_PATH =
  'M15.9457 5.84046V0.796511H13.6671V9.2046H15.9457L19.3821 4.17945V9.2046H21.6515V0.796511H19.3752L15.9457 5.84046ZM8.83481 0.794184H7.47829V0H5.20661V0.801228H3.85008C1.40738 0.794185 0 2.37319 0 5.12356C0 7.65138 1.40738 9.19994 4.05344 9.19994H5.20892V10.0175H7.4806V9.19994H8.63606C9.97647 9.19994 10.9956 8.80163 11.6889 8.06366C12.3822 7.3257 12.6896 6.37694 12.6896 5.12356C12.6849 2.37319 11.2775 0.794184 8.83481 0.794184ZM5.20661 7.52253H4.66354C3.10363 7.52253 2.32252 6.5854 2.32252 4.94553C2.32252 3.41338 3.08746 2.4833 4.49484 2.4833H5.20661V7.52253ZM8.0214 7.52253H7.47829V2.49034H8.19236C9.59976 2.49034 10.3624 3.45551 10.3624 4.95251C10.3624 6.5854 9.58128 7.52253 8.0214 7.52253ZM28.8085 4.17945H25.3698V0.796511H23.1097V9.2046H25.3791V5.84046H28.8178V9.2046H31.0872V0.796511H28.8178L28.8085 4.17945ZM50.3283 0.801228C49.4501 0.801228 48.907 1.26973 48.6366 2.10611L47.1438 6.69086L45.6278 2.10844C45.3574 1.2674 44.8166 0.803555 43.9361 0.803555H41.8563V9.19994H44.1395V3.27981L46.0669 9.19994H48.2207L50.148 3.27981V9.19994H52.4174V0.805882L50.3283 0.801228ZM39.2587 1.25338C38.8358 0.960518 38.1911 0.784814 37.3083 0.784814H32.7857V2.4833H36.5919C37.8629 2.4833 38.3413 2.92136 38.3413 3.9686V4.18178H35.2284C34.2301 4.18178 33.4836 4.38088 32.9937 4.89629C32.7652 5.13293 32.5861 5.41378 32.467 5.72208C32.3479 6.03043 32.2913 6.35985 32.3004 6.69086C32.3004 7.56705 32.6309 8.24408 33.1902 8.65642C33.6801 9.0172 34.3911 9.19756 35.3232 9.19756H40.442V4.51212C40.442 2.91199 40.056 1.80155 39.2587 1.25338ZM38.3344 7.52957H35.3578C34.8009 7.52957 34.341 7.32104 34.341 6.70489C34.341 6.0349 34.7477 5.84983 35.3578 5.84983H38.3621L38.3344 7.52957Z';

const TEXT_FILL = { fill: 'var(--texticon-black_inverse_a100)' } as const;
const TEXT_COLOR = { color: 'var(--texticon-black_inverse_a100)' } as const;
const FILL_TRANSITION = 'transition-[fill] duration-200';
const COLOR_TRANSITION = 'transition-[color] duration-200';

const FlameIcon: React.FC<{ gradientId: string }> = ({ gradientId }) => (
  <svg
    width="26"
    height="24"
    viewBox="0 0 26.0605 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient
        id={gradientId}
        x1="21.0925"
        y1="0"
        x2="1.13307"
        y2="0"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FEDA3B" />
        <stop offset="0.47" stopColor="#EF5541" />
        <stop offset="0.815" stopColor="#821EE0" />
        <stop offset="0.98" stopColor="#7F2A8A" />
      </linearGradient>
    </defs>
    <path d={UNION_PATH} fill={`url(#${gradientId})`} />
  </svg>
);

const FinamWordmark: React.FC = () => (
  <svg
    width="52"
    height="10"
    viewBox="0 0 52.4174 10.0175"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      className={FILL_TRANSITION}
      d={FINAM_WORDMARK_PATH}
      style={TEXT_FILL}
    />
  </svg>
);

const FullLogo: React.FC<{ subtitle: string; gradientId: string }> = ({
  subtitle,
  gradientId,
}) => (
  <span
    className="inline-flex items-end h-spacing-24"
    style={{ gap: '6.5px' /* no token */ }}
  >
    <FlameIcon gradientId={gradientId} />
    <span
      className="inline-flex flex-col items-start"
      style={{ gap: '2.8px' /* no token */ }}
    >
      <FinamWordmark />
      <span
        className={cn(
          'font-body font-semibold uppercase whitespace-nowrap',
          COLOR_TRANSITION
        )}
        style={{
          ...TEXT_COLOR,
          fontSize: '6.94px', // no token (smallest: 8px)
          lineHeight: '7.7px', // no token (smallest: 12px)
          letterSpacing: '0.694px', // no token
        }}
      >
        {subtitle}
      </span>
    </span>
  </span>
);

const FinamProductLogo: React.FC<FinamProductLogoProps> = ({
  variant,
  isCollapsed = false,
  className,
}) => {
  const id = useId();
  const gradientId = `finam-prod-${id.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const subtitle = SUBTITLE[variant];

  return (
    <span className={cn('inline-flex shrink-0 items-center', className)}>
      {isCollapsed ? (
        <FlameIcon gradientId={gradientId} />
      ) : (
        <FullLogo subtitle={subtitle} gradientId={gradientId} />
      )}
    </span>
  );
};

export default React.memo(FinamProductLogo);
