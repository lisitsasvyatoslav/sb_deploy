import React, { useState, useRef, useEffect } from 'react';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';

interface ChatItemProps {
  title: string;
  isActive?: boolean;
  onDelete?: () => void;
  onExpand?: () => void;
  onPin?: () => void;
  onArchive?: () => void;
  onClick?: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  title,
  isActive = false,
  onDelete,
  onExpand,
  onPin,
  onArchive,
  onClick,
}) => {
  const { t } = useTranslation('chat');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onExpand?.();
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onPin?.();
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onArchive?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onDelete?.();
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex items-center justify-between py-3 px-3 cursor-pointer transition-colors border-b border-border-light ${
        isActive
          ? 'bg-background-card'
          : isHovered
            ? 'bg-overlay-light'
            : 'bg-transparent'
      }`}
    >
      <span className="text-[14px] text-text-primary truncate flex-1 pr-2">
        {title}
      </span>

      {/* Three-dot menu button */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={handleMenuClick}
          className={`
            p-1 rounded transition-all text-text-secondary hover:text-text-primary
            ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}
          title={t('item.menu')}
        >
          <Icon variant="more" size={18} />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-1 min-w-[160px] rounded-[8px] shadow-lg z-50 overflow-hidden py-2 bg-surface-low">
            {/* Expand */}
            <button
              onClick={handleExpand}
              className="w-full px-3 py-2.5 flex items-center gap-3 transition-colors text-left bg-transparent hover:bg-overlay-light"
            >
              <OpenInFullIcon
                sx={{ fontSize: 16 }}
                className="text-text-secondary"
              />
              <span className="text-[13px] text-text-primary">
                {t('item.expand')}
              </span>
            </button>

            {/* Pin */}
            <button
              onClick={handlePin}
              className="w-full px-3 py-2.5 flex items-center gap-3 transition-colors text-left bg-transparent hover:bg-overlay-light"
            >
              <PushPinOutlinedIcon
                sx={{ fontSize: 16 }}
                className="text-text-secondary"
              />
              <span className="text-[13px] text-text-primary">
                {t('item.pin')}
              </span>
            </button>

            {/* Archive */}
            <button
              onClick={handleArchive}
              className="w-full px-3 py-2.5 flex items-center gap-3 transition-colors text-left bg-transparent hover:bg-overlay-light"
            >
              <ArchiveOutlinedIcon
                sx={{ fontSize: 16 }}
                className="text-text-secondary"
              />
              <span className="text-[13px] text-text-primary">
                {t('item.archive')}
              </span>
            </button>

            {/* Delete chat */}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2.5 flex items-center gap-3 transition-colors text-left bg-transparent hover:bg-overlay-light"
              >
                <Icon
                  variant="trash"
                  size={16}
                  className="text-text-secondary"
                />
                <span className="text-[13px] text-text-primary">
                  {t('item.deleteChat')}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatItem;
