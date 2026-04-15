'use client';

import React from 'react';
import { Modal, ModalBody, ModalFooter } from '@/shared/ui/Modal';
import { Icon } from '@/shared/ui/Icon/Icon';
import Button from '@/shared/ui/Button/Button';
import { useTranslation } from '@/shared/i18n/client';

export interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  warning?: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  title,
  description,
  warning,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  const { t } = useTranslation('common');

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      maxWidth="sm"
      zIndex={9999}
    >
      <ModalBody className="!p-0">
        {/* middle — icon + title+subtitle */}
        <div className="flex flex-col items-start gap-spacing-24 px-spacing-24 pt-spacing-24 pb-spacing-16">
          <div className="w-base-64 h-base-64 p-spacing-20 rounded-radius-80 bg-base-accent_accentdangera20 flex items-center justify-center">
            <Icon
              variant="trash"
              size={24}
              className="text-base-accent_accentdanger"
            />
          </div>

          <div className="flex flex-col gap-spacing-8 self-stretch">
            <h2 className="font-semibold text-24 leading-32 tracking-tight-2 text-blackinverse-a100">
              {title}
            </h2>
            <p className="font-normal text-16 leading-24 tracking-tight-1 text-blackinverse-a56 whitespace-pre-line">
              {description}
            </p>
            {warning && (
              <p className="font-normal text-16 leading-24 tracking-tight-1 text-blackinverse-a100">
                {warning}
              </p>
            )}
          </div>
        </div>
      </ModalBody>

      <ModalFooter align="between" className="!p-spacing-24">
        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          disabled={isDeleting}
          className="flex-1"
          data-testid="delete-confirm-cancel"
        >
          {t('ideas.deleteBoard.cancel')}
        </Button>
        <Button
          variant="negative"
          size="md"
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1"
          data-testid="delete-confirm-submit"
        >
          {isDeleting
            ? t('ideas.deleteBoard.confirming')
            : t('ideas.deleteBoard.confirm')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteConfirmDialog;
