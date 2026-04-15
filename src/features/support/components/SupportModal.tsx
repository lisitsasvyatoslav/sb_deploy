'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from '@/shared/i18n/client';
import { useAuthStore } from '@/stores/authStore';
import { Modal, ModalBody, ModalFooter } from '@/shared/ui/Modal';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import { Icon } from '@/shared/ui/Icon';
import { Dropdown, DROPDOWN_CONTAINER_CLASSES } from '@/shared/ui/Dropdown';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';
import { supportApi } from '../api/supportApi';

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REASON_VALUES = [
  'Сообщить об ошибке',
  'Идеи и пожелания',
  'Общий вопрос',
] as const;

const SUPPORT_EMAIL = 'care@finam.ru';

const SupportModal: React.FC<SupportModalProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation('common');

  const currentUser = useAuthStore((s) => s.currentUser);
  const firstName = useAuthStore((s) => s.firstName);
  const lastName = useAuthStore((s) => s.lastName);

  const displayName = useMemo(() => {
    const parts = [firstName, lastName].filter(Boolean);
    if (parts.length) return parts.join(' ');
    return currentUser?.split('@')[0] ?? '';
  }, [firstName, lastName, currentUser]);

  const reasonOptions = useMemo(
    () => [
      { label: t('support.reasonBug'), value: 'Сообщить об ошибке' as const },
      { label: t('support.reasonIdeas'), value: 'Идеи и пожелания' as const },
      { label: t('support.reasonGeneral'), value: 'Общий вопрос' as const },
    ],
    [t],
  );

  const schema = useMemo(
    () =>
      z.object({
        reason: z.enum(REASON_VALUES, {
          error: t('support.reasonPlaceholder'),
        }),
        message: z.string().min(1, { message: t('support.messagePlaceholder') }),
      }),
    [t],
  );

  type SupportFormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<SupportFormData>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
  });

  const reason = watch('reason');
  const message = watch('message');
  const isFormFilled = !!reason && !!message?.trim();

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: supportApi.createRequest,
  });

  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && mutation.isPending) return;
      onOpenChange(isOpen);
    },
    [onOpenChange, mutation.isPending],
  );

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data, {
      onSuccess: () => {
        showSuccessToast(t('support.success'));
        handleClose(false);
      },
      onError: () => {
        showErrorToast(t('support.error'));
      },
    });
  });

  const handleCopyEmail = useCallback(() => {
    navigator.clipboard.writeText(SUPPORT_EMAIL).then(() => {
      showSuccessToast(t('support.emailCopied'));
    });
  }, [t]);

  const selectedReasonLabel = useMemo(
    () => reasonOptions.find((o) => o.value === reason)?.label,
    [reason, reasonOptions],
  );

  return (
    <Modal open={open} onOpenChange={handleClose} maxWidth="sm">
      <form onSubmit={onSubmit}>
        <ModalBody
          className="flex flex-col px-spacing-24 pb-spacing-16 gap-spacing-24"
          padding="none"
        >
          <div className="flex items-center justify-center w-spacing-64 h-spacing-64 rounded-full bg-[color-mix(in_srgb,var(--mind-accent)_12%,transparent)]">
            <Icon variant="questionMarkCircle" size={24} className="text-mind-accent" />
          </div>

          <p className="text-24 font-semibold leading-32 tracking-tight-2 text-blackinverse-a100">
            {t('support.title')}
          </p>

          <div className="flex flex-col gap-spacing-16">
            <Input
              value={displayName}
              label={t('support.name')}
              size="lg"
              readOnly
              disabled
            />

            <Input
              value={currentUser ?? ''}
              label={t('support.email')}
              size="lg"
              readOnly
              disabled
            />

            <div className="flex flex-col gap-spacing-4">
              <label className="text-14 font-medium leading-20 text-blackinverse-a56">
                {t('support.reason')}
              </label>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    placement="bottom"
                    matchTriggerWidth
                    trigger={({ onClick, triggerRef, isOpen }) => (
                      <button
                        type="button"
                        ref={triggerRef}
                        onClick={onClick}
                        className={`flex items-center justify-between w-full h-spacing-48 px-spacing-16 rounded-radius-12 border transition-colors ${
                          errors.reason
                            ? 'border-critical-fg'
                            : 'border-blackinverse-a8 hover:border-blackinverse-a16'
                        } bg-surface-secondary text-left ${
                          field.value
                            ? 'text-blackinverse-a100'
                            : 'text-blackinverse-a32'
                        }`}
                      >
                        <span className="text-16 leading-24 truncate">
                          {selectedReasonLabel ?? t('support.reasonPlaceholder')}
                        </span>
                        <Icon
                          variant="chevronDown"
                          size={20}
                          className={`text-blackinverse-a56 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                    items={reasonOptions}
                    selectedValue={field.value}
                    onSelect={(value) => field.onChange(value)}
                    menuClassName={DROPDOWN_CONTAINER_CLASSES}
                  />
                )}
              />
              {errors.reason && (
                <span className="text-12 text-critical-fg">
                  {errors.reason.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-spacing-4">
              <label className="text-14 font-medium leading-20 text-blackinverse-a56">
                {t('support.message')}
              </label>
              <textarea
                {...register('message')}
                placeholder={t('support.messagePlaceholder')}
                rows={5}
                className={`w-full px-spacing-16 py-spacing-12 rounded-radius-12 border transition-colors resize-none ${
                  errors.message
                    ? 'border-critical-fg'
                    : 'border-blackinverse-a8 hover:border-blackinverse-a16 focus:border-blackinverse-a32'
                } bg-surface-secondary text-16 leading-24 text-blackinverse-a100 placeholder:text-blackinverse-a32 outline-none`}
              />
              {errors.message && (
                <span className="text-12 text-critical-fg">
                  {errors.message.message}
                </span>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter
          className="gap-spacing-16 px-spacing-24 py-spacing-24"
          leftContent={
            <button
              type="button"
              onClick={handleCopyEmail}
              className="flex items-center gap-spacing-4 text-14 leading-20 text-blackinverse-a56 hover:text-blackinverse-a100 transition-colors cursor-pointer"
            >
              <span>{t('support.emailHint')}</span>
              <span className="text-mind-accent underline">{SUPPORT_EMAIL}</span>
            </button>
          }
        >
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleClose(false)}
            type="button"
          >
            {t('support.cancel')}
          </Button>
          <Button
            variant="accent"
            size="md"
            type="submit"
            disabled={!isFormFilled || mutation.isPending}
            loading={mutation.isPending}
          >
            {t('support.submit')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default SupportModal;
