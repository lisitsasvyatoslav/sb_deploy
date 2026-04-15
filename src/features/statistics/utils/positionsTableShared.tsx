import { useTranslation } from '@/shared/i18n/client';
import { DataTableRow, DataTableCell } from '@/shared/ui/DataTable';
import { getLocaleTag } from '@/shared/utils/formatLocale';
import type { BrokerTrade } from '@/types';
import React from 'react';
import { TableCellString, TableCellNumbers } from '@/shared/ui/DataTable/cells';
import {
  currencySymbol,
  formatDateTime,
  formatNumber,
  formatQuantity,
  getExchange,
} from './positionsTableUtils';

interface TradeRowProps {
  trade: BrokerTrade;
  currency?: string;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const TradeRow = React.memo<TradeRowProps>(
  ({ trade, currency, isSelected, onClick }) => {
    const { t, i18n } = useTranslation('statistics');
    const locale = getLocaleTag(i18n.language);
    const exchange = getExchange(trade.symbol);
    const total = parseFloat(trade.price) * parseFloat(trade.size);
    const sym = currencySymbol(currency);

    return (
      <DataTableRow state={isSelected ? 'active' : 'default'} onClick={onClick}>
        {/* Date/time */}
        <DataTableCell align="left">
          <TableCellString
            value={formatDateTime(trade.timestamp)}
            className="justify-start"
          />
        </DataTableCell>

        {/* Broker */}
        <DataTableCell align="right">
          <TableCellString value={trade.brokerType} />
        </DataTableCell>

        {/* Account */}
        <DataTableCell align="right">
          <TableCellString value={trade.accountId} />
        </DataTableCell>

        {/* Exchange */}
        <DataTableCell align="right">
          <TableCellString value={exchange} />
        </DataTableCell>

        {/* Quantity */}
        <DataTableCell align="right">
          <TableCellNumbers value={formatQuantity(trade.size, locale)} />
        </DataTableCell>

        {/* Side */}
        <DataTableCell align="right">
          <TableCellString
            value={
              trade.side?.toLowerCase() === 'buy'
                ? t('trades.buy')
                : t('trades.sell')
            }
          />
        </DataTableCell>

        {/* Price */}
        <DataTableCell align="right">
          <TableCellNumbers
            value={`${formatNumber(trade.price, 2, locale)} ${sym}`}
          />
        </DataTableCell>

        {/* Currency */}
        <DataTableCell align="right">
          <TableCellString value={sym} />
        </DataTableCell>

        {/* Trade amount */}
        <DataTableCell align="right">
          <TableCellNumbers
            value={`${formatNumber(total, 2, locale)} ${sym}`}
          />
        </DataTableCell>
      </DataTableRow>
    );
  }
);

TradeRow.displayName = 'TradeRow';
