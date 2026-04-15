import { useTranslation } from '@/shared/i18n/client';
import { getCurrencySymbol } from '@/features/ticker/utils/currency';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { originalValue: number; date: string } }>;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
}) => {
  const { t, i18n } = useTranslation('ticker');
  const locale = getLocaleTag(i18n.language);

  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const price = data.originalValue;
  const date = data.date;

  const formatPrice = (p: number) =>
    p.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    });

  return (
    <div className="bg-white rounded-2xl shadow-lg px-6 py-4 border border-gray-light">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-8">
          <span className="text-base font-semibold text-black tracking-[-0.128px]">
            {t('tooltip.date')}
          </span>
          <span className="text-base font-normal text-black tracking-[-0.128px]">
            {date}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-black"></div>
          <span className="text-base font-normal text-black tracking-[-0.128px]">
            {t('tooltip.price')}
          </span>
          <span className="text-base font-medium text-black tracking-[-0.128px] ml-auto">
            {formatPrice(price)} {getCurrencySymbol(undefined)}
          </span>
        </div>
      </div>
    </div>
  );
};
