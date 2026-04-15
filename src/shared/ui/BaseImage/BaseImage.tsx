import classNames from 'classnames';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export type BaseImageStatus = 'loading' | 'loaded' | 'error';

export interface BaseImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'onLoad' | 'onError' | 'placeholder'
> {
  /** Callback fired when image loads successfully */
  onLoad?: () => void;
  /** Callback fired when image fails to load */
  onError?: () => void;

  // ─── Placeholder (while loading) ───
  /** What to show while image is loading. 'skeleton' = animate-pulse div. ReactNode = custom. */
  placeholder?: 'skeleton' | React.ReactNode;

  // ─── Fallback (on error) ───
  /** What to show when image fails to load. ReactNode = custom fallback UI. */
  fallback?: React.ReactNode;

  // ─── next/image mode ───
  /** Use next/image instead of <img> for automatic optimization (WebP/AVIF, lazy load). Default: false */
  optimized?: boolean;
  /** Enable fill mode for next/image (requires parent with position: relative). */
  fill?: boolean;
}

/**
 * BaseImage — reusable image component with fade-in, placeholder, fallback, and optional next/image.
 *
 * Features:
 * - Fade-in animation on load (opacity 0 → 1, 300ms)
 * - Optional skeleton/custom placeholder while loading
 * - Optional fallback UI on error
 * - Optional next/image optimization (optimized prop)
 * - Resets loading state automatically when `src` changes
 *
 * Figma node: 55086:5323
 */
const BaseImage: React.FC<
  BaseImageProps & { ref?: React.Ref<HTMLImageElement>; sizes?: string }
> = ({
  src,
  onLoad: onLoadProp,
  onError: onErrorProp,
  placeholder,
  fallback,
  optimized = true,
  fill,
  className,
  width,
  height,
  alt = '',
  sizes,
  ref,
  ...props
}) => {
  const [status, setStatus] = useState<BaseImageStatus>('loading');

  useEffect(() => {
    setStatus('loading');
  }, [src]);

  const onLoadRef = useRef(onLoadProp);
  onLoadRef.current = onLoadProp;
  const onErrorRef = useRef(onErrorProp);
  onErrorRef.current = onErrorProp;

  const handleLoad = useCallback(() => {
    setStatus('loaded');
    onLoadRef.current?.();
  }, []);

  const handleError = useCallback(() => {
    setStatus('error');
    onErrorRef.current?.();
  }, []);

  // Bail out early when src is missing or empty to avoid browser warnings
  if (!src) {
    if (fallback) return <>{fallback}</>;
    return null;
  }

  const needsWrapper = !!placeholder || !!fallback;

  // When wrapped: className (sizes, radius) goes on wrapper; img fills it.
  // When unwrapped: className goes directly on img.
  const imgClassName = classNames(
    'transition-opacity duration-300',
    status === 'loaded' ? 'opacity-100' : 'opacity-0',
    needsWrapper ? 'absolute inset-0 w-full h-full object-cover' : className
  );

  const renderImage = () =>
    optimized ? (
      <Image
        src={src as string}
        alt={alt}
        fill={fill}
        width={!fill ? (width as number) : undefined}
        height={!fill ? (height as number) : undefined}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={imgClassName}
      />
    ) : (
      <img
        ref={ref}
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        className={imgClassName}
        {...props}
      />
    );

  if (!needsWrapper) return renderImage();

  return (
    <div className={classNames('relative overflow-hidden', className)}>
      {/* Placeholder — visible while loading */}
      {status === 'loading' &&
        (placeholder === 'skeleton' ? (
          <div className="absolute inset-0 bg-blackinverse-a12 animate-pulse rounded-[inherit]" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {placeholder}
          </div>
        ))}

      {/* Fallback — visible on error */}
      {status === 'error' && fallback && (
        <div className="absolute inset-0 flex items-center justify-center">
          {fallback}
        </div>
      )}

      {/* Image — hidden until loaded, or removed on error with fallback */}
      {!(status === 'error' && fallback) && renderImage()}
    </div>
  );
};

export default BaseImage;
