'use client';

import BrokerIcon from '@/shared/ui/BrokerIcon';
import Checkbox from '@/shared/ui/Checkbox';
import { useBrokerAccountsQuery } from '@/features/broker/queries';
import { useClickOutside } from '@/shared/hooks';
import { useTranslation } from '@/shared/i18n/client';
import { useStatisticsStore } from '@/stores/statisticsStore';
import type { Broker } from '@/types/broker';
import { transformAccountsToBrokers } from '@/shared/utils/brokerTransform';
import { Icon } from '@/shared/ui/Icon';
import React, { useRef, useState } from 'react';

interface BrokerAccountFilterProps {
  selectedAccountIds: string[] | null;
  onChange: (accountIds: string[] | null) => void;
}

const BrokerAccountFilter: React.FC<BrokerAccountFilterProps> = ({
  selectedAccountIds,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedBrokers, setExpandedBrokers] = useState<Set<string>>(
    new Set()
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const setShowBrokerDialog = useStatisticsStore(
    (state) => state.setShowBrokerDialog
  );

  const { t } = useTranslation('statistics');
  const { data: accounts, isLoading, error } = useBrokerAccountsQuery();

  const brokers = accounts ? transformAccountsToBrokers(accounts) : [];

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  const handleAccountToggle = (accountId: string) => {
    if (selectedAccountIds === null) {
      const allAccountIds = brokers.flatMap((b) => b.accounts.map((a) => a.id));
      onChange(allAccountIds.filter((id) => id !== accountId));
      return;
    }

    if (selectedAccountIds.includes(accountId)) {
      onChange(selectedAccountIds.filter((id) => id !== accountId));
    } else {
      onChange([...selectedAccountIds, accountId]);
    }
  };

  const handleBrokerToggle = (broker: Broker) => {
    const brokerAccountIds = broker.accounts.map((acc) => acc.id);

    if (selectedAccountIds === null) {
      const allAccountIds = brokers.flatMap((b) => b.accounts.map((a) => a.id));
      onChange(allAccountIds.filter((id) => !brokerAccountIds.includes(id)));
      return;
    }

    const allSelected = brokerAccountIds.every((id) =>
      selectedAccountIds.includes(id)
    );

    if (allSelected) {
      onChange(
        selectedAccountIds.filter((id) => !brokerAccountIds.includes(id))
      );
    } else {
      const newIds = [...selectedAccountIds];
      brokerAccountIds.forEach((id) => {
        if (!newIds.includes(id)) {
          newIds.push(id);
        }
      });
      onChange(newIds);
    }
  };

  const toggleBrokerExpanded = (brokerType: string) => {
    const newExpanded = new Set(expandedBrokers);
    if (newExpanded.has(brokerType)) {
      newExpanded.delete(brokerType);
    } else {
      newExpanded.add(brokerType);
    }
    setExpandedBrokers(newExpanded);
  };

  const getSelectedBrokers = () => {
    if (selectedAccountIds === null) {
      return brokers;
    }
    return brokers.filter((broker) =>
      broker.accounts.some((acc) => selectedAccountIds.includes(acc.id))
    );
  };

  const getTriggerContent = () => {
    const selectedBrokers = getSelectedBrokers();

    if (selectedBrokers.length === 1 && selectedAccountIds !== null) {
      const broker = selectedBrokers[0];
      return (
        <div className="flex items-center gap-3">
          <BrokerIcon broker={broker.type} />
          <span className="theme-text-primary">{broker.name}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {selectedBrokers.map((broker) => (
          <BrokerIcon key={broker.type} broker={broker.type} />
        ))}
      </div>
    );
  };

  const isAccountSelected = (accountId: string) => {
    if (selectedAccountIds === null) return true;
    return selectedAccountIds.includes(accountId);
  };

  const isBrokerFullySelected = (broker: Broker) => {
    if (selectedAccountIds === null) return true;
    return broker.accounts.every((acc) => selectedAccountIds.includes(acc.id));
  };

  const isBrokerPartiallySelected = (broker: Broker) => {
    if (selectedAccountIds === null) return false;
    return (
      broker.accounts.some((acc) => selectedAccountIds.includes(acc.id)) &&
      !isBrokerFullySelected(broker)
    );
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 text-sm transition-colors w-[160px] h-[48px] rounded-lg theme-surface theme-border"
      >
        {getTriggerContent()}
        {isOpen ? (
          <Icon
            variant="chevronUp"
            size={20}
            className="ml-auto theme-text-primary"
          />
        ) : (
          <Icon
            variant="chevronDown"
            size={20}
            className="ml-auto theme-text-primary"
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[320px] theme-surface rounded-xl theme-border shadow-dropdown z-50 overflow-hidden">
          <div className="py-2 max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-6 text-center text-sm theme-text-secondary">
                {t('brokerFilter.loading')}
              </div>
            ) : error ? (
              <div className="px-4 py-6 text-center text-sm text-status-negative">
                {t('brokerFilter.error')}
              </div>
            ) : brokers.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm theme-text-secondary">
                {t('brokerFilter.noBrokers')}
              </div>
            ) : (
              brokers.map((broker) => (
                <div key={broker.type}>
                  {/* Broker Row */}
                  <div className="flex items-center px-4 py-2 theme-bg-hover transition-colors">
                    {/* Icon */}
                    <BrokerIcon broker={broker.type} />

                    {/* Broker Name */}
                    <span className="flex-1 text-base theme-text-primary ml-3">
                      {broker.name}
                    </span>

                    {/* Checkbox */}
                    <div className="mr-2">
                      <Checkbox
                        checked={isBrokerFullySelected(broker)}
                        indeterminate={isBrokerPartiallySelected(broker)}
                        onChange={() => handleBrokerToggle(broker)}
                      />
                    </div>

                    {/* Accordion Toggle */}
                    <button
                      onClick={() => toggleBrokerExpanded(broker.type)}
                      className="w-5 h-5 flex items-center justify-center theme-text-secondary transition-colors"
                    >
                      <Icon
                        variant="chevronDown"
                        size={20}
                        className={`transition-transform ${expandedBrokers.has(broker.type) ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Accounts List (Expanded) */}
                  {expandedBrokers.has(broker.type) && (
                    <div className="ml-11 mr-4 mb-1">
                      {broker.accounts.map((account) => (
                        <div
                          key={account.id}
                          className="w-full flex items-center gap-3 px-4 py-2.5 theme-bg-hover transition-colors rounded-lg"
                        >
                          {/* Account Checkbox */}
                          <Checkbox
                            checked={isAccountSelected(account.id)}
                            onChange={() => handleAccountToggle(account.id)}
                          />

                          {/* Account Name */}
                          <span className="text-sm theme-text-primary">
                            {account.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add Broker Button */}
          {!isLoading && !error && (
            <div className="p-4 theme-border border-t">
              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg theme-bg-hover transition-colors bg-background-card"
                onClick={() => setShowBrokerDialog(true)}
              >
                <span className="text-sm theme-text-primary font-medium">
                  {t('brokerFilter.addBroker')}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrokerAccountFilter;
