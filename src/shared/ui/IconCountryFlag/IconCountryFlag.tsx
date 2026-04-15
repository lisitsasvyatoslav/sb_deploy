import classNames from 'classnames';
import React, { FC, SVGProps, useEffect, useState } from 'react';

import { IconCountryFlagProps } from './IconCountryFlag.types';
import { getCachedFlag, getFlag } from './countryFlagMap';

type SvgComponent = FC<SVGProps<SVGSVGElement>>;

export const IconCountryFlag: React.FC<IconCountryFlagProps> = ({
  variant,
  size = 24,
  className,
}) => {
  const [SvgComponent, setSvgComponent] = useState<SvgComponent | null>(() =>
    getCachedFlag(variant)
  );

  useEffect(() => {
    const cached = getCachedFlag(variant);
    if (cached) {
      setSvgComponent(() => cached);
      return;
    }

    setSvgComponent(null);
    let cancelled = false;
    getFlag(variant).then((component) => {
      if (!cancelled && component) {
        setSvgComponent(() => component);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [variant]);

  if (!SvgComponent) {
    return (
      <span
        style={{ width: size, height: size }}
        className={classNames('shrink-0 inline-block rounded-full', className)}
        aria-hidden
      />
    );
  }

  return (
    <SvgComponent
      width={size}
      height={size}
      className={classNames('shrink-0', className)}
      aria-hidden
    />
  );
};
