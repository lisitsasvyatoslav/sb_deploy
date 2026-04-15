import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Custom Figma spacing tokens: spacing-*, base-*, border-*, separator_size_*, contentmax_*
const isCustomSpacing = (value: string) =>
  /^(spacing-|base-|border-|separator_size_|contentmax_)/.test(value);

// Custom Figma border-radius tokens: radius-*
const isCustomRadius = (value: string) => /^radius-/.test(value);

// Custom Figma shadow tokens: 100-600, effects-*, soft, medium, large, card*, e1, e3, toolbar, fab, top-nav, modal, dropdown
const isCustomShadow = (value: string) =>
  /^(effects-|[1-6]00$|soft|medium|large|card|e[13]$|toolbar|fab|top-nav|modal|dropdown)/.test(
    value
  );

// Custom Figma blur tokens: medium, high, extra, normal, ultra, low, effects-*, progressiveblur-*
const isCustomBlur = (value: string) =>
  /^(medium|high|extra|normal|ultra|low|effects-|progressiveblur-)/.test(value);

// Custom Figma color tokens (semantic theme + aliases)
// Prevents tailwind-merge from treating e.g. text-blackinverse-a56 and text-12 as conflicting
const isCustomColor = (value: string) =>
  /^(blackinverse|whiteinverse|texticon|brand|status|mind|overlay|wrapper|stroke|background|surfacewhite|surfacegray|surfacelow|surfacemedium|base|other|colors|accent|tag|chart|edge|selection|skeleton|toast|toggle|minimap|chat|sidebar|surface|icon)-/.test(
    value
  );

// Custom Figma font sizes: bare numbers (8, 10, 12, 14, ...) used as text-12, text-14, etc.
const isCustomFontSize = (value: string) =>
  /^(8|10|12|14|16|18|20|24|48|72)$/.test(value);

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: [isCustomSpacing],
      radius: [isCustomRadius],
      shadow: [isCustomShadow],
      blur: [isCustomBlur],
      color: [isCustomColor],
    },
    classGroups: {
      'font-size': [{ text: [isCustomFontSize] }],
      'text-color': [{ text: [isCustomColor] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
