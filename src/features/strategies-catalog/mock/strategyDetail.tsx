export type PeriodTab = 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'ALL';

export interface StrategyDetail {
  id: string;
  name: string;
  status: 'investment' | 'trading';
  author: string;
  rating: number;
  profitability: number;
  risk: 'low' | 'medium' | 'high';
  horizon: string;
  minAmount: string;
  title: string;
  term: string;
  returns: {
    WEEK: number;
    MONTH: number;
    QUARTER: number;
    YEAR: number;
    ALL: number;
  };
  chartData: {
    WEEK: number[];
    MONTH: number[];
    QUARTER: number[];
    YEAR: number[];
    ALL: number[];
  };
  volatility: number;
  sharpeRatio: number;
  description: string;
}

// Generate smooth chart data points
export const generateChartData = (endValue: number, points = 30): number[] => {
  const data: number[] = [];
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const noise = (Math.random() - 0.5) * Math.abs(endValue) * 0.1;
    const value = endValue * Math.pow(progress, 0.8) + noise;
    data.push(value);
  }
  data[points - 1] = endValue;
  return data;
};

export const strategyDetail: StrategyDetail = {
  id: '1',
  name: 'Alenka Capital Bonds money',
  status: 'investment',
  author: 'Mark Denisov',
  rating: 4.5,
  profitability: 32.4,
  risk: 'medium',
  horizon: 'long-term',
  minAmount: '50 000 ₽',
  title: 'Alenka Capital Bonds',
  term: 'from 1 year',
  returns: {
    WEEK: 1.2,
    MONTH: 3.5,
    QUARTER: 5.2,
    YEAR: 32.4,
    ALL: 156.1,
  },
  chartData: {
    WEEK: generateChartData(1.2),
    MONTH: generateChartData(3.5),
    QUARTER: generateChartData(5.2),
    YEAR: generateChartData(32.4),
    ALL: generateChartData(156.1),
  },
  volatility: 18.5,
  sharpeRatio: 1.24,
  description:
    'The strategy invests in the largest US technology companies, using fundamental analysis and growth potential assessment.',
};
