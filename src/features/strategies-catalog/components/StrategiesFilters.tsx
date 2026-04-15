'use client';
import { Box } from '@mui/material';
import React, { FC, useState } from 'react';
import { StrategiesSearch } from './StrategiesSearch';
import { StrategiesFilter } from './StrategiesFilter';
import { StrategiesSelector } from './StrategiesSelector';
import { useTranslation } from '@/shared/i18n/client';

export type SortOption = '0' | '1' | '2';
type SortLabelKey =
  | 'strategiesCatalog.filters.sort.byProfitability'
  | 'strategiesCatalog.filters.sort.oldest'
  | 'strategiesCatalog.filters.sort.name';

export const SORT_OPTIONS: { value: SortOption; labelKey: SortLabelKey }[] = [
  {
    value: '0',
    labelKey: 'strategiesCatalog.filters.sort.byProfitability',
  },
  {
    value: '1',
    labelKey: 'strategiesCatalog.filters.sort.oldest',
  },
  {
    value: '2',
    labelKey: 'strategiesCatalog.filters.sort.name',
  },
];

interface StrategiesFiltersProps {
  className?: string;
}

export const StrategiesFilters: FC<StrategiesFiltersProps> = ({
  className,
}) => {
  const { t } = useTranslation('common');
  const [sortBy, setSortBy] = useState<SortOption>('0');
  const handleSearchChange = (_value: string) => undefined;

  return (
    <Box className={`flex items-center justify-between gap-4 ${className}`}>
      <StrategiesSearch
        value=""
        onChange={handleSearchChange}
        placeholder={t('strategiesCatalog.filters.searchPlaceholder')}
      />
      <StrategiesFilter />
      <StrategiesSelector sortBy={sortBy} onSortChange={setSortBy} />
    </Box>
  );
};
