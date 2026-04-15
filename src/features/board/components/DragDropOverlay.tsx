import { useTranslation } from '@/shared/i18n/client';

interface DragDropOverlayProps {
  isVisible: boolean;
}

const DragDropOverlay = ({ isVisible }: DragDropOverlayProps) => {
  const { t } = useTranslation('board');

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-[1000] pointer-events-none">
      <div className="bg-white p-5 rounded-lg shadow-lg text-center">
        <div className="text-2xl mb-2">📄</div>
        <div className="text-base font-bold text-blue-500">
          {t('dragDrop.dropToUpload')}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {t('dragDrop.supportedFormats')}
        </div>
      </div>
    </div>
  );
};

export default DragDropOverlay;
