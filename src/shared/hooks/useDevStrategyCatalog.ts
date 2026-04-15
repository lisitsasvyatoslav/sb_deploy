export const isStrategiesCatalogEnabled = () =>
  process.env.NEXT_PUBLIC_FEATURE_STRATEGIES_CATALOG === 'true';

export const useDevStrategyCatalog = () => isStrategiesCatalogEnabled();
