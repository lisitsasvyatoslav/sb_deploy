'use client';

import React, { useCallback, useRef, useState } from 'react';
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/shared/ui/Modal';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import { showErrorToast } from '@/shared/utils/toast';
import { getCroppedImage } from '../utils/cropImage';

interface AvatarCropModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onSave: (blob: Blob) => void;
  loading?: boolean;
}

const AvatarCropModal: React.FC<AvatarCropModalProps> = ({
  open,
  onOpenChange,
  imageSrc,
  onSave,
  loading,
}) => {
  const { t } = useTranslation('profile');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const initialCrop = centerCrop(
        makeAspectCrop({ unit: '%', width: 80 }, 1, width, height),
        width,
        height
      );
      setCrop(initialCrop);
      setCompletedCrop({
        unit: 'px',
        x: (initialCrop.x / 100) * width,
        y: (initialCrop.y / 100) * height,
        width: (initialCrop.width / 100) * width,
        height: (initialCrop.height / 100) * height,
      });
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;
    try {
      const blob = await getCroppedImage(imgRef.current, completedCrop);
      onSave(blob);
    } catch {
      showErrorToast(t('myProfile.avatarUploadError'));
    }
  }, [completedCrop, onSave, t]);

  return (
    <Modal open={open} onOpenChange={onOpenChange} maxWidth="sm">
      <ModalHeader>
        <ModalTitle>{t('myProfile.cropModal.title')}</ModalTitle>
      </ModalHeader>
      <ModalBody padding="none">
        <div className="flex items-center justify-center bg-blackinverse-a8 min-h-[300px]">
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            onComplete={setCompletedCrop}
            aspect={1}
            circularCrop
            ruleOfThirds
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt={t('myProfile.cropModal.imageAlt')}
              onLoad={onImageLoad}
              className="max-h-[344px] max-w-full block"
            />
          </ReactCrop>
        </div>
      </ModalBody>
      <ModalFooter align="between">
        <Button
          variant="secondary"
          size="md"
          onClick={() => onOpenChange(false)}
          fullWidth
        >
          {t('myProfile.cropModal.cancel')}
        </Button>
        <Button
          variant="accent"
          size="md"
          onClick={handleSave}
          loading={loading}
          disabled={!completedCrop}
          fullWidth
        >
          {t('myProfile.cropModal.save')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AvatarCropModal;
