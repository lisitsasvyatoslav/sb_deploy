'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/shared/ui/Modal';
import Input from '@/shared/ui/Input';
import { Dropdown } from '@/shared/ui/Dropdown';
import type { DropdownItem } from '@/shared/ui/Dropdown';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import {
  usePublishToMarketplaceMutation,
  useDeploymentsQuery,
} from '@/features/strategy/queries';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { logger } from '@/shared/utils/logger';
import type { MarketplaceStrategyType } from '@/types';

interface PublishToMarketplaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  strategyId: number;
  strategyName: string;
  strategyDescription?: string;
}

const STRATEGY_TYPES: MarketplaceStrategyType[] = [
  'Trend',
  'MeanReversion',
  'Arbitrage',
  'News',
];

export const PublishToMarketplaceModal: React.FC<
  PublishToMarketplaceModalProps
> = ({ open, onOpenChange, strategyId, strategyName, strategyDescription }) => {
  const { t } = useTranslation('common');
  const publishMutation = usePublishToMarketplaceMutation();
  const { data: deployments } = useDeploymentsQuery(
    open ? strategyId : undefined
  );
  const hasDeployments = (deployments?.length ?? 0) > 0;

  const [title, setTitle] = useState(strategyName);
  const [description, setDescription] = useState(strategyDescription || '');
  const [strategyType, setStrategyType] =
    useState<MarketplaceStrategyType>('Trend');

  useEffect(() => {
    if (open) {
      setTitle(strategyName);
      setDescription(strategyDescription || '');
      setStrategyType('Trend');
    }
  }, [open, strategyName, strategyDescription]);

  const strategyTypeItems: DropdownItem[] = STRATEGY_TYPES.map((type) => ({
    label: t(`publishToMarketplace.strategyTypes.${type}`),
    value: type,
  }));

  const selectedTypeLabel =
    strategyTypeItems.find((item) => item.value === strategyType)?.label ||
    t('publishToMarketplace.strategyTypePlaceholder');

  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && publishMutation.isPending) return;
      onOpenChange(isOpen);
    },
    [onOpenChange, publishMutation.isPending]
  );

  const handleSubmit = useCallback(async () => {
    try {
      await publishMutation.mutateAsync({
        id: strategyId,
        data: {
          title: title.trim(),
          description: description.trim(),
          strategyType,
          riskLevel: 'Aggressive',
        },
      });
      showSuccessToast(t('publishToMarketplace.successToast'));
      onOpenChange(false);
    } catch (error) {
      logger.error(
        'PublishToMarketplaceModal',
        'Failed to publish strategy',
        error
      );
      showErrorToast(t('publishToMarketplace.errorToast'));
    }
  }, [
    publishMutation,
    strategyId,
    title,
    description,
    strategyType,
    t,
    onOpenChange,
  ]);

  const isSubmitDisabled =
    !title.trim() ||
    !description.trim() ||
    !hasDeployments ||
    publishMutation.isPending;

  return (
    <Modal open={open} onOpenChange={handleClose} maxWidth="md">
      <ModalHeader>
        <ModalTitle>{t('publishToMarketplace.title')}</ModalTitle>
      </ModalHeader>
      <ModalBody
        className="flex flex-col gap-spacing-24 px-spacing-24"
        padding="none"
      >
        {!hasDeployments && deployments !== undefined && (
          <div className="flex items-center gap-spacing-8 px-spacing-12 py-spacing-8 rounded-radius-2 bg-colors-status_negative_bg text-13 text-status-negative">
            {t('publishToMarketplace.noDeploymentsWarning')}
          </div>
        )}
        <div className="flex gap-spacing-24">
          <div className="flex-1">
            <Input
              label={t('publishToMarketplace.nameLabel')}
              placeholder={t('publishToMarketplace.namePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="md"
            />
          </div>
          <div className="flex-1">
            <label className="block text-12 leading-16 tracking-tight-1 font-normal mb-spacing-4 text-blackinverse-a72">
              {t('publishToMarketplace.strategyTypeLabel')}
            </label>
            <Dropdown
              trigger={({ isOpen, onClick, triggerRef }) => (
                <button
                  type="button"
                  ref={triggerRef}
                  onClick={onClick}
                  className="flex items-center justify-between w-full h-[40px] px-spacing-12 rounded-radius-2 bg-wrapper-a6 text-13 text-blackinverse-a100 hover:bg-wrapper-a8 transition-colors"
                >
                  <span>{selectedTypeLabel}</span>
                  <span
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  >
                    &#9662;
                  </span>
                </button>
              )}
              items={strategyTypeItems}
              selectedValue={strategyType}
              onSelect={(value) =>
                setStrategyType(value as MarketplaceStrategyType)
              }
              placement="bottom"
              zIndex={1400}
              matchTriggerWidth
            />
          </div>
        </div>
        <div>
          <label className="block text-12 leading-16 tracking-tight-1 font-normal mb-spacing-4 text-blackinverse-a72">
            {t('publishToMarketplace.descriptionLabel')}
          </label>
          <textarea
            className="w-full min-h-[100px] resize-none rounded-radius-2 bg-wrapper-a6 px-spacing-12 py-spacing-8 text-13 text-blackinverse-a100 placeholder:text-blackinverse-a56 outline-none focus:ring-1 focus:ring-brand-base transition-colors"
            placeholder={t('publishToMarketplace.descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="mt-spacing-4 text-12 leading-16 text-blackinverse-a56">
            {t('publishToMarketplace.descriptionHint')}
          </p>
        </div>
      </ModalBody>
      <ModalFooter
        align="right"
        className="gap-spacing-16 px-spacing-24 py-spacing-24"
      >
        <Button
          variant="secondary"
          size="md"
          onClick={() => handleClose(false)}
          type="button"
        >
          {t('publishToMarketplace.cancelButton')}
        </Button>
        <Button
          variant="accent"
          size="md"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          loading={publishMutation.isPending}
          type="button"
        >
          {t('publishToMarketplace.submitButton')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
