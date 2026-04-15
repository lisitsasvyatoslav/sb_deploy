import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/shared/ui/Modal';
import BrokerIcon from '@/shared/ui/BrokerIcon';
import {
  useBrokerAccountsQuery,
  useDeleteBrokerAccountsMutation,
} from '@/features/broker/queries';
import { useTranslation } from '@/shared/i18n/client';
import { useStatisticsStore } from '@/stores/statisticsStore';
import { transformAccountsToBrokers } from '@/shared/utils/brokerTransform';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import { Icon } from '@/shared/ui/Icon';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckIcon from '@mui/icons-material/Check';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RemoveIcon from '@mui/icons-material/Remove';
import React, { useRef, useState } from 'react';
import Button from '@/shared/ui/Button';
import Beta from '@/shared/ui/Beta';

interface BrokerManagementDialogProps {
  open: boolean;
  onClose: () => void;
}

const BrokerManagementDialog: React.FC<BrokerManagementDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation('broker');
  const [expandedBroker, setExpandedBroker] = useState<string | null>(null);
  const [deleteConfirmBroker, setDeleteConfirmBroker] = useState<string | null>(
    null
  );
  // Preserve broker name during exit animation (deleteConfirmBroker becomes null before unmount)
  const lastDeleteBrokerRef = useRef<string | null>(null);
  if (deleteConfirmBroker) lastDeleteBrokerRef.current = deleteConfirmBroker;
  const setShowBrokerDialog = useStatisticsStore(
    (state) => state.setShowBrokerDialog
  );
  const setBrokerDialogReturnTo = useStatisticsStore(
    (state) => state.setBrokerDialogReturnTo
  );
  const selectedAccountIds = useStatisticsStore(
    (state) => state.selectedAccountIds
  );
  const setSelectedAccountIds = useStatisticsStore(
    (state) => state.setSelectedAccountIds
  );

  const { data: accounts, isLoading } = useBrokerAccountsQuery();
  const deleteBrokerMutation = useDeleteBrokerAccountsMutation();
  const brokers = accounts ? transformAccountsToBrokers(accounts) : [];

  const handleClose = () => {
    setDeleteConfirmBroker(null);
    setExpandedBroker(null);
    setBrokerDialogReturnTo(null);
    onClose();
  };

  const toggleBrokerExpanded = (brokerType: string) => {
    if (expandedBroker === brokerType) {
      setExpandedBroker(null);
    } else {
      setExpandedBroker(brokerType);
    }
  };

  const handleAddBroker = () => {
    setDeleteConfirmBroker(null);
    setExpandedBroker(null);
    setBrokerDialogReturnTo('management');
    setShowBrokerDialog(true);
    onClose();
  };

  const handleDeleteBroker = (brokerType: string) => {
    setDeleteConfirmBroker(brokerType);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmBroker) return;

    try {
      const result =
        await deleteBrokerMutation.mutateAsync(deleteConfirmBroker);
      showSuccessToast(
        t('management.deleteSuccess', { count: result.deleted })
      );
      setDeleteConfirmBroker(null);

      const remainingBrokers = brokers.filter(
        (b) => b.type !== deleteConfirmBroker
      );
      if (remainingBrokers.length === 0) {
        setSelectedAccountIds(null);
      }
    } catch (error) {
      console.error('Failed to delete broker accounts:', error);
      showErrorToast(t('management.deleteError'));
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmBroker(null);
  };

  const handleTokenManagement = () => {
    setDeleteConfirmBroker(null);
    setExpandedBroker(null);
    setBrokerDialogReturnTo('management');
    setShowBrokerDialog(true);
    onClose();
  };

  // Account filter logic
  const handleAccountToggle = (accountId: string) => {
    if (selectedAccountIds === null) {
      const allAccountIds = brokers.flatMap((b) => b.accounts.map((a) => a.id));
      setSelectedAccountIds(allAccountIds.filter((id) => id !== accountId));
      return;
    }

    if (selectedAccountIds.includes(accountId)) {
      setSelectedAccountIds(
        selectedAccountIds.filter((id) => id !== accountId)
      );
    } else {
      setSelectedAccountIds([...selectedAccountIds, accountId]);
    }
  };

  const handleBrokerToggle = (brokerType: string) => {
    const broker = brokers.find((b) => b.type === brokerType);
    if (!broker) return;

    const brokerAccountIds = broker.accounts.map((acc) => acc.id);

    if (selectedAccountIds === null) {
      const allAccountIds = brokers.flatMap((b) => b.accounts.map((a) => a.id));
      setSelectedAccountIds(
        allAccountIds.filter((id) => !brokerAccountIds.includes(id))
      );
      return;
    }

    const allSelected = brokerAccountIds.every((id) =>
      selectedAccountIds.includes(id)
    );

    if (allSelected) {
      setSelectedAccountIds(
        selectedAccountIds.filter((id) => !brokerAccountIds.includes(id))
      );
    } else {
      const newIds = [...selectedAccountIds];
      brokerAccountIds.forEach((id) => {
        if (!newIds.includes(id)) {
          newIds.push(id);
        }
      });
      setSelectedAccountIds(newIds);
    }
  };

  const isAccountSelected = (accountId: string) => {
    if (selectedAccountIds === null) return true;
    return selectedAccountIds.includes(accountId);
  };

  const isBrokerFullySelected = (brokerType: string) => {
    const broker = brokers.find((b) => b.type === brokerType);
    if (!broker) return false;
    if (selectedAccountIds === null) return true;
    return broker.accounts.every((acc) => selectedAccountIds.includes(acc.id));
  };

  const isBrokerPartiallySelected = (brokerType: string) => {
    const broker = brokers.find((b) => b.type === brokerType);
    if (!broker) return false;
    if (selectedAccountIds === null) return false;
    return (
      broker.accounts.some((acc) => selectedAccountIds.includes(acc.id)) &&
      !isBrokerFullySelected(brokerType)
    );
  };

  return (
    <>
      <Modal
        open={open}
        onOpenChange={(isOpen) => !isOpen && handleClose()}
        maxWidth="md"
        zIndex={9999}
      >
        <ModalHeader className="pt-2">
          <ModalTitle>{t('management.title')}</ModalTitle>
        </ModalHeader>
        <ModalBody padding="none">
          <div className="overflow-y-auto p-6">
            {isLoading ? (
              <div className="py-12 text-center text-sm theme-text-secondary">
                {t('management.loading')}
              </div>
            ) : brokers.length === 0 ? (
              <div className="py-12 text-center text-sm theme-text-secondary">
                {t('management.empty')}
              </div>
            ) : (
              <div className="space-y-3">
                {brokers.map((broker) => (
                  <div key={broker.type} className="overflow-hidden">
                    {/* Broker Header */}
                    <div
                      className="flex items-center px-4 py-3 theme-surface cursor-pointer theme-bg-hover transition-colors rounded-sm"
                      onClick={() => toggleBrokerExpanded(broker.type)}
                    >
                      {/* Expand/Collapse Icon */}
                      <div className="w-6 h-6 flex items-center justify-center theme-text-secondary mr-3">
                        <Icon
                          variant="chevronDown"
                          size={20}
                          className={`transition-transform ${expandedBroker === broker.type ? 'rotate-180' : ''}`}
                        />
                      </div>

                      {/* Broker Icon */}
                      <div className="border-2 theme-border rounded-md p-1">
                        <BrokerIcon broker={broker.type} />
                      </div>

                      {/* Broker Info */}
                      <div className="flex-1 ml-3">
                        <div className="text-base font-medium theme-text-primary">
                          {broker.name}
                        </div>
                        <div className="text-sm theme-text-secondary">
                          {broker.url}
                        </div>
                      </div>

                      {/* Broker Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBrokerToggle(broker.type);
                        }}
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                          isBrokerFullySelected(broker.type) ||
                          isBrokerPartiallySelected(broker.type)
                            ? 'bg-[var(--text-primary)] border-[var(--text-primary)]'
                            : 'bg-transparent border-[var(--border-light)]'
                        }`}
                      >
                        {isBrokerFullySelected(broker.type) && (
                          <CheckIcon
                            fontSize="small"
                            className="text-surface-medium"
                          />
                        )}
                        {isBrokerPartiallySelected(broker.type) && (
                          <RemoveIcon
                            fontSize="small"
                            className="text-surface-medium"
                          />
                        )}
                      </button>
                    </div>

                    {/* Accounts List (Expanded) */}
                    {expandedBroker === broker.type && (
                      <div className="ps-12 py-2">
                        {broker.accounts.map((account) => (
                          <div
                            key={account.id}
                            className="flex items-center justify-between ps-16 pe-4 py-2.5 rounded-lg"
                          >
                            {/* Account Name */}
                            <span className="text-sm theme-text-primary">
                              {account.name}
                            </span>
                            {/* Account Checkbox */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAccountToggle(account.id);
                              }}
                              className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                                isAccountSelected(account.id)
                                  ? 'bg-[var(--text-primary)] border-[var(--text-primary)]'
                                  : 'bg-transparent border-[var(--border-light)]'
                              }`}
                            >
                              {isAccountSelected(account.id) && (
                                <CheckIcon
                                  fontSize="small"
                                  className="text-surface-medium"
                                />
                              )}
                            </button>
                          </div>
                        ))}

                        {/* Delete Broker Data Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBroker(broker.type);
                          }}
                          className="group flex gap-4 items-center"
                          aria-label={t('management.deleteBrokerData')}
                        >
                          <div className="flex items-center justify-center w-10 h-10 ml-2 rounded-full theme-bg-hover transition-colors bg-background-card">
                            <Icon
                              variant="trash"
                              size={20}
                              className="theme-text-primary"
                            />
                          </div>
                          <span className="text-sm theme-text-primary font-medium">
                            {t('management.deleteBrokerData')} <Beta />
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Broker Button */}
            <div className="overflow-hidden align-start w-full flex items-center theme-surface">
              <button
                onClick={handleAddBroker}
                className="group ms-14 flex items-center gap-2"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full theme-bg-hover transition-colors theme-text-primary bg-background-card">
                  <AccountBalanceIcon fontSize="small" />
                </div>
                <span className="text-sm theme-text-primary font-medium">
                  {t('management.addBroker')}
                </span>
              </button>
            </div>

            {/* Token Management Button */}
            <div className="border-t theme-border ms-14 py-3 mt-5">
              <button
                onClick={handleTokenManagement}
                className="group w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full theme-bg-hover transition-colors bg-background-card">
                    <ListAltIcon
                      fontSize="small"
                      className="theme-text-primary"
                    />
                  </div>
                  <span className="text-sm theme-text-primary font-medium">
                    {t('management.tokenManagement')}
                    <Beta />
                  </span>
                </div>
                <Icon
                  variant="chevronRight"
                  size={20}
                  className="theme-text-secondary"
                />
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      <Modal
        open={!!deleteConfirmBroker}
        onOpenChange={(isOpen) => !isOpen && handleCancelDelete()}
        maxWidth="sm"
        zIndex={10000}
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
              <ModalTitle>{t('management.deleteConfirmTitle')}</ModalTitle>
              <p className="text-[var(--text-secondary)] text-xl leading-6 tracking-[-0.2px]">
                {t('management.deleteWarning')}
              </p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="!px-6 !pt-0 !pb-0">
          <p className="text-sm theme-text-secondary">
            {t('management.deleteConfirmText')}{' '}
            <span className="font-medium theme-text-primary">
              {brokers.find(
                (b) =>
                  b.type ===
                  (deleteConfirmBroker || lastDeleteBrokerRef.current)
              )?.name ||
                deleteConfirmBroker ||
                lastDeleteBrokerRef.current}
            </span>
            {t('management.deleteConfirmSuffix')}
          </p>
        </ModalBody>
        <ModalFooter align="right">
          <Button onClick={handleCancelDelete} variant="secondary" size="md">
            {t('management.cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} variant="negative" size="md">
            {t('management.delete')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default BrokerManagementDialog;
