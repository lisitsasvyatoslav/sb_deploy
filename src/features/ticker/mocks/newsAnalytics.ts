import { NewsArticle } from '@/types/ticker';

// Mock News Articles
export const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    tickerSymbol: 'VTBR',
    headline: 'ВТБ проведет допэмиссию акций почти на ₽85 млрд',
    date: '10 октября',
    time: '09:11',
    source: 'finam.ru',
  },
  {
    id: 'news-2',
    tickerSymbol: 'VTBR',
    headline:
      'ВТБ размещает однодневные облигации на 100 млрд рублей с доходностью 16,03% годовых',
    date: '10 октября',
    time: '12:12',
    source: 'finam.ru',
  },
  {
    id: 'news-3',
    tickerSymbol: 'VTBR',
    headline:
      'Идея конвертации «префов» ВТБ, по заявлениям Минфина, предметно не обсуждалась',
    date: '07 октября',
    time: '10:00',
    source: 'rbc.ru',
  },
  {
    id: 'news-4',
    tickerSymbol: 'SBER',
    headline:
      'Греф заявил, что банки «даже близко» не повторят рекорд прибыли 2024 года',
    date: '08 октября',
    time: '12:26',
    source: 'vedomosti.ru',
  },
  {
    id: 'news-5',
    tickerSymbol: 'SBER',
    headline: '«Сбер» запустил продажи своего «умного» кольца',
    date: '23 сентября',
    time: '08:01',
    source: 'rbc.ru',
  },
  {
    id: 'news-6',
    tickerSymbol: 'ROSN',
    headline:
      'Хинштейн направил обращение в ФАС для контроля цен на бензин в Курской области',
    date: '10 октября',
    time: '09:11',
    source: 'vedomosti.ru',
  },
  {
    id: 'news-7',
    tickerSymbol: 'ROSN',
    headline: 'Роснефть планирует увеличить добычу на 5% в следующем квартале',
    date: '05 октября',
    time: '15:30',
    source: 'finam.ru',
  },
  {
    id: 'news-8',
    tickerSymbol: 'LKOH',
    headline: 'ЛУКОЙЛ объявляет о дивидендах в размере 500 рублей на акцию',
    date: '01 октября',
    time: '11:00',
    source: 'rbc.ru',
  },
  {
    id: 'news-9',
    tickerSymbol: 'LKOH',
    headline: 'ЛУКОЙЛ подписал контракт на поставку нефти в Китай',
    date: '28 сентября',
    time: '14:15',
    source: 'vedomosti.ru',
  },
  {
    id: 'news-10',
    tickerSymbol: 'YDEX',
    headline: 'Яндекс представил новую версию поискового алгоритма с AI',
    date: '12 октября',
    time: '10:45',
    source: 'finam.ru',
  },
  {
    id: 'news-11',
    tickerSymbol: 'YDEX',
    headline: 'Яндекс.Маркет показал рост выручки на 45% за третий квартал',
    date: '09 октября',
    time: '16:20',
    source: 'rbc.ru',
  },
];

// Analytics tab configuration
export const ANALYTICS_TABS = [
  { label: 'News', value: 'news' as const },
  { label: 'Fundamental', value: 'fundamental' as const },
  { label: 'Tech analysis', value: 'techanalysis' as const },
];
