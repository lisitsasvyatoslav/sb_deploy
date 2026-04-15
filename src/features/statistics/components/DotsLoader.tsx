'use client';

import React from 'react';

interface DotsLoaderProps {
  /**
   * 0–100 fill percentage for determinate mode.
   * Omit (or pass undefined) for indeterminate scanning animation.
   */
  progress?: number;
}

/**
 * DotsLoader — dot-grid progress bar.
 *
 * - Indeterminate (default): a scanning band of brand-colored dots sweeps the track.
 * - Determinate (progress prop): left portion lights up in brand color to progress%,
 *   glow sits at the leading edge so it always feels alive.
 *
 * Two-row dot grid (16px height) to match Figma node 4460:44752.
 * Fills the container width; dot count tiles automatically.
 */
const DotsLoader: React.FC<DotsLoaderProps> = ({ progress }) => {
  const isDeterminate = progress !== undefined;
  const clampedProgress = isDeterminate
    ? Math.max(0, Math.min(100, progress))
    : 0;

  return (
    <div className="relative overflow-hidden rounded-full w-full h-4">
      {/* Dim dots — full track */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--blackinverse-a12) 1.5px, transparent 1.5px)',
          backgroundSize: '8px 8px',
        }}
      />

      {isDeterminate ? (
        <>
          {/* Bright brand-colored dots — filled portion */}
          <div
            className="absolute inset-y-0 left-0 transition-[width] duration-500 ease-out"
            style={{
              width: `${clampedProgress}%`,
              backgroundImage:
                'radial-gradient(circle, var(--brand-base) 1.5px, transparent 1.5px)',
              backgroundSize: '8px 8px',
            }}
          />
          {/* Brand glow at the leading edge */}
          <div
            className="absolute top-0 bottom-0 w-8 -translate-x-1/2 transition-[left] duration-500 ease-out"
            style={{
              left: `${clampedProgress}%`,
              background:
                'radial-gradient(ellipse at center, var(--brand-base) 0%, transparent 70%)',
              opacity: 0.5,
            }}
          />
        </>
      ) : (
        /* Indeterminate: band of brand-colored dots scans across the track */
        <div
          className="absolute top-0 bottom-0 w-1/3"
          style={{
            backgroundImage:
              'radial-gradient(circle, var(--brand-base) 1.5px, transparent 1.5px)',
            backgroundSize: '8px 8px',
            WebkitMaskImage:
              'linear-gradient(90deg, transparent 0%, white 25%, white 75%, transparent 100%)',
            maskImage:
              'linear-gradient(90deg, transparent 0%, white 25%, white 75%, transparent 100%)',
            animation: 'dots-loader-scan 2s ease-in-out infinite',
          }}
        />
      )}

      <style>{`
        @keyframes dots-loader-scan {
          from { left: -33%; }
          to   { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default DotsLoader;
