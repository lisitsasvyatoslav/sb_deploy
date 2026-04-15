import React from 'react';
import { useTranslation } from '@/shared/i18n/client';
import { Info } from '@mui/icons-material';
import { Link } from '@/shared/ui/Navigation';

// TODO [MOCK] — тарифы и комиссии должны приходить из API
interface TariffItem {
  title: string;
  lines: { label: string; description: string }[];
}

const MOCK_TARIFFS: TariffItem[] = [
  {
    title: 'Комбинированный',
    lines: [
      {
        label: 'Автоследование В',
        description: '2% годовых от суммы чистых активов',
      },
      {
        label: 'Автоследование SFSmR',
        description: '5% от инвестиционного дохода в рублях',
      },
    ],
  },
  {
    title: 'Тариф от СЧА 3',
    lines: [
      {
        label: 'Автоследование В',
        description: '2% годовых от суммы чистых активов',
      },
    ],
  },
];

const StrategyDetailTariffs: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-14 leading-20 font-semibold text-text-primary">
          {t('strategiesCatalog.detail.availableTariffs')}
        </span>
        <button
          type="button"
          className="text-12 leading-20 text-blackinverse-a32 hover:text-text-primary transition cursor-pointer"
        >
          {t('strategiesCatalog.detail.allTariffs')}
        </button>
      </div>

      {/* Tariff cards */}
      <div className="grid grid-cols-2 gap-3">
        {MOCK_TARIFFS.map((tariff, idx) => (
          <div
            key={idx}
            className="bg-background-card rounded p-3 flex flex-col gap-2"
          >
            <span className="text-14 leading-20 font-semibold text-blackinverse-a32">
              {tariff.title}
            </span>
            {tariff.lines.map((line) => (
              <div key={line.label} className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className="text-12 leading-16 text-mind-accent hover:underline transition text-left cursor-pointer"
                >
                  {line.label}
                </button>
                <span className="text-12 leading-16 text-blackinverse-a32">
                  {line.description}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Commission notice */}
      <div className="bg-background-card rounded px-4 py-3 flex items-center justify-between flex-wrap">
        <div className="flex items-center gap-3">
          <Info className="shrink-0 text-blackinverse-a100" />
          <span className="flex-1 text-12 leading-16 text-blackinverse-a100 max-w-[345px]">
            {t('strategiesCatalog.detail.commissionNotice')}
          </span>
        </div>
        {/* todo add link */}
        <Link
          to="#"
          className="text-12 leading-16 text-blackinverse-a32 font-medium hover:underline transition shrink-0"
        >
          {t('strategiesCatalog.detail.tariffsLink')}
        </Link>
      </div>
    </div>
  );
};

export default StrategyDetailTariffs;
