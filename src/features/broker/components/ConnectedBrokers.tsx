'use client';

import React, { useRef, useState } from 'react';
import { Icon } from '@/shared/ui/Icon';
import Button from '@/shared/ui/Button';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/shared/ui/Modal';
import BrokerIcon from '@/shared/ui/BrokerIcon';
import { useTranslation } from '@/shared/i18n/client';
import {
  useBrokerAccountsQuery,
  useDeleteBrokerAccountsMutation,
} from '@/features/broker/queries';
import { transformAccountsToBrokers } from '@/shared/utils/brokerTransform';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import { logger } from '@/shared/utils/logger';
import ImportTradesDialog from './ImportTradesDialog';

interface ConnectedBrokersProps {
  onAddBroker: () => void;
  onAllBrokersDeleted?: () => void;
}

const ConnectedBrokers: React.FC<ConnectedBrokersProps> = ({
  onAddBroker,
  onAllBrokersDeleted,
}) => {
  const { t } = useTranslation('common');
  const { t: tBroker } = useTranslation('broker');

  const [expandedBroker, setExpandedBroker] = useState<string | null>(null);
  const [deleteConfirmBroker, setDeleteConfirmBroker] = useState<string | null>(
    null
  );
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const lastDeleteBrokerRef = useRef<string | null>(null);
  const isUsRegion = process.env.NEXT_PUBLIC_DEPLOYMENT_REGION === 'us';

  const { data: accounts, isLoading } = useBrokerAccountsQuery();
  const deleteBrokerMutation = useDeleteBrokerAccountsMutation();
  const brokers = accounts ? transformAccountsToBrokers(accounts, tBroker) : [];

  const toggleExpanded = (brokerType: string) => {
    setExpandedBroker(expandedBroker === brokerType ? null : brokerType);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmBroker) return;

    try {
      const result =
        await deleteBrokerMutation.mutateAsync(deleteConfirmBroker);
      showSuccessToast(t('profile.brokerDeleted', { count: result.deleted }));
      setDeleteConfirmBroker(null);

      const remainingBrokers = brokers.filter(
        (b) => b.type !== deleteConfirmBroker
      );
      if (remainingBrokers.length === 0) {
        onAllBrokersDeleted?.();
      }
    } catch (error) {
      logger.error(
        'ConnectedBrokers',
        'Failed to delete broker accounts',
        error
      );
      showErrorToast(tBroker('management.deleteError'));
    }
  };

  return (
    <>
      {/* Connected brokers list */}
      <div className="mb-4">
        <div className="text-xs font-medium theme-text-secondary uppercase tracking-wide mb-2">
          {t('profile.connectedBrokers')}
        </div>

        {isLoading ? (
          <div className="text-sm theme-text-secondary py-2">
            {t('profile.loadingBrokers')}
          </div>
        ) : brokers.length === 0 ? (
          <div className="text-sm theme-text-secondary py-2">
            {t('profile.noBrokers')}
          </div>
        ) : (
          <div className="space-y-1">
            {brokers.map((broker) => (
              <div key={broker.type}>
                {/* Broker header row */}
                <div
                  className="flex items-center px-3 py-2.5 cursor-pointer rounded-lg theme-bg-hover transition-colors"
                  onClick={() => toggleExpanded(broker.type)}
                >
                  <div className="w-5 h-5 flex items-center justify-center theme-text-secondary mr-2">
                    <Icon
                      variant="chevronDown"
                      size={16}
                      className={`transition-transform ${expandedBroker === broker.type ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <div className="border theme-border rounded-md p-0.5 mr-2">
                    <BrokerIcon broker={broker.type} size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium theme-text-primary">
                      {broker.name}
                    </div>
                    <div className="text-xs theme-text-secondary">
                      {broker.url}
                    </div>
                  </div>
                  <span className="text-xs theme-text-secondary ml-2">
                    {broker.accounts.length}
                  </span>
                </div>

                {/* Expanded accounts */}
                {expandedBroker === broker.type && (
                  <div className="pl-10 py-1">
                    {broker.accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center py-1.5 px-2"
                      >
                        <span className="text-sm theme-text-primary">
                          {account.name}
                        </span>
                      </div>
                    ))}

                    {/* Delete broker button */}
                    <Button
                      variant="negative"
                      size="xs"
                      icon="trash"
                      onClick={() => {
                        setDeleteConfirmBroker(broker.type);
                        lastDeleteBrokerRef.current = broker.type;
                      }}
                    >
                      {tBroker('management.deleteBrokerData')}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add broker button */}
      <Button
        variant="secondary"
        size="md"
        fullWidth
        icon="plusCircle"
        onClick={onAddBroker}
      >
        {t('profile.connectBrokers')}
      </Button>

      {/* Import from file button (US region only) */}
      {isUsRegion && (
        <Button
          variant="secondary"
          size="md"
          fullWidth
          icon="doc"
          onClick={() => setImportDialogOpen(true)}
          className="mt-2"
        >
          {tBroker('csvImport.importFromFile')}
        </Button>
      )}

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteConfirmBroker}
        onOpenChange={(isOpen) => !isOpen && setDeleteConfirmBroker(null)}
        maxWidth="sm"
        zIndex={60}
      >
        <ModalHeader className="!px-6 !pb-6">
          <div className="flex flex-col gap-8">
            <div className="flex size-16 items-center justify-center rounded-full bg-[var(--color-negative)]/12">
              <Icon
                variant="trash"
                size={24}
                className="text-[var(--color-negative)]"
              />
            </div>
            <div className="space-y-2">
              <ModalTitle>
                {tBroker('management.deleteConfirmTitle')}
              </ModalTitle>
              <p className="text-[var(--text-secondary)] text-xl leading-6 tracking-[-0.2px]">
                {tBroker('management.deleteWarning')}
              </p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="!px-6 !pt-0 !pb-0">
          <p className="text-sm theme-text-secondary">
            {tBroker('management.deleteConfirmText')}{' '}
            <span className="font-medium theme-text-primary">
              {brokers.find(
                (b) =>
                  b.type ===
                  (deleteConfirmBroker || lastDeleteBrokerRef.current)
              )?.name ||
                deleteConfirmBroker ||
                lastDeleteBrokerRef.current}
            </span>
            {tBroker('management.deleteConfirmSuffix')}
          </p>
        </ModalBody>
        <ModalFooter align="right">
          <Button
            onClick={() => setDeleteConfirmBroker(null)}
            variant="secondary"
            size="md"
          >
            {tBroker('management.cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} variant="negative" size="md">
            {tBroker('management.delete')}
          </Button>
        </ModalFooter>
      </Modal>

      {/* CSV Import Dialog */}
      {isUsRegion && (
        <ImportTradesDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
        />
      )}
    </>
  );
};

export default ConnectedBrokers;
