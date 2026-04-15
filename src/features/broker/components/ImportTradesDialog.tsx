'use client';

import React, { useRef, useState } from 'react';
import Button from '@/shared/ui/Button';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/shared/ui/Modal';
import { useTranslation } from '@/shared/i18n/client';
import { useImportTradesMutation } from '@/features/broker/queries';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';
import { logger } from '@/shared/utils/logger';

interface ImportTradesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImportTradesDialog: React.FC<ImportTradesDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation('broker');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMutation = useImportTradesMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setErrors([]);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      const result = await importMutation.mutateAsync(selectedFile);
      setErrors(result.errors);

      if (result.imported > 0) {
        if (result.duplicates > 0) {
          showSuccessToast(
            t('csvImport.successWithDuplicates', {
              imported: result.imported,
              duplicates: result.duplicates,
            })
          );
        } else {
          showSuccessToast(t('csvImport.success', { count: result.imported }));
        }
      }

      if (result.errors.length === 0) {
        onOpenChange(false);
        setSelectedFile(null);
      }
    } catch (error) {
      logger.error('ImportTradesDialog', 'Import failed', error);
      showErrorToast(t('csvImport.error'));
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedFile(null);
      setErrors([]);
      importMutation.reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Modal open={open} onOpenChange={handleClose} maxWidth="sm" zIndex={60}>
      <ModalHeader>
        <ModalTitle>{t('csvImport.title')}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          {t('csvImport.description')}
        </p>
        <pre className="text-xs text-[var(--text-primary)] bg-[rgba(255,255,255,0.06)] border border-[var(--border-light)] rounded-lg p-3 mb-4 overflow-x-auto">
          {t('csvImport.formatExample')}
          {'\n'}2024-01-15,AAPL,buy,10,185.50
          {'\n'}2024-01-16,TSLA,sell,5,220.00
        </pre>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile
              ? t('csvImport.changeFile')
              : t('csvImport.selectFile')}
          </Button>
          {selectedFile && (
            <span className="text-sm text-[var(--text-primary)] truncate">
              {selectedFile.name}
            </span>
          )}
        </div>

        {errors.length > 0 && (
          <div className="bg-[var(--color-negative)]/8 border border-[var(--color-negative)]/20 rounded-lg p-3 max-h-40 overflow-y-auto">
            <p className="text-xs font-medium text-[var(--color-negative)] mb-1">
              {t('csvImport.validationErrors', { count: errors.length })}
            </p>
            {errors.map((err, i) => (
              <p key={i} className="text-xs text-[var(--color-negative)]">
                {err}
              </p>
            ))}
          </div>
        )}
      </ModalBody>
      <ModalFooter align="right">
        <Button
          onClick={() => handleClose(false)}
          variant="secondary"
          size="md"
        >
          {t('management.cancel')}
        </Button>
        <Button
          onClick={handleImport}
          variant="primary"
          size="md"
          disabled={!selectedFile || importMutation.isPending}
        >
          {importMutation.isPending
            ? t('csvImport.importing')
            : t('csvImport.import')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ImportTradesDialog;
