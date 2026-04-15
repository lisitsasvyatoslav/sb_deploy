/**
 * Parse a hex color string (#RGB or #RRGGBB) into r, g, b components.
 */
export const hexToRgb = (
  hex: string
): { r: number; g: number; b: number } | null => {
  const normalized = hex.replace('#', '');
  if (![3, 6].includes(normalized.length)) return null;

  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;

  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value)) return null;

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

/**
 * Determine whether a hex color is perceptually light (luminance > 0.6).
 * Useful for choosing dark vs light text on a colored background.
 */
export const isLightColor = (color?: string): boolean => {
  if (!color) return false;

  const rgb = color.startsWith('#') ? hexToRgb(color) : null;
  if (!rgb) return false;

  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance > 0.6;
};
