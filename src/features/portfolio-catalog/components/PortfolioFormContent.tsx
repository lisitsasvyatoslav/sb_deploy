import React from 'react';
import type { TFunction } from 'i18next';
import Input from '@/shared/ui/Input';
import SearchInput from '@/shared/ui/SearchInput';
import InstrumentPickerTable from './InstrumentPickerTable';
import PositionsDateRangeFilter from '@/features/statistics/components/PositionsDateRangeFilter';
import CheckboxDropdownFilter from '@/features/statistics/components/CheckboxDropdownFilter';
import type { CheckboxDropdownItem } from '@/features/statistics/components/CheckboxDropdownFilter';
import type { CreatePortfolioFromDataModalMode } from './CreatePortfolioFromDataModal';

export interface PortfolioFormContentProps {
  name: string;
  setName: (value: string) => void;
  selectedInstruments: string[];
  setSelectedInstruments: (instruments: string[]) => void;
  searchValue: string;
  handleSearchChange: (value: string) => void;
  dateRange: string;
  setDateRange: (value: string) => void;
  hasBrokers: boolean;
  brokerItems: CheckboxDropdownItem[];
  selectedBrokerTypes: string[] | null;
  onBrokersChange: (ids: string[] | null) => void;
  accountItems: CheckboxDropdownItem[];
  selectedAccountIds: string[] | null;
  onAccountsChange: (ids: string[] | null) => void;
  initialParentInstruments: string[] | undefined;
  tableMountKey: string;
  showEditLoader: boolean;
  isPortfolioError: boolean;
  mode: CreatePortfolioFromDataModalMode;
  t: TFunction<'common'>;
}

function renderLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="w-8 h-8 border-2 border-blackinverse-a32 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function renderError(t: TFunction<'common'>) {
  return (
    <p className="text-14 text-danger-base">
      {t('portfolioCatalog.createFromData.loadError')}
    </p>
  );
}

function renderForm(props: PortfolioFormContentProps) {
  const {
    name,
    setName,
    setSelectedInstruments,
    searchValue,
    handleSearchChange,
    dateRange,
    setDateRange,
    hasBrokers,
    brokerItems,
    selectedBrokerTypes,
    onBrokersChange,
    accountItems,
    selectedAccountIds,
    onAccountsChange,
    initialParentInstruments,
    tableMountKey,
    mode,
    t,
  } = props;

  return (
    <>
      <Input
        label={
          mode === 'edit'
            ? t('portfolioCatalog.createFromData.nameLabel')
            : undefined
        }
        placeholder={t('portfolioCatalog.createFromData.namePlaceholder')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        size="md"
        aria-label={t('portfolioCatalog.createFromData.nameLabel')}
        containerClassName="w-full"
      />

      <div className="flex md:flex-row flex-col md:items-start items-stretch gap-spacing-12 self-stretch">
        <div className="flex flex-col gap-spacing-4 flex-grow min-w-[150px]">
          <span className="text-12 leading-16 font-normal tracking-tight-1 text-blackinverse-a100">
            {t('portfolioCatalog.createFromData.brokersLabel')}
          </span>
          <CheckboxDropdownFilter
            items={brokerItems}
            selectedIds={selectedBrokerTypes}
            onChange={onBrokersChange}
            allLabel={t('portfolioCatalog.createFromData.all')}
            noneLabel={t('portfolioCatalog.createFromData.noneSelected')}
            disabled={!hasBrokers}
          />
        </div>
        <div className="flex flex-col gap-spacing-4 flex-grow min-w-0">
          <span className="text-12 leading-16 font-normal tracking-tight-1 text-blackinverse-a100">
            {t('portfolioCatalog.createFromData.accountsLabel')}
          </span>
          <CheckboxDropdownFilter
            items={accountItems}
            selectedIds={selectedAccountIds}
            onChange={onAccountsChange}
            allLabel={t('portfolioCatalog.createFromData.all')}
            noneLabel={t('portfolioCatalog.createFromData.noneSelected')}
            disabled={!hasBrokers}
          />
        </div>
        <div className="flex flex-col gap-spacing-4 flex-grow min-w-[128px]">
          <span className="text-12 leading-16 font-normal tracking-tight-1 text-blackinverse-a100">
            {t('portfolioCatalog.createFromData.periodLabel')}
          </span>
          <PositionsDateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            disabled={!hasBrokers}
            size="md"
            className="shrink-0"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 min-h-[240px] flex-1">
        <div className="flex flex-row items-center gap-spacing-12 self-stretch">
          <span className="shrink-0 text-14 leading-20 font-semibold tracking-tight-1 text-blackinverse-a100 min-w-0 md:min-w-[210px]">
            {t('portfolioCatalog.createFromData.instrumentsTitle')}
          </span>
          <SearchInput
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('portfolioCatalog.createFromData.searchPlaceholder')}
            size="md"
            className="flex-grow"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <InstrumentPickerTable
            key={tableMountKey}
            onInstrumentSelectionChange={setSelectedInstruments}
            initialParentInstruments={initialParentInstruments}
            parentOnlySelection
          />
        </div>
      </div>
    </>
  );
}

const PortfolioFormContent: React.FC<PortfolioFormContentProps> = (props) => {
  if (props.showEditLoader) {
    return renderLoading();
  }
  if (props.isPortfolioError && props.mode === 'edit') {
    return renderError(props.t);
  }
  return renderForm(props);
};

export default PortfolioFormContent;
