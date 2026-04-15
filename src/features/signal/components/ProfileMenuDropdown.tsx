/**
 * ProfileMenuDropdown Component
 * Complete profile menu with settings, signals, grid toggle, and logout
 */

import { Icon } from '@/shared/ui/Icon';
import Switch from '@/shared/ui/Switch';
import { useTranslation } from '@/shared/i18n/client';
import { useLogout } from '@/shared/hooks/useLogout';
import { useSettingsNavStore } from '@/stores/settingsNavStore';
import { Check, GridViewOutlined } from '@mui/icons-material';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

import SignalDropdown from './SignalDropdown';

interface ProfileMenuDropdownProps {
  isGridView: boolean;
  onToggleGridView: () => void;
  onCloseMenu: () => void;
}

const ProfileMenuDropdown: React.FC<ProfileMenuDropdownProps> = ({
  isGridView,
  onToggleGridView,
  onCloseMenu,
}) => {
  const { t } = useTranslation('signal');
  const handleLogout = useLogout();
  const saveReferrer = useSettingsNavStore((state) => state.saveReferrer);

  // Check if we are on board page to show signals dropdown
  const pathname = usePathname();
  const isBoardPage = pathname?.startsWith('/ideas/');

  // Theme state
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-surface theme-border max-w-[360px] rounded-[24px] shadow-dropdown p-4 flex flex-col gap-2 min-w-[280px]">
      {/* Settings Link */}
      <Link
        href="/profile"
        onClick={() => {
          saveReferrer();
          onCloseMenu();
        }}
        className="flex items-center gap-4 h-10 p-2 rounded-12 transition-colors no-underline text-inherit hover:bg-surface-hover"
      >
        <Icon variant="settings" size={24} className="text-text-primary" />
        <div className="flex-1 flex flex-col gap-0.5 justify-center">
          <p className="font-inter font-semibold text-sm tracking-[-0.2px] leading-5 text-text-primary m-0">
            {t('profileMenu.profileSettings')}
          </p>
        </div>
        <Icon
          variant="chevronRight"
          size={24}
          className="text-text-secondary"
        />
      </Link>

      {/* Webhook URL Section - only on board page */}
      {isBoardPage && <SignalDropdown />}

      {/* Grid View Toggle */}
      <div className="flex items-center gap-3 h-10 px-2 py-2 rounded-12 hover:bg-surface-hover transition-colors">
        <GridViewOutlined className="!w-6 !h-6 text-text-primary" />
        <span className="flex-1 font-inter font-medium text-sm text-text-primary tracking-[-0.056px] leading-5 text-left">
          {t('profileMenu.gridView')}
        </span>
        <Switch
          checked={isGridView}
          onChange={onToggleGridView}
          aria-label={t('profileMenu.gridView')}
        />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => {
          setTheme(theme === 'light' ? 'dark' : 'light');
          onCloseMenu();
        }}
        className="flex items-center gap-3 h-10 p-2 rounded-12 transition-colors bg-transparent border-none w-full text-left hover:bg-surface-hover"
      >
        {theme === 'light' ? (
          <Icon variant="themeDark" size={24} className="text-text-primary" />
        ) : (
          <Icon variant="themeLight" size={24} className="text-text-primary" />
        )}
        <span className="flex-1 font-inter font-medium text-sm tracking-[-0.056px] leading-5 text-text-primary text-left">
          {theme === 'light'
            ? t('profileMenu.darkTheme')
            : t('profileMenu.lightTheme')}
        </span>
        <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
          <Check sx={{ fontSize: 10 }} className="text-white" />
        </div>
      </button>

      {/* Logout Button */}
      <button
        onClick={() => {
          onCloseMenu();
          handleLogout();
        }}
        className="flex items-center gap-3 h-10 p-2 rounded-12 transition-colors bg-transparent border-none w-full text-left hover:bg-surface-hover"
      >
        <Icon variant="logout" size={24} className="text-text-primary" />
        <span className="font-inter font-medium text-sm tracking-[-0.056px] leading-5 text-text-primary">
          {t('profileMenu.logout')}
        </span>
      </button>
    </div>
  );
};

export default ProfileMenuDropdown;
