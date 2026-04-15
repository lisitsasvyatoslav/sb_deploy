/**
 * Maps business brand names (from html[data-brand]) to finsignal-feed-explore brand tokens.
 * Add new brands here as the product expands.
 */
const BRAND_MAP: Record<string, 'purple' | 'green'> = {
  lime: 'green',
  finam: 'purple',
};

export function getFeedBrand(): 'purple' | 'green' {
  if (typeof document === 'undefined') return 'purple';
  const brand = document.documentElement.dataset.brand ?? '';
  return BRAND_MAP[brand] ?? 'purple';
}
