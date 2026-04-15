import { Ticker } from '@/types/ticker';

// Helper function to generate mock sparkline data with YYYY-MM-DD dates
const generateSparklineData = (values: number[]) => {
  const now = new Date();
  return values.map((value, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (values.length - 1 - index));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return {
      date: `${year}-${month}-${day}`,
      value: value,
    };
  });
};

// Mock ticker data based on Figma design
export const MOCK_TICKERS: Ticker[] = [
  {
    id: '1',
    name: 'Банк ВТБ',
    symbol: 'VTBR',
    price: 67.98,
    priceChange: -0.1,
    priceChangePercent: -0.15,
    yearlyChange: -15.6,
    yearlyChangePercent: -18.66,
    sparkline: generateSparklineData([68, 67.5, 68.2, 67.8, 67.98]),
    category: 'popular',
    lastUpdate: '14:45',
  },
  {
    id: '2',
    name: 'Сбербанк',
    symbol: 'SBER',
    price: 292.29,
    priceChange: -3.18,
    priceChangePercent: -1.08,
    yearlyChange: 36.87,
    yearlyChangePercent: 14.44,
    sparkline: generateSparklineData([295, 293, 294, 292.5, 292.29]),
    category: 'popular',
    lastUpdate: '14:45',
  },
  {
    id: '3',
    name: 'Роснефть',
    symbol: 'ROSN',
    price: 410.65,
    priceChange: -1.3,
    priceChangePercent: -0.3,
    yearlyChange: -36.87,
    yearlyChangePercent: -14.27,
    sparkline: generateSparklineData([412, 411, 410.5, 411.2, 410.65]),
    category: 'popular',
    lastUpdate: '14:45',
  },
  {
    id: '4',
    name: 'ЛУКОЙЛ',
    symbol: 'LKOH',
    price: 6254.5,
    priceChange: -11.5,
    priceChangePercent: -0.18,
    yearlyChange: -695.5,
    yearlyChangePercent: -10.01,
    sparkline: generateSparklineData([6266, 6258, 6255, 6256, 6254.5]),
    category: 'popular',
    lastUpdate: '14:45',
  },
  {
    id: '5',
    name: 'Яндекс',
    symbol: 'YDEX',
    price: 3989.5,
    priceChange: -6.5,
    priceChangePercent: -0.16,
    yearlyChange: 25,
    yearlyChangePercent: 0.63,
    sparkline: generateSparklineData([3996, 3990, 3988, 3991, 3989.5]),
    category: 'popular',
    lastUpdate: '14:45',
  },
  {
    id: '6',
    name: 'Северсталь',
    symbol: 'CHMF',
    price: 911,
    priceChange: -3,
    priceChangePercent: -0.4,
    yearlyChange: -218.4,
    yearlyChangePercent: -23.6,
    sparkline: generateSparklineData([914, 912, 910, 911.5, 911]),
    category: 'popular',
    lastUpdate: '14:45',
  },
  {
    id: '7',
    name: 'МТС',
    symbol: 'MTSS',
    price: 207.7,
    priceChange: 0.75,
    priceChangePercent: 0.35,
    yearlyChange: 6.95,
    yearlyChangePercent: 3.46,
    sparkline: generateSparklineData([207, 207.2, 207.5, 207.6, 207.7]),
    category: 'popular',
    lastUpdate: '14:45',
  },
  {
    id: '8',
    name: 'Полюс',
    symbol: 'PLZL',
    price: 2052,
    priceChange: -6.2,
    priceChangePercent: -0.4,
    yearlyChange: 591.8,
    yearlyChangePercent: 40.53,
    sparkline: generateSparklineData([2058, 2055, 2053, 2052.5, 2052]),
    category: 'popular',
    lastUpdate: '14:45',
  },
];

export const TICKER_CATEGORIES = [
  { label: 'Популярное', value: 'popular' },
  { label: 'Акции РФ', value: 'russian_stocks' },
  { label: 'Облигации', value: 'bonds' },
  { label: 'Фьючерсы', value: 'futures' },
  { label: 'Криптовалюта', value: 'crypto' },
  { label: 'ПИФы', value: 'pifs' },
  { label: 'Валютные пары', value: 'forex' },
  { label: 'Индексы РФ', value: 'russian_indices' },
  { label: 'Мировые индексы', value: 'world_indices' },
  { label: 'Акции США', value: 'us_stocks' },
];
