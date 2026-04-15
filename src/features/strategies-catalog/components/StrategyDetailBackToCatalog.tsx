'use client';

import { Link } from '@/shared/ui/Navigation';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/shared/i18n/client';

interface StrategyDetailBackToCatalogProps {
  className?: string;
}

const StrategyDetailBackToCatalog = ({
  className,
}: StrategyDetailBackToCatalogProps) => {
  const { t } = useTranslation('common');

  return (
    <Link
      to="/strategies-catalog"
      className={`flex items-center gap-2 text-text-muted text-xs ${className}`}
    >
      <Icon variant="chevronLeftSmall" size={20} />{' '}
      {t('strategiesCatalog.detail.backToCatalog')}
    </Link>
  );
};

export default StrategyDetailBackToCatalog;
