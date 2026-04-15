import type { PeriodType, PortfolioValueHistoryResponse } from '@/types';
import { logger } from '@/shared/utils/logger';

/**
 * Normalizes ISO date string to Python format (backend)
 * JS: "2024-01-01T00:00:00.000Z" → Python: "2024-01-01T00:00:00+00:00"
 * Also handles case without milliseconds: "2024-01-01T00:00:00Z" → "2024-01-01T00:00:00+00:00"
 */
export const normalizeDateString = (isoString: string): string => {
  // Replace .000Z or simply Z with +00:00 for compatibility with backend
  return isoString.replace(/(\.\d{3})?Z$/, '+00:00');
};

/**
 * Generates a full date range for the selected period
 * Important for proper chart scaling
 * Date format compatible with backend (Python datetime.isoformat)
 */
export const generateFullDateRange = (
  dateFrom: string,
  dateTo: string,
  timeframe: string
): string[] => {
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  const dates: string[] = [];

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    logger.error('chartHelpers', 'Invalid dates in generateFullDateRange', {
      dateFrom,
      dateTo,
    });
    return [];
  }

  if (start > end) {
    logger.warn('chartHelpers', 'dateFrom > dateTo in generateFullDateRange', {
      dateFrom,
      dateTo,
    });
    return [];
  }

  if (timeframe === '1H') {
    let current = new Date(start);
    while (current <= end) {
      dates.push(normalizeDateString(current.toISOString()));
      current = new Date(current.getTime() + 60 * 60 * 1000); // +1 hour
    }
  } else if (timeframe === '4H') {
    let current = new Date(start);
    while (current <= end) {
      dates.push(normalizeDateString(current.toISOString()));
      current = new Date(current.getTime() + 4 * 60 * 60 * 1000); // +4 hours
    }
  } else if (timeframe === '1D') {
    let current = new Date(start);
    current.setUTCHours(0, 0, 0, 0);
    while (current <= end) {
      dates.push(normalizeDateString(current.toISOString()));
      current = new Date(current.getTime() + 24 * 60 * 60 * 1000); // +1 day
    }
  } else if (timeframe === '1W') {
    let current = new Date(start);
    current.setUTCHours(0, 0, 0, 0);
    while (current.getUTCDay() !== 1) {
      current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
    }
    while (current <= end) {
      dates.push(normalizeDateString(current.toISOString()));
      current = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
    }
  } else if (timeframe === '1MN') {
    let current = new Date(start);
    current.setUTCDate(1);
    current.setUTCHours(0, 0, 0, 0);
    while (current <= end) {
      dates.push(normalizeDateString(current.toISOString()));
      current = new Date(
        Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1)
      );
    }
  } else if (timeframe === '1QR') {
    let current = new Date(start);
    current.setUTCMonth(Math.floor(current.getUTCMonth() / 3) * 3); // Round to the start of the quarter
    current.setUTCDate(1);
    current.setUTCHours(0, 0, 0, 0);
    while (current <= end) {
      dates.push(normalizeDateString(current.toISOString()));
      current = new Date(
        Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 3, 1)
      );
    }
  }

  return dates;
};

/**
 * Formatting X-axis labels
 * Shows dates in the user's local time for convenience
 */
export const formatXAxisLabel = (
  dateStr: string,
  period: PeriodType,
  timeframe: string,
  locale = 'en-US'
): string => {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    logger.error('chartHelpers', 'Invalid date in formatXAxisLabel', {
      dateStr,
    });
    return '';
  }

  const month = date.getMonth();
  const day = date.getDate();

  if (period === '2d' || timeframe === '4H') {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return `${day} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  // For "all" period with daily/weekly data — show day + month (same as 1w/1m)
  if (period === 'all' && (timeframe === '1D' || timeframe === '1W')) {
    if (month === 0 && day === 1) {
      return date.getFullYear().toString();
    }
    return date
      .toLocaleDateString(locale, { day: 'numeric', month: 'short' })
      .toUpperCase();
  }

  // Для длинных периодов (месячные/квартальные данные от backend)
  const isLongPeriod =
    period === '6m' || period === '1y' || period === '3y' || period === 'all';

  if (isLongPeriod) {
    if (month === 0) {
      return date.getFullYear().toString();
    }
    return date.toLocaleDateString(locale, { month: 'short' }).toUpperCase();
  }

  if (timeframe === '1D' || timeframe === '1W') {
    if (month === 0 && day === 1) {
      return date.getFullYear().toString();
    }
    return date
      .toLocaleDateString(locale, { day: 'numeric', month: 'short' })
      .toUpperCase();
  }

  return date.toLocaleDateString(locale, { month: 'short' }).toUpperCase();
};

/**
 * Group dates by month, prioritising dates where data is available.
 * Uses local time for grouping (matches label display).
 */
const groupDatesByMonth = (
  dates: string[],
  datesWithData?: Set<string>
): string[] => {
  const monthsMap = new Map<string, string[]>();

  dates.forEach((dateStr) => {
    const date = new Date(dateStr);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthsMap.has(monthKey)) {
      monthsMap.set(monthKey, []);
    }
    monthsMap.get(monthKey)?.push(dateStr);
  });

  const monthlyDates: string[] = [];
  monthsMap.forEach((monthDates) => {
    let selectedDate = monthDates[monthDates.length - 1];

    if (datesWithData) {
      // Ищем последнюю дату которая имеет данные
      for (let i = monthDates.length - 1; i >= 0; i--) {
        if (datesWithData.has(monthDates[i])) {
          selectedDate = monthDates[i];
          break;
        }
      }
    }

    monthlyDates.push(selectedDate);
  });

  return monthlyDates.sort();
};

/**
 * Generating labels for the X-axis depending on the period
 *
 * The backend sends data with the correct granularity:
 * - 2d: 4-hour intervals (~12 points for 48 hours) with forward-fill for weekends
 * - 1w: daily data with forward-fill for weekends
 * - 1m: daily data with forward-fill for weekends
 * - 6m, 1y, 3y: daily data (grouped by month on the frontend)
 * - all: adaptive timeframe
 *
 * This function can additionally filter dates for X-axis readability.
 */
export const generateLabels = (
  dates: string[],
  period: PeriodType,
  data?: PortfolioValueHistoryResponse,
  datesWithData?: Set<string>
): string[] => {
  if (dates.length === 0) return [];

  // For long periods, we group by months
  // The backend sends daily data, but we need monthly labels for readability
  if (period === '6m' || period === '1y' || period === '3y') {
    const grouped = groupDatesByMonth(dates, datesWithData);
    if (grouped.length <= 2) return dates;
    return grouped;
  }

  if (period === 'all') {
    const timeframe = data?.timeframe;

    if (timeframe === '1H' || timeframe === '4H') {
      return dates;
    }

    if (timeframe === '1D') {
      const allMonthly = groupDatesByMonth(dates, datesWithData);

      if (allMonthly.length <= 2) return dates;

      if (allMonthly.length > 24) {
        const result = allMonthly.filter((_, index) => index % 2 === 0);
        const lastDate = allMonthly[allMonthly.length - 1];
        if (!result.includes(lastDate)) {
          result.push(lastDate);
        }
        return result;
      }

      return allMonthly;
    }

    return dates;
  }

  return dates;
};
