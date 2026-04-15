/**
 * LimexLogo — LIMEX brand logo
 *
 * Figma node: 55063:5409 (dark) / 64550:11698 (light)
 *
 * Colors resolve automatically from CSS variables — smooth theme transitions included:
 *   text   → var(--texticon-black_inverse_a100): #040405 (light) / #FFFFFF (dark)
 *   accent → var(--brand-primary): #18F51E (light) / #A9DC4D (dark)
 */

import React from 'react';
import { cn } from '@/shared/utils/cn';
import type { LogoProps } from './Logo.types';

const TEXT_FILL = { fill: 'var(--texticon-black_inverse_a100)' } as const;
const ACCENT_FILL = { fill: 'var(--brand-primary, #18F51E)' } as const;
const TRANSITION = 'transition-[fill] duration-200';

const FullSvg: React.FC = () => (
  <svg
    width="92"
    height="24"
    viewBox="0 0 92 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      className={TRANSITION}
      style={TEXT_FILL}
      d="M8.31352 6.06726H4.15932V17.9312H14.8098V14.8889H8.31352V6.06726Z"
    />
    <path
      className={TRANSITION}
      style={TEXT_FILL}
      d="M20.3474 6.06726H16.1881V17.9362H20.3474V6.06726Z"
    />
    <path
      className={TRANSITION}
      style={TEXT_FILL}
      d="M30.624 13.5079H30.5685L27.025 6.06726H22.0935V17.9312H25.854V10.986H25.9953L29.2712 17.9312H31.9263L35.2123 10.986H35.3536V17.9312H39.104V6.06726H34.1674L30.624 13.5079Z"
    />
    <path
      className={TRANSITION}
      style={TEXT_FILL}
      d="M40.8455 17.9312H52.2784V15.039H45.0047V13.2527H51.7736V10.6707H45.0047V8.95945H52.2784V6.06726H40.8455V17.9312Z"
    />
    <path
      className={TRANSITION}
      style={TEXT_FILL}
      d="M63.8482 11.9117L68.8403 6.06726H64.0147L61.3042 9.78507H61.1982L58.3866 6.06726H53.445L58.2705 11.8867V11.9267L53.445 17.9312H58.0535L60.966 14.2835H61.0619L64.0198 17.9312H68.8251L63.8482 11.9417V11.9117Z"
    />
    <path
      className={TRANSITION}
      style={ACCENT_FILL}
      d="M4.15925 1.9447H0V6.06782H4.15925V1.9447Z"
    />
    <path
      className={TRANSITION}
      style={ACCENT_FILL}
      d="M4.15925 17.9323H0V22.0554H4.15925V17.9323Z"
    />
    <path
      className={TRANSITION}
      style={ACCENT_FILL}
      d="M72.9991 1.94464H68.8399V6.06776H72.9991V1.94464Z"
    />
    <path
      className={TRANSITION}
      style={ACCENT_FILL}
      d="M72.9991 17.9323H68.8399V22.0554H72.9991V17.9323Z"
    />
  </svg>
);

const MiniSvg: React.FC = () => (
  <svg
    width="28"
    height="24"
    viewBox="0 0 28 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      className={TRANSITION}
      style={ACCENT_FILL}
      d="M27 2.25H20.498V8.75263H27V2.25Z"
    />
    <path
      className={TRANSITION}
      style={ACCENT_FILL}
      d="M7.50197 8.75263V15.2474H20.498L20.498 8.75263H7.50197Z"
    />
    <path
      className={TRANSITION}
      style={ACCENT_FILL}
      d="M7.50197 2.25H1V8.75263H7.50197V2.25Z"
    />
    <path
      className={TRANSITION}
      style={ACCENT_FILL}
      d="M27 15.2474L20.498 15.2474L20.498 21.75H27V15.2474Z"
    />
    <path
      className={TRANSITION}
      style={ACCENT_FILL}
      d="M7.50197 15.2474L1 15.2474V21.75H7.50197V15.2474Z"
    />
  </svg>
);

const LimexLogo: React.FC<LogoProps> = ({ isCollapsed = false, className }) => (
  <span className={cn('inline-flex shrink-0 items-center', className)}>
    {isCollapsed ? <MiniSvg /> : <FullSvg />}
  </span>
);

export default React.memo(LimexLogo);
