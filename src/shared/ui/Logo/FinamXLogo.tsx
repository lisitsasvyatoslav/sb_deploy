/**
 * FinamXLogo — FINAM X brand logo
 *
 * Figma node: 64547:884
 *
 * Colors resolve automatically from CSS variables — smooth theme transitions included:
 *   text   → var(--texticon-black_inverse_a100): #040405 (light) / #FFFFFF (dark)
 *   accent → var(--brand-primary): purple in finam brand (light/dark variants)
 */

import React from 'react';
import { cn } from '@/shared/utils/cn';
import type { LogoProps } from './Logo.types';

const TEXT_FILL = { fill: 'var(--texticon-black_inverse_a100)' } as const;
const ACCENT_FILL = { fill: 'var(--brand-primary, #7863F6)' } as const;
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
      d="M19.9738 18.1501H16.6059V5.8501H19.9738V18.1501ZM28.3763 5.8501C30.2616 5.8501 31.5684 6.27989 32.3221 7.11285C32.9507 7.81969 33.2773 8.98201 33.2773 10.5727V18.1499H29.9097V10.1945C29.9097 8.98201 29.407 8.47677 28.1754 8.47677H25.2603V18.1501H21.8923V5.8501H28.3763ZM41.9605 5.8501C43.3171 5.8501 44.3224 6.07757 45.0012 6.50663C46.2577 7.31517 46.886 8.88012 46.886 11.2299V18.1501H39.0449C37.562 18.1501 36.4817 17.9226 35.7529 17.4679C34.8481 16.8873 34.3956 15.9029 34.3956 14.5131C34.3956 12.0128 35.803 10.6744 38.8949 10.6744H43.5183V10.4464C43.5183 8.95668 42.8902 8.47677 40.9553 8.47677H35.2752V5.8501H41.9605ZM61.0542 5.8501C63.039 5.8501 64.447 6.27989 65.2265 7.11285C65.8798 7.79508 66.2062 8.88012 66.2062 10.3202V18.1501H62.8384V10.851C62.8384 9.03287 62.3614 8.47677 60.8286 8.47677H59.0444V18.1501H55.676V8.47677H52.0569V18.1501H48.6894V5.8501H61.0542ZM14.5313 5.8501V8.47677H6.94766C5.71612 8.47677 5.21363 8.98201 5.21363 10.1943V11.0728H14.5313V13.6893H5.21363V18.1499H1.84598V10.5727C1.84598 8.98201 2.17259 7.81969 2.80103 7.11285C3.55468 6.27989 4.86168 5.8501 6.74663 5.8501H14.5313ZM39.07 13.3012C38.2409 13.3012 37.8133 13.6796 37.8133 14.4378C37.8133 15.2207 38.316 15.5234 39.6232 15.5234H43.5183V13.3012H39.07Z"
    />
    <path
      className={TRANSITION}
      style={ACCENT_FILL}
      d="M84.8834 11.2844C84.443 11.7247 84.443 12.4386 84.8834 12.879L90.1544 18.1501H85.7431L81.4063 13.8134L77.0695 18.1501H72.7777L78.0488 12.879C78.4892 12.4386 78.4892 11.7247 78.0488 11.2844L72.7778 6.01339H77.0694L81.4063 10.3501L85.7431 6.01339H90.1542L84.8834 11.2844Z"
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
      d="M19.0912 10.8868C18.4324 11.5457 18.4324 12.6139 19.0912 13.2727L26.978 21.1597H20.3777L13.8886 14.6708L7.39972 21.1597H0.978027L8.865 13.2727C9.52382 12.6139 9.52383 11.5457 8.865 10.8868L0.978207 3H7.39954L13.8886 9.48888L20.3777 3H26.9778L19.0912 10.8868Z"
    />
  </svg>
);

const FinamXLogo: React.FC<LogoProps> = ({
  isCollapsed = false,
  className,
}) => (
  <span className={cn('inline-flex shrink-0 items-center', className)}>
    {isCollapsed ? <MiniSvg /> : <FullSvg />}
  </span>
);

export default React.memo(FinamXLogo);
