'use client';

import React from 'react';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/shared/ui/Modal';
import Button from '@/shared/ui/Button';
import TickerIcon from '@/shared/ui/TickerIcon';
import { usePortfolioFormModal } from '../hooks/usePortfolioFormModal';
import PortfolioFormContent from './PortfolioFormContent';

export type CreatePortfolioFromDataModalMode = 'create' | 'edit';

export interface CreatePortfolioFromDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: CreatePortfolioFromDataModalMode;
  portfolioId?: number | null;
}

const CreatePortfolioFromDataModal: React.FC<
  CreatePortfolioFromDataModalProps
> = ({ open, onOpenChange, mode, portfolioId }) => {
  const modal = usePortfolioFormModal({
    open,
    onOpenChange,
    mode,
    portfolioId,
  });

  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && modal.handleClose()}
      maxWidth={780}
      floatingCloseButton
      className="h-[90vh]"
    >
      <ModalHeader className="!px-12 pt-16 !pb-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <ModalTitle>{modal.title}</ModalTitle>
          {modal.selectedInstruments.length > 0 && (
            <div className="flex items-center gap-[-4px] shrink-0">
              {modal.selectedInstruments.slice(0, 5).map((ticker) => (
                <div key={ticker} className="-ml-1 first:ml-0">
                  <TickerIcon
                    symbol={ticker}
                    securityId={modal.securityIdMap[ticker]}
                    size={24}
                  />
                </div>
              ))}
              {modal.selectedInstruments.length > 5 && (
                <span className="ml-1 text-12 text-blackinverse-a56">
                  +{modal.selectedInstruments.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </ModalHeader>

      <ModalBody
        padding="none"
        className="flex flex-col gap-4 min-h-0 overflow-hidden px-12 pb-4"
      >
        <PortfolioFormContent
          name={modal.name}
          setName={modal.setName}
          selectedInstruments={modal.selectedInstruments}
          setSelectedInstruments={modal.setSelectedInstruments}
          searchValue={modal.searchValue}
          handleSearchChange={modal.handleSearchChange}
          dateRange={modal.dateRange}
          setDateRange={modal.setDateRange}
          hasBrokers={modal.hasBrokers}
          brokerItems={modal.brokers.map((b) => ({
            id: b.type,
            label: b.name,
          }))}
          selectedBrokerTypes={modal.selectedBrokerTypes}
          onBrokersChange={modal.setSelectedBrokerTypes}
          accountItems={modal.availableAccounts.map((a) => ({
            id: a.id,
            label: a.name,
          }))}
          selectedAccountIds={modal.selectedAccountIds}
          onAccountsChange={modal.setSelectedAccountIds}
          initialParentInstruments={modal.initialParentInstruments}
          tableMountKey={modal.tableMountKey}
          showEditLoader={modal.showEditLoader}
          isPortfolioError={modal.isPortfolioError}
          mode={mode}
          t={modal.t}
        />
      </ModalBody>

      <ModalFooter align="right" className="!px-12 !py-4">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={modal.handleClose}
          disabled={modal.isSaving}
        >
          {modal.t('portfolioCatalog.createFromData.cancel')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => void modal.handleSubmit()}
          disabled={
            modal.isSaving ||
            modal.showEditLoader ||
            (mode === 'edit' && modal.isPortfolioError)
          }
        >
          {mode === 'create'
            ? modal.t('portfolioCatalog.createFromData.submitCreate')
            : modal.t('portfolioCatalog.createFromData.submitEdit')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CreatePortfolioFromDataModal;
