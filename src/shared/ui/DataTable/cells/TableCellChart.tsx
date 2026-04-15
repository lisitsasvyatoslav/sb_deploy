import { cn } from '@/shared/utils/cn';
import SparklineChart from '@/shared/ui/SparklineChart/SparklineChart';
import TableCellNA from './TableCellNA';

interface TableCellChartProps {
  data?: number[];
  /** Sparkline width. Figma: 90px */
  width?: number;
  /** Sparkline height. Figma: 24px */
  height?: number;
  /** Show dashed horizontal line at the open (first) price level */
  showOpenLine?: boolean;
  className?: string;
}

/**
 * TableCellChart — mini sparkline chart cell
 *
 * Figma node: 55815:5264
 *
 * Layout: row justify-end items-center padding=4 4 4 0
 * Sparkline: 90×24px, 1px stroke, gradient fill, left fade-in mask, optional dashed open line
 */
const TableCellChart: React.FC<TableCellChartProps> = ({
  data,
  width = 90,
  height = 24,
  showOpenLine = true,
  className,
}) => {
  if (!data || data.length < 2) return <TableCellNA />;

  return (
    <div
      className={cn(
        'flex items-center justify-end pt-spacing-4 pr-spacing-4 pb-spacing-4 pl-0',
        className
      )}
    >
      <SparklineChart
        data={data}
        width={width}
        height={height}
        showOpenLine={showOpenLine}
        fadeLeft
      />
    </div>
  );
};

export default TableCellChart;
