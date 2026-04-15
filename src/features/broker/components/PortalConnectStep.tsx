import BrokerIcon from '@/shared/ui/BrokerIcon';
import Button from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';
import React, { useMemo } from 'react';
import { getAvailableBrokers } from '../constants';
import SyncDepthDropdown from './SyncDepthDropdown';
import WizardTwoPanelLayout from './WizardTwoPanelLayout';

interface PortalConnectStepProps {
  brokerType: string;
  portalOpened: boolean;
  isRegistering: boolean;
  isConfirming: boolean;
  error: string | null;
  onOpenPortal: () => void;
  onConfirm: () => void;
  syncDepthYears: number;
  onSyncDepthChange: (years: number) => void;
  onBack: () => void;
}

const PortalConnectStep: React.FC<PortalConnectStepProps> = ({
  brokerType,
  portalOpened,
  isRegistering,
  isConfirming,
  error,
  onOpenPortal,
  onConfirm,
  syncDepthYears,
  onSyncDepthChange,
  onBack,
}) => {
  const { t } = useTranslation('broker');
  const availableBrokers = useMemo(() => getAvailableBrokers(t), [t]);
  const broker = availableBrokers.find((b) => b.type === brokerType);

  return (
    <WizardTwoPanelLayout currentStep={2} onBack={onBack}>
      <div className="flex-1 flex flex-col items-center max-w-[480px] mx-auto w-full mt-base-8">
        {/* Broker Logo */}
        <div className="relative mb-base-24">
          <div className="w-[100px] h-[100px] bg-surfacemedium-surfacemedium border-2 border-[var(--border-light)] rounded-full flex items-center justify-center">
            <BrokerIcon broker={brokerType} size={60} />
          </div>
        </div>

        {/* Title and Description */}
        <div className="flex flex-col gap-base-8 items-center w-full text-center mb-base-24">
          <h2 className="text-24 font-semibold leading-32 text-[var(--text-primary)]">
            {portalOpened
              ? t('portal.waitingTitle')
              : t('portal.connectTo', { broker: broker?.name })}
          </h2>
          <p className="text-14 leading-20 text-[var(--text-secondary)]">
            {portalOpened
              ? t('portal.waitingDescription')
              : t('portal.description')}
          </p>
        </div>

        {/* Sync Depth Dropdown — temporarily hidden, depth is hardcoded to SYNC_DEPTH */}
        {/* <div className="w-full mb-base-24">
          <SyncDepthDropdown
            value={syncDepthYears}
            onChange={onSyncDepthChange}
          />
        </div> */}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-base-8 mb-base-16 text-14 text-status-negative">
            <Icon
              variant="exclamationMarkCircle"
              size={16}
              className="flex-shrink-0 mt-base-2"
            />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-base-12 w-full items-center">
          {!portalOpened ? (
            <Button
              type="button"
              onClick={onOpenPortal}
              disabled={isRegistering}
              variant="accent"
              loading={isRegistering}
            >
              {isRegistering ? t('portal.opening') : t('portal.openPortal')}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isConfirming}
              variant="accent"
              loading={isConfirming}
            >
              {isConfirming
                ? t('portal.confirming')
                : t('portal.confirmConnection')}
            </Button>
          )}
        </div>
      </div>
    </WizardTwoPanelLayout>
  );
};

export default PortalConnectStep;
