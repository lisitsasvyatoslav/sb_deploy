'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from '@/shared/i18n/client';
import { createPasswordSchema } from '@/features/auth/components/PasswordValidationPanel';
import { Modal, ModalBody, ModalFooter } from '@/shared/ui/Modal';
import Button from '@/shared/ui/Button/Button';
import Input from '@/shared/ui/Input';
import { Icon } from '@/shared/ui/Icon';
import { isAxiosError } from 'axios';
import { showErrorToast } from '@/shared/utils/toast';
import { useChangePasswordMutation } from '../queries';

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChangePasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * ChangePasswordModal — modal for changing user password
 *
 * Figma node: 961:74049
 */
const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { t: tProfile } = useTranslation('profile');
  const { t: tAuth } = useTranslation('auth');
  const changePasswordMutation = useChangePasswordMutation();

  const [showSuccess, setShowSuccess] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const schema = useMemo(
    () =>
      z
        .object({
          oldPassword: z.string().min(1),
          newPassword: createPasswordSchema(tAuth),
          confirmPassword: z.string().min(1),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: tProfile('myProfile.changePasswordModal.passwordsMismatch'),
          path: ['confirmPassword'],
        }),
    [tAuth, tProfile]
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
  });

  const [oldPassword, newPassword, confirmPassword] = watch([
    'oldPassword',
    'newPassword',
    'confirmPassword',
  ]);
  const allFieldsFilled = !!oldPassword && !!newPassword && !!confirmPassword;

  useEffect(() => {
    if (open) {
      reset();
      setShowSuccess(false);
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open, reset]);

  const handleClose = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && changePasswordMutation.isPending) return;
      onOpenChange(isOpen);
    },
    [onOpenChange, changePasswordMutation.isPending]
  );

  const onSubmit = handleSubmit((data) => {
    changePasswordMutation.mutate(
      { oldPassword: data.oldPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          setShowSuccess(true);
        },
        onError: (error) => {
          if (isAxiosError(error) && error.response?.status === 400) {
            setError('oldPassword', {
              message: tProfile(
                'myProfile.changePasswordModal.wrongOldPassword'
              ),
            });
          } else {
            showErrorToast(tProfile('myProfile.changePasswordModal.error'));
          }
        },
      }
    );
  });

  const eyeToggle = (visible: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center justify-center cursor-pointer"
      tabIndex={-1}
    >
      <Icon variant={visible ? 'eye' : 'eyeHidden'} size={20} />
    </button>
  );

  return (
    <Modal open={open} onOpenChange={handleClose} maxWidth="sm">
      {showSuccess ? (
        <>
          <ModalBody
            className="flex flex-col gap-spacing-32 px-spacing-24 pb-spacing-32"
            padding="none"
          >
            <div className="flex items-center justify-center w-spacing-64 h-spacing-64 rounded-full bg-[color-mix(in_srgb,var(--mind-accent)_12%,transparent)]">
              <Icon variant="tick" size={24} className="text-mind-accent" />
            </div>

            <div className="flex flex-col gap-spacing-8">
              <p className="text-24 font-semibold leading-32 tracking-tight-2 text-blackinverse-a100">
                {tProfile('myProfile.changePasswordModal.successTitle')}
              </p>
              <p className="text-16 font-regular leading-24 tracking-tight-1 text-blackinverse-a56">
                {tProfile('myProfile.changePasswordModal.successSubtitle')}
              </p>
            </div>
          </ModalBody>

          <ModalFooter className="px-spacing-24 py-spacing-24" align="left">
            <Button
              variant="accent"
              size="md"
              onClick={() => handleClose(false)}
            >
              {tProfile('myProfile.changePasswordModal.understood')}
            </Button>
          </ModalFooter>
        </>
      ) : (
        <form onSubmit={onSubmit}>
          <ModalBody
            className="flex flex-col px-spacing-24 pb-spacing-16 gap-spacing-32"
            padding="none"
          >
            <div className="flex items-center justify-center w-spacing-64 h-spacing-64 rounded-full bg-[color-mix(in_srgb,var(--mind-accent)_12%,transparent)]">
              <Icon variant="editNote" size={24} className="text-mind-accent" />
            </div>

            <p className="text-24 font-semibold leading-32 tracking-tight-2 text-blackinverse-a100">
              {tProfile('myProfile.changePasswordModal.title')}
            </p>

            <div className="flex flex-col gap-spacing-16">
              <Input
                {...register('oldPassword')}
                type={showOldPassword ? 'text' : 'password'}
                placeholder={tProfile(
                  'myProfile.changePasswordModal.oldPassword'
                )}
                size="lg"
                error={errors.oldPassword?.message}
                rightIcon={eyeToggle(showOldPassword, () =>
                  setShowOldPassword((v) => !v)
                )}
              />
              <Input
                {...register('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                placeholder={tProfile(
                  'myProfile.changePasswordModal.newPassword'
                )}
                size="lg"
                error={errors.newPassword?.message}
                rightIcon={eyeToggle(showNewPassword, () =>
                  setShowNewPassword((v) => !v)
                )}
              />
              <Input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={tProfile(
                  'myProfile.changePasswordModal.confirmPassword'
                )}
                size="lg"
                error={errors.confirmPassword?.message}
                rightIcon={eyeToggle(showConfirmPassword, () =>
                  setShowConfirmPassword((v) => !v)
                )}
              />
            </div>
          </ModalBody>

          <ModalFooter className="gap-spacing-16 px-spacing-24 py-spacing-24">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={() => handleClose(false)}
              type="button"
            >
              {tProfile('myProfile.changePasswordModal.cancel')}
            </Button>
            <Button
              variant="accent"
              size="md"
              className="flex-1"
              type="submit"
              disabled={!allFieldsFilled}
              loading={changePasswordMutation.isPending}
            >
              {tProfile('myProfile.changePasswordModal.save')}
            </Button>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
};

export default ChangePasswordModal;
