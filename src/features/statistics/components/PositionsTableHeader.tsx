'use client';

import IconButton from '@/shared/ui/IconButton';
import { useBrokerAccountsQuery } from '@/features/broker/queries';
import { useTranslation } from '@/shared/i18n/client';
import { useStatisticsStore } from '@/stores/statisticsStore';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import React, { useCallback, useState } from 'react';
import BrokerAccountFilter from './BrokerAccountFilter';
import PositionsDateRangeFilter from './PositionsDateRangeFilter';
import PositionsOptionsMenu from './PositionsOptionsMenu';
import SearchInput from '@/shared/ui/SearchInput';
import SegmentedControl from '@/shared/ui/SegmentedControl';

const PositionsTableHeader = () => {
  const { t } = useTranslation('statistics');
  const filters = useStatisticsStore((state) => state.positionsFilters);
  const setFilters = useStatisticsStore((state) => state.setPositionsFilters);
  const dateRange = useStatisticsStore((state) => state.dateRange);
  const setDateRange = useStatisticsStore((state) => state.setDateRange);
  const selectedAccountIds = useStatisticsStore(
    (state) => state.selectedAccountIds
  );
  const setSelectedAccountIds = useStatisticsStore(
    (state) => state.setSelectedAccountIds
  );

  const viewMode = useStatisticsStore((state) => state.viewMode);
  const setViewMode = useStatisticsStore((state) => state.setViewMode);

  const { data: accounts, isSuccess } = useBrokerAccountsQuery();
  const hasBrokers = isSuccess && !!accounts && accounts.length > 0;

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const handleFilterChange = useCallback(
    (key: string, value: string | null) => {
      setFilters({ [key]: value });
    },
    [setFilters]
  );

  const handleSearchChange = useCallback(
    (value: string | null) => {
      handleFilterChange('search', value);
    },
    [handleFilterChange]
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <div className="flex-shrink-0 pt-spacing-8 pr-spacing-8 pb-spacing-2 pl-spacing-8 flex items-center justify-between gap-spacing-4 min-h-[42px]">
      {/* Left Group - Date filter */}
      <div className="flex items-center gap-spacing-8">
        <PositionsDateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          disabled={!hasBrokers}
        />
      </div>

      {/* Right Group - Search + SegmentedControl */}
      <div className="flex items-center gap-spacing-12">
        <SearchInput
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          onClear={() => handleSearchChange(null)}
          placeholder={t('positions.searchTicker')}
          size="sm"
          className="w-[180px] shrink-0"
        />

        <SegmentedControl
          segments={[
            { value: 'history', label: t('positions.history') },
            { value: 'portfolio', label: t('positions.portfolio') },
          ]}
          value={viewMode}
          onChange={(value) => setViewMode(value as 'portfolio' | 'history')}
          size="L"
          variant="mono"
        />
      </div>

      {/* Broker & Account filter - HIDDEN but code preserved */}
      {false && (
        <BrokerAccountFilter
          selectedAccountIds={selectedAccountIds}
          onChange={setSelectedAccountIds}
        />
      )}

      {/* More options button - HIDDEN but code preserved */}
      {false && (
        <>
          <IconButton
            icon={<MoreHorizIcon className="text-blackinverse-a100" />}
            size={24}
            onClick={handleMenuOpen}
            ariaLabel="More options"
            className="!w-12 !h-12 !border !border-[var(--border-light)] !rounded-lg"
          />

          <PositionsOptionsMenu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          />
        </>
      )}
    </div>
  );
};

export default PositionsTableHeader;
