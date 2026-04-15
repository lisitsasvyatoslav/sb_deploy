'use client';

import React from 'react';
import { cn } from '@/shared/utils/cn';

import type { SkeletonChartProps } from './SparklineChart.types';

// Normalized Y positions (0=top, 1=bottom of waveform area) derived from Figma node 61083:3991.
// 25 evenly-spaced X steps across the chart width, linear segments (no smoothing) to match Figma style.
const SKELETON_YN = [
  1.0, 0.527, 0.25, 0.536, 0.627, 0.527, 0.359, 0.323, 0.045, 0.0, 0.25, 0.2,
  0.25, 0.714, 0.836, 0.65, 0.545, 0.355, 0.395, 0.305, 0.477, 0.35, 0.318,
  0.309, 0.391,
];

function buildSkeletonPath(width: number, height: number): string {
  // Figma node 61083:3991: waveform occupies y=[6,28] within h=32 → ratios 6/32 and 22/32
  const yTop = height * (6 / 32);
  const yRange = height * (22 / 32);
  const n = SKELETON_YN.length;
  const pts = SKELETON_YN.map((yn, i) => {
    const x = ((i / (n - 1)) * width).toFixed(2);
    const y = (yTop + yn * yRange).toFixed(2);
    return `${x} ${y}`;
  });
  return `M ${pts.join(' L ')}`;
}

function buildSkeletonAreaPath(width: number, height: number): string {
  const yBottom = height * (31 / 32); // Figma fill area closes at y=31 within h=32
  return `${buildSkeletonPath(width, height)} L ${width} ${yBottom} L 0 ${yBottom} Z`;
}

const SkeletonChart: React.FC<SkeletonChartProps> = ({
  width,
  height,
  gradientId,
  lineColor,
  shadeColorFrom,
  shadeColorTo,
  maskStyle,
  className,
  dataTestId,
}) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('block shrink-0', className)}
    aria-hidden="true"
    data-testid={dataTestId}
    style={maskStyle}
  >
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="2%" style={{ stopColor: shadeColorFrom }} />
        <stop offset="100%" style={{ stopColor: shadeColorTo }} />
      </linearGradient>
    </defs>
    <path
      d={buildSkeletonAreaPath(width, height)}
      fill={`url(#${gradientId})`}
    />
    <path
      d={buildSkeletonPath(width, height)}
      stroke={lineColor}
      strokeWidth={1}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default SkeletonChart;
