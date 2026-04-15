'use client';

import { useTranslation } from '@/shared/i18n/client';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import { useStatisticsStore } from '@/stores/statisticsStore';
import { useEffect, useState } from 'react';
import PositionsCompactPagination from './PositionsCompactPagination';
import { PortfolioConfigureDropdown } from './PortfolioConfigureDropdown';

/** Right section: time, date, and compact pagination (Figma node-id=2001:2045–2047) */
const FooterStatusBar = () => {
  const { i18n } = useTranslation('statistics');
  const locale = getLocaleTag(i18n.language);
  const filters = useStatisticsStore((state) => state.positionsFilters);
  const setFilters = useStatisticsStore((state) => state.setPositionsFilters);
  const paginationMeta = useStatisticsStore((state) => state.paginationMeta);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-spacing-8">
      {/* Time - Figma node-id=2001:2045 */}
      <span className="text-10 leading-12 font-medium tracking-tight-1 text-blackinverse-a32">
        {now.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>

      {/* Separator - 2x2 ellipse from Figma */}
      <div className="w-spacing-2 h-spacing-2 rounded-full bg-blackinverse-a32" />

      {/* Date - Figma node-id=2001:2047 */}
      <span className="text-10 leading-12 font-medium tracking-tight-1 text-blackinverse-a32">
        {now.toLocaleDateString(locale)}
      </span>

      {/* PositionsCompactPagination - Figma node-id=2001:2044 */}
      {paginationMeta && (
        <PositionsCompactPagination
          currentPage={filters.page || 1}
          totalPages={paginationMeta.totalPages}
          onPageChange={(page) => setFilters({ page })}
        />
      )}
    </div>
  );
};

/** Left section: export dropdown + settings (Figma node-id=2001:2040) */
const FooterActions = () => {
  return (
    <div className="flex items-center gap-spacing-8">
      <PortfolioConfigureDropdown />
    </div>
  );
};

const PositionsTableFooter = () => {
  return (
    <div className="flex-shrink-0 px-spacing-20 py-spacing-8 flex items-center justify-between gap-spacing-10 h-[44px] /* no spacing token for 44 */">
      {/* Left - Download icon + "Настроить" dropdown */}
      <FooterActions />

      {/* Right - Time + Date + Pagination */}
      <FooterStatusBar />
    </div>
  );
};

export default PositionsTableFooter;
