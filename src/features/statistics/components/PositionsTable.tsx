import { useStatisticsStore } from '@/stores/statisticsStore';
import PositionsTableFooter from './PositionsTableFooter';
import PositionsTableHeader from './PositionsTableHeader';
import PositionsHistoryGroupedTable from './PositionsHistoryGroupedTable';
import PositionsHistoryTable from './PositionsHistoryTable';
import PositionsPortfolioTable from './PositionsPortfolioTable';
import classNames from 'classnames';

// border-radius: 4px;
// border: 1px solid var(--Outline-low_em, rgba(255, 255, 255, 0.05));
// background: #151515;

const PositionsTable = ({ className }: { className?: string }) => {
  const viewMode = useStatisticsStore((state) => state.viewMode);
  const selectedInstrument = useStatisticsStore(
    (state) => state.selectedInstrument
  );

  const renderContent = () => {
    if (viewMode === 'portfolio') {
      return <PositionsPortfolioTable />;
    }
    if (selectedInstrument) {
      return <PositionsHistoryTable />;
    }
    return <PositionsHistoryGroupedTable />;
  };

  return (
    <div
      className={classNames(
        'flex flex-col rounded-radius-4 border border-blackinverse-a8 h-full bg-surfacelow-surfacelow1',
        className
      )}
    >
      <PositionsTableHeader />

      <div className="flex-1 min-h-0 overflow-hidden">{renderContent()}</div>

      <PositionsTableFooter />
    </div>
  );
};

export default PositionsTable;
