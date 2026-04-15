import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/shared/ui/Modal';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import { Icon } from '@/shared/ui/Icon/Icon';
import React from 'react';

interface DeleteCardConfirmDialogProps {
  open: boolean;
  cardCount: number;
  signalCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteCardConfirmDialog: React.FC<DeleteCardConfirmDialogProps> = ({
  open,
  cardCount,
  signalCount,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation('board');
  const title =
    cardCount === 1
      ? t('deleteDialog.titleSingle')
      : t('deleteDialog.titleMultiple', { count: cardCount });

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onCancel()}
      maxWidth="sm"
      zIndex={1600}
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
            <ModalTitle>{title}</ModalTitle>
            <p className="text-[var(--text-secondary)] text-xl leading-6 tracking-[-0.2px]">
              {t('deleteDialog.cannotUndo')}
            </p>
          </div>
        </div>
      </ModalHeader>
      <ModalBody className="!px-6 !pt-0 !pb-0">
        {signalCount > 0 && (
          <div className="rounded bg-[var(--color-negative)]/10 border border-[var(--color-negative)]/24 p-3">
            <p className="text-sm text-[var(--text-primary)]">
              <span
                dangerouslySetInnerHTML={{
                  __html: t('deleteDialog.signalWarning', {
                    count: signalCount,
                  }),
                }}
              />{' '}
              {t('deleteDialog.signalWarningDetail')}
            </p>
          </div>
        )}
      </ModalBody>
      <ModalFooter align="between" className="!px-6 !py-6">
        <Button
          variant="secondary"
          size="md"
          onClick={onCancel}
          className="!w-[180px]"
        >
          {t('deleteDialog.cancel')}
        </Button>
        <Button
          variant="negative"
          size="md"
          onClick={onConfirm}
          className="!w-[180px]"
        >
          {t('deleteDialog.delete')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteCardConfirmDialog;
