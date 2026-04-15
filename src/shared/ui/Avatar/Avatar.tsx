'use client';

import React, { useCallback, useEffect, useState } from 'react';
import BaseImage from '@/shared/ui/BaseImage';
import { cn } from '@/shared/utils/cn';

export type AvatarSizePreset = 'XL' | 'L' | 'M' | 'S';

/** Preset name or a custom pixel value (e.g. 20). */
export type AvatarSize = AvatarSizePreset | number;

export interface AvatarProps {
  /** Image URL. When absent or on load error, falls back to initials placeholder. */
  src?: string | null;
  /** User's full name — used to derive initials for the placeholder. */
  name?: string;
  /** Explicit initials override (max 2 characters). Takes priority over `name`. */
  initials?: string;
  /** Size preset or custom pixel value. Default: 'M' */
  size?: AvatarSize;
  /** Alt text for the image. Falls back to `name` if not provided. */
  alt?: string;
  /** Show initials on the placeholder. When false, only the gradient background is shown. Default: true */
  showInitials?: boolean;
  /** Additional CSS classes */
  className?: string;
  'data-testid'?: string;
}

/** Pixel dimensions for each preset — single source of truth used by SIZE_CONFIG and pxSize. */
const SIZE_PX: Record<AvatarSizePreset, number> = {
  XL: 104,
  L: 72,
  M: 48,
  S: 32,
};

const SIZE_CONFIG: Record<AvatarSizePreset, { box: string; text: string }> = {
  XL: {
    // 104px — no spacing token exists (scale ends at 80px); TODO: add if Figma exports it
    box: 'w-[104px] h-[104px]',
    text: 'text-48 font-medium leading-64',
  },
  L: {
    box: 'w-spacing-72 h-spacing-72', // 72px
    // 28px font — no text-28 token; line-height 36px — no leading-36 token
    // TODO: run `npm run update-tokens` if these values appear in Figma variable export
    text: 'text-[28px] font-medium leading-[36px]',
  },
  M: {
    box: 'w-spacing-48 h-spacing-48', // 48px
    text: 'text-20 font-medium leading-24',
  },
  S: {
    box: 'w-spacing-32 h-spacing-32', // 32px
    text: 'text-14 font-medium leading-20',
  },
};

// Inline style is intentional: Tailwind cannot purge dynamically interpolated arbitrary values at build time
function getCustomSizeConfig(px: number): {
  box: string;
  text: string;
  style: React.CSSProperties;
} {
  const fontSize = Math.max(Math.round(px * 0.45), 8);
  const lineHeight = Math.round(fontSize * 1.2);
  return {
    box: '',
    text: 'font-medium',
    style: {
      width: px,
      height: px,
      fontSize,
      lineHeight: `${lineHeight}px`,
    },
  };
}

const PLACEHOLDER_BG = 'bg-brand-base';
const PLACEHOLDER_TEXT_COLOR = 'text-brand-text___icon';

function getInitials(name?: string, explicitInitials?: string): string {
  if (explicitInitials) return explicitInitials.slice(0, 2).toUpperCase();

  if (!name?.trim()) return '';

  const parts = name.trim().split(/\s+/);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return parts[0][0].toUpperCase();
}

/**
 * Avatar — circular user avatar with image or initials placeholder.
 *
 * Figma node: 9315:3816
 *
 * Modes:
 * - Image: pass `src` for a circular photo. On load error, falls back to initials.
 * - Placeholder: when `src` is absent/null, renders initials on a gradient background.
 *
 * Sizes: XL (104px), L (72px), M (48px), S (32px), or any custom pixel value
 */
const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  initials: explicitInitials,
  size = 'M',
  alt,
  showInitials = true,
  className,
  'data-testid': dataTestId,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [src]);

  const handleLoad = useCallback(() => setImgLoaded(true), []);
  const handleError = useCallback(() => setImgError(true), []);

  const sizeConfig =
    typeof size === 'number' ? getCustomSizeConfig(size) : SIZE_CONFIG[size];
  const customStyle =
    'style' in sizeConfig && !!sizeConfig.style ? sizeConfig.style : undefined;
  const pxSize = typeof size === 'number' ? size : SIZE_PX[size];
  const hasSrc = !!src && !imgError;
  const derivedInitials = getInitials(name, explicitInitials);
  const altText = alt || name || 'Avatar';

  return (
    <div
      role="img"
      aria-label={altText}
      data-testid={dataTestId}
      style={customStyle}
      className={cn(
        'rounded-full flex-shrink-0 overflow-hidden relative',
        'flex flex-col items-center justify-center',
        'select-none',
        sizeConfig.box,
        sizeConfig.text,
        PLACEHOLDER_BG,
        PLACEHOLDER_TEXT_COLOR,
        className
      )}
    >
      {showInitials && (!hasSrc || !imgLoaded) && derivedInitials}
      {hasSrc && (
        <BaseImage
          src={src}
          alt={altText}
          fill
          sizes={`${pxSize}px`}
          onLoad={handleLoad}
          onError={handleError}
          className="object-cover rounded-full"
        />
      )}
    </div>
  );
};

export default React.memo(Avatar);
