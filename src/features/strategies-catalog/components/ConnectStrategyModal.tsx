'use client';

import React from 'react';
import { Link } from '@/shared/ui/Navigation';
import { Modal, ModalBody } from '@/shared/ui/Modal';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';

interface ConnectStrategyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategyName?: string;
}

export const ConnectStrategyModal: React.FC<ConnectStrategyModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation('common');

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="sm"
      showCloseButton={false}
      className="!bg-background-card pt-6 p-4"
    >
      <ModalBody className="px-4 pt-0 pb-4">
        <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
          {t('strategiesCatalog.connectModal.redirectTitle')}
        </h2>

        <p className="text-sm text-text-muted mb-6 text-center">
          {t('strategiesCatalog.connectModal.brokerRequired')}
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="https://comon.ru"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
          >
            <Button className="w-full" variant="primary" size="md">
              {t('strategiesCatalog.connectModal.goToComon')}
            </Button>
          </Link>
          <Link
            to="https://finam.ru"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
          >
            <Button variant="secondary" size="md" className="w-full">
              {t('strategiesCatalog.connectModal.openFinamAccount')}
            </Button>
          </Link>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default ConnectStrategyModal;
