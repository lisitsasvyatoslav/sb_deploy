import classNames from 'classnames';
import React, { useEffect, useState, FC, SVGProps } from 'react';

import { IconProps } from './Icon.types';
import { getIcon, getCachedIcon } from './iconMap';

type SvgComponent = FC<SVGProps<SVGSVGElement>>;

export const Icon: React.FC<IconProps> = ({
  variant,
  size = 24,
  className,
  ...rest
}) => {
  // Synchronous cache hit — no placeholder, no detached DOM nodes
  const [SvgComponent, setSvgComponent] = useState<SvgComponent | null>(() =>
    getCachedIcon(variant)
  );

  useEffect(() => {
    // If already resolved synchronously, skip the async path
    const cached = getCachedIcon(variant);
    if (cached) {
      setSvgComponent(() => cached);
      return;
    }

    let cancelled = false;
    getIcon(variant).then((component) => {
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
        className={classNames('shrink-0 inline-block', className)}
        aria-hidden
      />
    );
  }

  return (
    <SvgComponent
      width={size}
      height={size}
      className={classNames('shrink-0', className)}
      aria-hidden={rest['aria-label'] ? undefined : true}
      {...rest}
    />
  );
};
