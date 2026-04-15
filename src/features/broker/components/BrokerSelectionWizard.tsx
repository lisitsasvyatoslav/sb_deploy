import React, { useMemo } from 'react';
import { useBrokerWizard } from '../hooks/useBrokerWizard';
import { usePortfoliosQuery } from '@/features/portfolio-catalog/queries';
import type { DiscoveredAccount } from '@/types/broker';
import CreatePortfoliosStep from './CreatePortfoliosStep';
import EnterTokenStep from './EnterTokenStep';
import ImportTradesDialog from './ImportTradesDialog';
import PortalConnectStep from './PortalConnectStep';
import SelectBrokerStep from './SelectBrokerStep';

interface BrokerSelectionWizardProps {
  onClose?: () => void;
  onCanCloseChange?: (canClose: boolean) => void;
  onBeforeCloseRef?: React.MutableRefObject<(() => void) | null>;
}

const BrokerSelectionWizard: React.FC<BrokerSelectionWizardProps> = ({
  onClose,
  onCanCloseChange,
  onBeforeCloseRef,
}) => {
  const wizard = useBrokerWizard({ onClose, onCanCloseChange });

  // Expose the wizard's cleanup handler to the parent modal via ref
  React.useEffect(() => {
    if (onBeforeCloseRef) {
      onBeforeCloseRef.current = wizard.cleanupOnClose;
    }
    return () => {
      if (onBeforeCloseRef) {
        onBeforeCloseRef.current = null;
      }
    };
  }, [onBeforeCloseRef, wizard.cleanupOnClose]);
  const { data: portfolios } = usePortfoliosQuery();

  const existingDefaultPortfolio = useMemo(
    () => portfolios?.find((p) => p.isDefault) ?? null,
    [portfolios]
  );

  const renderStep = () => {
    switch (wizard.currentStep) {
      case 'select-broker':
        return <SelectBrokerStep onSelect={wizard.handleBrokerSelect} />;

      case 'enter-token':
        return wizard.selectedBroker ? (
          <EnterTokenStep
            brokerType={wizard.selectedBroker}
            onSubmit={wizard.handleTokenSubmit}
            isLoading={wizard.isTokenSubmitting}
            error={wizard.tokenError}
            successMessage={wizard.successMessage}
            syncDepthYears={wizard.syncDepthYears}
            onSyncDepthChange={wizard.setSyncDepthYears}
            onBack={wizard.handleBack}
          />
        ) : null;

      case 'portal-connect':
        return wizard.selectedBroker ? (
          <PortalConnectStep
            brokerType={wizard.selectedBroker}
            portalOpened={wizard.portalOpened}
            isRegistering={wizard.isRegistering}
            isConfirming={wizard.isConfirming}
            error={wizard.portalError}
            onOpenPortal={wizard.handlePortalOpen}
            onConfirm={wizard.handlePortalCallback}
            syncDepthYears={wizard.syncDepthYears}
            onSyncDepthChange={wizard.setSyncDepthYears}
            onBack={wizard.handleBack}
          />
        ) : null;

      case 'create-portfolios': {
        // Token flow: accounts from validate (in memory, not DB)
        // SnapTrade flow: accounts from DB — convert to DiscoveredAccount shape
        const accounts: DiscoveredAccount[] =
          wizard.discoveredAccountsRaw.length > 0
            ? wizard.discoveredAccountsRaw
            : wizard.discoveredAccounts.map((a) => ({
                accountId: a.accountId,
                accountName: a.accountName || a.accountId,
                brokerType: a.brokerType,
                institutionName: a.institutionName,
                balances: {},
              }));

        return wizard.selectedBroker ? (
          <CreatePortfoliosStep
            accounts={accounts}
            onSave={wizard.handlePortfoliosSave}
            onBack={wizard.handleBack}
            isSaving={wizard.isSavingPortfolios}
            existingDefaultPortfolioName={existingDefaultPortfolio?.name}
            existingAccountIds={wizard.existingAccountIds}
          />
        ) : null;
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {renderStep()}

      <ImportTradesDialog
        open={wizard.showImportDialog}
        onOpenChange={wizard.setShowImportDialog}
      />
    </div>
  );
};

export default BrokerSelectionWizard;
