'use client';

import React, { useState } from 'react';
import Button from '@/shared/ui/Button';
import { ConnectStrategyModal } from './ConnectStrategyModal';
import { useTranslation } from '@/shared/i18n/client';

interface StrategyDetailConnectCardProps {
  strategyName?: string;
}

export const StrategyDetailConnectCard: React.FC<
  StrategyDetailConnectCardProps
> = ({ strategyName }) => {
  const { t } = useTranslation('common');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  return (
    <>
      <div className="mt-6">
        <div className="bg-background-card rounded-lg p-5 flex items-center justify-between  h-fit w-[308px]">
          <Button
            onClick={() => setIsConnectModalOpen(true)}
            className="bg-[var(--color-accent)] hover:bg-[var(--brand-primary-hover)] text-white px-8 w-full"
          >
            {t('strategiesCatalog.detail.connect')}
          </Button>
        </div>
      </div>

      <ConnectStrategyModal
        open={isConnectModalOpen}
        onOpenChange={setIsConnectModalOpen}
        strategyName={strategyName}
      />
    </>
  );
};

export default StrategyDetailConnectCard;
