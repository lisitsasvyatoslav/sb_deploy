'use client';

import { useTranslation } from '@/shared/i18n/client';
import Beta from '@/shared/ui/Beta';
import Checkbox from '@/shared/ui/Checkbox';
import { useClickOutside } from '@/shared/hooks';
import { useStatisticsStore } from '@/stores/statisticsStore';
import CachedIcon from '@mui/icons-material/Cached';
import PostAddIcon from '@mui/icons-material/PostAdd';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { Icon } from '@/shared/ui/Icon';
import { useRef, useState } from 'react';

interface PositionsOptionsMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const PositionsOptionsMenu = ({
  anchorEl,
  open,
  onClose,
}: PositionsOptionsMenuProps) => {
  const { t } = useTranslation('statistics');
  const [showClosedPositions, setShowClosedPositions] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const setShowBrokerManagementDialog = useStatisticsStore(
    (state) => state.setShowBrokerManagementDialog
  );

  useClickOutside(menuRef, onClose, open);

  const handleLoadTrades = () => {
    onClose();
  };

  const handleDownloadTrades = () => {
    onClose();
  };

  const handleBrokersAccounts = () => {
    setShowBrokerManagementDialog(true);
    onClose();
  };

  if (!open || !anchorEl) return null;

  const rect = anchorEl.getBoundingClientRect();

  return (
    <div
      ref={menuRef}
      className="fixed bg-surface-medium rounded-xl border border-border-light shadow-dropdown z-50 overflow-hidden min-w-[280px]"
      style={{
        top: `${rect.bottom + 8}px`,
        right: `${window.innerWidth - rect.right}px`,
      }}
    >
      <div className="py-2">
        {/* Show closed positions */}
        <div className="w-full px-4 py-2.5 hover:bg-background-preview transition-colors">
          <div className="flex items-center gap-3">
            <Icon variant="eye" size={20} className="text-black" />
            <span className="flex-1 text-sm text-black">
              {t('options.showClosedPositions')}
              <Beta />
            </span>
            <Checkbox
              checked={showClosedPositions}
              onChange={setShowClosedPositions}
            />
          </div>
        </div>

        {/* Update every 5 minutes */}
        <div className="w-full px-4 py-2.5 hover:bg-background-preview transition-colors">
          <div className="flex items-center gap-3">
            <CachedIcon fontSize="small" className="text-black" />
            <span className="flex-1 text-sm text-black">
              {t('options.autoRefresh')}
              <Beta />
            </span>
            <Checkbox checked={autoRefresh} onChange={setAutoRefresh} />
          </div>
        </div>

        {/* Divider */}
        <div className="my-1 border-t border-border-light" />

        {/* Load trades */}
        <button
          onClick={handleLoadTrades}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-background-preview transition-colors text-left"
        >
          <PostAddIcon fontSize="small" className="text-black" />
          <span className="text-sm text-black">
            {t('options.loadTrades')}
            <Beta />
          </span>
        </button>

        {/* Download trades */}
        <button
          onClick={handleDownloadTrades}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-background-preview transition-colors text-left"
        >
          <SystemUpdateAltIcon fontSize="small" className="text-black" />
          <span className="text-sm text-black">
            {t('options.downloadTrades')}
            <Beta />
          </span>
        </button>

        {/* Divider */}
        <div className="my-1 border-t border-border-light" />

        {/* Brokers and accounts */}
        <button
          onClick={handleBrokersAccounts}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-background-preview transition-colors text-left"
        >
          <Icon variant="settings" size={20} className="text-black" />
          <span className="text-sm text-black">
            {t('options.brokersAccounts')}
          </span>
        </button>
      </div>
    </div>
  );
};

export default PositionsOptionsMenu;
