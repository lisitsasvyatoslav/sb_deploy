'use client';

/**
 * Logo — unified region-aware brand logo
 *
 * Figma node: 55322:11931
 *
 * Selects the correct brand logo based on DEPLOYMENT_REGION:
 *   lime  → LimexLogo
 *   finam → FinamXLogo
 *
 * Both variants adapt to light/dark theme automatically via CSS variables.
 */

import React, { useMemo } from 'react';
import { getClientRegionConfig } from '@/shared/config/region';
import LimexLogo from './LimexLogo';
// import FinamXLogo from './FinamXLogo';
import FinamProductLogo from './FinamProductLogo';
import type { LogoProps } from './Logo.types';

const Logo: React.FC<LogoProps> = ({ isCollapsed, className }) => {
  // Region never changes mid-session (requires page reload), so [] deps are correct
  const isLime = useMemo(() => getClientRegionConfig().theme === 'lime', []);
  return isLime ? (
    <LimexLogo isCollapsed={isCollapsed} className={className} />
  ) : (
    // <FinamXLogo
    //   isCollapsed={isCollapsed}
    //   className={className}
    // />
    <FinamProductLogo
      variant="finam-dnevnik"
      isCollapsed={isCollapsed}
      className={className}
    />
  );
};

export default React.memo(Logo);
