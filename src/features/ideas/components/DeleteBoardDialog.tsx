import { Modal, ModalBody, ModalFooter } from '@/shared/ui/Modal';
import { Icon } from '@/shared/ui/Icon/Icon';
import { useTranslation } from '@/shared/i18n/client';
import React from 'react';

export interface DeleteBoardDialogProps {
  open: boolean;
  boardName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const DeleteBoardDialog: React.FC<DeleteBoardDialogProps> = ({
  open,
  boardName,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const { t } = useTranslation('common');

  return (
    <Modal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      maxWidth="sm"
      zIndex={9999}
    >
      <ModalBody className="!px-6 !pt-6 !pb-0">
        <div className="flex flex-col items-center gap-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
            aria-label={t('ideas.deleteBoard.closeAriaLabel')}
          >
            <Icon
              variant="close"
              size={20}
              className="text-[var(--blackinverse-a56)]"
            />
          </button>

          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[rgba(237,64,48,0.2)]">
            <Icon
              variant="trash"
              size={24}
              className="text-[rgba(255,154,144,1)]"
            />
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-inter font-normal text-[28px] leading-[34px] tracking-[-0.3px] text-[var(--blackinverse-a100)]">
              {t('ideas.deleteBoard.title')}
            </h2>
            <p className="font-inter font-normal text-[16px] leading-[22px] text-[var(--blackinverse-a72)]">
              {t('ideas.deleteBoard.body')}
            </p>
          </div>
        </div>
      </ModalBody>

      <ModalFooter align="between" className="!px-6 !py-6">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="flex items-center justify-center w-[180px] h-10 rounded-[2px] bg-[var(--chat-bubble-bg)] font-inter font-medium text-[14px] text-[var(--blackinverse-a100)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
        >
          {t('ideas.deleteBoard.cancel')}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex items-center justify-center w-[180px] h-10 rounded-[2px] bg-[#ed4030] font-inter font-medium text-[14px] text-white hover:bg-[#d63828] transition-colors disabled:opacity-50"
        >
          {isLoading
            ? t('ideas.deleteBoard.confirming')
            : t('ideas.deleteBoard.confirm')}
        </button>
      </ModalFooter>
    </Modal>
  );
};
