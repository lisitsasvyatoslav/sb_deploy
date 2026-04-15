'use client';

import React, { useCallback } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { getClientRegionConfig } from '@/shared/config/region';
import { usePortfoliosWithSummaryQuery } from '../queries';
import { symbolsFromPortfolioFillRule } from '../utils/instrumentFillRule';
import SectionHeader from './SectionHeader';
import PortfolioCard from './PortfolioCard';
import PortfolioCardLoading from './PortfolioCardLoading';
import CatalogEmptyState from './CatalogEmptyState';

interface PortfoliosListSectionProps {
  onOpenCreateInstrumentPortfolio?: () => void;
  onOpenEditInstrumentPortfolio?: (portfolioId: number) => void;
}

/**
 * PortfoliosListSection — left column with portfolio cards
 *
 * Figma node: 3664:32396
 */
const PortfoliosListSection: React.FC<PortfoliosListSectionProps> = ({
  onOpenCreateInstrumentPortfolio,
  onOpenEditInstrumentPortfolio,
}) => {
  const { t } = useTranslation('common');
  const { baseCurrency } = getClientRegionConfig();
  const {
    data: portfolios,
    isLoading,
    error,
  } = usePortfoliosWithSummaryQuery();

  const handleCreatePortfolio = useCallback(() => {
    onOpenCreateInstrumentPortfolio?.();
  }, [onOpenCreateInstrumentPortfolio]);

  return (
    <div className="flex flex-col gap-spacing-4 rounded-radius-4 pt-spacing-6 pb-spacing-12">
      <SectionHeader
        title={t('boardSections.portfolio.title')}
        onAction={handleCreatePortfolio}
        actionLabel={t('boardSections.portfolio.connectBroker')}
        actionAriaLabel="Create portfolio"
      />

      {/* Portfolio cards */}
      {isLoading ? (
        <div className="px-spacing-16 py-spacing-32 text-center text-blackinverse-a32 text-12">
          {t('loading')}
        </div>
      ) : error ? (
        <div className="px-spacing-16 py-spacing-32 text-center text-status-negative text-12">
          {t('errors.loadFailed', 'Failed to load portfolios')}
        </div>
      ) : portfolios && portfolios.length > 0 ? (
        <div className="flex flex-col bg-blackinverse-a4 rounded-radius-4">
          {portfolios.map((portfolio) =>
            !portfolio.hasSnapshot ? (
              <PortfolioCardLoading key={portfolio.id} name={portfolio.name} />
            ) : (
              <PortfolioCard
                key={portfolio.id}
                id={portfolio.id}
                name={portfolio.name}
                totalValue={portfolio.totalValue}
                unrealizedPnl={portfolio.unrealizedPnl}
                positionCount={
                  portfolio.fillRule?.type === 'all'
                    ? undefined
                    : symbolsFromPortfolioFillRule(portfolio.fillRule).length ||
                      portfolio.positionCount
                }
                currency={portfolio.currency ?? baseCurrency}
                isDefault={portfolio.isDefault}
                onClick={
                  onOpenEditInstrumentPortfolio
                    ? () => onOpenEditInstrumentPortfolio(portfolio.id)
                    : undefined
                }
                onEdit={
                  onOpenEditInstrumentPortfolio
                    ? () => onOpenEditInstrumentPortfolio(portfolio.id)
                    : undefined
                }
              />
            )
          )}
        </div>
      ) : (
        <CatalogEmptyState
          title={t('portfolioCatalog.empty.title', 'No data')}
          description={t(
            'portfolioCatalog.empty.portfolioDescription',
            'Portfolios allow you to group assets in your accounts for analysis. Connect accounts first, then you can create portfolios.'
          )}
          actionLabel={t(
            'portfolioCatalog.empty.connectAccount',
            'Connect account'
          )}
          onAction={handleCreatePortfolio}
        />
      )}
    </div>
  );
};

export default PortfoliosListSection;
