import { useTranslation } from '@/shared/i18n/client';
import Image from 'next/image';
import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
interface ContextMenuProps {
  open: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onCreateNote: () => void;
  onSearchTicker: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  open,
  position,
  onClose,
  onCreateNote,
  onSearchTicker,
}) => {
  const { t } = useTranslation('board');

  return (
    <Menu
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          backgroundColor: 'var(--surface-medium)',
          border: '1px solid var(--border-light)',
        },
      }}
      MenuListProps={{
        sx: {
          '& .MuiButtonBase-root': {
            borderRadius: '0 !important',
            color: 'var(--text-primary)',
            '&:hover': {
              backgroundColor: 'var(--bg-hover)',
            },
          },
          '& .MuiListItemIcon-root': {
            minWidth: '36px',
          },
          '& .MuiListItemText-root': {
            color: 'var(--text-primary)',
          },
        },
      }}
      anchorReference="anchorPosition"
      anchorPosition={{
        top: position.y,
        left: position.x,
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <MenuItem
        onClick={() => {
          onCreateNote();
          onClose();
        }}
      >
        <ListItemIcon>
          <Image
            src="/images/new-document.svg"
            alt={t('contextMenu.createNote')}
            className="w-5 h-5 theme-icon-invert"
            width={20}
            height={20}
          />
        </ListItemIcon>
        <ListItemText>{t('contextMenu.createNote')}</ListItemText>
      </MenuItem>

      <MenuItem
        onClick={() => {
          onSearchTicker();
          onClose();
        }}
      >
        <ListItemIcon>
          <Image
            src="/images/magnifier.svg"
            alt={t('contextMenu.searchByTicker')}
            className="w-5 h-5 theme-icon-invert"
            width={20}
            height={20}
          />
        </ListItemIcon>
        <ListItemText>{t('contextMenu.searchByTicker')}</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default ContextMenu;
