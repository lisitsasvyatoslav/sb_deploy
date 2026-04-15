'use client';

import React, { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/shared/i18n/client';
import { useLogout } from '@/shared/hooks/useLogout';
import { onboardingApi, useOnboardingUIStore } from '@/features/onboarding';
import SignalDropdown from '@/features/signal/components/SignalDropdown';
import {
  DropdownBase,
  DropdownHeader,
  DropdownItemButton,
  DROPDOWN_CONTAINER_CLASSES,
  useDropdownContext,
} from '@/shared/ui/Dropdown';
import type {
  DropdownBaseTriggerProps,
  DropdownHeaderThemeValue,
  DropdownItem,
} from '@/shared/ui/Dropdown';
import { useLocale } from '@/shared/i18n/locale-provider';
import { SUPPORTED_LOCALES, LANGUAGE_COOKIE } from '@/shared/i18n/settings';
import { getClientRegion, regionConfig } from '@/shared/config/region';
import { isDev } from '@/shared/config/environment';
import { IconCountryFlag } from '@/shared/ui/IconCountryFlag';

export interface ProfileDropdownProps {
  trigger: (props: DropdownBaseTriggerProps) => React.ReactNode;
  onSettingsClick: () => void;
}

const BadgeLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-11 font-medium px-spacing-6 py-spacing-2 rounded-radius-8 bg-blackinverse-a4 text-blackinverse-a56">
    {children}
  </span>
);

function AppSwitchers() {
  const { setIsOpen } = useDropdownContext();
  const { locale, toggleLocale } = useLocale();

  const currentRegion = getClientRegion();
  const targetRegion = currentRegion === 'ru' ? 'us' : 'ru';
  const nextLocale = locale === 'ru' ? 'EN' : 'RU';

  const handleRegionToggle = useCallback(() => {
    const maxAge = 365 * 24 * 60 * 60;
    document.cookie = `dev-region-override=${targetRegion};path=/;max-age=${maxAge};samesite=lax`;
    document.cookie = `${LANGUAGE_COOKIE}=${regionConfig[targetRegion].defaultLocale};path=/;max-age=${maxAge};samesite=lax`;
    window.location.reload();
  }, [targetRegion]);

  if (!isDev) return null;

  return (
    <>
      <DropdownItemButton
        item={{
          label: 'Switch region to',
          value: 'region',
          leftIcon: (
            <IconCountryFlag
              variant={
                currentRegion === 'us' ? 'unitedStatesOfAmerica' : 'russia'
              }
              size={20}
            />
          ),
          rightIcon: <BadgeLabel>{targetRegion.toUpperCase()}</BadgeLabel>,
        }}
        onClick={handleRegionToggle}
      />

      {SUPPORTED_LOCALES.length > 1 && (
        <DropdownItemButton
          item={{
            label: 'Switch lang to',
            value: 'locale',
            leftIcon: 'global' as const,
            rightIcon: <BadgeLabel>{nextLocale}</BadgeLabel>,
          }}
          onClick={() => {
            toggleLocale();
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
}

function ProfileDropdownMenu({
  onSettingsClick,
}: Pick<ProfileDropdownProps, 'onSettingsClick'>) {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation('common');
  const { t: tSignal } = useTranslation('signal');
  const { setIsOpen } = useDropdownContext();
  const handleLogout = useLogout();

  const pathname = usePathname();
  const isBoardPage = pathname?.startsWith('/ideas/');

  const handleThemeChange = useCallback(
    (value: DropdownHeaderThemeValue) => setTheme(value),
    [setTheme]
  );

  const menuItems: (DropdownItem & { onClick: () => void })[] = useMemo(
    () => [
      {
        label: t('profile.settings'),
        value: 'settings',
        leftIcon: 'settings' as const,
        onClick: () => {
          onSettingsClick();
          setIsOpen(false);
        },
      },
      {
        label: t('profile.logout'),
        value: 'logout',
        leftIcon: 'logout' as const,
        onClick: () => {
          handleLogout();
          setIsOpen(false);
        },
      },
      ...(process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production'
        ? [
            {
              label: t('profile.restartOnboarding'),
              value: 'restart-onboarding',
              leftIcon: 'refresh' as const,
              onClick: () => {
                onboardingApi.reset().then(() => {
                  useOnboardingUIStore.getState().resetUIState();
                  window.location.reload();
                });
                setIsOpen(false);
              },
            },
          ]
        : []),
    ],
    [t, onSettingsClick, handleLogout, setIsOpen]
  );

  return (
    <>
      <DropdownHeader
        activeTheme={theme as DropdownHeaderThemeValue}
        onThemeChange={handleThemeChange}
      />

      {isBoardPage && (
        <div className="px-spacing-2 pb-spacing-1">
          <SignalDropdown
            title={tSignal('dropdown.title')}
            createButtonText={tSignal('dropdown.createButton')}
            emptyStateText={tSignal('dropdown.emptyState')}
            tradingViewLinkText={tSignal('dropdown.tradingViewLink')}
          />
        </div>
      )}

      <div className="py-spacing-6">
        <AppSwitchers />
        {menuItems.map((item) => (
          <DropdownItemButton
            key={item.value}
            item={item}
            onClick={item.onClick}
          />
        ))}
      </div>
    </>
  );
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  trigger,
  onSettingsClick,
}) => {
  return (
    <DropdownBase
      placement="top"
      menuClassName={DROPDOWN_CONTAINER_CLASSES}
      trigger={trigger}
      menu={<ProfileDropdownMenu onSettingsClick={onSettingsClick} />}
    />
  );
};

export default ProfileDropdown;
