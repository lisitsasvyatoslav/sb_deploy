/**
 * Resolves a CSS custom property to its computed value.
 * Needed for libraries (Chart.js, Recharts) that don't support var(--...).
 */
export function resolveThemeColor(varName: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

/**
 * Resolves multiple CSS custom properties at once.
 */
export function resolveThemeColors<T extends Record<string, string>>(
  vars: T
): Record<keyof T, string> {
  const result = {} as Record<keyof T, string>;
  const style =
    typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement)
      : null;
  for (const [key, varName] of Object.entries(vars)) {
    result[key as keyof T] = style
      ? style.getPropertyValue(varName).trim()
      : '';
  }
  return result;
}
