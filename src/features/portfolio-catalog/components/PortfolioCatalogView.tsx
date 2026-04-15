'use client';

import React, { useCallback, useState } from 'react';
import AddBrokerDialog from '@/features/broker/components/AddBrokerDialog';
import { useResponsiveCardSize } from '@/shared/hooks';
import { getMaxContainerWidthClass } from '@/shared/constants/layout';
import { GlowBorder, useGlowTarget } from '@/features/onboarding';
import PortfoliosBoardsSection from './PortfoliosBoardsSection';
import PortfoliosListSection from './PortfoliosListSection';
import AccountsTreeSection from './AccountsTreeSection';
import CreatePortfolioFromDataModal, {
  type CreatePortfolioFromDataModalMode,
} from './CreatePortfolioFromDataModal';

const PortfolioCatalogView: React.FC = () => {
  const { screenWidth } = useResponsiveCardSize();
  const maxContainerWidthClass = getMaxContainerWidthClass(screenWidth);
  const portfolioContainersGlow = useGlowTarget('portfolio-containers');

  const [instrumentModalOpen, setInstrumentModalOpen] = useState(false);
  const [instrumentModalMode, setInstrumentModalMode] =
    useState<CreatePortfolioFromDataModalMode>('create');
  const [instrumentModalPortfolioId, setInstrumentModalPortfolioId] = useState<
    number | null
  >(null);

  const openCreateInstrumentPortfolio = useCallback(() => {
    setInstrumentModalMode('create');
    setInstrumentModalPortfolioId(null);
    setInstrumentModalOpen(true);
  }, []);

  const openEditInstrumentPortfolio = useCallback((portfolioId: number) => {
    setInstrumentModalMode('edit');
    setInstrumentModalPortfolioId(portfolioId);
    setInstrumentModalOpen(true);
  }, []);

  return (
    <>
      <div className="w-full h-full overflow-auto bg-[var(--bg-base)] pt-[84px] px-16">
        <div
          className={`flex flex-col gap-4 w-full ${maxContainerWidthClass} mx-auto`}
        >
          {/* Top: Portfolio boards */}
          <PortfoliosBoardsSection />

          {/* Bottom: Portfolios + Accounts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 pb-12">
            <GlowBorder
              active={portfolioContainersGlow}
              borderRadius={4}
              borderWidth={3}
              className="w-full flex-col"
            >
              <PortfoliosListSection
                onOpenCreateInstrumentPortfolio={openCreateInstrumentPortfolio}
                onOpenEditInstrumentPortfolio={openEditInstrumentPortfolio}
              />
            </GlowBorder>
            <GlowBorder
              active={portfolioContainersGlow}
              borderRadius={4}
              borderWidth={3}
              className="w-full flex-col"
            >
              <AccountsTreeSection />
            </GlowBorder>
          </div>
        </div>
      </div>

      <CreatePortfolioFromDataModal
        open={instrumentModalOpen}
        onOpenChange={setInstrumentModalOpen}
        mode={instrumentModalMode}
        portfolioId={instrumentModalPortfolioId}
      />

      <AddBrokerDialog />
    </>
  );
};

export default PortfolioCatalogView;
