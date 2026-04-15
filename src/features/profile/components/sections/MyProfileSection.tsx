'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { cookieStorage } from '@/shared/utils/cookies';
import Avatar from '@/shared/ui/Avatar';
import Input from '@/shared/ui/Input';
import { Icon } from '@/shared/ui/Icon';
import Button from '@/shared/ui/Button';
import ProgressBar from '@/shared/ui/ProgressBar';
import { Dropdown } from '@/shared/ui/Dropdown';
import type { DropdownItem } from '@/shared/ui/Dropdown';
import { useTranslation } from '@/shared/i18n/client';
import { showErrorToast } from '@/shared/utils/toast';
import {
  useUpdateProfileMutation,
  useDeleteAccountMutation,
} from '../../queries';
import { useAvatarUpload } from '../../hooks/useAvatarUpload';
import AvatarCropModal from '../AvatarCropModal';
import ChangePasswordModal from '../ChangePasswordModal';
import { DeleteProfileDialog } from '@/features/profile/components/DeleteProfileDialog';
import AvatarDeleteModal from '../AvatarDeleteModal';

/**
 * AvatarBadge — camera icon overlay for avatar
 *
 * Figma node: 960:81355
 */
const AvatarBadge: React.FC = () => (
  <div className="absolute top-0 right-0 w-spacing-24 h-spacing-24 rounded-radius-80 flex items-center justify-center overflow-hidden bg-background-base">
    <div className="bg-wrapper-a12 w-full h-full rounded-radius-80 flex items-center justify-center border-border-2xs border-background-base">
      <Icon
        variant="cam"
        size={12}
        className="text-texticon-black_inverse_a100"
      />
    </div>
  </div>
);

/* ── Avatar block ── */

const AvatarSection: React.FC = () => {
  const { t } = useTranslation('profile');
  const { avatarUrl, firstName, currentUser } = useAuthStore();
  const displayName = firstName || currentUser || '';

  const {
    fileInputRef,
    cropImageSrc,
    cropModalOpen,
    deleteModalOpen,
    isUploading,
    isDeleting,
    handleAvatarAction,
    handleFileSelect,
    handleCropSave,
    handleCropModalClose,
    handleDeleteConfirm,
    handleDeleteModalClose,
  } = useAvatarUpload();

  const avatarItems: DropdownItem[] = [
    { label: t('myProfile.selectImage'), value: 'select', leftIcon: 'folder' },
    ...(avatarUrl
      ? [
          {
            label: t('myProfile.deleteImage'),
            value: 'delete',
            leftIcon: 'trash' as const,
            variant: 'negative' as const,
          },
        ]
      : []),
  ];

  return (
    <>
      <Dropdown
        trigger={({ onClick, triggerRef }) => (
          <div
            className="relative w-fit self-start cursor-pointer"
            onClick={onClick}
            ref={triggerRef}
          >
            <Avatar size="L" name={displayName} src={avatarUrl} showInitials />
            <AvatarBadge />
          </div>
        )}
        items={avatarItems}
        onSelect={handleAvatarAction}
        placement="bottom"
        menuClassName="w-[256px]"
        disabled={isUploading}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {cropImageSrc && (
        <AvatarCropModal
          open={cropModalOpen}
          onOpenChange={handleCropModalClose}
          imageSrc={cropImageSrc}
          onSave={handleCropSave}
          loading={isUploading}
        />
      )}

      <AvatarDeleteModal
        open={deleteModalOpen}
        onOpenChange={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </>
  );
};

/* ── Name + email fields block ── */

const profileSchema = z.object({
  firstName: z.string().trim(),
  lastName: z.string().trim(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ProfileFields: React.FC = () => {
  const { t } = useTranslation('profile');
  const {
    currentUser,
    firstName: storeFirstName,
    lastName: storeLastName,
  } = useAuthStore();
  const updateProfileMutation = useUpdateProfileMutation();

  const { register, handleSubmit, reset, formState } = useForm<ProfileFormData>(
    {
      resolver: zodResolver(profileSchema),
      mode: 'onBlur',
      defaultValues: {
        firstName: storeFirstName ?? '',
        lastName: storeLastName ?? '',
      },
    }
  );

  // Sync store → form only when form is not dirty (no unsaved edits)
  const prevStoreRef = useRef({
    firstName: storeFirstName,
    lastName: storeLastName,
  });
  useEffect(() => {
    const prev = prevStoreRef.current;
    if (prev.firstName !== storeFirstName || prev.lastName !== storeLastName) {
      prevStoreRef.current = {
        firstName: storeFirstName,
        lastName: storeLastName,
      };
      if (!formState.isDirty) {
        reset({
          firstName: storeFirstName ?? '',
          lastName: storeLastName ?? '',
        });
      }
    }
  }, [storeFirstName, storeLastName, formState.isDirty, reset]);

  const onBlur = handleSubmit((data) => {
    if (
      data.firstName === (storeFirstName ?? '') &&
      data.lastName === (storeLastName ?? '')
    ) {
      return;
    }
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        reset(data);
      },
      onError: () => showErrorToast(t('myProfile.profileUpdateError')),
    });
  });

  const email = currentUser ?? '';

  return (
    <div className="flex flex-col gap-spacing-16">
      <div className="flex flex-col gap-spacing-8">
        <div className="flex gap-spacing-8">
          <div className="flex-1">
            <Input
              {...register('firstName')}
              placeholder={t('myProfile.firstNamePlaceholder')}
              onBlur={onBlur}
              size="md"
            />
          </div>
          <div className="flex-1">
            <Input
              {...register('lastName')}
              placeholder={t('myProfile.lastNamePlaceholder')}
              onBlur={onBlur}
              size="md"
            />
          </div>
        </div>
        <p className="text-12 leading-16 text-blackinverse-a56">
          {t('myProfile.nameHint')}
        </p>
      </div>

      <Input
        placeholder="email@example.com"
        value={email}
        disabled
        size="md"
        hint={t('myProfile.emailHint')}
      />
    </div>
  );
};

/* ── Subscription info block ── */

interface SubscriptionInfoProps {
  tokensUsed: number;
  tokensTotal: number;
  label: string;
  plan: string;
  expiresAt: string;
}

const SubscriptionInfo: React.FC<SubscriptionInfoProps> = ({
  tokensUsed,
  tokensTotal,
  label,
  plan,
  expiresAt,
}) => {
  const { t } = useTranslation('profile');

  return (
    <div className="flex flex-col gap-spacing-16">
      <ProgressBar
        current={tokensUsed}
        total={tokensTotal}
        title={t('myProfile.subscription.tokens')}
        label={label}
        sublabel={plan}
        description={t('myProfile.expiresAt', { date: expiresAt })}
      />
      <Button variant="ghost" size="sm" className="self-start">
        {t('myProfile.chooseSubscription')}
      </Button>
    </div>
  );
};

/* ── Main component ── */

const MyProfileSection: React.FC = () => {
  const { t } = useTranslation('profile');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const currentUser = useAuthStore((s) => s.currentUser);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteAccountMutation = useDeleteAccountMutation();

  // TODO: replace with real API data when available
  const subscription = {
    plan: t('myProfile.subscription.free'),
    label: t('myProfile.subscription.trialPeriod'),
    expiresAt: '17.02.2026',
    tokensUsed: 320657,
    tokensTotal: 600000,
  };

  const handleDeleteConfirm = async () => {
    if (!currentUser) return;
    await deleteAccountMutation.mutateAsync(
      { email: currentUser },
      {
        onSuccess: () => {
          cookieStorage.clearTokens();
          localStorage.removeItem('current_board_id');
          window.location.replace('/welcome?demo=true');
        },
        onError: () => {
          showErrorToast(t('myProfile.deleteModal.error'));
        },
      }
    );
  };

  return (
    <div className="flex flex-row gap-spacing-24 max-w-[520px]">
      <AvatarSection />

      {/* Profile data */}
      <div className="flex flex-col gap-spacing-32 pt-spacing-28 w-[412px]">
        <div className="flex flex-col gap-spacing-32">
          <ProfileFields />

          <Button
            variant="secondary"
            size="md"
            className="self-start"
            onClick={() => setChangePasswordOpen(true)}
          >
            {t('myProfile.changePassword')}
          </Button>

          <SubscriptionInfo
            tokensUsed={subscription.tokensUsed}
            tokensTotal={subscription.tokensTotal}
            label={subscription.label}
            plan={subscription.plan}
            expiresAt={subscription.expiresAt}
          />
        </div>

        <Button
          variant="secondary"
          size="md"
          className="self-start !text-colors-status_negative_base"
          onClick={() => setDeleteDialogOpen(true)}
        >
          {t('myProfile.deleteProfile')}
        </Button>
      </div>
      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />

      <DeleteProfileDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteAccountMutation.isPending}
        userEmail={currentUser ?? ''}
      />
    </div>
  );
};

export default MyProfileSection;
