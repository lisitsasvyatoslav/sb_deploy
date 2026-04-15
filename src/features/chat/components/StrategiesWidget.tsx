import React, { useState } from 'react';
import { useTranslation } from '@/shared/i18n/client';
import StrategiesWidgetCards from '@/features/chat/components/StrategiesWidgetCards';

const StrategiesWidget: React.FC<{ strategyIds: number[] }> = ({
  strategyIds,
}) => {
  const { t } = useTranslation('chat');
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-primary">
        {t('strategiesWidget.description')}
      </p>
      <div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          disabled={expanded}
          className="px-3 py-2 rounded-[4px] text-[12px] font-medium text-text-primary bg-blackinverse-a12 backdrop-blur-[12px] hover:bg-blackinverse-a32 disabled:opacity-50 disabled:cursor-not-allowed transition w-fit"
        >
          {t('strategiesWidget.cta')}
        </button>
      </div>
      {expanded && <StrategiesWidgetCards strategyIds={strategyIds} />}
    </div>
  );
};

export default StrategiesWidget;
