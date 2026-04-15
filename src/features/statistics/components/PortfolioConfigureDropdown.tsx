'use client';

import { DropdownBase } from '@/shared/ui/Dropdown/DropdownBase';
import Button from '@/shared/ui/Button';
import { useTranslation } from '@/shared/i18n/client';
import { useStatisticsStore } from '@/stores/statisticsStore';
import { useBoardStore } from '@/stores/boardStore';
import { portfolioApi } from '@/services/api/portfolio';
import { logger } from '@/shared/utils/logger';
import {
  portfolioCatalogQueryKeys,
  usePortfoliosWithSummaryQuery,
} from '@/features/portfolio-catalog/queries';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { cn } from '@/shared/utils/cn';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import SelectDropdown from './SelectDropdown';

/** Settings panel — portfolio selector + Save button (Figma node-id=2015:12047) */
const PortfolioSettingsPanel = ({
  onClose,
  onPersist,
}: {
  onClose: () => void;
  onPersist?: (portfolioId: number | null) => void;
}) => {
  const { t } = useTranslation('statistics');
  const { t: tPortfolio } = useTranslation('portfolio');
  const { data: portfolios } = usePortfoliosWithSummaryQuery();

  const selectedPortfolioId = useStatisticsStore(
    (state) => state.selectedPortfolioId
  );
  const applyFilter = useStatisticsStore((state) => state.applyFilter);

  const [localPortfolioId, setLocalPortfolioId] = useState<number | null>(
    selectedPortfolioId
  );

  // Sync local state when the store value loads asynchronously
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current && selectedPortfolioId !== null) {
      setLocalPortfolioId(selectedPortfolioId);
      initializedRef.current = true;
    }
  }, [selectedPortfolioId]);

  const selectedPortfolio = portfolios?.find((p) => p.id === localPortfolioId);

  // Sentinel value "" represents "all portfolios" (null portfolioId)
  const ALL_PORTFOLIOS_VALUE = '';

  const portfolioItems = useMemo(
    () => [
      { label: tPortfolio('chart.allAssets'), value: ALL_PORTFOLIOS_VALUE },
      ...(portfolios?.map((p) => ({ label: p.name, value: String(p.id) })) ??
        []),
    ],
    [portfolios, tPortfolio]
  );

  const handleSave = () => {
    applyFilter({
      portfolioId: localPortfolioId,
      portfolioName: selectedPortfolio?.name ?? null,
      accountIds: null,
    });
    onPersist?.(localPortfolioId);
    onClose();
  };

  return (
    <div className="flex flex-col max-h-[471px] /* no spacing token for 471 */">
      {/* Settings rows */}
      <div className="flex-1 flex flex-col gap-spacing-12 pt-spacing-20 px-spacing-20 pb-spacing-40">
        <SelectDropdown
          label={t('positions.portfolio')}
          items={portfolioItems}
          value={
            localPortfolioId != null
              ? String(localPortfolioId)
              : ALL_PORTFOLIOS_VALUE
          }
          onChange={(val) => {
            setLocalPortfolioId(
              val === ALL_PORTFOLIOS_VALUE ? null : Number(val)
            );
          }}
          placeholder={t('positions.virtualPortfolio')}
          data-testid="portfolio-selector"
        />
      </div>

      {/* Save button */}
      <div className="flex flex-col items-center justify-end px-spacing-20 pb-spacing-20">
        <Button
          variant="primary"
          fullWidth
          onClick={handleSave}
          data-testid="settings-save-button"
        >
          {t('positions.save')}
        </Button>
      </div>
    </div>
  );
};

/**
 * "Настроить" dropdown — opens PortfolioSettingsPanel with portfolio selector + Save.
 * Used in PositionsTableFooter and ChartPortfolioSelector.
 */
export const PortfolioConfigureDropdown = () => {
  const { t } = useTranslation('statistics');
  const queryClient = useQueryClient();
  const boardId = useBoardStore((state) => state.boardId);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownBase
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={({ isOpen: open, onClick, triggerRef }) => (
        <button
          ref={triggerRef}
          onClick={onClick}
          type="button"
          className={cn(
            'inline-flex items-center justify-center overflow-hidden',
            'h-spacing-24 py-spacing-4 pl-spacing-8 pr-spacing-6 gap-spacing-4',
            'rounded-radius-2',
            'bg-transparent backdrop-blur-normal',
            'transition-colors duration-200'
          )}
          data-testid="configure-dropdown"
        >
          <span className="text-12 leading-16 font-medium tracking-tight-1 text-blackinverse-a56 max-w-[200px] /* no spacing token for 200 */ overflow-hidden text-ellipsis whitespace-nowrap">
            {t('positions.configure')}
          </span>
          <KeyboardArrowDownIcon
            sx={{ width: 16, height: 16 }}
            className={cn(
              'text-blackinverse-a56 transition-transform duration-200',
              { 'rotate-180': open }
            )}
          />
        </button>
      )}
      menu={
        <PortfolioSettingsPanel
          onClose={() => setIsOpen(false)}
          onPersist={(pid) => {
            if (boardId) {
              portfolioApi
                .setBoardPortfolioId(boardId, pid)
                .then(() => {
                  void queryClient.invalidateQueries({
                    queryKey:
                      portfolioCatalogQueryKeys.boardPortfolioSettings(boardId),
                  });
                })
                .catch((err) =>
                  logger.error(
                    'PortfolioConfigureDropdown',
                    'Failed to persist board portfolio',
                    err
                  )
                );
            }
          }}
        />
      }
      menuClassName="w-[432px] /* no spacing token for 432 */ rounded-radius-4 border border-blackinverse-a4 bg-surfacegray-high shadow-[0px_20px_76px_0px_rgba(0,0,0,0.2)] /* no shadow token */ backdrop-blur-effects-modal"
      placement="top"
      offset={8}
    />
  );
};
