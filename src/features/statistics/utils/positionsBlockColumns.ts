import type { TFunction } from 'i18next';

export type ColAlign = 'left' | 'center' | 'right';

export function getPositionsBlockColumns(
  t: TFunction<'statistics'>
): { key: string; label: string; align: ColAlign }[] {
  return [
    { key: 'instrument', label: t('columns.instrument'), align: 'left' },
    { key: 'broker', label: t('columns.broker'), align: 'right' },
    { key: 'account', label: t('columns.account'), align: 'right' },
    { key: 'exchange', label: t('columns.exchange'), align: 'right' },
    { key: 'quantity', label: t('columns.quantity'), align: 'right' },
    { key: 'avgOpenPrice', label: t('columns.purchasePrice'), align: 'right' },
    { key: 'currentPrice', label: t('columns.currentPrice'), align: 'right' },
    { key: 'unrealizedPnlPct', label: t('columns.changePct'), align: 'right' },
    {
      key: 'unrealizedPnlMoney',
      label: t('columns.unrealizedPnl'),
      align: 'right',
    },
    { key: 'realizedPnl', label: t('columns.realizedPnl'), align: 'right' },
    { key: 'action', label: '', align: 'right' },
  ];
}
