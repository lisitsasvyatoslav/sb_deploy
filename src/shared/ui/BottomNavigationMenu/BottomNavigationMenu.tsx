import React, { useState, useRef, useEffect, useCallback } from 'react';
import { m } from 'framer-motion';
import IconButton from '@/shared/ui/IconButton';
import Tooltip from '@/shared/ui/Tooltip';
import { Icon } from '@/shared/ui/Icon';
import SignalWidgetCatalog from '@/features/board/components/SignalWidgetCatalog';
import StrategyWidgetCatalog from '@/features/board/components/StrategyWidgetCatalog';
import type { SignalSourceType } from '@/features/board/components/SignalWidgetCatalog';
import type { CardType } from '@/types/common';
import { useTranslation } from '@/shared/i18n/client';
import {
  GlowBorder,
  useGlowTarget,
  useOnboardingUIStore,
} from '@/features/onboarding';

/**
 * BottomNavigationMenu — toolbar
 *
 * Figma node: 2282:1285
 */
interface BottomNavigationMenuProps {
  onSelectionModeClick?: () => void;
  onSignalSelect?: (signalType: SignalSourceType) => void;
  onDocumentClick?: () => void;
  onMagnifierClick?: () => void;
  onNewsWidgetClick?: () => void;
  showMiniMap?: boolean;
  onMiniMapClick?: () => void;
  onStrategyWidgetSelect?: (widgetType: CardType) => void;
}

const TooltipLabel: React.FC<{ label: string; hotkey?: string }> = ({
  label,
  hotkey,
}) => (
  <span className="flex items-center gap-1.5">
    <span>{label}</span>
    {hotkey && (
      <kbd className="text-[11px] leading-4 font-[450] text-[var(--Black-Inverse-A56)] [font-family:inherit]">
        {hotkey}
      </kbd>
    )}
  </span>
);

const BottomNavigationMenu: React.FC<BottomNavigationMenuProps> = ({
  onSelectionModeClick,
  onSignalSelect,
  onDocumentClick,
  onMagnifierClick,
  onNewsWidgetClick,
  showMiniMap = false,
  onMiniMapClick,
  onStrategyWidgetSelect,
}) => {
  const { t } = useTranslation('board');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [isStrategyCatalogOpen, setIsStrategyCatalogOpen] = useState(false);
  const [isSignalCatalogOpen, setIsSignalCatalogOpen] = useState(false);
  const strategyRef = useRef<HTMLDivElement>(null);
  const signalRef = useRef<HTMLDivElement>(null);

  const handleStrategyClick = useCallback(() => {
    setIsStrategyCatalogOpen((prev) => !prev);
    setIsSignalCatalogOpen(false);
  }, []);

  const handleSignalClick = useCallback(() => {
    setIsSignalCatalogOpen((prev) => !prev);
    setIsStrategyCatalogOpen(false);
  }, []);

  const handleStrategyWidgetSelect = useCallback(
    (widgetType: CardType) => {
      setIsStrategyCatalogOpen(false);
      onStrategyWidgetSelect?.(widgetType);
    },
    [onStrategyWidgetSelect]
  );

  const handleSignalWidgetSelect = useCallback(
    (signalType: SignalSourceType) => {
      setIsSignalCatalogOpen(false);
      onSignalSelect?.(signalType);
    },
    [onSignalSelect]
  );

  // Toggle strategy catalog via hotkey event
  useEffect(() => {
    if (!onStrategyWidgetSelect) {
      setIsStrategyCatalogOpen(false);
      return;
    }

    const handler = () => {
      setIsStrategyCatalogOpen((prev) => !prev);
      setIsSignalCatalogOpen(false);
    };
    window.addEventListener('toggleStrategyCatalog', handler);
    return () => window.removeEventListener('toggleStrategyCatalog', handler);
  }, [onStrategyWidgetSelect]);

  // Toggle signal catalog via hotkey event
  useEffect(() => {
    if (!onSignalSelect) {
      setIsSignalCatalogOpen(false);
      return;
    }

    const handler = () => {
      setIsSignalCatalogOpen((prev) => !prev);
      setIsStrategyCatalogOpen(false);
    };
    window.addEventListener('toggleSignalCatalog', handler);
    return () => window.removeEventListener('toggleSignalCatalog', handler);
  }, [onSignalSelect]);

  // Close catalogs when clicking outside
  useEffect(() => {
    if (!isStrategyCatalogOpen && !isSignalCatalogOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        isStrategyCatalogOpen &&
        strategyRef.current &&
        !strategyRef.current.contains(event.target as Node)
      ) {
        setIsStrategyCatalogOpen(false);
      }
      if (
        isSignalCatalogOpen &&
        signalRef.current &&
        !signalRef.current.contains(event.target as Node)
      ) {
        setIsSignalCatalogOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isStrategyCatalogOpen, isSignalCatalogOpen]);

  const isOnboardingDocked = useOnboardingUIStore(
    (s) => s.isGuideOpen && s.widgetMode === 'docked'
  );
  const dockedWidth = useOnboardingUIStore((s) => s.dockedWidth);
  const toolbarGlow = useGlowTarget('board-toolbar');
  const tickerGlow = useGlowTarget('add-ticker');

  return (
    <m.div
      className="fixed top-1/2 -translate-y-1/2 z-[1200] flex flex-col items-center overflow-visible"
      style={{ right: isOnboardingDocked ? dockedWidth + 12 : 12 }}
    >
      <GlowBorder active={toolbarGlow} borderRadius={4} borderWidth={3}>
        <div className="flex flex-col items-center gap-1 bg-background-gray_low backdrop-blur-effects-panel rounded-[2px] shadow-effects-panel overflow-visible">
          {/* Button group */}
          <div className="flex flex-col gap-0.5">
            {/* Selection Mode (strategy only) */}
            {onSelectionModeClick && (
              <div
                className="relative flex"
                onMouseEnter={() => setHoveredButton('selection')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <IconButton
                  icon={
                    <Icon
                      variant="cursor"
                      size={24}
                      style={{ color: 'var(--text-primary)' }}
                    />
                  }
                  onClick={onSelectionModeClick}
                  ariaLabel={t('bottomNav.selectionMode')}
                  size={24}
                  className="!w-12 !h-12 !p-3 hover:!bg-[var(--blackinverse-a4)]"
                />
                <Tooltip
                  content={
                    <TooltipLabel
                      label={t('bottomNav.selectionMode')}
                      hotkey="V"
                    />
                  }
                  show={hoveredButton === 'selection'}
                  position="left"
                  variant="compact"
                />
              </div>
            )}

            {/* Note */}
            <div
              className="relative flex"
              onMouseEnter={() => setHoveredButton('note')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <IconButton
                icon={
                  <Icon
                    variant="sticky"
                    size={24}
                    style={{ color: 'var(--text-primary)' }}
                  />
                }
                onClick={onDocumentClick}
                ariaLabel={t('bottomNav.note')}
                size={24}
                className="!w-12 !h-12 !p-3 hover:!bg-[var(--blackinverse-a4)]"
              />
              <Tooltip
                content={
                  <TooltipLabel label={t('bottomNav.note')} hotkey="N" />
                }
                show={hoveredButton === 'note'}
                position="left"
                variant="compact"
              />
            </div>

            {/* Strategies (strategy only) */}
            {onStrategyWidgetSelect && (
              <div
                ref={strategyRef}
                className="relative flex"
                onMouseDown={(e) => e.nativeEvent.stopPropagation()}
                onMouseEnter={() => setHoveredButton('strategy')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <Icon
                  variant="markerTools"
                  size={16}
                  className="absolute bottom-0 left-0 z-10 pointer-events-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                <IconButton
                  icon={
                    <Icon
                      variant="target"
                      size={24}
                      style={{
                        color: isStrategyCatalogOpen
                          ? 'var(--color-accent)'
                          : 'var(--text-primary)',
                      }}
                    />
                  }
                  onClick={handleStrategyClick}
                  ariaLabel={t('bottomNav.strategies')}
                  size={24}
                  className={`!w-12 !h-12 !p-3 ${isStrategyCatalogOpen ? 'hover:!bg-[var(--accent-active)]' : 'hover:!bg-[var(--blackinverse-a4)]'}`}
                />
                {!isStrategyCatalogOpen && (
                  <Tooltip
                    content={
                      <TooltipLabel
                        label={t('bottomNav.strategies')}
                        hotkey="S"
                      />
                    }
                    show={hoveredButton === 'strategy'}
                    position="left"
                    variant="compact"
                  />
                )}
                <StrategyWidgetCatalog
                  isOpen={isStrategyCatalogOpen}
                  onSelect={handleStrategyWidgetSelect}
                />
              </div>
            )}

            {/* Signal */}
            {onSignalSelect && (
              <div
                ref={signalRef}
                className="relative flex"
                onMouseDown={(e) => e.nativeEvent.stopPropagation()}
                onMouseEnter={() => setHoveredButton('signal')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <Icon
                  variant="markerTools"
                  size={16}
                  className="absolute bottom-0 left-0 z-10 pointer-events-none"
                  style={{ color: 'var(--text-primary)' }}
                />
                <IconButton
                  icon={
                    <Icon
                      variant="flash"
                      size={24}
                      style={{
                        color: isSignalCatalogOpen
                          ? 'var(--color-accent)'
                          : 'var(--text-primary)',
                      }}
                    />
                  }
                  onClick={handleSignalClick}
                  ariaLabel={t('bottomNav.signals')}
                  size={24}
                  className={`!w-12 !h-12 !p-3 ${isSignalCatalogOpen ? 'hover:!bg-[var(--accent-active)]' : 'hover:!bg-[var(--blackinverse-a4)]'}`}
                />
                {!isSignalCatalogOpen && (
                  <Tooltip
                    content={
                      <TooltipLabel label={t('bottomNav.signals')} hotkey="K" />
                    }
                    show={hoveredButton === 'signal'}
                    position="left"
                    variant="compact"
                  />
                )}
                <SignalWidgetCatalog
                  isOpen={isSignalCatalogOpen}
                  onSelect={handleSignalWidgetSelect}
                />
              </div>
            )}

            {/* Ticker */}
            <GlowBorder active={tickerGlow} borderRadius={4} borderWidth={3}>
              <div
                className="relative flex"
                onMouseEnter={() => setHoveredButton('ticker')}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <IconButton
                  icon={
                    <Icon
                      variant="lineChartOutline"
                      size={24}
                      style={{ color: 'var(--text-primary)' }}
                    />
                  }
                  onClick={onMagnifierClick}
                  ariaLabel={t('bottomNav.ticker')}
                  size={24}
                  className="!w-12 !h-12 !p-3 hover:!bg-[var(--blackinverse-a4)]"
                />
                <Tooltip
                  content={
                    <TooltipLabel label={t('bottomNav.ticker')} hotkey="T" />
                  }
                  show={hoveredButton === 'ticker'}
                  position="left"
                  variant="compact"
                />
              </div>
            </GlowBorder>

            {/* News Widget */}
            <div
              className="relative flex"
              onMouseEnter={() => setHoveredButton('news')}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <IconButton
                icon={
                  <Icon
                    variant="megaphone"
                    size={24}
                    style={{ color: 'var(--text-primary)' }}
                  />
                }
                onClick={onNewsWidgetClick}
                ariaLabel={t('bottomNav.news')}
                size={24}
                className="!w-12 !h-12 !p-3 hover:!bg-[var(--blackinverse-a4)]"
              />
              <Tooltip
                content={<TooltipLabel label={t('bottomNav.news')} />}
                show={hoveredButton === 'news'}
                position="left"
                variant="compact"
              />
            </div>
          </div>

          {/* Separator */}
          <div className="w-5 h-px bg-wrapper-a8" />

          {/* Mini Map */}
          <div
            className="relative flex"
            onMouseEnter={() => setHoveredButton('minimap')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <IconButton
              icon={
                <Icon
                  variant="map"
                  size={24}
                  style={{
                    color: showMiniMap
                      ? 'var(--color-accent)'
                      : 'var(--text-primary)',
                  }}
                />
              }
              onClick={onMiniMapClick}
              ariaLabel={t('bottomNav.miniMap')}
              size={24}
              className={`!w-12 !h-12 !p-3 ${showMiniMap ? 'hover:!bg-[var(--accent-active)]' : 'hover:!bg-[var(--blackinverse-a4)]'}`}
            />
            <Tooltip
              content={
                <TooltipLabel label={t('bottomNav.miniMap')} hotkey="M" />
              }
              show={hoveredButton === 'minimap'}
              position="left"
              variant="compact"
            />
          </div>
        </div>
      </GlowBorder>
    </m.div>
  );
};

export default BottomNavigationMenu;
