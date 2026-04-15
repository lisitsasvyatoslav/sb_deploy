'use client';

import React from 'react';
import DotsLoader from '@/features/statistics/components/DotsLoader';
import { useTranslation } from '@/shared/i18n/client';

interface PortfolioCardLoadingProps {
  name: string;
}

/**
 * PortfolioCardLoading — portfolio row in loading state (snapshot being created)
 *
 * Figma node: 5000:24497
 *
 * Shows "Идет загрузка данных" text + indeterminate DotsLoader
 * instead of value/PnL while the portfolio snapshot is being created.
 */
const PortfolioCardLoading: React.FC<PortfolioCardLoadingProps> = ({
  name,
}) => {
  const { t } = useTranslation('common');

  return (
    <div
      className="flex flex-col gap-spacing-8 p-spacing-12 border-b border-blackinverse-a4 rounded-radius-2"
      data-testid="portfolio-card-loading"
    >
      <span className="text-12 leading-16 font-medium tracking-tight-1 text-blackinverse-a100">
        {t('portfolioCatalog.loading.title', 'Идет загрузка данных')}
      </span>
      <DotsLoader />
      <span className="text-8 leading-12 font-semibold uppercase tracking-tight-1 text-blackinverse-a32">
        {name}
      </span>
    </div>
  );
};

export default PortfolioCardLoading;
