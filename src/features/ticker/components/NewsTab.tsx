import TickerIcon from '@/shared/ui/TickerIcon';
import Button from '@/shared/ui/Button';
import Table, { TableColumn } from '@/shared/ui/Table';
import { useNewsByTickersQuery } from '@/features/ticker/queries';
import { useNewsAnalyticsModalStore } from '@/features/ticker/stores/newsAnalyticsModalStore';
import { useNewsPreviewStore } from '@/stores/newsPreviewStore';
import { NewsArticle } from '@/types/ticker';
import { useTranslation } from '@/shared/i18n/client';
import { Check, InfoOutlined } from '@mui/icons-material';
import React from 'react';

const NewsTab: React.FC = () => {
  const { selectedTickers, selectedNewsIds, toggleNewsRow } =
    useNewsAnalyticsModalStore();

  const { openWithNews } = useNewsPreviewStore();
  const { t } = useTranslation('ticker');

  // Fetch news using TanStack Query
  const { data: filteredNews = [], isLoading } =
    useNewsByTickersQuery(selectedTickers);

  const handleRowClick = (row: NewsArticle) => {
    toggleNewsRow(row.id);
  };

  const handleInfoClick = (e: React.MouseEvent, row: NewsArticle) => {
    e.stopPropagation(); // Prevent row click
    openWithNews(row);
  };

  // Table columns definition
  const columns: TableColumn<NewsArticle>[] = [
    {
      key: 'content',
      label: '',
      render: (row) => {
        const isSelected = selectedNewsIds.includes(row.id);

        return (
          <div className="flex gap-3 items-center">
            {/* Ticker Logo */}
            <div className="relative">
              <TickerIcon
                securityId={row.securityId}
                symbol={row.tickerSymbol}
                size={48}
              />
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary-500 border-2 border-[var(--surface-medium)] flex items-center justify-center">
                  <Check sx={{ fontSize: 16 }} className="text-white" />
                </div>
              )}
            </div>

            {/* News Content */}
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <p className="text-[15px] font-medium text-[var(--text-base)] leading-[22px] tracking-[-0.09px] overflow-hidden text-ellipsis whitespace-nowrap">
                {row.headline}
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] leading-4">
                {row.date && row.time && (
                  <>
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {row.date}, {row.time}
                    </span>
                    <span className="text-gray-400">•</span>
                  </>
                )}
                <span className="whitespace-nowrap">{row.source}</span>
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex-1 min-h-0 px-8 pr-4 pt-2 pb-0 h-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-sm text-gray-500">{t('news.loadingNews')}</div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-sm text-gray-500">{t('news.noNews')}</div>
          </div>
        ) : (
          <Table
            columns={columns}
            rows={filteredNews}
            onRowClick={handleRowClick}
            getRowKey={(row) => String(row.id)}
            getRowId={(row) => row.id}
            selectedRows={selectedNewsIds}
            isHeaderHidden={true}
            rowActions={(row, isHovered) => {
              // Only show info button if news has content
              if (!row.content) return null;

              return (
                <Button
                  onClick={(e) => handleInfoClick(e, row)}
                  variant={isHovered ? 'accent' : 'ghost'}
                  size="sm"
                  icon={<InfoOutlined sx={{ fontSize: 20 }} />}
                  className="!p-2 !rounded-full"
                  aria-label={t('news.showFullText')}
                />
              );
            }}
            virtualized={{
              enabled: true,
              estimateSize: 80,
              overscan: 5,
            }}
          />
        )}
      </div>
    </>
  );
};

export default NewsTab;
