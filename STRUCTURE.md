# ⚛️ Frontend Project Structure

## 📋 Overview

This document describes the scalable project structure implemented for the Trading Diary frontend application.

## 🗂️ Directory Structure

```
src/
├── 📝 types/                          # Domain-organized TypeScript type definitions
│   │
│   ├── index.ts                       # ⭐ Barrel export - re-exports all domain types
│   │                                  #    Usage: import { Board, Card, Chat } from '@/types'
│   │                                  #    Exports: All types from board, chat, auth, attribution, signal, statistics, llm, ui, common
│   │
│   ├── board.ts                       # Board domain type definitions
│   │                                  #    Exports: Board, Card, Edge, ReactFlowNode, CardType enum
│   │                                  #             CreateBoardRequest, UpdateBoardRequest, BoardFullData
│   │                                  #             CreateCardRequest, UpdateCardRequest, SignalMeta
│   │                                  #             FileUploadResponse, FileInfoResponse, FileCardMeta (S3-based)
│   │                                  #             SignalDataItem (signal payload data for carousel with optional security_id)
│   │                                  #    Card: includes color (hex string) for card header background
│   │                                  #          Signal cards (type='signal'): signal_id, signal_count,
│   │                                  #          recent_signals (last 3), source_type ('tradingview'|'telegram')
│   │                                  #    FileUploadResponse: {file_id, filename, file_size, mime_type, title, s3_key, file_type?}
│   │                                  #    FileInfoResponse: {file_id, filename, file_size, mime_type, uploaded_at, download_url, title}
│   │                                  #    FileCardMeta: {file_id, s3_key, filename, file_size, mime_type, file_type?, uploading?}
│   │                                  #    Note: file_type is optional file extension (without dot) for icon selection
│   │                                  #    Used by: features/board/*, services/api/boards.ts, services/api/files.ts
│   │
│   ├── boardOverlay.ts                 # Board overlay descriptor types
│   │                                  #    BoardOverlayDescriptor: discriminated union (kind + payload)
│   │                                  #    Kinds: note-editor, news-preview, file-preview, ticker-details,
│   │                                  #           fundamental-details, tech-analysis-details, signal-editor
│   │
│   ├── chat.ts                        # Chat & messaging type definitions
│   │                                  #    Exports: Chat, Message, ChatListItem, MessageRole, MessageType, Plan, ExecutionStep
│   │                                  #             CreateChatRequest, UpdateChatRequest
│   │                                  #             CreateChatRequest.seed_messages - optional initial messages (welcome-seeded dialog)
│   │                                  #             ToolCallInfo (type, status, content) for history display
│   │                                  #    Message.tool_calls - Array of tool executions from assistant
│   │                                  #    Message.message_type - 'chat' | 'survey_qa' | 'welcome_ack' | 'survey_feedback' | 'survey_rows'
│   │                                  #    Message.plans - Plan[] (hierarchical: Plan → ExecutionStep[])
│   │                                  #    Plan - Stores plan metadata (id, status, description, duration, input, output, error, executionSteps)
│   │                                  #    ExecutionStep - Individual step execution (tool, status, duration, input, output, error)
│   │                                  #    Chat.type - 'chat' | 'pipeline'
│   │                                  #             SendMessageRequest, SendMessageResponse
│   │                                  #    SendMessageRequest: includes board_id (optional) - current board context for AI
│   │                                  #    Message fields: card_ids (number[]), file_ids (string[])
│   │                                  #                    trade_ids (number[]) - broker trade IDs for AI analysis
│   │                                  #                    tickers (Record<string, number | null>) - ticker → security_id mapping
│   │                                  #    Note: Uses card_ids/file_ids/trade_ids/board_id instead of context_cards/additions
│   │                                  #    Used by: features/chat/*, services/api/chat.ts
│   │
│   ├── survey.ts                      # Onboarding survey types
│   │                                  #    Exports: SurveyQuestion, SurveyStatusResponse, SurveyQuestionType
│   │                                  #    Used by: features/chat/components/ChatWindow.tsx, services/api/survey.ts
│   │
│   ├── auth.ts                        # Authentication type definitions
│   │                                  #    Exports: AuthTokens, AuthUser
│   │                                  #    Used by: stores/authStore.ts, services/api/auth.ts
│   │
│   ├── attribution.ts                 # First-party attribution API payloads (AttributionEventPayload, AttributionEventType)
│   │                                  #    Used by: utils/attribution.ts, services/api/attribution.ts
│   │
│   ├── broker.ts                      # Broker integration type definitions
│   │                                  #    Exports: BrokerConnection (with sync_depth_years), TradingAccount
│   │                                  #             CreateBrokerConnectionRequest, BrokerConnectionUpdateRequest
│   │                                  #             (sync_depth_years, auto_sync_enabled)
│   │                                  #    Used by: features/broker/*, services/api/broker.ts
│   │
│   ├── statistics.ts                  # Trading statistics type definitions
│   │                                  #    Exports: Position, Trade, Transaction, TradingSummary
│   │                                  #             BrokerTrade, BrokerTransaction, BrokerPosition
│   │                                  #             PaginatedResponse, FilterOptions
│   │                                  #             TradesFilterParams (account_ids: string[] | null - format "broker:account_id")
│   │                                  #             BrokerPositionsFilterParams, TransactionsFilterParams
│   │                                  #             PeriodType ('2d' | '1w' | '1m' | '6m' | '1y' | '3y' | 'all')
│   │                                  #             PortfolioValuePoint, PortfolioValueHistoryResponse
│   │                                  #    Note: account_ids uses composite format "broker:account_id" for uniqueness
│   │                                  #    Used by: features/statistics/*, services/api/statistics.ts
│   │
│   ├── llm.ts                         # LLM provider/model type definitions
│   │                                  #    Exports: LLMProvider, Model, ChatConfig
│   │                                  #    Used by: features/chat/*, services/api/chat.ts
│   │
│   ├── ui.ts                          # UI component type definitions
│   │                                  #    Exports: DialogProps, ButtonVariant
│   │                                  #    Used by: components/*, features/*/components/*
│   │
│   ├── ticker.ts                      # Ticker and trading symbol type definitions
│   │                                  #    Exports: Ticker (includes security_id for CloudFront icons), TickerCategory
│   │                                  #             NewsArticle (includes security_id, content for HTML news body)
│   │                                  #             FundamentalData (includes security_id, comprehensive metrics)
│   │                                  #             FundamentalMetric (structure: { name, value, format, description? })
│   │                                  #             TechnicalIndicator, TechnicalAnalysisData (includes security_id), AnalyticsTab
│   │                                  #             TickerBatchItem (security_id, asset_ticker, asset_currency, quote_last, quote_change_percent)
│   │                                  #             TickerBatchResponse (data, total, page, limit, hasMore) — response of GET /ticker/batch
│   │                                  #    FundamentalData: Includes both legacy simple fields (pe, debtRatio, roe, ebitda, netIncome)
│   │                                  #                     and new detailed FundamentalMetric objects for all metrics
│   │                                  #                     (pe_ratio, price_book, price_sales, debt_ratio, debt_equity,
│   │                                  #                      roe, roa, roi, net_income, ebitda, operating_income, etc.)
│   │                                  #                     Legacy fields maintained for backward compatibility in list views
│   │                                  #    TechnicalIndicator: { name, value?, format, signal?, description? }
│   │                                  #    TechnicalAnalysisData: includes trend_class, trend_power, pattern, indicators array, security_id
│   │                                  #    NewsArticle: includes optional content field for full HTML content, url for source link
│   │                                  #    Used by: components/dialogs/TickerPickerModal.tsx, AddNewsAnalyticsModal.tsx
│   │
│   ├── tag.ts                         # Tag type definitions for card tags
│   │                                  #    Exports: Tag interface, TagType type ('ticker' | 'link' | 'ai-response')
│   │                                  #             isTickerTag, isLinkTag, isAiResponseTag (type guards)
│   │                                  #    Tag structure: { id?, type, text, icon?, meta, order }
│   │                                  #    Ticker tag meta: { symbol, name, security_id? } - security_id enables icon display
│   │                                  #    Note: id is optional (omitted in creation, present in responses)
│   │                                  #    Used by: components/ui/Tag.tsx, features/board/*, features/ticker/*
│   │
│   ├── overview.ts                    # Overview page type definitions
│   │                                  #    Exports: OverviewViewProps (common props for MainGridView)
│   │                                  #    Used by: features/main/views/*, views/MainPage.tsx
│   │
│   ├── portfolio.ts                   # Portfolio API types
│   │                                  #    Exports: PortfolioResponse, PortfolioWithSummaryResponse, PortfolioInstrumentFillRule,
│   │                                  #             CreatePortfolioRequest, UpdatePortfolioRequest
│   │                                  #    Used by: services/api/portfolio.ts, features/portfolio-catalog/*
│   │
│   ├── signal.ts                      # Webhook signal (TradingView, Telegram) type definitions
│   │                                  #    Exports: Signal, SignalData, SignalSourceType enum, CreateSignalRequest,
│   │                                  #             UpdateSignalRequest, SignalListResponse, SignalDataListResponse,
│   │                                  #             TradingViewPayload
│   │                                  #    SignalSourceType: TRADINGVIEW = 'tradingview', TELEGRAM = 'telegram'
│   │                                  #    Signal: {id, user_id, board_id, card_id, secret_token, source_type,
│   │                                  #             webhook_url, description?, active, show_toast_notification,
│   │                                  #             created_at, updated_at, board_name?, data_count?}
│   │                                  #    SignalData: {id, signal_id, payload (JSON), created_at, security_id? (optional)}
│   │                                  #    webhook_url: {BASE_URL}/web-hook/{source_type}/{secret_token}
│   │                                  #    Token format: {prefix}_{uuid} (tv_ for TradingView, tg_ for Telegram)
│   │                                  #    Used by: features/signal/*, services/api/signals.ts
│   │
│   ├── deployment.ts                  # Deployment & trading idea type definitions
│   │                                  #    Exports: Deployment, TradingIdea, DeploySSEEvent (discriminated union)
│   │                                  #    Deployment: { id, strategyId, sequenceNumber, promptSnapshot, ideasTtlSeconds, status, createdAt }
│   │                                  #    TradingIdea: { id, ticker, securityId?, direction, entryPrice, takeProfit?, stopLoss?, lots, currency? }
│   │                                  #    DeploySSEEvent: deployment_started | llm_processing | ideas_saved | deployment_completed | deployment_failed
│   │                                  #    Used by: features/strategy/queries.ts, features/board/components/cardContent/TradingIdeaContent.tsx
│   │
│   ├── strategy.ts                    # Strategy & marketplace type definitions
│   │                                  #    Exports: Strategy, MarketplaceStrategyType, PublishToMarketplaceRequest
│   │                                  #    MarketplaceStrategyType: 'Trend' | 'MeanReversion' | 'Arbitrage' | 'News'
│   │                                  #    PublishToMarketplaceRequest: { title, description, strategyType }
│   │                                  #    Used by: features/strategy/queries.ts, PublishToMarketplaceModal
│   │
│   ├── strategyBinding.ts             # TD-986 Comon strategy binding types
│   │                                  #    Exports: StrategyBinding, StrategyBindingInitResponse, StrategyBindingWithDetails
│   │                                  #    Used by: features/strategy-binding/*, services/api/strategyBinding.ts
│   │
│   └── common.ts                      # Shared utility types and enums
│                                      #    Exports: Position, CardType enum (note, file, news,
│                                      #             fundamental, technical, chart, link, ai_response, signal, widget, strategy, trading_idea), ApiResponse<T>
│                                      #    Used by: All modules
│
├── 🏗️ shared/                          # FSD shared layer — UI kit, utils, hooks, config, i18n
│   │                                  #    All imports use @/shared/* prefix
│   │
│   ├── ui/                            # Design system components (moved from components/ui/)
│   │                                  #    Button, Modal, Dialog, Dropdown, Icon, DataTable,
│   │                                  #    Avatar, Input, Toast, SparklineChart, etc.
│   │                                  #    Import: @/shared/ui/Button, @/shared/ui/Modal, etc.
│   │
│   ├── utils/                         # Pure utility functions (moved from utils/)
│   │                                  #    cn, formatters, timeUtils, fileUtils, logger, toast, etc.
│   │                                  #    Import: @/shared/utils/cn, @/shared/utils/toast, etc.
│   │
│   ├── hooks/                         # Shared React hooks (moved from hooks/)
│   │                                  #    useClickOutside, useDebounce, useHotkeys, useResizable, etc.
│   │                                  #    Import: @/shared/hooks/useClickOutside, @/shared/hooks, etc.
│   │
│   ├── config/                        # Application configuration (moved from config/)
│   │                                  #    api, environment, region, routes, toastConfig, etc.
│   │                                  #    Import: @/shared/config/region, @/shared/config/api, etc.
│   │
│   ├── constants/                     # Application-wide constants (moved from constants/)
│   │                                  #    LAYOUT_CONSTANTS, getSidebarTotalWidth, etc.
│   │                                  #    Import: @/shared/constants/layout
│   │
│   ├── i18n/                          # Internationalization (moved from i18n/)
│   │   ├── settings.ts               # SUPPORTED_LOCALES, FALLBACK_LOCALE, NAMESPACES
│   │   ├── client.ts                  # useTranslation re-export ('use client')
│   │   │                              #    ⚠️ Always import from '@/shared/i18n/client'
│   │   ├── locale-provider.tsx        # LocaleProvider, useLocale context
│   │   ├── index.ts                   # Barrel re-export
│   │   ├── @types/i18next.d.ts       # Type augmentation for translation keys
│   │   └── locales/
│   │       ├── en/                    # English translations (11 namespace JSON files)
│   │       └── ru/                    # Russian translations (11 namespace JSON files)
│   │
│   └── styles/                        # Global CSS overrides (moved from styles/)
│       └── toast.css                  # react-toastify custom overrides
│
├── 🎯 features/                       # Feature modules (complete vertical slices)
│   │
│   ├── 🏠 main/                       # Main page (overview) feature module
│   │   │
│   │   └── views/                     # Main page view components
│   │       ├── MainGridView.tsx       # ⭐ Grid view of recent boards ("Последнее")
│   │       │                          #    Feature-specific wrapper for GridView (wraps to multiple rows)
│   │       │                          #    Uses: GridView, useResponsiveCardSize, formatBoardDate
│   │       │                          #    Card sizes: 184×168px (<2560px), 231×200px (≥2560px)
│   │       │                          #    Max container width: 1936px (centered on wide screens)
│   │       │                          #    Max columns: 8, gap: 8px, sidebar-aware sizing
│   │       │                          #    Date formatting: formatBoardDate from utils/timeUtils
│   │       │                          #    Card design: 111px preview + info block, border radius 16px
│   │       │                          #    Create button: "Добавить еще" with screen-plus icon
│   │       └── index.ts               # Barrel export for views
│   │
│   ├── 💡 ideas/                      # Ideas page feature module
│   │   │
│   │   ├── components/                # Ideas-specific components
│   │   │   └── IdeasContextMenu.tsx   # ⭐ Context menu for board cards (grid/list views)
│   │   │                              #    Actions: Ask AI, Rename, Duplicate, Copy link, Delete, Publish
│   │   │                              #    Publish item: conditionally shown via onPublish prop
│   │   │                              #    Supports both IconVariant strings and ReactNode icons
│   │   │                              #    Uses: DeleteBoardDialog, portal-based positioning
│   │   │
│   │   ├── hooks/                     # Ideas-specific hooks
│   │   │   └── useIdeasContextMenu.tsx # Shared context menu state + rendering for Grid/List views
│   │   │                              #    Manages: menu open/close state, homeBoard check
│   │   │                              #    Returns: openMenuBoardId, handleMenuOpen, renderContextMenu
│   │   │                              #    Uses: IdeasContextMenu, useHomeBoardQuery
│   │   │
│   │   ├── views/                     # Ideas page view components
│   │   │   ├── IdeasGridView.tsx      # ⭐ Grid view of all idea boards ("Идеи")
│   │   │   │                          #    Feature-specific wrapper for GridView (no maxRows limit)
│   │   │   │                          #    Uses responsive max container width (1936px/1600px)
│   │   │   │                          #    Props: onPublish? for marketplace publishing
│   │   │   │                          #    Uses: GridView, useResponsiveCardSize, useIdeasContextMenu
│   │   │   ├── IdeasListView.tsx      # ⭐ List view of all idea boards ("Идеи")
│   │   │   │                          #    Custom list layout with responsive max container width
│   │   │   │                          #    Props: onPublish? for marketplace publishing
│   │   │   │                          #    Uses: useResponsiveCardSize, useIdeasContextMenu
│   │   │   └── index.ts               # Barrel export for views
│   │   │
│   │   └── index.ts                   # Barrel export for ideas feature
│   │
│   ├── 🎯 strategy/                   # Strategy feature module (prompt-based trading strategies)
│   │   │
│   │   ├── components/
│   │   │   └── PublishToMarketplaceModal.tsx # ⭐ Publish strategy to marketplace modal (TD-1101)
│   │   │                              #    Features: Name input (prefilled), strategy type dropdown,
│   │   │                              #              description textarea, deployment check with warning
│   │   │                              #    Props: open, onOpenChange, strategyId, strategyName, strategyDescription?
│   │   │                              #    Uses: Modal compound components, Dropdown (zIndex 1400),
│   │   │                              #           useDeploymentsQuery, usePublishToMarketplaceMutation
│   │   │                              #    Feature flag: shown only when useDevStrategyCatalog enabled
│   │   │                              #    i18n: common:publishToMarketplace.* keys
│   │   │                              #    Mock: API call is mocked (backend not ready)
│   │   │
│   │   ├── queries.ts                 # Strategy TanStack Query hooks
│   │   │                              #    Exports: useStrategyQuery, useStrategiesQuery,
│   │   │                              #             useUpdateStrategyMutation, usePublishToMarketplaceMutation
│   │   │                              #    Used by: StrategyContent, BoardSectionPage, PublishToMarketplaceModal
│   │   │
│   │   └── index.ts                   # Barrel export for strategy feature
│   │
│   ├── 🔗 strategy-binding/           # TD-986: Comon binding; app/(app)/strategies/bound/, bind/callback, bind/mock-comon
│   │   │
│   │   ├── components/
│   │   │   ├── BindComonButton.tsx    # Button to initiate strategy binding
│   │   │   ├── BoundStrategiesList.tsx # List of bound strategies (profile); StrategySummaryCard
│   │   │   ├── BoundStrategiesPage.tsx # Page listing all bound strategies (/strategies/bound)
│   │   │   ├── MockComonPage.tsx      # [MOCK] Temporary comon.ru stand-in page; StrategySummaryCard as button
│   │   │   ├── StrategyBindingCallback.tsx # Callback after redirect from comon; StrategySummaryCard
│   │   │   └── StrategyBindingFeatureGate.tsx # Wrapper: TD-986 UI only when useDevStrategyCatalog
│   │   │
│   │   ├── mock/
│   │   │   └── data.ts               # [MOCK] Mock strategy and binding data
│   │   │
│   │   ├── queries.ts                # TanStack Query hooks for binding
│   │   └── index.ts                  # Barrel export
│   │
│   ├── 📈 ticker/                     # Ticker selection & analytics feature module
│   │   │
│   │   ├── components/                # Ticker-specific React components
│   │   │   ├── TickerPickerModal.tsx  # Ticker modal; board mode YM ticker_added on /ideas/ (ticker_card)
│   │   │   │                          #    Features: purple theme, TickerIcon component, selected chips, Recharts sparklines
│   │   │   │                          #    Uses Table component with virtualized infinite scroll for performance
│   │   │   │                          #    Infinite scroll with useInfiniteTickersQuery (auto-loads more as you scroll)
│   │   │   │                          #    Max 5 tickers selection, opens AddNewsAnalyticsModal
│   │   │   │                          #    Uses: Table, useInfiniteTickersQuery (with debounced search, market ID, type), TickerIcon
│   │   │   │                          #    Fixed height: 400px for scrollable area
│   │   │   │                          #    Sorting: Column sorting (name, price, priceChange, yearlyChange) with queryClient cache reset
│   │   │   │                          #            Field mapping: name→asset_name, price→quote_last, priceChange→quote_change_percent
│   │   │   │                          #            Default sort: fundamental_market_cap desc (market cap)
│   │   │   │                          #    Integrated with backend: GET /api/ticker?market=&type=&page=&limit=&sort=&ordering=
│   │   │   ├── TickerInfoModal.tsx    # Detailed ticker information modal
│   │   │   │                          #    Features: back button, SparklineChart integration, company metrics
│   │   │   │                          #    Displays: expanded price chart (700x280px), key metrics in two columns
│   │   │   ├── AddNewsAnalyticsModal.tsx # News & analytics selection modal with virtual scrolling
│   │   │   │                          #    Features: ticker filter chips with badges (counts across all tabs), 3 tabs
│   │   │   │                          #    Fixed height: 400px for scrollable tab content
│   │   │   │                          #    Dynamic button: counts tickers + selected rows
│   │   │   │                          #    Integrated with card creation via useCreateTickerCards hook
│   │   │   │                          #    Creates chart/news/fundamental/technical cards on board
│   │   │   │                          #    Imports: FundamentalDetailsModal for fundamental details
│   │   │   │                          #    State: Reads selectedTickers & selectedSecurityIds from useNewsAnalyticsModalStore
│   │   │   │                          #           (single source of truth, syncs back to tickerModalStore for navigation)
│   │   │   │                          #    Uses: useTickersQuery({security_ids}), useAnalyticsTabsQuery,
│   │   │   │                          #          useNewsByTickersQuery (loads tickers by security_id)
│   │   │   ├── NewsTab.tsx            # News articles list with virtual scrolling and detail modal
│   │   │   │                          #    Features: info button to view full news content in modal
│   │   │   │                          #              HTML content rendering with custom styles
│   │   │   │                          #              link to source article
│   │   │   │    Uses Table component with virtualization, row actions
│   │   │   │    Uses: Table, useNewsByTickersQuery, Modal
│   │   │   │    Integrated with backend: GET /api/ticker/news?security_id= (with content)
│   │   │   ├── FundamentalTab.tsx     # Fundamental metrics with virtual scrolling (P/E, Debt, ROE, EBITDA, Net-income)
│   │   │   │                          #    Features: info button to view detailed fundamental analysis
│   │   │   │                          #              opens FundamentalDetailsModal on info click
│   │   │   │                          #              adjusted column widths: ticker (220px), P/E/Debt/ROE (100px center), EBITDA/Net-income (160px right)
│   │   │   │                          #              text-overflow ellipsis on all columns for proper text handling
│   │   │   │    Uses Table component with virtualization, row actions
│   │   │   │    Uses: Table, useFundamentalDataByTickersQuery, useFundamentalModalStore
│   │   │   │    Integrated with backend: GET /api/ticker/{ticker_slug}/fundamental
│   │   │   ├── TechAnalysisTab.tsx    # Technical analysis with virtual scrolling (main view)
│   │   │   │                          #    Features: row selection with checkmark on ticker icon
│   │   │   │                          #              info button to view detailed technical analysis
│   │   │   │                          #              clicking row toggles selection, clicking info opens modal
│   │   │   │    Uses Table component with virtualization, row actions
│   │   │   │    Layout: table-based with ticker logo, 3 priority analysis columns (EMA-100, RSI, MACD)
│   │   │   │    Translation: translateIndicatorName(), translateDescription()
│   │   │   │                 Supports status values: bullish_reversal, bullish_recovery, bearish, etc.
│   │   │   │    Indicator Priority: getDisplayIndicators() prioritizes EMA-100, RSI, MACD first
│   │   │   │    Uses: Table, useTechnicalDataByTickersQuery, useTechAnalysisModalStore
│   │   │   │    Integrated with backend: GET /api/ticker/{ticker_slug}/ta
│   │   │   ├── TechAnalysisDetailsModal.tsx # Technical analysis details modal
│   │   │   │                          #    Features: full technical analysis details in separate modal
│   │   │   │                          #              trend class/power/pattern display at top
│   │   │   │                          #              all indicators in 2-column grid layout
│   │   │   │                          #              comprehensive translations for all status values
│   │   │   │    Translations: formatTrendClass(), formatTrendPower(), formatPattern()
│   │   │   │                  Supports: linear_up, strong, ascending_broadering_wedge, etc.
│   │   │   │                          #              pattern badge, trend info with strength
│   │   │   │                          #              all indicators in 3-column grid with signals
│   │   │   │                          #              summary section, back button support
│   │   │   │                          #              Russian localization for all text (trends, patterns, indicators)
│   │   │   │    Layout: modal with header (ticker info), scrollable content
│   │   │   │    Translation: translateIndicatorName(), translateDescription()
│   │   │   │                 formatTrendClass(), formatTrendPower(), formatPattern()
│   │   │   │    Uses: useTechAnalysisModalStore (state management)
│   │   │   ├── FundamentalDetailsModal.tsx # Fundamental analysis details modal
│   │   │   │                          #    Features: detailed view of fundamental metrics in 2-column table layout
│   │   │   │                          #              left column: "Оценка стоимости", "Долговая нагрузка", "Рентабельность"
│   │   │   │                          #              right column: "Данные о прибылях и убытках"
│   │   │   │                          #              metric rows with label + info icon + value
│   │   │   │                          #              Russian number formatting (comma as decimal)
│   │   │   │                          #              formatLargeNumber() for billions/millions display
│   │   │   │                          #              back button support, scrollable content (max-h-[600px])
│   │   │   │    Metrics: P/E, Debt Ratio, ROE, EBITDA, Net Income
│   │   │   │    Color coding: green (#1b825e) for positive metrics, gray for neutral
│   │   │   │    Uses: useFundamentalModalStore (state management), MetricRow component
│   │   │   └── SparklineChart.tsx     # Recharts-based sparkline component with timezone-aware date formatting
│   │   │                              #    Props: data: SparklineDataPoint[] (with {date, value})
│   │   │                              #    Date handling: Uses date-fns for MSK date parsing and display
│   │   │                              #    Formats: period=D → "HH:mm", others → "d LLL" (Russian locale)
│   │   │                              #    Backward compatible: handles empty dates from old format (pre-TD-499)
│   │   │
│   │   ├── queries.ts                 # ⭐ TanStack Query hooks for ticker API
│   │   │                              #    Exports: useTickersQuery (with search, market, type, security_ids params)
│   │   │                              #             useInfiniteTickersQuery (infinite scroll pagination)
│   │   │                              #             useMarketsQuery (available but not used in UI)
│   │   │                              #             useTickersByMarketQuery
│   │   │                              #             useNewsByTickersQuery (backend integrated)
│   │   │                              #             useFundamentalDataByTickersQuery (backend integrated)
│   │   │                              #             useTechnicalDataByTickersQuery (backend integrated)
│   │   │                              #             useAnalyticsTabsQuery
│   │   │                              #             useTickerBatchQuery — batch price fetch by symbols via GET /ticker/batch
│   │   │                              #             tickerQueryKeys (query key factory, includes batch key)
│   │   │                              #    Market filtering: Uses singular market ID and type parameters
│   │   │                              #    useTickersQuery with security_ids: Primary method for loading selected tickers
│   │   │                              #                                       Uses GET /ticker with security_ids param
│   │   │                              #    useInfiniteTickersQuery: Returns {data, fetchNextPage, hasNextPage, isFetchingNextPage}
│   │   │                              #                            Auto-increments page param, flattens pages array
│   │   │                              #    useTickerBatchQuery(symbols[]): Fetches prices for a set of ticker symbols
│   │   │
│   │   ├── stores/                    # Ticker-specific Zustand stores
│   │   │   ├── tickerModalStore.ts    # Ticker picker modal state
│   │   │   │                          #    State: isOpen, selectedTickers (symbols, deprecated),
│   │   │   │                          #           selectedSecurityIds (primary, max 5)
│   │   │   │                          #    Actions: openModal(), closeModal(),
│   │   │   │                          #             toggleTicker(symbol, securityId),
│   │   │   │                          #             removeTicker(symbol)
│   │   │   ├── tickerInfoStore.ts     # Ticker info modal state
│   │   │   │                          #    State: isOpen, selectedTicker, showBackButton
│   │   │   │                          #    Actions: openModal(ticker, showBackButton?), closeModal()
│   │   │   ├── techAnalysisModalStore.ts # Tech analysis details modal state
│   │   │   │                          #    State: isOpen, selectedTechData, showBackButton
│   │   │   │                          #    Actions: openModal(techData, showBackButton?), closeModal()
│   │   │   ├── fundamentalModalStore.ts # Fundamental analysis details modal state
│   │   │   │                          #    State: isOpen, selectedFundamentalData, showBackButton
│   │   │   │                          #    Actions: openModal(fundamentalData, showBackButton?), closeModal()
│   │   │   └── newsAnalyticsModalStore.ts # News & analytics modal state
│   │   │                              #    State: isOpen, selectedTickers, selectedSecurityIds, activeTab,
│   │   │                              #           selectedNewsIds, selectedFundamentalIds, selectedTechnicalIds
│   │   │                              #    Actions: openModal(tickers, securityIds), setActiveTab(),
│   │   │                              #             toggleNewsRow(), removeTicker(symbol, securityId, relatedItems?), etc.
│   │   │
│   │   ├── hooks/                     # Ticker-specific custom hooks
│   │   │   ├── useCreateTickerCards.ts # Ticker/news/fundamental/technical cards; YM ticker_added on /ideas/ (chart tickers)
│   │   │   └── useTickerChartData.ts   # Fetches chart card data (price, sparkline) via GET /api/ticker/chart/:securityId
│   │   │                              #    Params: selectedTickers (symbols, for news/fundamental/technical filters),
│   │   │                              #            selectedSecurityIds (primary, for chart cards),
│   │   │                              #            selectedNewsIds, selectedFundamentalIds, selectedTechnicalIds
│   │   │                              #    Features: orchestrates card creation from ticker data
│   │   │                              #    Creates: chart, news, fundamental, technical cards
│   │   │                              #    Uses: useTickersQuery({security_ids, limit: 100}), calculateGridPositions,
│   │   │                              #          ticker mapper helpers
│   │   │                              #    Integrated with: useBoardStore, useCreateCardMutation
│   │   │
│   │   ├── helpers/                   # Ticker-specific helper functions
│   │   │   ├── currency.ts            # Currency formatting utilities
│   │   │   │                          #    getCurrencySymbol: maps ISO 4217 codes to symbols ($, €, ₽, etc.)
│   │   │   │                          #    formatMonetaryValue: formats value with scale suffix and currency
│   │   │   ├── techAnalysisTranslations.ts # Backend key → i18n key mappers for tech analysis display
│   │   │   │                          #    Shared by TechAnalysisTab + TechAnalysisDetailsModal
│   │   │   │                          #    Maps English backend keys to ticker namespace i18n keys
│   │   │   │                          #    Note: Stochastic intentionally excluded — renders in English
│   │   │   └── tickerToCard.ts        # ⭐ Ticker data to card request mappers
│   │   │                              #    Functions: createChartCardData, createNewsCardData,
│   │   │                              #               createFundamentalCardData, createTechnicalCardData
│   │   │                              #    Converts ticker/news/analytics data to CreateCardRequest format
│   │   │                              #    Creates structured Tag objects with type (ticker/link), text, icon, meta
│   │   │                              #    Ticker tags preserve security_id in meta for proper icon display
│   │   │                              #    News cards: use full HTML content if available, fallback to headline
│   │   │                              #                include link tags if URL is present
│   │   │                              #    Fundamental cards: stores complete FundamentalData in meta.fundamentalData
│   │   │                              #                      preserves all 25+ metrics for modal display
│   │   │                              #                      includes display metrics array for card preview
│   │   │                              #    Technical cards: formats content from indicators array, includes trend/pattern info
│   │   │                              #                    maps all indicators with signals to card meta
│   │   │
│   │   └── mocks/                     # Mock ticker data for development
│   │       ├── tickers.ts             # Mock ticker data with categories (MOCK_TICKERS, TICKER_CATEGORIES)
│   │       └── newsAnalytics.ts       # Mock news, fundamental, and technical data
│   │                                  #    Exports: MOCK_NEWS, ANALYTICS_TABS
│   │
│   ├── 📋 board/                      # Board/Canvas feature module
│   │   │
│   │   ├── components/                # Board-specific React components
│   │   │   ├── Board.tsx              # ⭐ Main board canvas component (uses ReactFlow)
│   │   │   │                          #    Root wrapper handles paste/mouse events (pane click/context menu)
│   │   │   │                          #    Forwards custom handlers from useBoard into ReactFlow (onNodeClick, onPane*)
│   │   │   │                          #    Keeps SelectionArea, card selection toolbar, group outline and context menu in sync with ReactFlow
│   │   │   │                          #    Mounts BoardOverlayHost inside .lmx__home__main-container
│   │   │   ├── overlay/              # Board overlay fullscreen system
│   │   │   │   ├── BoardOverlayWindow.tsx  # Shell component (absolute inset-0, slots: header/body/footer, ESC handler)
│   │   │   │   ├── BoardOverlayHost.tsx    # Connector: reads store, renders OverlayContentRenderer, dirty-close dialog
│   │   │   │   ├── OverlayContentRenderer.tsx # Descriptor → component switch (all card types)
│   │   │   │   ├── NoteEditorScene.tsx     # Note editor scene (TipTap, title, color, save/delete)
│   │   │   │   ├── NewsPreviewScene.tsx    # News preview scene (image, content, tags, open original)
│   │   │   │   ├── FilePreviewScene.tsx    # File preview scene (image/pdf/text/excel/word + metadata)
│   │   │   │   ├── TickerInfoScene.tsx     # Ticker/chart scene (sparkline chart, period selector, metrics)
│   │   │   │   ├── FundamentalScene.tsx    # Fundamental analysis scene (two-column metrics table)
│   │   │   │   ├── TechAnalysisScene.tsx   # Technical analysis scene (trend/indicators table)
│   │   │   │   ├── SignalScene.tsx         # Signal editor scene (webhook form, history)
│   │   │   │   └── DiscardConfirmDialog.tsx # Confirm dialog for closing dirty overlay
│   │   │   ├── CardSelectionToolbar.tsx # Toolbar above selected cards (Ask AI, Download, Open, Delete)
│   │   │   │                          #    Positioned above a single card or group of cards (right-drag selection)
│   │   │   │                          #    Includes ColorPicker popup and Download dropdown (PNG/JSON/CSV for chart cards)
│   │   │   ├── CardContextMenu.tsx    # Context menu for card "..." button (Duplicate, Ask AI, Download, Delete)
│   │   │   │                          #    Rendered via portal to escape ReactFlow transform
│   │   │   │                          #    Download submenu with PNG/JSON/CSV (chart cards only)
│   │   │   ├── GroupSelectionOutline.tsx # Outline around group of selected cards
│   │   │   │                          #    Visible only when multiple cards are selected
│   │   │   ├── BoardMiniMap.tsx       # Minimap navigation component
│   │   │   ├── DragDropOverlay.tsx    # File drag & drop overlay UI
│   │   │   ├── StrategyWidgetCatalog.tsx # Animated submenu for strategy board toolbar (Стратегия, Прогнозы, etc.)
│   │   │   │                          #    Exports STRATEGY_WIDGETS array and StrategyWidget type
│   │   │   ├── SignalWidgetCatalog.tsx # Animated submenu for signal source selection (Telegram, TradingView, AI Скринер)
│   │   │   │                          #    Exports SIGNAL_WIDGETS array and SignalSourceType type
│   │   │   ├── CardHeader.tsx         # ⭐ Universal card header component (discriminated union types)
│   │   │   │                          #    Variants: 'simple' (text-based) | 'logo' (icon-based with badge)
│   │   │   │                          #    Simple: title, backgroundColor, editable, onTitleChange - for regular cards
│   │   │   │                          #            Inline editing for 'file' type cards with custom SVG icons
│   │   │   │                          #            Icons: pencil-v2 (Edit), checkmark-circle (Save)
│   │   │   │                          #            stopImmediatePropagation() to prevent ReactFlow selection
│   │   │   │                          #    Logo: logo, name, backgroundColor, badgeCount - for external sources
│   │   │   │                          #    TypeScript ensures type-safe props based on variant
│   │   │   │                          #    Used by: CardNode (via getCardHeaderConfig helper)
│   │   │   ├── CardContentSkeleton.tsx # Skeleton loading animation for card content (pulse bars)
│   │   │   ├── CardContent.tsx        # ⭐ Unified card content orchestrator (47 lines, refactored)
│   │   │   │                          #    Main component with byType map that renders different layouts
│   │   │   │                          #    based on card.type. Imports all content components from cardContent/
│   │   │   │                          #    Accepts boardId prop for signal modal integration
│   │   │   │                          #    Uses Figma design: https://www.figma.com/design/DjwUE4wL1Jd0CH3vTPPebE/%E2%9C%8F%EF%B8%8F-Diary?node-id=1138-30152&m=dev
│   │   │   ├── cardContent/           # Card content type components (modular structure)
│   │   │   │   ├── NewsContent.tsx    # HTML/text news display with HTML detection
│   │   │   │   │                      #    Supports both HTML and plain text content
│   │   │   │   │                      #    Detects HTML tags and renders with dangerouslySetInnerHTML
│   │   │   │   │                      #    Uses .news-card-content CSS class for styling
│   │   │   │   ├── SignalContent.tsx  # ⭐ Trading signals carousel with swipe navigation
│   │   │   │   │                      #    Features: Swipe/carousel for recent signals, pagination dots
│   │   │   │   │                      #    Uses useSwipeNavigation hook for touch/mouse gestures
│   │   │   │   │                      #    "Смотреть" button opens SignalModal in view mode
│   │   │   │   │                      #    Empty state: shows SignalInstructions for source setup
│   │   │   │   │                      #    stopPropagation wrappers prevent ReactFlow interference
│   │   │   │   │                      #    Accepts boardId prop for modal integration
│   │   │   │   ├── TextContent.tsx    # Simple text display for note types
│   │   │   │   ├── ChartContent.tsx   # Ticker chart with SparklineChart integration
│   │   │   │   │                      #    Displays price, sparkline, currency from meta fields
│   │   │   │   │                      #    Calculates min/max labels for chart scale
│   │   │   │   │                      #    Backward compatible: converts old format [numbers] to new [{date:'',value}]
│   │   │   │   │                      #    Handles cards created before TD-499 (Dec 25, 2025) with sparkline in meta
│   │   │   │   ├── ChartWidgetContent.tsx # Full interactive TxChart (FinamTrade) widget (TD-825)
│   │   │   │   │                      #    Loads @finam/chart-web via mf-loader + federated modules
│   │   │   │   │                      #    Persists chartState to card.meta via PUT /api/card/:id
│   │   │   │   │                      #    Auto-save: poll (5s) + debounce (2s) + immediate (unmount/visibility)
│   │   │   │   │                      #    card.meta: {security_id, pitch, chartState, aiInstruments}
│   │   │   │   ├── FileContent.tsx    # Enhanced file preview with format-specific rendering (250 lines)
│   │   │   │   │                      #    - Skeleton loading state during upload (pulsing animation)
│   │   │   │   │                      #    - Excel/CSV: table preview (10×10 limit, scrollable)
│   │   │   │   │                      #    - TXT: text content preview (500 char limit, monospace)
│   │   │   │   │                      #    - DOCX: HTML preview (1000 char limit, parsed with mammoth)
│   │   │   │   │                      #    - Images: full image preview with pre-signed S3 URLs
│   │   │   │   │                      #    - Other: differentiated icons (PDF, Word, Excel, Folder)
│   │   │   │   │                      #    Uses libraries: xlsx (Excel parsing), mammoth (Word parsing)
│   │   │   │   ├── LinkContent.tsx    # Link preview with OG image and description
│   │   │   │   ├── FundamentalContent.tsx # Financial metrics display
│   │   │   │   │                      #    Displays 5 key metrics from meta.metrics array
│   │   │   │   │                      #    Reads display-ready metrics (no hardcoded fallbacks)
│   │   │   │   ├── TechnicalContent.tsx # Technical indicators with signal translation
│   │   │   │   │                      #    Displays first 5 indicators from meta.indicators
│   │   │   │   │                      #    Includes translateSignal helper (EN→RU)
│   │   │   │   ├── AiAnswerContent.tsx # AI-generated response display
│   │   │   │   ├── AiScreenerContent.tsx # AI Screener card (widgetType: ai_screener)
│   │   │   │   │                      #    Filters view → results table in same card
│   │   │   │   │                      #    Calls GET /api/ticker/screener, replaces content with results
│   │   │   │   │                      #    Output port (signal) connects to Strategy input (any)
│   │   │   │   ├── AiScreenerResultsTable.tsx # Signal results table (rendered inside AiScreenerContent)
│   │   │   │   │                      #    Columns: instrument, horizon, price, target, drawdown, volatility, sharpe
│   │   │   │   │                      #    "Изменить" returns to filter view
│   │   │   │   │                      #    Created via signal toolbar submenu → AI Скринер
│   │   │   │   ├── TickerCardContent.tsx # Ticker widget card (widgetType: ticker_card)
│   │   │   │   │                      #    Price, sparkline, change from meta (security_id, tickerSymbol, tickerName)
│   │   │   │   │                      #    Uses useTickerChartData, SparklineChart, TickerIcon
│   │   │   │   │                      #    Integrated with: GET /api/ticker/chart/:securityId
│   │   │   │   ├── StrategyContent.tsx # Strategy card with prompt editor and deploy button
│   │   │   │   │                      #    Textarea with auto-save (800ms debounce) for promptText
│   │   │   │   │                      #    "Запуск" button triggers SSE deploy via deploymentApi.deploy()
│   │   │   │   │                      #    "Publish to marketplace" button (feature-gated, shown when deployments exist)
│   │   │   │   │                      #    Auto-creates trading_idea card (700×520) with edge on first deploy
│   │   │   │   │                      #    Sets deploying flag in deploymentNavStore (before card creation)
│   │   │   │   │                      #    Invalidates deployment queries on completion
│   │   │   │   │                      #    Uses: PublishToMarketplaceModal, useDevStrategyCatalog
│   │   │   │   ├── TradingIdeaContent.tsx # Trading ideas table (native HTML, same style as AiScreenerResultsTable)
│   │   │   │   │                      #    Table only (header rendered by TradingIdeaOuterHeader outside card)
│   │   │   │   │                      #    Columns: ИНСТРУМЕНТ, ВХОД, ЦЕЛЬ, СТОП, ЛОТЫ, R:R, УВЕР., ДЕЙСТВИЕ
│   │   │   │   │                      #    Features: countdown timer, CSV download, skeleton loading during deploy
│   │   │   │   │                      #    Shared nav + deploying state via useDeploymentNavStore
│   │   │   │   ├── TradingIdeaOuterHeader.tsx # Badge + DeploymentNavigator rendered outside card
│   │   │   │   │                      #    Rendered by CardNode above Resizable for trading_idea cards
│   │   │   │   │                      #    Shared nav state via useDeploymentNavStore
│   │   │   │   │                      #    Figma: https://www.figma.com/design/Um5fMVTAZXlfyVR8nPTPeV/?node-id=1:3151
│   │   │   │   ├── WidgetContent.tsx  # Widget card content dispatcher
│   │   │   │   │                      #    screener_forecast → AiScreenerContent (TD-630)
│   │   │   │   │                      #    ai_screener → AiScreenerContent
│   │   │   │   └── widgets/          # Isolated widget components for WidgetContent
│   │   │   │       ├── index.ts      # WIDGET_MAP: Record<WidgetType, FC<WidgetProps>>
│   │   │   │       ├── types.ts      # WidgetProps interface { card: Card }
│   │   │   │       ├── ProfitabilityChartWidget.tsx   # Portfolio chart + AddBrokerDialog
│   │   │   │       ├── PositionsTableWidget.tsx       # Positions table with overflow-hidden wrapper
│   │   │   │       ├── NewsFeedWidget.tsx             # News feed widget — two modes: feed view and inline config
│   │   │   │       │                                  #    Config mode: delegates to NewsFeedConfigPanel
│   │   │   │       │                                  #    Controlled via newsFeedConfigStore (configuringCardId)
│   │   │   │       ├── NewsFeedConfigPanel.tsx        # Inline filter + ticker config panel for news feed widget
│   │   │   │       ├── WidgetPlaceholderWidget.tsx    # Re-exports WidgetPlaceholder
│   │   │   │       └── useBrokerDialogAutoOpen.ts     # Auto-opens broker dialog when no connections
│   │   │   ├── icons/                 # File type icon components (80x80px, placeholder style)
│   │   │   │   ├── IconPdf.tsx        # PDF file icon (red badge)
│   │   │   │   │                      #    Figma reference: https://www.figma.com/design/DjwUE4wL1Jd0CH3vTPPebE/%E2%9C%8F%EF%B8%8F-Diary?node-id=1138-30152&m=dev
│   │   │   │   ├── IconXls.tsx        # Excel file icon (green badge)
│   │   │   │   │                      #    Figma reference: https://www.figma.com/design/DjwUE4wL1Jd0CH3vTPPebE/%E2%9C%8F%EF%B8%8F-Diary?node-id=1138-30152&m=dev
│   │   │   │   ├── IconDoc.tsx        # Word document icon (blue badge)
│   │   │   │   │                      #    Microsoft Word branding colors
│   │   │   │   └── IconFolder.tsx     # Generic folder icon (for other file types)
│   │   │   │                          #    Figma reference: https://www.figma.com/design/DjwUE4wL1Jd0CH3vTPPebE/%E2%9C%8F%EF%B8%8F-Diary?node-id=1138-30152&m=dev
│   │   │   └── nodes/                 # Specialized card node types
│   │   │       ├── CardNode.tsx       # ⭐ Universal card node for all regular cards (including signals)
│   │   │       │                      #    Uses CardHeader component with configurable variants (simple/logo)
│   │   │       │                      #    Uses CardContent component for type-specific content display
│   │   │       │                      #    Uses getCardHeaderConfig() helper to determine header type
│   │   │       │                      #    Uses useUpdateCardMutation() for inline title editing (file cards)
│   │   │       │                      #    Logo header: for cards with external sources (signals, notifications)
│   │   │       │                      #                 Drag handle on header, allows swipe in content
│   │   │       │                      #    Simple header: for regular cards (notes, files, charts, etc.)
│   │   │       │                      #                   Drag handle on entire card content
│   │   │       │                      #                   Inline editing for 'file' type via handleTitleChange
│   │   │       │                      #    Uses FilePreview modal for file type cards (controlled via data.showFilePreview)
│   │   │       │                      #    Resizable: supports width/height dimensions persistence
│   │   │       │                      #    Header design: https://www.figma.com/design/DjwUE4wL1Jd0CH3vTPPebE/%E2%9C%8F%EF%B8%8F-Diary?node-id=3089-592326&m=dev
│   │   │       │                      #    Tags design: https://www.figma.com/design/DjwUE4wL1Jd0CH3vTPPebE/%E2%9C%8F%EF%B8%8F-Diary?node-id=3092-638293&m=dev
│   │   │
│   │   ├── hooks/                     # Board-specific React hooks
│   │   │   ├── useBoard.ts            # Main board state and operations
│   │   │   │                          #    Derives ymBoardType from board.template for useBoardGlobalEvents (YM)
│   │   │   │                          #    Centralizes mouse logic: multi-select, pane click reset, rectangle select
│   │   │   │                          #    openCreateDialog reads reactFlowInstance.getViewport() at call time → card placed at visible center
│   │   │   │                          #    Programmatically controls context menu (onRootContextMenu, onNodeContextMenu)
│   │   │   │                          #    Disables ReactFlow's built-in selection, syncs cardSelection ↔ ReactFlow nodes
│   │   │   │                          #    Handles card clicks via global mousedown/mouseup (click vs drag using startPosition)
│   │   │   │                          #    Keyboard handler: Delete/Backspace key deletes selected cards (respects editable elements)
│   │   │   │                          #    handleToolbarOpen: Opens card based on type (news → preview, file → preview,
│   │   │   │                          #                       signal → SignalModal in view mode, other → edit dialog)
│   │   │   ├── useBoardActions.ts     # Board CRUD actions (create, delete, etc.)
│   │   │   │                          #    All operations use targeted query invalidation (boardId-specific)
│   │   │   │                          #    saveCardColor: Saves card header color for selected cards
│   │   │   │                          #    uploadFile: 4-step atomic flow (no race conditions, no redundant fetches)
│   │   │   ├── useCardResize.ts       # Hook for resizing cards from within content components (replaces window event)
│   │   │   │                          #              Step 1: Create card with skipInvalidation flag
│   │   │   │                          #              Step 2: Upload file to S3 via filesApi
│   │   │   │                          #              Step 3: Update card with boardId (triggers targeted invalidation)
│   │   │   │                          #              Result: Only specific board's full query is refetched, not all boards
│   │   │   │                          #    Error handling: auto-deletes card if upload fails (with targeted invalidation)
│   │   │   │                          #    Logging: detailed step-by-step logging for debugging
│   │   │   ├── useBoardHandlers.ts    # Thin composition root for ReactFlow event handlers (TD-922)
│   │   │   │                          #    Delegates to focused sub-hooks in boardHandlers/ subdirectory
│   │   │   │                          #    Creates shared refs and passes them to sub-hooks
│   │   │   │                          #    Returns merged handler object with exact same shape as before
│   │   │   ├── boardHandlers/          # Sub-hooks split from useBoardHandlers (TD-922 Phase 2)
│   │   │   │   ├── types.ts            # Shared types: EMPTY_CLICK_INFO, SelectionAPI, BoardCallbacks, UseBoardHandlersConfig
│   │   │   │   ├── useBoardNodeDrag.ts # Node drag handlers: saveNodePositions, onNodeDragStart, onNodeDrag, onNodeDragStop
│   │   │   │   │                       #    Includes chat drop-zone detection and multi-drag support
│   │   │   │   ├── useBoardPaneSelection.ts # Pane selection: handlePaneMouseDown/Move/Up, handlePaneClick, handlePaneContextMenu
│   │   │   │   │                       #    Includes global mouseup cleanup listener for right-click selection
│   │   │   │   ├── useBoardNodeInteraction.ts # Node interaction: handleNodeClick, handleNodeContextMenu, onNodeDoubleClick
│   │   │   │   │                       #    Includes global keyboard Delete handler (TD-579)
│   │   │   │   ├── useBoardDropZone.ts # Drag & drop: onDragOver, onDragLeave, onDrop (files/news)
│   │   │   │   ├── useBoardEdgeConnect.ts # Edge connection: onConnect with optimistic UI + rollback
│   │   │   │   ├── useBoardViewport.ts # Viewport: init effect + onMove with debounced save
│   │   │   │   └── index.ts           # Barrel export of all sub-hooks and types
│   │   │   ├── useBoardSelection.ts   # Board selection orchestration (wraps useCardSelection with ReactFlow/DOM behavior)
│   │   │   │                          #    Manages selectionBox, toolbarState, groupOutline and global mouse listeners
│   │   │   ├── useCardSelection.ts    # Card selection state management (selectedCards ids and simple operations)
│   │   │   ├── useBoardGlobalEvents.ts # Window events: createNote, createAiScreener, createStrategyWidget; YM board_widget_create
│   │   │   ├── usePasteToBoard.ts     # Paste handler (Ctrl+V): creates card at viewport center, ignores paste when any modal is open
│   │   │   ├── useChartWidget.ts      # Chart widget hook — bridges React lifecycle to ChartWidgetController
│   │   │                              #    Returns: containerRef (ref callback), loading, mounted, error
│   │   │                              #    Handles: theme changes, AI instrument injection, save on blur/unload
│   │   │   └── useChartExport.ts     # Chart export hook — PNG via takeSnapshot, JSON/CSV via backend API
│   │   │                              #    Uses chartHandlerRegistry for PNG, chartExportApi for JSON/CSV
│   │   │
│   │   ├── queries.ts                 # ⭐ TanStack Query hooks for board API
│   │   │                              #    Exports: useBoardsAllQuery, useBoardQuery, useBoardFullQuery
│   │   │                              #             useCreateBoardMutation (creates new board, invalidates boards list)
│   │   │                              #             useCreateCardMutation, useUpdateCardMutation
│   │   │                              #             useDeleteCardMutation, boardQueryKeys (query key factory)
│   │   │                              #    ⚡ OPTIMIZATION: Mutations accept boardId for targeted invalidation
│   │   │                              #                   createCard accepts skipInvalidation flag for batched operations
│   │   │                              #                   Only invalidates specific board's queries, not all boards
│   │   │                              #                   Prevents redundant fetches of home board list during file upload
│   │   │                              #    useDeleteCardMutation: Invalidates signal webhooks when deleting signal cards
│   │   │                              #                         Ensures SignalDropdown updates when card removed
│   │   │                              #    useBoardFullQuery: No placeholderData to allow immediate UI updates
│   │   │                              #    Other queries: Use placeholderData: keepPreviousData for smooth UX
│   │   │
│   │   ├── helpers/                   # Board-specific helper functions
│   │   │   ├── ymBoardType.ts         # YM board_type: ymBoardTypeFromTemplate, ymBoardTypeFromPathname
│   │   │   ├── cardPositioning.ts     # Card positioning & grid layout utilities
│   │   │   │                          #    Functions: calculateGridPositions, calculateGridPositionsFromCenter,
│   │   │   │                          #              calculateSingleCardPosition
│   │   │   │                          #    Features: 16px spacing, 5 cards per row, collision detection,
│   │   │   │                          #              center-based positioning for viewport
│   │   │   │                          #    Used by: ticker card creation, paste operations, modal creation
│   │   │   ├── signalHelpers.ts       # Signal card data processing utilities
│   │   │   │                          #    Functions: getSignalTitle(payload) - extracts title from signal payload
│   │   │   │                          #              Priority: text > message > ticker+price > default
│   │   │   │                          #              formatSignalTime(isoString) - formats timestamp for display
│   │   │   │                          #              Returns: "Сегодня HH:MM", "Вчера HH:MM", or "DD.MM.YYYY HH:MM"
│   │   │   │                          #              getSourceConfig(sourceType) - returns logo, name, headerBg
│   │   │   │                          #    Used by: SignalContent, cardHeaderConfig
│   │   │   ├── cardHeaderConfig.ts    # ⭐ Card header configuration helper (universal/extensible)
│   │   │   │                          #    Function: getCardHeaderConfig(card, defaultColor, onTitleChange?) → CardHeaderConfig
│   │   │   │                          #    Returns discriminated union: SimpleHeaderConfig | LogoHeaderConfig
│   │   │   │                          #    Encapsulates logic for determining header variant based on card type
│   │   │   │                          #    Currently supports: signal cards (logo header with badge)
│   │   │   │                          #    Sets editable=true for 'file' type cards
│   │   │   │                          #    Easy to extend: add new card types with custom headers
│   │   │   │                          #    Used by: CardNode to determine header props
│   │   │   └── viewportUtils.ts       # Viewport calculation utilities
│   │   │                              #    Exports: DEFAULT_VIEWPORT, getViewportCenter
│   │   │                              #    getFlowCenterPosition(reactFlowInstance, cardSize?)
│   │   │                              #      → top-left position that visually centers a card in the viewport
│   │   │                              #      → accounts for sidebar width via .react-flow element bounds
│   │   │                              #      → offsets by cardSize/2 (default 336×280) so card center = viewport center
│   │   │                              #    getBoardCenterWithoutInstance(viewport, cardSize?)
│   │   │                              #      → same but without ReactFlowInstance (for global modals outside ReactFlowProvider)
│   │   │
│   │   ├── helpers.ts                 # Board data transformation utilities
│   │   │                              #    Functions: convertBoardDataToNodes(), cardToNode()
│   │   │
│   │   ├── edgeHelpers.ts             # Edge manipulation utilities
│   │   │                              #    Functions: createEdge(), deleteEdge(), updateEdge()
│   │   │
│   │   └── constants.ts               # Board-related constants
│                                      #    Exports: NODE_TYPES (cardNode, tradingIdeaNode - unified)
│                                      #             SAVE_DELAY, drag animation CSS
│                                      #    Note: Signal cards use cardNode type (no separate signalNode)
│   │
│   ├── 💬 chat/                       # Chat & AI conversation feature
│   │   ├── hooks/                      # Feature-specific hooks (ChatWindow decomposition)
│   │   │   ├── useChatSurveyGate.ts    # Onboarding survey gate state+actions (required/optional flow)
│   │   │   │                          #    Yandex Metrika: chat_survey_gate_started, quiz_*, legacy onboarding_question_* / interrupted / etc.
│   │   │   │                          #    Survey reminder: Triggers every 5 messages (MIN_SURVEY_GAP = 5)
│   │   │   │                          #    Error handling: Resets surveyPhase to 'done' on API errors (TD-1028 fix)
│   │   │   │                          #    CRITICAL: Validates chatId before API calls to prevent 404 errors (TD-449)
│   │   │   │                          #    Checks: !enabled || !chatId || chatId === 0 before loading/submitting
│   │   │   │                          #    Prevents race condition when chat is still being created
│   │   │   │                          #    Fix: Clears current question immediately after creating Q&A message
│   │   │   │                          #         and before UI update to prevent duplicate display (TD-556)
│   │   │   │                          #    Fix: Saves question reference before clearing state, wraps putAnswer
│   │   │   │                          #         calls in try-catch with state recovery on failure (TD-556)
│   │   │   ├── useChatFileAttachments.ts # File attachment upload flow (pending → uploaded ids)
│   │   │   ├── useChatWindowChipSync.ts  # Chip ↔ attachment/card sync effects (file→chip, card→chip, removal detection)
│   │   │   ├── useChatWindowSend.ts      # handleSendMessage + handleSendSuggestion (guards, context assembly, analytics)
│   │   │   ├── useChatWindowAttachments.ts # Input attachment panel logic (remove, delete, open list, refresh sync)
│   │   │   ├── useChatWindowLlmActions.ts  # LLM action bar callbacks (save-as-card, copy, thumbs, refresh) + store registration
│   │   │   ├── useChatWindowWelcome.ts     # Welcome migration localStorage state (load, toggle, ack, persist)
│   │   │   ├── useChatWindowAnimatedReveal.ts # Staggered message reveal animation (visibleMessageIndices)
│   │   │   ├── useOnboarding.ts       # Onboarding step tracking (GET/PUT /api/survey/onboarding)
│   │   │   │                          #    States: loading → active (step 0) / completed (step >= 1)
│   │   │   │                          #    Returns: isOnboardingVisible, dismissOnboarding, completeCurrentStep
│   │   │   └── useStrategySurvey.ts   # ⭐ Multi-step strategy survey flow hook
│   │   │                              #    Features: Step-based survey (chips/radio/checkbox/text → results),
│   │   │                              #              manages survey state, answers, navigation
│   │   │                              #    i18n: All labels and mock strings via t('strategySurvey.*')
│   │   │                              #    Gated by: useDevStrategyCatalog feature flag in ChatWindow
│   │   │                              #    Used by: ChatWindow (strategy survey flow)
│   │   ├── constants/
│   │   │   └── yandexChatProgressMeta.ts # Keys for SSE tool_progress.meta (YM); must match nestjs AgentService
│   │   ├── components/
│   │   │   ├── ChatManager.tsx        # ⭐ Main chat container with resizable width (308-600px); YM ai_chat_opened, ai_response_received, ai_tool_news_*, on send/tool_progress
│   │   │   │                          #    Position: Appears after NewsSidebar in flex layout
│   │   │   │                          #    Resizable: Left border drag handle with useResizable hook
│   │   │   │                          #    Drag handle: 4px wide hit area, purple highlight (rgba(120,99,246,0.4))
│   │   │   │                          #    Width: Dynamic chatWidth from store (persisted in localStorage)
│   │   │   │                          #    Animation: smooth open/close with opacity transition
│   │   │   │                          #                Uses framer-motion for width/layout transitions
│   │   │   │                          #    States: Chat list ↔ Active chat window ↔ Attachments list
│   │   │   │                          #    Attachments list: showAttachmentsList state, opens on chip click
│   │   │   │                          #    Auto-create first chat: Creates initial chat dialog automatically on first open
│   │   │   │                          #                           when chat list is empty (TD-395)
│   │   │   │                          #                           Error handling: checks isError from useChatsQuery
│   │   │   │                          #                           Prevents creation if chat list failed to load
│   │   │   │                          #                           Prevents infinite retry with hasAttemptedFirstChatCreation ref
│   │   │   │                          #                           Skips if welcome_seed_chat_payload exists (handled by useWelcomeFlowHandler)
│   │   │   │    Streaming: Uses flushSync for real-time UI updates
│   │   │   │                          #    Cache: messagesCacheRef for closure-safe state access
│   │   │   │                          #    Tool progress: when backend tool reports create_card=done,
│   │   │   │                          #                   uses tool_progress.meta.card to update boardFull(boardId) cache (no full board refetch)
│   │   │   │                          #                   and lightly invalidates edges; falls back to invalidation when meta is missing
│   │   │   │                          #    Header: "AI Chat" title, close button, dynamic right icon
│   │   │   │                          #            Right icon: folder (back to list) / add-square (new chat)
│   │   │   │                          #    Context cards: stored in localStorage per chat
│   │   │   │                          #    Trades context: Manages chatTradesContext from store for trade analysis
│   │   │   │                          #                    Clears after successful message send
│   │   │   │                          #    Open trigger: AI Chat button in Sidebar
│   │   │   │                          #    handleSaveResponseAsCard: saves AI response as board card
│   │   │   │                          #                              uses user prompt as card title (from promptTitle param)
│   │   │   │                          #    Assets: /images/folder.svg (Figma design)
│   │   │   │                          #    Re-exports: useChatManager from hooks/useChatManager
│   │   │   │                          #    Onboarding: Shows OnboardingPanel overlay for new users (step 0)
│   │   │   │                          #               Uses Modal component, dismissed via useOnboarding hook
│   │   │   ├── OnboardingPanel.tsx    # Quick Start onboarding full-screen overlay
│   │   │   │                          #    Props: open, onClose, onSectionClick
│   │   │   │                          #    Uses: Modal (xl), Icon, design tokens (blackinverse-a*, bg-background-white_medium)
│   │   │   │                          #    Features: 3 clickable preview cards (interface guide, try product, connect portfolio)
│   │   │   │                          #    Shown only for new users (onboarding_step === 0 in DB)
│   │   │   ├── ChatWindow.tsx         # Individual chat window with AI response actions
│   │   │   │                          #    Preserves line breaks in messages (whitespace-pre-wrap)
│   │   │   │                          #    Streaming: Shows blinking cursor during token streaming
│   │   │   │                          #    ThinkingIndicator: Shown only when no content received yet
│   │   │   │                          #    Props: showAuthNotice (optional) - triggers auth banner
│   │   │   │                          #    ToolProgressIndicator: Shows tool execution status
│   │   │   │                          #    Features: Save AI response to board with LaunchIcon button
│   │   │   │                          #              Action buttons panel below each AI response
│   │   │   │                          #              Placeholder container for future rating buttons
│   │   │   │                          #              Disclaimer text under input (investment advice notice)
│   │   │   │                          #    Props: animatedReveal (sequential message reveal animation)
│   │   │   │                          #           minimal (hides model settings, surveys, file attachments)
│   │   │   │                          #    ⭐ Input blocking: Disabled when welcome migration active but not acknowledged
│   │   │   │                          #                     User must click "Да, мне все понятно" to continue
│   │   │   │                          #                     Also blocked during survey phases (blocked/optional/prompt/reminder)
│   │   │   │                          #    Survey rendering: Shown after ChatMessageList in flat flex-col gap-6 structure
│   │   │   │                          #                     EmptyChat hidden when survey active (!isSurveyBlocking)
│   │   │   │                          #    Save button: MUI LaunchIcon, 28px (h-7 w-7), gray with hover
│   │   │   │                          #    Card title: truncated user prompt (max 80 chars) or fallback
│   │   │   │                          #    Layout: mobile-first flex (column→row), space-between alignment
│   │   │   │                          #    Uses: EmptyChat component for empty state with suggestions
│   │   │   │                          #          Disclaimer component for investment advice notice
│   │   │   ├── EmptyChat.tsx           # Empty chat state with suggestions and disclaimer
│   │   │   │                          #    Features: Title question, suggestion list, full disclaimer
│   │   │   │                          #    Props: onSendSuggestion (auto-sends message), disabled
│   │   │   │                          #    Layout: Centered vertically, max-w-[480px] container
│   │   │   │                          #    Composites: ChatSuggestionsList, Disclaimer
│   │   │   ├── ChatSuggestionsList.tsx # List of suggestion items for empty chat
│   │   │   │                          #    Features: Hardcoded suggestions array, gap-2 vertical layout
│   │   │   │                          #    Props: onSend (callback), disabled
│   │   │   │                          #    Suggestions: Portfolio analysis questions (5 items)
│   │   │   ├── ChatSuggestion.tsx      # Individual suggestion item button
│   │   │   │                          #    Features: Hover state, chevron icon, auto-send on click
│   │   │   │                          #    Props: text, onSend, disabled
│   │   │   │                          #    Design: bg-gray-50/900, rounded-12, min-h-[48px]
│   │   │   │                          #    Icon: MUI ChevronRightIcon
│   │   │   ├── Disclaimer.tsx          # Reusable disclaimer component with variants
│   │   │   │                          #    Props: variant ('full' | 'short'), className
│   │   │   │                          #    Full: Long investment disclaimer for empty state
│   │   │   │                          #    Short: Brief AI disclaimer below chat input
│   │   │   │                          #    Styles: text-10/[8px], text-text-muted, centered
│   │   │   │
│   │   │   │   widgets/                # Chat message widgets (alert, chart, portfolio, risk, strategies)
│   │   │   │   ├── AlertCard.tsx       # Alert message widget (info, warning, success, error)
│   │   │   │   ├── MiniChart.tsx       # Sparkline chart widget with gradient fill
│   │   │   │   ├── PortfolioSummary.tsx # Portfolio value summary widget
│   │   │   │   ├── RiskIndicator.tsx   # Risk level indicator with progress bar
│   │   │   │   ├── renderWidget.tsx    # Widget factory by type (incl. 'strategies' → StrategiesWidget)
│   │   │   │   └── index.ts            # Barrel exports
│   │   │   │
│   │   │   │   chatWindow/             # ChatWindow sub-components (keeps ChatWindow.tsx smaller)
│   │   │   │   ├── ChatMessageList.tsx # Message list with virtual scroll (@tanstack/react-virtual); user+assistant pairing, streaming/tool progress
│   │   │   │   │                       #    DisplayBlock types: welcome_ack, survey_qa, survey_feedback, user_pair, assistant_only
│   │   │   │   │                       #    survey_qa: question (bold) + answer in #FBFAFF container
│   │   │   │   │                       #    welcome_ack: "Да, мне все понятно" in #FBFAFF container
│   │   │   │   │                       #    Widget rendering: uses renderWidget for msg.widget + msg.widgetData
│   │   │   │   │                       #    User messages: Dark bubble design (#242424) with white text
│   │   │   │   │                       #    Action bar: Attachment chips + sources count + edit toggle
│   │   │   │   │                       #    Edit mode: Message text becomes violet-300, accept/decline icons
│   │   │   │   │                       #    Uses: UserMessageBubble, MessageActionBar components
│   │   │   │   ├── DisplayBlockCards.tsx # WelcomeAckBlock, SurveyQaBlock, SurveyFeedbackBlock for virtual list rows
│   │   │   │   ├── WelcomeMigrationBanner.tsx # "Диалог сохранен…" banner with expandable history
│   │   │   │   │                       #    Props: preview, collapsed, seededMessages, onToggle
│   │   │   │   │                       #    Features: green checkmark icon, animated expand/collapse
│   │   │   │   │                       #    Uses: framer-motion AnimatePresence, MUI CheckCircleOutlineIcon
│   │   │   │   ├── WelcomeAckCta.tsx   # "Да, мне все понятно" CTA using AnswerOptionButton
│   │   │   │   ├── SurveyQuestion.tsx  # Survey question with Chips layout + progress bar
│   │   │   │   │                       #    Props: question, selection, onSelectionChange, onSubmit, onSkip, progress
│   │   │   │   │                       #    Features: dot progress bar, question counter (X/Y), flex-wrap chips
│   │   │   │   ├── messageWidgets.ts   # Strategy widget detection & rendering from pipeline output
│   │   │   │   │                       #    Detects recommendedStrategies field in message plans/executionSteps
│   │   │   │   │                       #    Extracts strategy IDs and delegates to renderWidget('strategies')
│   │   │   │   └── welcomeMigration.ts # Welcome migration meta helpers (load/persist/collapse logic)
│   │   │   │
│   │   │   │   strategySurvey/         # ⭐ Multi-step strategy survey flow (TD-787)
│   │   │   │   ├── StrategySurveyManager.tsx # Survey flow orchestrator
│   │   │   │   │                       #    Features: Step navigation, renders step components by type
│   │   │   │   │                       #    Uses: getSurveySteps(t), step components
│   │   │   │   │                       #    Used by: ChatWindow (when survey is active)
│   │   │   │   ├── StrategySurveyResults.tsx # Survey results display with matched strategies
│   │   │   │   │                       #    Features: Strategy cards list, max-w-[300px]
│   │   │   │   │                       #    Uses: SurveyStrategyCard
│   │   │   │   ├── survey.config.ts    # Survey steps configuration via getSurveySteps(t: TFunction<'chat'>)
│   │   │   │   ├── survey.mock-strategies.ts # Mock matched strategies for survey results
│   │   │   │   │
│   │   │   │   ├── steps/              # Individual survey step components
│   │   │   │   │   ├── StrategySurveyChipsStep.tsx   # Multi-select chips step
│   │   │   │   │   ├── StrategySurveyRadioStep.tsx   # Single-select radio step
│   │   │   │   │   ├── StrategySurveyCheckboxStep.tsx # Multi-select checkbox step (i18n: portfolioOption, customPlaceholder)
│   │   │   │   │   ├── StrategySurveyTextStep.tsx    # Free text input step
│   │   │   │   │   └── StrategySurveyResultsStep.tsx # Final results step
│   │   │   │   │
│   │   │   │   └── ui/                 # Shared UI components for survey
│   │   │   │       ├── SurveyHeader.tsx      # Survey step header with progress
│   │   │   │       ├── SurveyFooter.tsx      # Survey navigation footer (i18n: title/back/next)
│   │   │   │       ├── SurveyOptionItem.tsx  # Individual option item (chip/radio/checkbox)
│   │   │   │       └── SurveyStrategyCard.tsx # ⭐ Strategy card in survey results & analytics widget
│   │   │   │                                 #    Features: Full-bleed chart from real profit points data,
│   │   │   │                                 #              profit display, risk level (getStrategyCardRiskLabel),
│   │   │   │                                 #              title truncation (line-clamp-1),
│   │   │   │                                 #              avatar fallback (2-char initials on broken image)
│   │   │   │                                 #    Data: useGetProfitPoints (last 30 points per strategy)
│   │   │   │                                 #    Used by: StrategySurveyResults, StrategiesWidgetCards
│   │   │   │
│   │   │   ├── AuthNoticeBanner.tsx   # Auth notice banner that slides up from under input
│   │   │   │                          #    Features: animated slide-up from bottom, login CTA button
│   │   │   │                          #    Props: show (boolean) - controls banner visibility
│   │   │   │                          #    Used by: ChatWindow (minimal mode), Welcome page
│   │   │   ├── ChatInput.tsx          # Chat message input with Figma design
│   │   │   │                          #    Features: token counters (live), filter/add/attach buttons
│   │   │   │                          #    Design: animated gradient border, rounded container (hovered/focused states)
│   │   │   │                          #    Token display: input tokens (left), chat tokens (right)
│   │   │   │                          #    Filter button: MUI Tune icon (@mui/icons-material/Tune)
│   │   │   │                          #    Props: attachedCards, attachedFiles, onRemoveAttachment, onPasteFile
│   │   │   │                          #           inlineChips, onInlineChipsChange (for inline link/card/ticker chips)
│   │   │   │                          #    States: empty, hovered (glow 0.7), focused (glow 0.7), with text, with attachments
│   │   │   │                          #    Uses: ChatInputRichContent (contentEditable)
│   │   │   │                          #    Image attachments: previews shown above input container
│   │   │   │                          #    Exports: Attachment interface (id, type, name)
│   │   │   ├── ChatInputRichContent.tsx # ContentEditable wrapper for rich text input
│   │   │   │                          #    Features: inline chips support, paste handling (files, URLs)
│   │   │   │                          #    Props: value, onChange, onSend, onFocusChange, chips, onPasteFile, onPasteUrl
│   │   │   │                          #    Ref methods: focus, blur, insertChip, clear, getContent
│   │   │   │                          #    Handles: Enter to send, Shift+Enter for newline, backspace through chips
│   │   │   │                          #    Exports: ChatInputRichContentRef, ChatInputContent, generateChipId, extractDomain
│   │   │   ├── InlineChip.tsx         # Inline chip component for contentEditable text
│   │   │   │                          #    Types: link, card, ticker (each with distinct icon)
│   │   │   │                          #    Features: contentEditable=false (atomic unit), hover remove button
│   │   │   │                          #    Props: type, label, onRemove
│   │   │   │                          #    Design: 20px height, 4px padding, rounded-4, bg-secondary
│   │   │   │                          #    Exports: InlineChipData interface, InlineChipType type
│   │   │   ├── AttachmentChip.tsx     # @deprecated — use ChipsGroup instead
│   │   │   │                          #    Attachment indicator chips (old implementation)
│   │   │   │                          #    Props: count, label, removable, onRemove, onClick
│   │   │   ├── AttachmentTradesChip.tsx # Trade attachments chip with ticker icons
│   │   │   │                          #    Features: overlapping ticker icons, removable
│   │   │   │                          #    Props: trades (ticker[]), removable, onRemove, onClick
│   │   │   │                          #    Design: purple dashed border, overlapping icons with z-index
│   │   │   │                          #    Usage: Shows attached trades grouped by ticker
│   │   │   ├── AttachmentListItem.tsx # Individual attachment item in attachments list window
│   │   │   │                          #    Types: image, document, ticker, link, note (4 visual variants)
│   │   │   │                          #    Layout: Icon (40x40) | Name + Date / Additional info + Time
│   │   │   │                          #    Features: hover bg effect, delete icon on hover (when canDelete)
│   │   │   │                          #    Props: attachment (AttachmentListItemData), canDelete, onDelete
│   │   │   │                          #    Exports: AttachmentListItemData interface, AttachmentType type
│   │   │   ├── AttachmentListWindow.tsx # Container for attachments list view
│   │   │   │                          #    Features: scrollable list, contextual delete based on mode
│   │   │   │                          #    Props: attachments[], mode (input|sent|editing), onDelete
│   │   │   │                          #    Modes: input/editing = delete enabled, sent = readonly
│   │   │   │                          #    Exports: AttachmentListMode type
│   │   │   ├── UserMessageBubble.tsx  # Dark bubble container for user messages
│   │   │   │                          #    Features: dark bg, edit mode; multi-bubble only if messageType=survey_rows
│   │   │   │                          #    Props: content, messageType?, isEditing, onContentChange
│   │   │   │                          #    Edit mode: text becomes violet-300, auto-resize textarea
│   │   │   │                          #    Design: rounded-12, px-3 py-2, max-width 432px
│   │   │   ├── MessageActionBar.tsx   # Action bar below user messages
│   │   │   │                          #    Features: attachment chips (left), sources + edit toggle (right)
│   │   │   │                          #    Props: attachments[], sourcesCount, edit callbacks
│   │   │   │                          #    Design: flex space-between, 32px height
│   │   │   │                          #    Composes: MessageAttachChip, EditMessageToggle
│   │   │   ├── MessageAttachChip.tsx  # @deprecated — use ChipLink instead
│   │   │   │                          #    Types: chart, document, ai_answer, note, link, group
│   │   │   │                          #    Old implementation without hover/close behavior
│   │   │   ├── ChipLink.tsx          # Attachment type chip with hover close (Figma: 56218:6592)
│   │   │   │                          #    Types: chart, document, ai_answer, note, link, group, image, attachment
│   │   │   │                          #    Features: Icon component, hover icon→close swap, onRemove
│   │   │   │                          #    Props: type, label, onClick, onRemove, customIcon
│   │   │   │                          #    Design: h-24, rounded-2, bg-blackinverse-a4, hover:bg-blackinverse-a6
│   │   │   ├── ChipsGroup.tsx        # Summary chip for attachment count (Figma: 56218:6634, 59430:26172)
│   │   │   │                          #    Features: size variants (sm/lg), chevron on hover (web)
│   │   │   │                          #    Props: count, label, size, onClick
│   │   │   │                          #    Design: sm=web (12px), lg=app (14px semibold)
│   │   │   ├── ChipInfo.tsx          # Expanded attachment card (Figma: 56218:6611)
│   │   │   │                          #    Features: 32px logo, title+date, price+time, hover close
│   │   │   │                          #    Props: title, date, info, time, logo, onRemove, onClick
│   │   │   ├── EditMessageToggle.tsx  # Edit mode toggle for user messages
│   │   │   │                          #    Default: pencil icon button
│   │   │   │                          #    Edit mode: accept (green check) + decline (red X) icons
│   │   │   │                          #    Props: isEditing, onEditClick, onAccept, onDecline
│   │   │   ├── ThinkingIndicator.tsx  # Animated "Размышляю..." indicator
│   │   │   │                          #    Features: pulsing text, bouncing dots animation
│   │   │   │                          #    Uses: framer-motion for animations
│   │   │   │                          #    Shows while waiting for AI response
│   │   │   ├── ToolProgressIndicator.tsx # Tool execution progress display
│   │   │   │                          #    Shows tool status during AI agent execution
│   │   │   │                          #    Status icons: loader (pending), checkmark (done), cross (error)
│   │   │   │                          #    Uses: framer-motion for animations, MUI icons
│   │   │   │                          #    Props: toolProgress (Record<string, ToolProgressEvent>)
│   │   │   ├── SendButton.tsx # Animated send button with fly-away effect
│   │   │   │                          #    Features: send icon animation, wind lines effect
│   │   │   │                          #    Uses: framer-motion, MUI SendIcon
│   │   │   ├── StrategiesWidget.tsx   # Strategies recommendation widget for analytics chat
│   │   │   │                          #    Trigger: message has recommendedStrategies field in plans output
│   │   │   │                          #    Features: frosted-glass CTA button, expands to show strategy cards
│   │   │   │                          #    Uses: StrategiesWidgetCards, i18n('chat:strategiesWidget.*')
│   │   │   ├── StrategiesWidgetCards.tsx # Strategy cards list fetched from real API
│   │   │   │                          #    Features: per-ID fetch via useGetStrategyCatalogById, loading spinner
│   │   │   │                          #    Uses: SurveyStrategyCard, strategiesCatalog queries
│   │   │   ├── ChatHeader.tsx         # Chat panel header with model selector
│   │   │   │                          #    Features: logo icon, AI model dropdown, action icons
│   │   │   │                          #    Actions: new chat, show chat list, expand/collapse fullscreen
│   │   │   │                          #    Uses: useAvailableModelsQuery for model list
│   │   │   │                          #    Attachments mode: back button + "ОБЪЕКТЫ (N)" title
│   │   │   │                          #    Props: showAttachmentsList, attachmentsCount, onBackFromAttachments, onNewAnalysis
│   │   │   ├── ChatList.tsx           # List of user's chats grouped by date
│   │   │   │                          #    Groups: Today, Yesterday, Earlier
│   │   │   │                          #    Features: chat rename via inline edit
│   │   │   │                          #    Pipeline chats: shown with [A] prefix badge based on chat.type === 'pipeline'
│   │   │   ├── ChatItem.tsx           # Single chat list item with context menu
│   │   │   │
│   │   │   ├── Prompt/                # User prompt display components
│   │   │   │   ├── ActionsPromptPanel.tsx # Actions below user prompt (Figma: 56218:6428)
│   │   │   │   │                      #    Features: source chips (left), sources badge + edit/cancel/confirm (right)
│   │   │   │   │                      #    States: default, editing, saved
│   │   │   │   │                      #    Composes: ChipLink, IconButton, Icon
│   │   │   │   └── PromptBlock.tsx    # Full user prompt block (Figma: 56218:6417)
│   │   │   │                          #    Composes: bubble + ActionsPromptPanel
│   │   │   │                          #    States: default, editing (purple text), saved
│   │   │   ├── Message/               # AI response display components
│   │   │   │   ├── ActionsMessagePanel.tsx # Actions below AI response (from Portfolio Figma)
│   │   │   │   │                      #    Features: refresh, copy, "Add to board" ghost button
│   │   │   │   │                      #    Composes: IconButton, Button, Icon
│   │   │   │   └── MessageBlock.tsx   # Full AI response block (from Portfolio Figma)
│   │   │   │                          #    Composes: MarkdownRenderer + ActionsMessagePanel
│   │   │   ├── pipeline/              # Pipeline (AI analysis) components
│   │   │   │   ├── PipelineMessageBlock.tsx  # Renders pipeline steps as a visual block
│   │   │   │   │                      #    Props: { steps: ExecutionStep[] } — flat array of pipeline step records
│   │   │   │   │                      #    Renders: step progress list with status, duration, errors
│   │   │   │   ├── PipelineInput.tsx   # Pipeline instruction input for pipeline-type chats
│   │   │   │   │                      #    Shows textarea + execute/stop button + live PipelineProgress
│   │   │   │   │                      #    Uses usePipelineExecution hook with chatId context
│   │   │   │   └── PipelineProgress.tsx # Step-by-step progress display for pipeline execution
│   │   │                              #    Features: three-dot menu (rename, delete)
│   │   │                              #    Hover: shows menu button
│   │   │
│   │   └── queries.ts                 # Chat TanStack Query hooks
│                                      #    Exports: useChatsQuery, useSendMessageMutation
│   │
│   ├── 📊 statistics/                 # Trading statistics feature
│   │   │
│   │   ├── components/
│   │   │   ├── PositionsTable.tsx     # ⭐ Positions table container (Figma 2001:1987)
│   │   │   │                          #    Manages: viewMode ('history' | 'portfolio'), filters, pagination
│   │   │   │                          #    Live data from broker accounts with auto-polling
│   │   │   │                          #    AI Integration: handleAskAI creates chat with selected trades
│   │   │   │                          #             - Collects trade_ids / security_id from selections
│   │   │   │                          #             - Creates/updates chat via useChatManager
│   │   │   │                          #             - Registers clearSelections callback in chatStore
│   │   │   │                          #    Conditional empty states based on broker presence
│   │   │   │                          #    Row selection with context menu (positioned at click coords)
│   │   │   ├── PositionsTableHeader.tsx # Header (42px): DateRangeFilter + Search + SegmentedControl
│   │   │   │                          #    Left group: PositionsDateRangeFilter
│   │   │   │                          #    Right group: SearchInput (180px) + SegmentedControl (161px)
│   │   │   ├── PositionsTableFooter.tsx # Footer (44px): Compact pagination + last update time
│   │   │   │                          #    Uses: PositionsCompactPagination
│   │   │   ├── PositionsPortfolioTable.tsx # Portfolio positions data table
│   │   │   │                          #    Open positions with P&L, ticker icons, expandable trades
│   │   │   ├── PositionsHistoryTable.tsx # Trade history (flat); YM trades_loaded, trade_selected (catalog portfolio context)
│   │   │   ├── PositionsHistoryGroupedTable.tsx # Grouped history; YM trades_loaded once per grouped query; trade_selected once per selection stretch until all instrument+trade selection cleared; usePortfoliosWithSummaryQuery for broker_name
│   │   │   │                          #    Optional: filtersOverride + instrumentSelection + embedded → checkbox multi-select (portfolio modal)
│   │   │   ├── PositionsTableEmptyState.tsx # Empty state for positions table
│   │   │   │                          #    Contextual message based on broker/filter state
│   │   │   ├── PositionsTableSkeletons.tsx # Loading skeleton rows for positions table
│   │   │   ├── TradesTable.tsx        # Trades table with sorting/filtering
│   │   │   │                          #    Pagination support
│   │   │   │                          #    Color-coded P&L
│   │   │   ├── BrokerAccountFilter.tsx # Multi-select broker account filter
│   │   │   │                          #    Dropdown with broker/account checkboxes
│   │   │   │                          #    Supports: null=all accounts, []=no accounts, [...]=specific
│   │   │   │                          #    Features: partial selection with RemoveIcon, accordion expand/collapse
│   │   │   │                          #    Synced with statisticsStore.selectedAccountIds
│   │   │   ├── PositionsOptionsMenu.tsx # Positions actions menu (sync, manage brokers)
│   │   │   │                          #    Opens BrokerManagementDialog
│   │   │   ├── PositionsDateRangeFilter.tsx # Compact date range dropdown (89x32px)
│   │   │   │                          #    From Figma node-id=2001:1990
│   │   │   │                          #    Periods: Всё время, 2 дня, Неделя, 1 месяц, 6 месяцев, 1 год, 3 года
│   │   │   │                          #    Uses: Dropdown from @/components/ui/Dropdown
│   │   │   ├── PositionsCompactPagination.tsx # Compact prev/next + "4 из 10" counter (height 44px)
│   │   │   ├── DateRangeFilter.tsx    # Date range filter (from/to date pickers)
│   │   │   ├── ProfitabilityChart.tsx # ⭐ Portfolio value history chart (Chart.js)
│   │   │   │                          #    Features: multiple periods (2d-3y, all), broker filtering
│   │   │   │                          #    Displays: total value, instruments value, cash balance
│   │   │   │                          #    X-axis: adaptive with Chart.js autoSkip + maxTicksLimit
│   │   │   │                          #    Uses: react-chartjs-2, chartHelpers.ts
│   │   │   │                          #    Used by: PortfolioPage.tsx
│   │   │   ├── chartHelpers.ts        # Chart date generation and formatting helpers
│   │   │   │                          #    Exports: generateFullDateRange, formatXAxisLabel, generateLabels
│   │   │   ├── ProfitabilityChartSkeleton.tsx # Loading skeleton for portfolio chart
│   │   │   ├── ProfitabilityChartIllustration.tsx # Illustration for empty chart state
│   │   │   ├── PortfolioFirstLoadState.tsx # Loading state while broker data syncs for the first time
│   │   │   │                          #    Polls useSyncProgressQuery for real-time account progress
│   │   │   │                          #    Shows DotsLoader in determinate mode (completed/total accounts)
│   │   │   ├── DotsLoader.tsx         # Dot-grid progress bar (adaptive width)
│   │   │   │                          #    Props: progress?: number (0-100) — omit for indeterminate scan
│   │   │   └── WidgetPlaceholder.tsx  # "Скоро тут будут виджеты" placeholder
│   │   │
│   │   ├── helpers/
│   │   │   ├── positionsBlockColumns.ts # Shared COLUMNS constant for all positions tables
│   │   │   │                          #    Exports: POSITIONS_BLOCK_COLUMNS, ColAlign type
│   │   │   ├── positionsTableShared.tsx # Shared types and render helpers for positions tables
│   │   │   └── positionsTableUtils.tsx  # Utility functions for positions table data logic
│   │   │
│   │   ├── hooks/
│   │   │   └── usePaginationSync.ts       # Pagination state synchronization between views
│   │   │
│   │   └── queries.ts                 # TanStack Query hooks for statistics API
│   │                                  #    Exports: usePositionsQuery (enablePolling → refetchInterval 10s)
│   │                                  #             useTradesQuery, useTransactionsQuery, useSyncMutation
│   │                                  #             usePortfolioValueHistoryQuery
│   │
│   ├── portfolio-catalog/             # Portfolio + accounts catalog (boards list, portfolio rows, accounts tree)
│   │   ├── components/
│   │   │   ├── PortfolioCatalogView.tsx   # Layout; opens CreatePortfolioFromDataModal for + / edit
│   │   │   ├── CreatePortfolioFromDataModal.tsx # Create/edit instrument portfolio; YM portfolio_created on create; embeds PositionsHistoryGroupedTable
│   │   │   ├── PortfoliosListSection.tsx  # Props: onOpenCreateInstrumentPortfolio, onOpenEditInstrumentPortfolio
│   │   │   ├── PortfolioCard.tsx          # Row card; menu "Настроить" calls onEdit when provided
│   │   │   └── (PortfoliosBoardsSection, AccountsTreeSection, SectionHeader, …)
│   │   ├── queries.ts                 # usePortfoliosWithSummaryQuery, usePortfolioDetailQuery, useBoardPortfolioSettingsQuery, create/update/delete mutations
│   │   └── utils/
│   │       ├── instrumentFillRule.ts    # symbolsFromPortfolioFillRule(fillRule JSON)
│   │       └── ymPortfolioAnalytics.ts  # ymBrokerNameFromPortfolioFillRule, ymPortfolioContextFromCatalog (YM portfolio_id / broker_name)
│   │
│   ├── 💼 portfolio/                  # Portfolio management feature (temporary mock)
│   │   │
│   │   ├── components/
│   │   │   ├── CreatePortfolioDialog.tsx # Portfolio creation dialog
│   │   │   │                          #    Fields: name (required), description (optional)
│   │   │   │                          #    Used by: PortfoliosPage
│   │   │   ├── GridCard.tsx           # ⭐ Portfolio card for grid view
│   │   │   │                          #    Features: Portfolio preview (111px), name, updated date
│   │   │   │                          #    Uses: Link (Next.js), formatBoardDate utility
│   │   │   │                          #    Preview: /images/mocks/portfolio-preview.png
│   │   │   ├── PortfolioListItem.tsx  # ⭐ Portfolio item for list view
│   │   │   │                          #    Layout: Preview (92×56px) + title + dates (created/updated) + menu button
│   │   │   │                          #    Features: Three-dot menu button, hover effects
│   │   │   │                          #    Uses: Link (Next.js), formatBoardDate utility
│   │   │   └── PortfolioGridControls.tsx # ⭐ Reusable controls for portfolio views
│   │   │                              #    Features: "Добавить портфель" button + GridListToggle
│   │   │                              #    Props: onCreatePortfolio, gridSubMode, onGridSubModeChange
│   │   │                              #    Used by: PortfoliosGridView, PortfoliosListView
│   │   │
│   │   ├── views/                     # Portfolio view components (Grid/List modes)
│   │   │   ├── PortfoliosGridView.tsx # ⭐ Grid view of portfolios
│   │   │   │                          #    Features: Portfolio cards in grid layout
│   │   │   │                          #    Uses: GridView, GridCard, PortfolioGridControls
│   │   │   │                          #    Navigation: Link-based (Next.js)
│   │   │   │
│   │   │   ├── PortfoliosListView.tsx # ⭐ List view of portfolios
│   │   │   │                          #    Features: Portfolio items in vertical list
│   │   │   │                          #    Uses: PortfolioListItem, PortfolioGridControls
│   │   │   │                          #    Loading/Error: Uses LoadingState, ErrorState components
│   │   │   │
│   │   │   └── index.ts               # Barrel export for portfolio views
│   │   │
│   │   ├── queries.ts                 # Portfolio data hooks (TEMPORARY MOCK)
│   │   │                              #    Uses: useMockPortfolioStore (Zustand)
│   │   │                              #    Exports: usePortfoliosQuery, usePortfolioQuery
│   │   │                              #             useCreatePortfolioMutation, useDeletePortfolioMutation
│   │   │                              #    TODO: Replace with real API when backend ready
│   │   │                              #    Mock data: 1 portfolio (Основной портфель)
│   │   │
│   │   └── index.ts                   # Barrel export
│   │
│   ├── 📡 signal/                     # Webhook signal integration (TradingView, Telegram) feature
│   │   │
│   │   ├── queries.ts                 # ⭐ TanStack Query hooks for signal API
│   │   │                              #    Exports: useSignalWebhooksQuery, useSignalWebhookQuery
│   │   │                              #             useSignalHistoryQuery, useGenerateWebhookUrlMutation
│   │   │                              #             useCreateSignalWebhookMutation, useUpdateSignalWebhookMutation
│   │   │                              #             useDeleteSignalWebhookMutation
│   │   │                              #    Auto-activation: Creating new webhook auto-activates ALL board webhooks
│   │   │                              #    Query keys: ['signalWebhooks', boardId], ['signalWebhook', id]
│   │   │                              #                ['signalHistory', webhookId, limit]
│   │   │                              #    Invalidation: Updates invalidate board query & webhook lists
│   │   │                              #    Used by: SignalModal, SignalDropdown, useSignalToggle
│   │   │
│   │   ├── hooks/                     # Signal-specific custom hooks
│   │   │   └── useSignalToggle.ts     # ⭐ Signal toggle logic (reusable for TradingView/Telegram)
│   │   │                              #    Manages: localToggleState, allActive, isSignalsWorking
│   │   │                              #    Returns: { isSignalsWorking, toggleSignalsState, isLoading }
│   │   │                              #    Logic: Syncs local state with webhooks active state
│   │   │                              #           Activates/deactivates all webhooks on toggle
│   │   │                              #           Resets to inactive when all webhooks deleted
│   │   │                              #    Used by: SignalDropdown (ready for TelegramDropdown)
│   │   │
│   │   ├── stores/                    # Signal-specific Zustand stores
│   │   │   └── signalModalStore.ts    # Signal modal state management
│   │   │                              #    State: isOpen, boardId?, signalId?, mode ('create'|'edit'|'view')
│   │   │                              #    Actions: openModal(boardId?, signalId?, mode?), closeModal()
│   │   │                              #    Mode logic: Auto-determines mode if not provided
│   │   │                              #                signalId exists → 'edit', no signalId → 'create'
│   │   │                              #    Used by: SignalModal, SignalDropdown, SignalContent, useBoardHandlers
│   │   │
│   │   └── components/
│   │       ├── SignalModal.tsx        # ⭐ Main modal wrapper for signal management
│   │       │                          #    Modes: 'create', 'edit', 'view' (controlled by signalModalStore)
│   │       │                          #    Create mode: Generates webhook URL, allows signal creation
│   │       │                          #    Edit mode: Loads existing signal, allows description/notification updates
│   │       │                          #    View mode: Read-only display with signal history, "Close" button only
│   │       │                          #    Features: Auto-loads signal data & history in edit/view modes
│   │       │                          #              Syncs signal description to card title on update
│   │       │                          #              Dynamic button text: "Создать"/"Сохранить"/"Закрыть"
│   │       │                          #    Uses: SignalForm component, Material-UI Dialog
│   │       │                          #    Props: Controlled by signalModalStore (isOpen, boardId, signalId, mode)
│   │       │
│   │       ├── SignalForm.tsx         # ⭐ Reusable form component for signal settings
│   │       │                          #    Modes: 'create', 'edit', 'view' (passed as prop)
│   │       │                          #    Fields: Show toast notification toggle, webhook URL with copy button,
│   │       │                          #            description input (200 char limit with counter)
│   │       │                          #    Edit/View mode: Displays signal history list (up to 1000 records)
│   │       │                          #                   Format: timestamp, ticker icon (if available), payload text
│   │       │                          #    Disabled inputs in view mode
│   │       │                          #    Uses: TickerIcon, formatSignalTime, useCopyToClipboard
│   │       │
│   │       ├── SignalDropdown.tsx     # ⭐ Compact dropdown for profile menu (based on Figma design)
│   │       │                          #    Features: Toggle header controls content visibility (not disabled)
│   │       │                          #              TradingView link (always visible)
│   │       │                          #              Webhook list with SignalWebhookRow items
│   │       │                          #              "Create more" button (visible when toggle active)
│   │       │                          #    Toggle behavior: Controls visibility of webhook list & create button
│   │       │                          #                     Activates/deactivates ALL webhooks on toggle
│   │       │                          #                     Syncs with webhook active state automatically
│   │       │                          #    Design: White bg, rounded-[24px], shadow, purple accents
│   │       │                          #    Uses: useSignalToggle hook, SignalWebhookRow component
│   │       │                          #    Used by: ProfileMenuDropdown
│   │       │
│   │       └── SignalWebhookRow.tsx   # ⭐ Single webhook row in signal list
│   │                                  #    Displays: Webhook URL (truncated), description tooltip, copy button
│   │                                  #    Interactions: Click row opens SignalModal in edit mode
│   │                                  #                 Hover effect, keyboard navigation (Enter/Space)
│   │                                  #    Props: webhook, onCopy, onClick
│   │                                  #    Visual: Active webhooks - dark text, inactive - gray text
│   │                                  #    Used by: SignalDropdown
│   │
│   ├── 🎯 strategies-catalog/         # Strategies catalog feature module
│   │   │
│   │   ├── components/                # Strategy catalog-specific React components
│   │   │   ├── AiStrategyBlock.tsx    # ⭐ AI strategy selection landing block
│   │   │   │                          #    Features: Hero section with card stack illustration, AI bot badge
│   │   │   │                          #              "Подобрать с ИИ" button opens chat sidebar
│   │   │   │                          #              Catalog badge, title, description, CTA button
│   │   │   │                          #    Uses: Image, Bot/WandSparkles icons, CatalogIcon, Icon component
│   │   │   │                          #          useChatStore.openSidebar(), useTranslation
│   │   │   │                          #    Layout: Centered full-screen min-h-screen, max-w-[400px]
│   │   │   │                          #    Design: Gradient avatar (#8f69fc→#4e39ff), purple accents
│   │   │   │                          #    Used by: strategies-catalog page (default view)
│   │   │   ├── ConnectStrategyModal.tsx # Modal for connecting strategy to board
│   │   │   │                          #    Features: Strategy connection workflow
│   │   │   │                          #    Used by: StrategyDetailConnectCard
│   │   │   ├── StrategiesFilter.tsx   # Individual filter component for strategies
│   │   │   ├── StrategiesFilters.tsx  # Multiple filters container for strategies list
│   │   │   │                          #    Features: Filter chips, clear filters functionality
│   │   │   │                          #    Used by: StrategiesList
│   │   │   ├── StrategiesList.tsx     # Strategies list container with filtering/search
│   │   │   │                          #    Features: Displays filtered strategies based on search/filters
│   │   │   │                          #    Uses: StrategyCard, StrategiesFilters, StrategiesSearch
│   │   │   │                          #    Props: strategiesIds (from URL query params)
│   │   │   │                          #    Used by: StrategiesCatalogPage
│   │   │   ├── StrategiesSearch.tsx   # Search input for strategies
│   │   │   │                          #    Features: Debounced search, clear button
│   │   │   │                          #    Used by: StrategiesList
│   │   │   ├── StrategiesSelector.tsx # Strategy selector dropdown
│   │   │   │                          #    Features: Dropdown with strategy options
│   │   │   │                          #    Used by: StrategiesTabs
│   │   │   ├── StrategiesTabs.tsx     # Tab navigation for strategies (Current | Archived)
│   │   │   │                          #    Features: Segmented control with Save button
│   │   │   │                          #    Props: activeTab, onTabChange, onSaveClick
│   │   │   │                          #    Uses: StrategiesSelector
│   │   │   │                          #    Used by: StrategiesCatalogPage
│   │   │   ├── StrategyCard.tsx       # ⭐ Strategy card with detailed stats and schedule
│   │   │   │                          #    Features: Strategy preview, performance metrics, schedule info
│   │   │   │                          #              Expandable details, connect button
│   │   │   │                          #    Sub-components: StrategyCardHeader, StrategyCardStats,
│   │   │   │                          #                    StrategyCardSchedule, StrategyCardDetails
│   │   │   │                          #    Uses: StrategyDetailCardStat, TickerIcon, Icon components,
│   │   │   │                          #          getStrategyCardRiskLabel (utils/strategyCardRiskLabel)
│   │   │   │                          #    Design: Rounded corners, gradient accents, stat grid
│   │   │   │                          #    Used by: StrategiesList
│   │   │   ├── StrategySummaryCard.tsx # Компактная карточка: заголовок, доходность, риск (Zap), автор
│   │   │   │                          #    Props: density compact|comfortable, footerTrailing, as div|button
│   │   │   │                          #    Used by: BoundStrategiesList, MockComonPage, StrategyBindingCallback
│   │   │   ├── StrategyDetailBackToCatalog.tsx # Back navigation button for strategy detail
│   │   │   │                          #    Features: Returns to catalog view, clears URL params
│   │   │   │                          #    Used by: StrategyDetailHeader
│   │   │   ├── StrategyDetailCardStat.tsx # Single stat display for strategy card
│   │   │   │                          #    Features: Label + value with optional trend indicator
│   │   │   │                          #    Used by: StrategyCard, StrategyDetailHeader
│   │   │   ├── StrategyDetailConnectCard.tsx # Connect strategy card CTA
│   │   │   │                          #    Features: Connect button, opens ConnectStrategyModal
│   │   │   │                          #    Used by: Strategy detail view
│   │   │   ├── StrategyDetailHeader.tsx # Strategy detail page header
│   │   │   │                          #    Features: Strategy badge, created date, action icons (addBoard/heartPlus/close),
│   │   │   │                          #              title as bold heading
│   │   │   │                          #    Uses: useTranslation, Icon, IconButton, HeartPlus (lucide-react)
│   │   │   │                          #    Used by: StrategiesCatalogDetailPage
│   │   │   ├── StrategyDetailKeyMetrics.tsx # Sidebar card with key strategy metrics
│   │   │   │                          #    Features: Profitability %, risk level with color, min amount,
│   │   │   │                          #              max drawdown, subscribers count
│   │   │   │                          #    Risk colors: aggressive=status-negative, conservative=status-success,
│   │   │   │                          #                 moderate=status-warning
│   │   │   │                          #    Uses: useTranslation, Zap icon
│   │   │   │                          #    Used by: StrategyDetailSidebar
│   │   │   ├── StrategyDetailInfo.tsx  # Sidebar card with additional strategy info
│   │   │   │                          #    Features: Created date, follow accuracy, trade frequency,
│   │   │   │                          #              TAI (trade activity index), capacity
│   │   │   │                          #    Uses: useTranslation
│   │   │   │                          #    Used by: StrategyDetailSidebar
│   │   │   ├── StrategyDetailSchedule.tsx # ⭐ Strategy performance chart with period tabs
│   │   │   │                          #    Features: Recharts AreaChart, period tabs (All/Year/Month),
│   │   │   │                          #              portfolio overlay toggle, custom tooltip,
│   │   │   │                          #              locale-aware month names via Intl.DateTimeFormat
│   │   │   │                          #    Uses: useTranslation, Recharts, Tabs, Switch components
│   │   │   │                          #    Used by: StrategiesCatalogDetailPage (main content)
│   │   │   ├── StrategyDetailSidebar.tsx # ⭐ Right column sidebar container
│   │   │   │                          #    Features: Key metrics, connect button, author avatar
│   │   │   │                          #              (with broken image fallback), subscribers count,
│   │   │   │                          #              strategy info, composition breakdown
│   │   │   │                          #    Uses: StrategyDetailKeyMetrics, StrategyDetailInfo,
│   │   │   │                          #           StrategyDetailComposition, Button, Icon, useTranslation
│   │   │   │                          #    Props: strategyData (TradingStrategyDto), onConnectClick, className
│   │   │   │                          #    Used by: StrategiesCatalogDetailPage
│   │   │   ├── StrategyDetailDescription.tsx # Strategy text description block
│   │   │   │                          #    Features: Expandable text with "More"/"Collapse" toggle
│   │   │   │                          #    Used by: StrategiesCatalogDetailPage (main content)
│   │   │   ├── StrategyDetailComposition.tsx # Strategy composition breakdown
│   │   │   │                          #    Features: Asset/Sector tabs, stacked color bar, legend list
│   │   │   │                          #    Uses: useTranslation, Tabs component
│   │   │   │                          #    Used by: StrategyDetailSidebar
│   │   │   ├── StrategyDetailAiAnalysis.tsx # AI analysis summary card
│   │   │   │                          #    Features: Sparkles icon, AI text summary, directional tags
│   │   │   │                          #    Uses: useTranslation, lucide-react icons
│   │   │   │                          #    Used by: StrategiesCatalogDetailPage (main content)
│   │   │   ├── StrategyDetailConnectionConditions.tsx # Connection requirements section
│   │   │   │                          #    Features: Qualification, investment profile, risk category,
│   │   │   │                          #              required tests (two-column grid layout)
│   │   │   │                          #    Uses: useTranslation, ClientRiskCategory enum
│   │   │   │                          #    Used by: StrategiesCatalogDetailPage (main content)
│   │   │   ├── StrategyDetailTariffs.tsx # Auto-follow tariff cards
│   │   │   │                          #    Features: 3-column tariff grid, commission notice with info icon
│   │   │   │                          #    Uses: useTranslation
│   │   │   │                          #    Used by: StrategiesCatalogDetailPage (main content)
│   │   │   └── CardStackIllustration.tsx # SVG card stack illustration for AI block
│   │   │                              #    Used by: AiStrategyBlock
│   │   │
│   │   ├── utils/
│   │   │   ├── strategyCardRiskLabel.ts # getStrategyCardRiskLabel: catalog card risk labels (strategiesCatalog.card i18n keys)
│   │   │   │                              #    Used by: StrategyCard, StrategySummaryCard, SurveyStrategyCard
│   │   │   ├── strategyCardRiskStyles.ts # getStrategyCardRiskTextClass (catalog), getSurveyStrategyCardRiskTextClass (semantic status)
│   │   │   │                              #    Used by: StrategySummaryCard, SurveyStrategyCard
│   │   │   └── strategyProfitPercentDisplay.ts # formatSignedProfitPercent, getProfitPercentColorClass (signed %, P/L colors)
│   │   │                                  #    Used by: StrategyCard, StrategySummaryCard, SurveyStrategyCard
│   │   │
│   │   ├── mock/                      # Mock strategy data for development
│   │   │   ├── strategiesMock.ts      # Mock strategies catalog data
│   │   │   │                          #    Exports: STRATEGIES_MOCK array
│   │   │   └── strategyDetail.tsx     # Mock data for strategy detail page
│   │   │                              #    Exports: PeriodTab type, mock chart/composition data
│   │   │
│   │   ├── queries.ts                 # ⭐ TanStack Query hooks for strategies catalog API
│   │   │                              #    Exports: useGetStrategyCatalogById (strategy by ID)
│   │   │                              #             useGetProfitPoints (profit points for strategy)
│   │   │                              #    Query keys: ['strategyCatalog', id], ['profitPoints', id]
│   │   │                              #    staleTime: 30 seconds (1000 * 30)
│   │   │                              #    Used by: StrategyCard, StrategyDetail*
│   │   │
│   │   └── index.ts                   # Barrel export for strategies-catalog feature
│   │
│   ├── 🔐 auth/                       # Authentication feature
│   │   │
│   │   ├── queries.ts                 # ⭐ TanStack Query hooks for auth API
│   │   │                              #    Exports: useLoginMutation, useRegisterMutation (with privacy params),
│   │   │                              #             useLogoutMutation, authQueryKeys (query key factory)
│   │   │                              #    useRegisterMutation accepts: email, password, first_name, last_name,
│   │   │                              #                                  accepted_privacy_policy, accepted_marketing
│   │   │                              #    Used by: RegisterForm.tsx, AuthModal.tsx
│   │   │
│   │   └── components/
│   │       ├── AuthGuard.tsx          # ⭐ Route protection component
│   │       │                          #    Redirects to /login if not authenticated; mounts YmActiveSessionTracker
│   │       ├── YmActiveSessionTracker.tsx  # Yandex Metrika `active` goal once per tab session (auth + profile loaded)
│   │       ├── AuthModal.tsx          # ⭐ Unified auth (login/register) with SegmentedControl tab switcher
│   │       │                          #    Used by: WelcomeLayout, app/(guest)/login, app/(guest)/register
│   │       ├── LoginForm.tsx          # Login form (email + password)
│   │       ├── RegisterForm.tsx       # Registration form — RU: shows consent checkboxes; US: auto-accepts
│   │       ├── DevLoginPanel.tsx      # Dev-only quick login panel
│   │       ├── PasswordValidationPanel.tsx  # Real-time password strength display
│   │       ├── ForgotPassword.tsx     # Password reset request
│   │       ├── ResetPassword.tsx      # Password reset form
│   │       ├── OAuthCallback.tsx      # OAuth redirect handler
│   │       ├── WelcomeAuthModal.tsx   # Auth modal shown on the welcome/landing page
│   │
│   ├── 🔒 privacy-policy/             # Privacy policy feature
│   │   ├── PrivacyPolicyPage.tsx      # ⭐ Privacy policy page component
│   │   │                              #    Fetches from GET /api/privacy-policy, renders via LegalDocContent
│   │   │                              #    Route: /privacy-policy (guest layout, no auth required)
│   │   └── index.ts                   # Module exports
│   │
│   ├── 📄 legal/                      # Shared legal documents infrastructure
│   │   ├── legalDocUtils.ts           # Shared utilities and single source of truth for legal docs
│   │   │                              #    LEGAL_DOCS_META — list of all 4 docs (key, apiPath, guestPath, appPath, labelKey)
│   │   │                              #    isSubtitle() — detects numbered/short-heading paragraphs
│   │   │                              #    isBulletItem() — detects list items ending with ";"
│   │   │                              #    splitContent() — splits raw text into title + paragraphs
│   │   ├── LegalDocsLayout.tsx        # Two-column layout: sidebar + main content (guest zone)
│   │   ├── LegalDocsSidebar.tsx       # Navigation sidebar for guest legal pages
│   │   │                              #    Links from LEGAL_DOCS_META.guestPath, labels via i18n profile namespace
│   │   │                              #    Active link highlighted via usePathname
│   │   └── LegalDocContent.tsx        # Shared content renderer (title / subtitle / bullet / body)
│   │                                  #    Tailwind design tokens: text-blackinverse-a100/56, text-18/14
│   │
│   └── 🏦 broker/                     # Broker integration feature
│       │
│       ├── components/
│       │   ├── BrokerSelectionWizard.tsx  # ⭐ Multi-step broker connection wizard (2 steps)
│       │   │                              #    Step 1: Select broker → Step 2: Enter token / OAuth + sync
│       │   │                              #    Manages wizard state, navigation, and connection flow
│       │   │                              #    Props: onClose, onCanCloseChange (controls modal close behavior)
│       │   │                              #    On submit: validates token, sets sync depth, triggers sync, closes
│       │   ├── WizardTwoPanelLayout.tsx   # Shared two-panel layout for all wizard steps
│       │   │                              #    Left: content panel (flex-1), Right: promo panel (440px)
│       │   │                              #    Includes progress bar, back/close buttons
│       │   ├── WizardProgressBar.tsx      # "Шаги X / 3" segmented progress indicator
│       │   ├── AccordionSection.tsx       # Expandable section with framer-motion animation
│       │   ├── SelectBrokerStep.tsx       # Step 1: Select broker with two-panel layout
│       │   │                              #    Broker list with search, "Подключить →" buttons
│       │   ├── EnterTokenStep.tsx         # Step 2: Token input with two-panel layout
│       │   │                              #    Sync depth dropdown, token fields, error states
│       │   │                              #    Accordion: "Как это сделать", "Я не клиент"
│       │   │                              #    Token info popover, instruction wizard overlay
│       │   ├── PortalConnectStep.tsx      # Step 2 (OAuth): SnapTrade portal flow
│       │   │                              #    Two-panel layout, sync depth dropdown
│       │   ├── SyncDepthDropdown.tsx      # Dropdown for sync depth (1-10 years)
│       │   ├── TokenInfoPopover.tsx       # "Что такое API токен" popover with explanation
│       │   ├── TokenInstructionWizard.tsx # Fullscreen token creation guide (2-part wizard)
│       │
│       ├── hooks/
│       │   └── useBrokerWizard.ts         # Wizard; YM broker_* + portfolio_created per POST /portfolio/wizard `created[]`
│       ├── utils/
│       │   └── ymBrokerName.ts          # mapBrokerCodeToYmBrokerName for YM broker_name (Finam | ByBit | KuCoin | none)
│       │
│       ├── queries.ts                     # TanStack Query hooks for broker API
│       │                                  #    Exports: useBrokerConnectionsQuery
│       │                                  #             useCreateBrokerConnectionMutation
│       │                                  #             useUpdateBrokerConnectionMutation
│       │                                  #             useDeleteConnectionMutation
│       │                                  #    Returns: BrokerConnectionWithAccountsResponse
│       │
│       └── constants.ts                   # Broker-related constants
│                                          #    Exports: AVAILABLE_BROKERS with credential fields
│                                          #             Token manual instructions per broker
│
│   └── 👋 welcome/                        # Welcome/landing page + demo scene for unauthenticated users
│       │
│       ├── components/
│       │   ├── WelcomeForm.tsx            # ⭐ Welcome form with centered question input
│       │   │                             #    Props: sparklyId (string), onSubmit (callback)
│       │   │                             #    Structure: animated ball, title, subtitle, textarea + submit button
│       │   │                             #    State: question (string)
│       │   │                             #      Pure presentation component — no routing or auth logic
│       │   │
│       │   ├── DemoScene.tsx             # ⭐ Demo scene orchestrator (app-like layout for unauthenticated users)
│       │   │                             #    Layout: Sidebar (mode="demo") | DemoChat | DemoBoard (flex row)
│       │   │                             #    State: isChatOpen (boolean, default true)
│       │   │                             #    Redirects to / if authenticated (clears demo localStorage)
│       │   │                             #    Reuses main Sidebar component with mode="demo" prop
│       │   │
│       │   ├── DemoBoard.tsx             # Static React Flow board with one empty note card
│       │   │                             #    Uses ReactFlow directly with NODE_TYPES from board/constants
│       │   │                             #    Single hardcoded CardNode, no interactivity (drag/create/delete disabled)
│       │   │
│       │   ├── DemoChat.tsx              # ⭐ Demo chat panel with AI streaming
│       │   │                             #    Animated slide-in panel (motion.div, 450px width)
│       │   │                             #    Reuses ChatWindow (minimal mode) from chat feature
│       │   │                             #    State managed by useDemoChatStore (Zustand persist)
│       │   │                             #    Uses publicChatApi with AbortController for streaming
│       │   │                             #    3 message limit → shows auth notice banner
│       │   │                             #    Saves SEED_CHAT_PAYLOAD for post-auth chat restoration
│       │   │
│       │   └── ChatForm.tsx              # Welcome page chat input form
│       │
│       ├── constants.ts                  # ⭐ Welcome chat configuration
│       │                                 #    WELCOME_CHAT_CONFIG:
│       │                                 #      - MAX_USER_MESSAGES: 3 (configurable limit)
│       │                                 #      - MAX_TOKENS: 1500 (AI response limit)
│       │                                 #      - MODEL: 'litellm/gpt-5-mini' (preselected model)
│       │                                 #    WELCOME_STORAGE_KEYS: localStorage key names
│       │                                 #      - PENDING_MESSAGE, SEED_CHAT_PAYLOAD, DEMO_SPARKLE_CONTEXT
│       │                                 #    WELCOME_SIGNUP_PROMPT: signup prompt message
│       │                                 #    WELCOME_AFTER_SAVE_TEXT: post-auth greeting
│       │
│       ├── styles/                       # CSS modules (mobile-first)
│       │   ├── Welcome.module.css
│       │
│       ├── mocks/sparklies.ts            # @deprecated - sparkles are now fetched from API
│       ├── types.ts                      # WelcomeMessage, Sparkly types (re-exports WidgetType from chat)
│       └── index.ts                      # Barrel export
│
├── 🧩 components/                     # Shared/reusable components
│   ├── Checkbox.tsx                   # ⭐ Custom checkbox component (no MUI)
│   │                                  #    Props: checked, onChange, label, description, error, disabled, indeterminate, size, variant, className
│   │                                  #    Variants: accent (default), mono
│   │                                  #    Sizes: sm (16×16px), md (20×20px, default), lg (24×24px)
│   │                                  #    Features: keyboard navigation (Space/Enter), ARIA support, hover/pressed states
│   │                                  #    States: off, on (checked), indeterminate (mixed), error, disabled
│   │                                  #    Used by: RegisterForm (RU region consent checkboxes)
│   ├── RadioButton.tsx                # ⭐ Custom radio button component (no MUI)
│   │                                  #    Props: checked, onChange, error, disabled, size, variant, className, aria-label
│   │                                  #    Sizes: sm (16×16px), md (20×20px, default), lg (24×24px)
│   │                                  #    Variants: accent (default), mono
│   │                                  #    Features: keyboard navigation (Space/Enter), ARIA support, hover/pressed states
│   │                                  #    States: unchecked, checked, error, disabled
│   ├── Sidebar/                       # ⭐ Main navigation sidebar (decomposed into focused components)
│   │   ├── index.ts                   #    Barrel re-export (preserves @/components/Sidebar import path)
│   │   ├── Sidebar.tsx                #    Orchestrator: composes all sub-components, manages layout
│   │   ├── SidebarContext.tsx          #    React context: isDemo, isCollapsed, hoveredItem shared state
│   │   ├── SidebarLogo.tsx            #    Logo button with collapse/expand toggle, region-aware
│   │   ├── SidebarNavSection.tsx       #    Navigation items + expandable submenus (uses SidebarNavGroup)
│   │   ├── SidebarBottomActions.tsx    #    Language switcher, Explore toggle, AI Chat toggle
│   │   ├── SidebarProfile.tsx          #    Profile avatar + ProfileDropdown
│   │   ├── SidebarDemoLogin.tsx        #    Demo mode login button
│   │   ├── SidebarCreateBoardDialog.tsx #   Create board dialog + mutation logic
│   │   ├── useSidebarEffectiveState.ts #    Hook: resolves demo vs store state
│   │   └── useSidebarNavItems.ts       #    Hook: navItems, submenuItemsMap, board queries
│   │                                  #    Modes: Collapsed (48px icons only) / Expanded (200px with text)
│   │                                  #    State: useSidebarStore, useChatStore, useNewsSidebarStore
│   │                                  #    Used by: AppLayout, SettingsLayout, DemoScene
│   │
│   ├── layout/
│   │   ├── GuestLayout.tsx            # Layout for guest pages (auth, login, register)
│   │   │                              #    Minimal layout without navigation
│   │   ├── WelcomeLayout.tsx          # ⭐ Layout for welcome/landing page
│   │   │                              #    Features: Header with logo + auth buttons, footer
│   │   │                              #    Includes: AuthModal, gradient background
│   │   ├── AppLayout.tsx              # ⭐ Layout for main application pages
│   │   │                              #    Structure: Sidebar → NewsSidebar? → ChatManager? → MainContent
│   │   │                              #    Sidebar: Always visible left navigation (64px)
│   │   │                              #    Expandable panels: Explore (news) and AI Chat appear after Sidebar
│   │   │                              #    Panels order: Sidebar | Explore | Chat | Content (left to right)
│   │   │                              #    Container Width: Uses ResizeObserver for responsive measurement
│   │   │                              #    Welcome Flow: Calls useWelcomeFlowHandler for post-auth chat seeding
│   │   │                              #    Panel dimensions: 308px content + 8px margin (from LAYOUT_CONSTANTS)
│   │   │                              #    Includes: Sidebar, NewsSidebar, ChatManager, Modals
│   │   └── SettingsLayout.tsx         # Layout for settings pages (Profile, Account, Security)
│   │                                  #    Structure: Sidebar → MainContent
│   │                                  #    Excludes: Explore panel, Chat panel
│   │                                  #    Uses: Sidebar for navigation consistency
│   │
│   ├── views/                         # Reusable view components
│   │   ├── GridView.tsx               # ⭐ Universal responsive grid view component (react-grid-layout)
│   │   │                              #    Features: flexible column calculation, custom card dimensions
│   │   │                              #             sidebar-aware sizing, responsive max container width
│   │   │                              #             configurable gaps, padding, and card sizes
│   │   │                              #             loading/error states (via LoadingState/ErrorState), maxRows/maxCols support
│   │   │                              #    Column calculation: accounts for padding when using maxContainerWidth
│   │   │                              #                       respects maxCols, responsive to screen width
│   │   │                              #    Props: items, renderCard, title?, cols?, cardWidth?, cardHeight?,
│   │   │                              #           gap?, gridPadding?, maxContainerWidth?, maxCols?,
│   │   │                              #           sidebarAware?, getItemConfig?, onLayoutChange?, maxRows?
│   │   │                              #    Sidebar-aware: uses ResizeObserver for accurate container width
│   │   │                              #    Uses: LoadingState, ErrorState components for state rendering
│   │   │                              #    Used by: MainGridView, IdeasGridView, PortfoliosGridView
│   │   │
│   │   ├── FlowBoardsView.tsx         # ⭐ Universal ReactFlow view for boards/portfolios with responsive layout
│   │   │                              #    Generic component: FlowBoardsView<T extends FlowItem = Board>
│   │   │                              #    Features: ReactFlow canvas with responsive cards, viewport persistence
│   │   │                              #             Multi-row grid layout support (cols prop)
│   │   │                              #             Responsive card sizes (184×168 / 231×200)
│   │   │                              #             Horizontal centering on wide screens (initialOffsetX)
│   │   │                              #             Optional viewport persistence (persistViewport prop)
│   │   │                              #             Customizable create button label and preview image
│   │   │                              #    Props: boards, isLoading, error, onBoardClick, onCreateBoard,
│   │   │                              #           viewportKey, cols?, cardWidth?, cardHeight?,
│   │   │                              #           initialOffsetX?, persistViewport?, createLabel?, previewImage?
│   │   │                              #    Layout modes: Single-row (cols undefined), Multi-row grid (cols specified)
│   │   │                              #    Used by: MainPage (main-flow-viewport), IdeasPage (ideas-flow-viewport),
│   │   │                              #             PortfoliosPage (portfolios-flow-viewport)
│   │   │                              #    Viewport: Saved to localStorage per viewportKey (optional)
│   │   │                              #    Uses: useViewportPersistence, LAYOUT_CONSTANTS, getPageTopPadding
│   │   │
│   │   ├── FlowBoardsView.css         # Styles for FlowBoardsView ReactFlow nodes
│   │   │                              #    Uses display: contents to prevent layout interference
│   │   │                              #    Removes default ReactFlow styling, hides handles
│   │   │
│   │   └── nodes/                     # ReactFlow node components
│   │       └── BoardFlowNode.tsx      # ⭐ Responsive board/portfolio cards for Flow view
│   │                                  #    Responsive dimensions: 184×168px (<2560px), 231×200px (≥2560px)
│   │                                  #    BoardNode: Fixed 111px preview + info block, border radius 16px
│   │                                  #                formatBoardDate from utils/timeUtils, hover effects
│   │                                  #                previewImage prop (default: board-preview.png)
│   │                                  #                cardWidth/cardHeight props for dynamic sizing
│   │                                  #    CreateBoardNode: "Создать доску" button with screen-plus icon
│   │                                  #                     Fixed 111px height to match preview
│   │                                  #                     createLabel prop (default: 'Создать доску')
│   │                                  #                     cardWidth/cardHeight props for dynamic sizing
│   │                                  #    Styling: Matches Grid cards 1:1, uses LAYOUT_CONSTANTS
│   │                                  #    Used by: FlowBoardsView
│   │
│   ├── ui/                            # ⚠️ MOVED to shared/ui/ — see shared/ section above
│   │   ├── Button/                    # ⭐ Universal button component from Figma Design System
│   │   │   ├── index.ts               #    Main export
│   │   │   ├── Button.tsx             #    Component (Tailwind CSS only, no separate CSS file)
│   │   │   └── Button.types.ts        #    TypeScript types and size configuration
│   │   │                              #
│   │   │                              #    Figma node: 55087:5325
│   │   │                              #    Sizes: xl (56px), lg (48px), md (40px), sm (32px), xs (24px)
│   │   │                              #    Variants: accent, primary, negative, secondary, ghost
│   │   │                              #    Icon side: left, right (controlled size from design system)
│   │   │                              #    States: loading, disabled (hovered/pressed via CSS)
│   │   │                              #    Loading: MUI CircularProgress, preserves button width
│   │   │                              #    Accessibility: aria-label for icon-only, aria-busy for loading
│   │   │                              #    Blur tokens: backdrop-blur-medium (accent/primary/negative/ghost), backdrop-blur-extra (secondary)
│   │   │                              #    Focus ring: mind-accent for all variants, status-negative for negative variant
│   │   │                              #    All sizes/gaps/padding use spacing tokens (e.g. py-spacing-10 px-spacing-14)
│   │   ├── AnswerOptionButton.tsx     # Universal answer option button (pill style with + icon)
│   │   │                              #    Used in welcome-flow ("Да, мне все понятно") and survey questions
│   │   │                              #    Props: children, onClick, disabled, selected, showIcon, className
│   │   ├── Avatar.tsx                 # Circular user avatar with image or initials placeholder (Figma node: 55086:5323)
│   │   │                              #    Sizes: XL (104px), L (72px), M (48px), S (32px)
│   │   │                              #    Modes: image (src prop) with error fallback, initials placeholder (gradient bg)
│   │   │                              #    Gradient uses from-blackinverse-a4 to-blackinverse-a12 tokens
│   │   │                              #    Exports: Avatar, AvatarSize, AvatarProps
│   │   ├── Logo/                      # Brand logo components (Figma node: 55322:11931)
│   │   │   ├── LimexLogo.tsx          #    LIMEX logo — theme-aware, isCollapsed for mini/full
│   │   │   ├── FinamXLogo.tsx         #    FINAM X logo — theme-aware, isCollapsed for mini/full
│   │   │   ├── Logo.tsx               #    Unified region-aware wrapper (lime→LimexLogo, finam→FinamXLogo)
│   │   │   ├── Logo.types.ts          #    LogoProps: { isCollapsed?, className? }
│   │   │   ├── Logo.stories.tsx       #    AllVariants grid (full × collapsed), per-component stories
│   │   │   └── index.ts               #    Exports: Logo, LimexLogo, FinamXLogo, LogoProps
│   │   │                              #
│   │   │                              #    isCollapsed=false → full logo 92×24px; true → icon-only 28×24px
│   │   │                              #    Theme transitions: fill via var(--texticon-black_inverse_a100) + var(--brand-primary)
│   │   │                              #    Smooth: transition-[fill] duration-200 on each SVG path
│   │   │                              #    Used by: SidebarLogo (replaces former Sidebar/logos/* + LOGOS map)
│   │   ├── CountryFlag/               # Round country flag icons (Figma node: 60367:40355)
│   │   │   ├── CountryFlag.tsx        #    Lazy-loaded multicolor SVG flags (same pattern as Icon)
│   │   │   │                          #    263 country flags, sizes: 16 | 20 | 24 | 32
│   │   │   │                          #    Separate from Icon — multicolor, no currentColor support
│   │   │   ├── CountryFlag.types.ts   #    CountryFlagVariant (263 countries), CountryFlagSize, CountryFlagProps
│   │   │   ├── countryFlagMap.ts      #    Dynamic import loaders + module-level cache
│   │   │   ├── CountryFlag.stories.tsx #   Gallery with search, AllSizes
│   │   │   ├── flags/                 #    263 SVG files (camelCase naming)
│   │   │   └── index.ts              #    Barrel exports
│   │   ├── IconButton.tsx             # Icon-only button with badge support (Figma node: 55600:9214)
│   │   │                              #    Sizes: 16 | 20 | 24 (Figma) + 32 | 40 (app extensions). Default: 24
│   │   │                              #    Variants: default (blackinverse-a56), negative (status-negative)
│   │   │                              #    Badges: counter (uses Counter component), dot (mind-accent)
│   │   │                              #    States: CSS hover/active/disabled (+ explicit `state` prop for Storybook)
│   │   │                              #    Exports: IconButton, IconButtonProps, IconButtonSize, IconButtonVariant
│   │   ├── ControlsPanel.tsx          # Horizontal toolbar: ghost buttons, icon buttons, dividers (Figma node: 59114:3689)
│   │   │                              #    Items: ControlsItem[] = 'divider' | ButtonProps+dropdown | IconButtonProps+dropdown
│   │   │                              #    Discriminator: has children → Button (ghost/sm default); no children → IconButton
│   │   │                              #    Dropdown: if item.dropdown provided — wraps trigger in Dropdown component
│   │   │                              #    Exports: ControlsPanel, ControlsPanelProps, ControlsItem, ControlsButtonItem, ControlsIconButtonItem
│   │   ├── SparklineChart/            # Recharts sparkline chart 120×32px (Figma node: 61083:3942)
│   │   │   ├── index.ts               #    Re-exports SparklineChart, SparklineChartProps, SparklineChartVariant
│   │   │   ├── SparklineChart.tsx     #    Main component — recharts AreaChart with open-price ReferenceLine
│   │   │   ├── SparklineChart.types.ts #   SparklineChartProps, SparklineChartVariant, SkeletonChartProps
│   │   │   ├── SkeletonChart.tsx      #    SVG skeleton waveform (25-point polyline from Figma node 61083:3991)
│   │   │   └── SparklineChart.stories.tsx # Storybook: Default, Negative, Skeleton, AllVariants, FigmaStates
│   │   │                              #    Props: data?, variant?, showOpenLine?, fadeLeft?, width?, height?
│   │   │                              #    Variants: positive (success), negative (error), skeleton
│   │   │                              #    fadeLeft: CSS mask-image left-edge fade (default: false)
│   │   ├── LinkPreviewCard/           # OG link preview card (Figma node: 2644:126004)
│   │   │   ├── LinkPreviewCard.tsx    # Main component — OG image + domain + title + description + arrow
│   │   │   │                          #    Props: url (string), className?
│   │   │   │                          #    States: loading (skeleton), loaded (full preview), fallback (favicon/initial)
│   │   │   │                          #    Uses: useLinkPreview hook → /api/link-preview
│   │   │   │                          #    Integrated into: MarkdownRenderer (bare-URL paragraphs), NoteModalContent
│   │   │   └── index.ts
│   │   ├── ProgressBar.tsx            # Progress bar with animated fill + optional header row (Figma node: 61238:46202)
│   │   │                              #    Props: current, total, title, label?, sublabel?, description?, className?
│   │   │                              #    Header (tariffBar variant): label+sublabel on left, description on right
│   │   │                              #    Bar fill animates on mount via CSS transition-[width] duration-500
│   │   │                              #    Exports: ProgressBar, ProgressBarProps
│   │   ├── Counter.tsx                # Counter badge/pill component (Figma node: 55586:4551)
│   │   │                              #    Sizes: XL (20px), L (16px), M (14px), S (12px)
│   │   │                              #    Variants: accent, primary, secondary, white
│   │   │                              #    M/S use text-[9px] (no token) + leading-12 token
│   │   │                              #    Exports: Counter, CounterSize, CounterVariant, CounterProps
│   │   ├── BaseImage.tsx               # Reusable image component with fade-in, placeholder, fallback, next/image
│   │   │                              #    Features: fade-in (300ms), skeleton/custom placeholder, error fallback,
│   │   │                              #              optional next/image optimization (optimized prop)
│   │   │                              #    Status: 'loading' → 'loaded' | 'error'
│   │   │                              #    Used by: Avatar, Input. Exports: BaseImage, BaseImageProps, BaseImageStatus
│   │   ├── Input.tsx                  # Reusable input component with Figma Design System (TD-596, TD-694)
│   │   │                              #    Sizes: sm (32px), md (40px) - removed 'lg'
│   │   │                              #    States: Enabled, Hovered, Focused, Entered, Error (14 total variants)
│   │   │                              #    Design: 2px border-radius, 2px border, padding 8px/12px (md), 6px/8px (sm)
│   │   │                              #    Features: label, hint text, error state, left/right icons (supports clickable right icon controls), disabled state
│   │   ├── TextArea.tsx               # Multi-line text input from Figma Design System (Figma node: 55088:5328)
│   │   │                              #    States: Default, Hovered, Focused, Entered, Error, Error Focused, Disabled
│   │   │                              #    Features: label, hint text, error state, character counter (maxLength), disabled state
│   │   │                              #    Design: 2px border-radius, padding 10px/12px, 2px focus line (brand/error)
│   │   ├── Container.tsx              # Container wrapper component
│   │   ├── Modal/                    # ⭐ Composable modal system
│   │   │   ├── Modal.tsx             #    Root modal with portal, AnimatePresence exit animations, ESC via module-level registry (not DOM queries)
│   │   │   ├── ModalFrame.tsx        #    Layout: overlay, expand/collapse state, editor lifecycle, provides ModalContext
│   │   │   ├── ModalContext.tsx      #    React context for ModalFrame → ModalControls (avoids props drilling)
│   │   │   ├── ModalControls.tsx     #    Toolbar: expand/close buttons, AI button, EditorToolbar (reads from ModalContext)
│   │   │   ├── ModalEditorSetup.tsx  #    Creates TipTap editor (only mounted when editorConfig provided)
│   │   │   ├── ModalBody.tsx         #    Scrollable body with padding variants (pure layout wrapper)
│   │   │   ├── ModalFooter.tsx       #    Footer with align variants (left/center/right/between)
│   │   │   │                         #    leftContent prop: renders content on left side (children stay right via ml-auto)
│   │   │   ├── ModalHeader.tsx       #    Header wrapper
│   │   │   ├── ModalTitle.tsx        #    Semantic h2 title
│   │   │   ├── EditorToolbar.tsx     #    TipTap formatting toolbar (Bold, Italic, Strike, Underline, Link, lists)
│   │   │   ├── ModalEditableTitle.tsx #   Overlay editable title above modal
│   │   │   ├── useModalEditor.ts     #    Hook for TipTap editor creation (only called from ModalEditorSetup)
│   │   │   ├── types.ts              #    TypeScript interfaces
│   │   │   └── index.ts              #    Barrel exports
│   │   ├── Tabs.tsx                  # Universal tabs component with horizontal scroll
│   │   ├── Table.tsx                 # Universal table component with sortable columns, custom cells, and row actions
│   │   │                             #    Supports: hover state tracking, action buttons on hover
│   │   │                             #    Optional Features:
│   │   │                             #    - Virtual scrolling with @tanstack/react-virtual for performance
│   │   │                             #    - Infinite scroll support with callback (onScrollEnd)
│   │   │                             #    - Customizable row padding and container height
│   │   │                             #    - Expandable rows (controlled via parent state)
│   │   │                             #    - isSubTable prop for nested tables (removes horizontal padding)
│   │   │                             #    - onRowClick with MouseEvent for context menu positioning
│   │   │                             #    Used by: PositionsTable, TradesTable
│   │   │                             #             TickerPickerModal, NewsTab, FundamentalTab, TechAnalysisTab
│   │   ├── DataTable/                # ⭐ Generic data table from Figma Design System
│   │   │   ├── DataTable.tsx         #    Generic <T> component with ColumnDef, selectedKeys, expandable rows
│   │   │   │                         #    Figma node: 61072:40811
│   │   │   │                         #    Props: columns, rows, getRowKey, onRowClick, selectedKeys, hoverAction,
│   │   │   │                         #           renderExpandedRows, isLoading, isEmpty, loadingFallback, emptyFallback, header
│   │   │   │                         #    Row states: hover (blackinverse-a2), selected (brand-bg)
│   │   │   │                         #    Used by: PositionsPortfolioTable
│   │   │   ├── cells/                #    Reusable cell components for DataTable
│   │   │   │   ├── TableCellTicker   #    Ticker cell: chevron + logo + ticker name + extra badge
│   │   │   │   ├── TableCellString   #    Text cell with optional secondary line
│   │   │   │   ├── TableCellNumbers  #    Numeric cell with trend coloring and optional caret
│   │   │   │   ├── TableCellNA       #    "—" placeholder cell
│   │   │   │   ├── TableCellChart    #    Mini sparkline SVG chart
│   │   │   │   ├── TableCellButton   #    Inline action button cell
│   │   │   │   └── TableCellSkeleton #    Skeleton loading placeholder (symbol/string/number variants)
│   │   │   ├── primitives/           #    Low-level building blocks
│   │   │   │   ├── TrendCaret        #    ▲ green / ▼ red directional caret
│   │   │   │   └── CloseOpenRow      #    Chevron toggle for expanding/collapsing rows
│   │   │   ├── DataTable.stories.tsx         #    Basic functional stories
│   │   │   └── DataTableDocs.stories.tsx     #    Design System documentation (mirrors Figma page)
│   │   ├── Tag.tsx                   # ⭐ Tag component for displaying card tags (ticker, link, ai-response)
│   │   │                             #    Figma: https://www.figma.com/design/DjwUE4wL1Jd0CH3vTPPebE/%E2%9C%8F%EF%B8%8F-Diary?node-id=3092-638293&m=dev
│   │   │                             #    Supports three tag types with different visual styles:
│   │   │                             #    - ticker: Chart icon + symbol (gray background)
│   │   │                             #    - ai-response: Sparkle icon + text (purple background)
│   │   │                             #    - link: Link icon + text (gray background, clickable)
│   │   │                             #    Uses MUI icons: TrendingUp, AutoAwesome, Link
│   │   ├── LoadingState.tsx          # ⭐ Universal loading state component
│   │   │                             #    Props: message (default: "Загрузка..."), className, fullHeight (default: true)
│   │   │                             #    Features: Configurable height (h-full or min-h-[200px]), centered text
│   │   │                             #    Used by: GridView, PortfoliosListView
│   │   ├── ErrorState.tsx            # ⭐ Universal error state component
│   │   │                             #    Props: message (default: "Ошибка загрузки"), error, className, fullHeight (default: true)
│   │   │                             #    Features: Displays error message or error.message, configurable height
│   │   │                             #    Used by: GridView, PortfoliosListView
│   │   ├── DebouncedSearch.tsx       # ⭐ Universal debounced search input component
│   │   │                             #    Features: Configurable delay (default 500ms), controlled input
│   │   │                             #             Custom className support, forwarded props
│   │   │                             #    Props: value, onChange, placeholder, delay, className, ...inputProps
│   │   │                             #    Use case: Search filtering without excessive API calls
│   │   │                             #    Used by: features/statistics/components/PositionsTable.tsx
│   │   │
│   │   ├── SegmentedControl/         # ⭐ Segmented control component (Figma node: 2746:41733)
│   │   │   │                         #    Sizes: M (32px), L (40px)
│   │   │   │                         #    Variants: mono, surface, inverse
│   │   │   │                         #    Width: fixed (flex-1 segments) or content (hug)
│   │   │   │                         #    Props: segments (label/value/icon/counter), value, onChange, size, variant, widthType
│   │   │   │                         #    Accessibility: role="tablist", aria-selected, keyboard navigation (arrows, Home, End), focus ring: ring-mind-accent
│   │   │   │                         #    Used by: features/statistics/components/PositionsTableHeader.tsx
│   │   │   │                         #    Files: SegmentedControl.tsx, index.ts
│   │   │   │                         #    Note: SegmentedControlLegacy.tsx (old version) used by AuthModal
│   │   │
│   │   ├── Tooltip.tsx               # Tooltip component (Figma node: 55877:5658)
│   │   │                             #    Variants: default (padded card), compact (small pill)
│   │   │                             #    Positions: top, bottom, left, right with CSS-triangle arrow
│   │   │                             #    Background: surfacegray-high + backdrop-blur-medium (glassmorphism)
│   │   │                             #    Shadow: shadow-400 (Figma effects/floating)
│   │   │                             #    Props: content, show, position, variant, delay, className
│   │   │                             #    Animated with framer-motion AnimatePresence
│   │   ├── Overlay.tsx               # Animated backdrop for modals/drawers (no Figma link, pattern from Dialog)
│   │   │                             #    Tokens: bg-overlay-base + backdrop-blur-effects-modal
│   │   │                             #    Props: open, onClick, zClassName, className
│   │   │                             #    Animated with framer-motion AnimatePresence (fade 150ms)
│   │   ├── Divider.tsx               # 1px separator line (Figma node: 55960:21347)
│   │   │                             #    Orientations: horizontal (default), vertical
│   │   │                             #    Color: stroke-a12 token. Semantic HTML: <hr> or <div role="separator">
│   │   ├── Scroller.tsx              # Scrollable container with styled custom scrollbar (Figma node: 55960:20433)
│   │   │                             #    Directions: vertical (default), horizontal, both
│   │   │                             #    Scrollbar: 8px wide, blackinverse-a8 default / blackinverse-a12 hover (scrollbar.css)
│   │   ├── Dialog/                   # Confirmation dialog component (Figma node: 55089:9415)
│   │   │   ├── Dialog.tsx            #    Width: 424px. Header: 44px close. Footer: 88px cancel+confirm
│   │   │   │                         #    Icon types: add, edit, onBoard, delete (64×64px colored icon)
│   │   │   │                         #    Props: open, onOpenChange, title, subtitle, icon, content, confirmLabel, cancelLabel, onConfirm, loading
│   │   │   ├── Dialog.stories.tsx    #    Storybook: Default, WithAddIcon, WithEditIcon, WithDeleteIcon, Loading, AllIcons
│   │   │   └── index.ts              #    Barrel exports: Dialog, DialogProps, DialogIconType
│   │   ├── SidebarNav/               # Sidebar navigation components (Figma 55302:11212)
│   │   │   ├── SidebarNavItem.tsx    #    Main item (expanded mode): icon + label + right area (Figma 55156:8045)
│   │   │   │                         #    States: default, hover, active. Props: icon, label, showIcon, rightArea, isExpanded, showChevron, isActive
│   │   │   ├── SidebarNavItemMini.tsx #   Mini item (collapsed mode): icon only (Figma 55173:2426)
│   │   │   │                         #    Props: icon, label (aria-label), isActive
│   │   │   ├── SidebarNavSubitem.tsx  #   Sub-item with indent aligned to parent label (Figma 55308:5705)
│   │   │   │                         #    Right area visible on hover via group-hover. Props: label, rightArea, isActive
│   │   │   ├── SidebarNavGroup.tsx    #   Expand/collapse container with Framer Motion animation
│   │   │   │                         #    Props: item, children, isExpanded, onToggle
│   │   │   ├── SidebarNav.types.ts   #    Types: SidebarNavItemProps, SidebarNavItemMiniProps, SidebarNavSubitemProps, SidebarNavGroupProps
│   │   │   ├── SidebarNav.stories.tsx #   Storybook: Item states, Mini, Subitem, Group, FullSidebarDemo
│   │   │   └── index.ts             #    Barrel exports
│   │   │
│   │   ├── ListItemApp/              # Universal list item for app screens (Figma 9320:7913)
│   │   │   ├── ListItemApp.tsx       #    Main component: row with leading/content/trailing slots
│   │   │   │                         #    States: enabled, focused, active, disabled
│   │   │   │                         #    Props: leading, title, caption, trailing, state, onClick
│   │   │   ├── ListItemApp.types.ts  #    Types: ListItemAppState, ListItemAppProps
│   │   │   ├── ListItemApp.stories.tsx #  Storybook: Default, WithAvatar, WithSwitch, AllStates, FigmaStates
│   │   │   └── index.ts             #    Barrel exports: ListItemApp, ListItemAppProps, ListItemAppState
│   │   │
│   │   ├── Switch.tsx                # Toggle switch component (Figma 55058:4837)
│   │   │                             #    Sizes: sm (24x12px web), md (40x20px app)
│   │   │                             #    Features: Animated thumb slide, accent dot indicator on On state
│   │   │                             #    Uses CSS vars: --switch-bg-off/on, --switch-thumb, --switch-dot
│   │   │                             #    Off state has border-blackinverse-a12 for visibility on all backgrounds
│   │   │                             #    Props: checked, onChange, size, variant, disabled, aria-label
│   │   │                             #    Accessibility: role="switch", aria-checked, keyboard (Space/Enter)
│   │   │                             #    Used in: ProfileMenuDropdown, Sidebar (explore/chat toggles)
│   │   │
│   │   └── Dropdown/                 # ⭐ Universal dropdown component system with 3 APIs
│   │       │                         #    NEW: Unified dropdown system for all dropdown-like components
│   │       │                         #    Architecture: Dropdown (items) > DropdownBase (custom menu) > DropdownCompound (advanced)
│   │       │
│   │       ├── index.ts              #    Barrel exports: Dropdown, DropdownBase, DropdownCompound, sub-components, types
│   │       ├── types.ts              #    TypeScript interfaces: DropdownPlacement, DropdownItem, all props
│   │       │                         #    DropdownPlacement: 'top' | 'bottom' | 'left' | 'right'
│   │       │                         #    DropdownItem: { label: string, value: string, icon: ComponentType }
│   │       │
│   │       ├── Dropdown.tsx          #    ⭐ Main API with items auto-render (recommended for 90% cases)
│   │       │                         #    Props: items (DropdownItem[]), selectedValue, onSelect, trigger, placement, offset, etc.
│   │       │                         #           renderItem?: (item, isSelected) => ReactNode - custom item render
│   │       │                         #           renderMenu?: (itemsBlockEl) => ReactNode - custom menu container
│   │       │                         #    Default item style: ProfileDropdown (icon + text, gap-3, hover effects)
│   │       │                         #    Default menu style: rounded-lg, bg-[var(--bg-card)], shadow-xl
│   │       │                         #    Example: <Dropdown items={[...]} selectedValue="1" onSelect={...} />
│   │       │                         #    Custom item: <Dropdown items={[...]} renderItem={(item, isSelected) => <div>...</div>} />
│   │       │                         #    Custom menu: <Dropdown items={[...]} renderMenu={(items) => <div className="...">{items}</div>} />
│   │       │
│   │       ├── DropdownBase.tsx      #    Base Render Props API (for fully custom menu content)
│   │       │                         #    Props: trigger (render function), menu (ReactNode), placement, offset, zIndex, etc.
│   │       │                         #    Use when: Need complete control over menu HTML structure
│   │       │                         #    Example: <DropdownBase trigger={...} menu={<div>Custom content</div>} />
│   │       │
│   │       ├── DropdownCompound.tsx  #    Compound Components API (for advanced/custom use cases)
│   │       │                         #    Usage: <DropdownCompound><DropdownCompound.Trigger>...</DropdownCompound.Menu></DropdownCompound>
│   │       │                         #    Features: Full control over structure, state management
│   │       │                         #    Context: Provides isOpen, setIsOpen, triggerRef, menuRef via DropdownContext
│   │       │                         #    State: Controlled (open/onOpenChange) OR Uncontrolled (defaultOpen)
│   │       │                         #    Sub-components: DropdownCompound.Trigger, DropdownCompound.Menu
│   │       │
│   │       ├── DropdownTrigger.tsx   #    Trigger sub-component with click handling
│   │       │                         #    Supports: function-as-child (render prop) OR regular React elements
│   │       │                         #    Adds: onClick handler, aria-expanded, aria-haspopup, disabled state
│   │       │                         #    Accessibility: ARIA attributes for screen readers
│   │       │
│   │       ├── DropdownMenu.tsx      #    Menu sub-component with Portal, animations, positioning
│   │       │                         #    Features: Portal rendering (createPortal), framer-motion animations
│   │       │                         #             useClickOutside, Escape key, keyboard navigation (Arrow keys, Home, End)
│   │       │                         #             Viewport auto-correction (flips when no space)
│   │       │                         #    Animations: 0.15s duration, opacity + y/x translation + scale
│   │       │                         #    Default styles: rounded-lg, shadow-xl, bg-[var(--bg-card)], border
│   │       │                         #    Props: placement ('top'|'bottom'|'left'|'right'), offset (default: 8px)
│   │       │                         #           zIndex (default: 1000), usePortal (default: true)
│   │       │
│   │       ├── DropdownContext.tsx   #    React Context for sharing state between sub-components
│   │       │                         #    Exports: DropdownContext, useDropdownContext hook
│   │       │                         #    Throws error if used outside DropdownCompound
│   │       │
│   │       └── useDropdownPosition.ts #   Custom hook for viewport-aware positioning
│   │                                 #    Features: Calculates position with auto-correction when no space
│   │                                 #             Flips direction: bottom→top, left→right, etc.
│   │                                 #             Listens to scroll and resize events
│   │                                 #    Returns: ComputedPosition (top/bottom/left/right coordinates + final placement)
│   │                                 #    Used by: DropdownMenu for dynamic positioning
│   │
│   ├── dialogs/                       # Modal dialogs
│   │   ├── CreateBoardDialog.tsx      # ⭐ Board creation dialog (universal)
│   │   │                              #    Fields: name (required), description (optional)
│   │   │                              #    Loading state support, validation
│   │   │                              #    Used by: MainPage, IdeasPage (centralized board creation)
│   │   │                              #    Moved from features/main/components (used by multiple features)
│   │   ├── CreateCardDialog.tsx       # ⭐ Note creation/editing dialog (unified)
│   │   │                              #    Uses Modal with TipTap rich text editor
│   │   │                              #    Props: boardId, initialPosition, initialCardType, editCard (optional)
│   │   │                              #    Modes: Create mode (default) or Edit mode (when editCard provided)
│   │   │                              #    Edit mode: editable title, delete button with confirmation (DeleteCardConfirmDialog)
│   │   │                              #    "Спросить AI" button: creates chat with card via useChatManager
│   │   │                              #    Creates/updates/deletes card using mutations from board/queries
│   │   │                              #    Replaces old CardEditDialog (now deleted)
│   │   ├── AddBrokerDialog.tsx        # Broker connection wizard dialog
│   │                                  #    Uses Modal component (600px width)
│   │                                  #    State: canClose (controlled by BrokerSelectionWizard)
│   │                                  #    Blocks closing via backdrop/ESC during critical steps
│   │                                  #    Manages broker dialog return-to state
│   │   ├── BrokerManagementDialog.tsx # Broker & accounts management dialog
│   │   │                              #    Features: Interactive checkboxes for account filtering
│   │   │                              #    Accordion expand/collapse, partial selection with RemoveIcon
│   │   │                              #    Synced with statisticsStore.selectedAccountIds
│   │   │                              #    Actions: Add broker, Delete broker data (Beta)
│   │   ├── DeleteBoardDialog.tsx      # ⭐ Board deletion confirmation dialog
│   │   │                              #    Props: open, boardName, onClose, onConfirm, isLoading
│   │   │                              #    Uses Modal (size sm), shows trash icon, cancel/delete buttons
│   │   │                              #    Used by: IdeasContextMenu
│   │   ├── ConfirmAddNewsToBoard.tsx  # ⭐ Confirmation dialog: drop news onto specific board
│   │   │                              #    Props: isOpen, boardName, onClose, onConfirm
│   │   │                              #    Shown when user drops news onto a specific board card
│   │   ├── SelectBoardForNewsDialog.tsx # ⭐ Board selection dialog for news without active board
│   │   │                              #    Features: search, multi-select, DnD drop zones per row
│   │   │                              #    Brand hover styles (dashed border + bg) during news drag
│   │   │                              #    "Create board" inline, "Add to N boards" button
│   │   │                              #    Used by: NewsSidebar (bookmark/AI click), MainPage (drop outside boards)
│   │   └── index.ts                   # Barrel export for dialogs
│   │
│   ├── preview/                       # Content preview components
│   │   ├── FilePreview.tsx            # ⭐ File preview modal dialog component (S3-based, full-featured)
│   │   │                              #    Features: Modal dialog with file preview, metadata display, download
│   │   │                              #    File type support: Images (direct preview), PDFs (iframe embed),
│   │   │                              #                       Text files (pre-formatted content display),
│   │   │                              #                       Excel/Word (Microsoft Office Online viewer),
│   │   │                              #                       Other files (icon + metadata, download prompt)
│   │   │                              #    Props: open (boolean), card (Card | null), onClose (function)
│   │   │                              #    Download: Fetches pre-signed S3 URL via filesApi.getFile()
│   │   │                              #    Metadata: Shows file type, MIME type, size, creation date
│   │   │                              #    Error handling: Loading states, content errors, download errors
│   │   │                              #    Mobile responsive: Full screen on mobile, modal on desktop
│   │   │                              #    Uses: MUI Dialog, filesApi.getFile(), formatDateTime()
│   │   │                              #    Blocks native contextmenu on DialogContent (except inputs)
│   │   │                              #    Integrated in Board component (replaces CardPreviewDialog for files)
│   │   ├── NewsPreviewModal.tsx       # ⭐ News article preview modal (full-featured)
│   │   │                              #    Features: Modal dialog with OG image, title, description, source, tags
│   │   │                              #    Props: open (boolean), card (Card | null), onClose (function)
│   │   │                              #    Display: OG image (fallback if error), formatted publish date
│   │   │                              #    Actions: "Читать на источнике" button (opens newsUrl in new tab)
│   │   │                              #    Tags: Displays ticker tags using Tag component
│   │   │                              #    Integrated in Board component (replaces CardPreviewDialog for news)
│   │   ├── NewsPreview.tsx            # News article preview (simple component, not modal)
│   │   └── NotePreview.tsx            # Note card preview (simple component, not modal)
│   │
│   ├── AskAIButton.tsx                # AI assistance button
│   ├── DiaryLogoButton.tsx            # Логотип Diary/LIMEX в виде отдельной пилюли
│   ├── ExploreButton.tsx              # Кнопка "Explore" для открытия NewsSidebar
│   │                                  #    Порядок элементов: текст слева, иконка справа
│   │                                  #    Стилизована аналогично кнопке "AI Chat"
│   ├── NewsWidgetModal.tsx             # Modal news feed (opened from toolbar news button)
│   │                                  #    Store: useNewsWidgetModalStore
│   │                                  #    Tabs: "Фильтры" (MARKET_EVENT_TAXONOMY chips) + "Тикеры" (infinite ticker table)
│   │                                  #    Saves: meta.newsFilters (string[]) + meta.newsTickers (string[])
│   │                                  #    Same bookmark/AI/preview handlers as NewsSidebar
│   ├── NewsSidebar.tsx                # ⭐ News feed sidebar (Explore panel)
│   │                                  #    Position: Appears after Sidebar in flex layout
│   │                                  #    Animation: smooth open/close with opacity transition
│   │                                  #    Header: "Explore" title, filter button (with badge), search button
│   │                                  #    Content: useFeedData + NewsSnippet (custom rendering replacing FeedList)
│   │                                  #    Filters: useFilters('feedFilters') + FiltersOverlay for market event filter UI
│   │                                  #    Ticker chips: enriches news.stocks with price/change via GET /ticker/batch
│   │                                  #                  useTickerBatchQuery collects symbols from visible news, fetches batch,
│   │                                  #                  maps quote_last/quote_change_percent/security_id → NewsSnippet stocks
│   │                                  #    Theme: Uses useTheme, passes feedTheme to NewsSnippet/FiltersOverlay/NewsSkeleton
│   │                                  #    Analytics: YM news_viewed (preview from feed), explore_news_loaded, explore_empty,
│   │                                  #               explore_ai_click, explore_bookmark_click, explore_scroll_depth,
│   │                                  #               explore_time_on_widget (scroll depth resets on feed reload)
│   │                                  #    Open/close trigger: Explore button in Sidebar
│   │                                  #    Dimensions: 308px width + 8px margin
│   ├── BottomNavigationMenu.tsx       # Mobile bottom navigation
│   ├── TopNavigation.tsx              # @deprecated - replaced by Sidebar component
│   │                                  #    Old top navigation bar (kept for backwards compatibility)
│   │                                  #    Use Sidebar for navigation instead
│   ├── ResponsiveMenu.tsx             # @deprecated - navigation moved to Sidebar
│   │                                  #    Old responsive menu for TopNavigation
│   │                                  #    Navigation icons now in Sidebar component
│   ├── CardSearchDropdown.tsx         # Card search/filter dropdown
│   ├── BrokerIcon.tsx                 # Broker logo icon component
│   │                                  #    Displays broker icon by name
│   ├── TickerIcon.tsx                 # Stock ticker icon component with CloudFront CDN integration
│   │                                  #    Props: securityId?, symbol, size?, className?, alt?
│   │                                  #    Fetches icons from CloudFront CDN using security_id
│   │                                  #    Fallback: colored circle with ticker initials (hash-based colors)
│   │                                  #    Used by: TickerPickerModal, AddNewsAnalyticsModal, TickerInfoModal
│   │                                  #             TechAnalysisDetailsModal, NewsTab, FundamentalTab, TechAnalysisTab
│   │                                  #             TradesTable, PositionsTable
│   ├── TickerIconGroup.tsx            # Overlapping row of TickerIcon circles for board previews
│   │                                  #    Props: tickers (BoardTicker[]), size?, overlap?, maxVisible?
│   │                                  #    Used by: IdeasGridView, IdeasListView, BoardFlowNode
│   ├── Pagination.tsx                 # Pagination controls component
│   │                                  #    Page navigation with numbers
│   ├── Beta.tsx                       # Beta badge component
│   │                                  #    Marks new/beta features
│   ├── EmptyStatePlaceholder.tsx      # ⭐ Empty state placeholder for pages in development
│   │                                  #    Features: Animated illustration (central mockup + 6 feature cards)
│   │                                  #    Illustration: 560×240px with gradient phone mockup, metric badges (3×3 grid)
│   │                                  #                 6 floating feature cards (40×40px icons) around central element
│   │                                  #    Text: Customizable title/subtitle (default: "Скоро здесь будет крутая фича")
│   │                                  #    Design: Figma - https://www.figma.com/design/DjwUE4wL1Jd0CH3vTPPebE/%E2%9C%8F%EF%B8%8F-Diary?node-id=4160-76286&m=dev
│   │                                  #    Assets: /public/images/placeholders/ (7 SVG icons)
│   │                                  #    Used by: app routes (Стратегии, Исполнение, Обучение)
│   │                                  #    Background: #fafafc, centered layout, responsive
│   ├── Loading.tsx                    # Loading spinner component
│   │
│   ├── snackbar/                      # Standalone snackbar notification component
│   │   └── Snackbar.tsx               # Presentational snackbar with type, icon, action
│   │                                  #    Props: message, icon?, type?, action?, className?, aria-label?
│   │                                  #    Types: default, danger (full background color)
│   │                                  #    Features: Optional icon, optional action button
│   │                                  #    Difference from Toast: no react-toastify dependency, embeddable in layouts
│   │                                  #    ARIA: role="alert", aria-live="polite"
│   │
│   ├── toast/                         # ⭐ Toast notification components (react-toastify based)
│   │   ├── CustomToast.tsx            # Generic toast component with title, icon, message, and button
│   │   │                              #    Props: message, title?, icon?, button?, severity, closeToast
│   │   │                              #    Severity types: success, error, warning, info (with color-coded backgrounds)
│   │   │                              #    Features: Optional title, optional icon, optional action button with link/onClick
│   │   │                              #    Styling: Tailwind CSS, no inline styles
│   │   │                              #    Used by: utils/toast.tsx helpers (showSuccessToast, showErrorToast, etc.)
│   │   │
│   │   └── SignalToast.tsx            # Specialized toast for signal notifications
│   │                                  #    Props: iconUrl, messageTicker, message, sourceName, button?, closeToast
│   │                                  #    Features: Signal source icon, ticker icon (optional), message, action button
│   │                                  #    Styling: Tailwind CSS, no inline styles
│   │                                  #    Used by: utils/toast.tsx::showSignalToast(), hooks/useSignalSSE.ts
│   │
│   ├── storybook/                      # Storybook-only utilities (useStripDarkTheme hook for light/dark side-by-side demos)
│   │
│   ├── Notification.tsx               # ⭐ Toast notification container component
│   │                                  #    Wraps react-toastify ToastContainer with custom configuration
│   │                                  #    Features: top-right positioning, no progress bar, custom styling
│   │                                  #    Imports: react-toastify styles and custom toast.css
│   │                                  #    Used by: app/providers.tsx (rendered globally)
│   │
│   ├── CookieBanner.tsx               # ⭐ Cookie consent banner component
│   │                                  #    Features: non-blocking banner in bottom-right corner
│   │                                  #              shown to users who haven't accepted cookie policy
│   │                                  #              links to /cookie-policy page, no backdrop overlay
│   │                                  #              dismissible only by clicking "Принять" button
│   │                                  #    Position: fixed bottom-4 right-4, max-width 28rem
│   │                                  #    Storage logic:
│   │                                  #      - Cookie stores accepted policy version number (e.g. '1', '2')
│   │                                  #      - Guest: fetches currentVersion from API, persists in cookie on accept
│   │                                  #      - Guest login: auto-syncs cookie acceptance to backend DB
│   │                                  #      - Auth: always checks backend, syncs cookie ↔ DB
│   │                                  #      - Version change: shows banner again if cookie version < currentVersion
│   │                                  #      - Cookie expires in 90 days (3 months)
│   │                                  #      - Backward compat: old "true" cookie treated as version 1
│   │                                  #    Uses: privacyPolicyApi, cookieStorage
│   │                                  #    Integration: rendered in App.tsx after ToastContainer (visible on all pages)
│
├── ⚙️ constants/                      # ⚠️ MOVED to shared/constants/ — see shared/ section above
│   ├── index.ts                       # Barrel export for constants
│   └── layout.ts                      # ⭐ Layout system constants (design system values)
│                                      #    LAYOUT_CONSTANTS:
│                                      #      - SIDEBAR_COLLAPSED_WIDTH: 48px (collapsed mode, icons only)
│                                      #      - SIDEBAR_EXPANDED_WIDTH: 200px (expanded mode, icons + text)
│                                      #      - SIDEBAR_CONTENT_WIDTH: 308px (expandable panel width)
│                                      #      - SIDEBAR_MARGIN: 8px (external sidebar margin)
│                                      #      - CARD_WIDTH_SMALL: 184px, CARD_WIDTH_LARGE: 231px
│                                      #      - CARD_HEIGHT_SMALL: 168px, CARD_HEIGHT_LARGE: 200px
│                                      #      - PREVIEW_HEIGHT: 111px (fixed preview height for all cards)
│                                      #      - GAP: 8px (grid gap)
│                                      #      - PADDING: { TOP: 84, TITLE_HEIGHT: 28, TITLE_BOTTOM: 16, LEFT: 16 }
│                                      #      - MAX_COLS: 8 (maximum grid columns)
│                                      #      - MAX_CONTAINER_WIDTH_LARGE: 1936px (max width for screens 2560px+)
│                                      #      - MAX_CONTAINER_WIDTH_NORMAL: 1600px (max width for screens < 2560px)
│                                      #      - BREAKPOINT_LARGE: 2560px (responsive breakpoint)
│                                      #    Helper functions:
│                                      #      - getSidebarTotalWidth(width?): returns total width (content + margin)
│                                      #        Accepts optional width param for dynamic chat width (default: 308px)
│                                      #      - getMaxContainerWidth(screenWidth): returns responsive max width
│                                      #      - getMaxContainerWidthClass(screenWidth): returns Tailwind class
│                                      #      - getPageTopPadding(): returns 128px (84 + 28 + 16)
│                                      #      - getFlowInitialOffsetX(isNewsOpen, screenWidth, containerWidth):
│                                      #        calculates horizontal offset for Flow view to match Grid
│                                      #        includes sidebar offset + centering on wide screens (≥2560px)
│                                      #    Used by: All layout-related components, hooks, and views
│                                      #    Replaces: All hardcoded layout magic numbers
│
├── 🪝 hooks/                          # ⚠️ MOVED to shared/hooks/ — see shared/ section above
│   ├── index.ts                       # Barrel export for hooks
│   ├── useClickOutside.ts             # Detect clicks outside element
│   │                                  #    Used for closing dropdowns/menus, TopNavigation, statistics filters
│   ├── useLinkPreview.ts              # React Query hook — fetch OG preview via backend /api/link-preview
│   │                                  #    Exports: useLinkPreview(url) → { data: LinkPreviewData, isLoading }
│   │                                  #    Caching: staleTime 1 h, gcTime 24 h, retry false
│   │                                  #    Used by: components/ui/LinkPreviewCard
│   ├── useDevStrategyCatalog.ts       # ⭐ Feature flag hook for strategies catalog + TD-986 strategy binding UI
│   │                                  #    Exports: isStrategiesCatalogEnabled() (non-hook, for services/api e.g. strategyBinding)
│   │                                  #    Returns: boolean based on NEXT_PUBLIC_FEATURE_STRATEGIES_CATALOG env var
│   │                                  #    Used by: app/(app)/strategies-catalog/layout.tsx (route protection),
│   │                                  #             app/(app)/strategies/bind/layout.tsx, strategies/bound/layout.tsx,
│   │                                  #             StrategyBindingFeatureGate (PortfoliosSection),
│   │                                  #             ChatWindow (gates strategy survey flow)
│   │                                  #    Purpose: Enables/disables strategies catalog + Comon binding UI at build time
│   ├── useTheme.ts                    # ⭐ Theme management hook
│   │                                  #    Applies data-theme attribute to document.documentElement
│   │                                  #    Uses theme state from appViewStore (light/dark)
│   │                                  #    Triggers CSS variable switching via [data-theme="dark"] selector
│   │                                  #    Used by: app/(app)/layout.tsx (root layout)
│   ├── useColsCount.ts                # ⭐ Calculate responsive column count for grid/flow views
│   │                                  #    Uses containerWidth from appViewStore (measured by AppLayout)
│   │                                  #    Card sizes: 184px (<2560px), 231px (≥2560px)
│   │                                  #    Max width: 1936px, Max cols: 8, Gap: 8px (from LAYOUT_CONSTANTS)
│   │                                  #    Used by: MainPage, IdeasPage (for board limiting and flow layout)
│   ├── useResponsiveCardSize.ts       # ⭐ Get responsive card dimensions based on screen width
│   │                                  #    Returns: { cardWidth, cardHeight, screenWidth }
│   │                                  #    Breakpoint: 2560px (LAYOUT_CONSTANTS.BREAKPOINT_LARGE)
│   │                                  #    Sizes: 184×168px / 231×200px, Preview fixed at 111px
│   │                                  #    Used by: MainGridView, IdeasGridView, useFlowLayoutParams
│   ├── useFlowLayoutParams.ts         # ⭐ Centralized layout parameters for Flow views
│   │                                  #    Combines: useColsCount, useResponsiveCardSize, getFlowInitialOffsetX
│   │                                  #    Returns: { cols, cardWidth, cardHeight, initialOffsetX }
│   │                                  #    Used by: MainPage, IdeasPage (single source of truth for Flow layout)
│   ├── useViewportPersistence.ts      # ⭐ ReactFlow viewport save/load hook
│   │                                  #    Storage: localStorage with key-based separation
│   │                                  #    Returns: initialViewport, handleViewportChange, shouldFitView
│   │                                  #    Features: debounced save (300ms), per-page viewport (viewportKey)
│   │                                  #    Keys: 'main-flow-viewport', 'ideas-flow-viewport', 'portfolios-flow-viewport'
│   │                                  #    Used by: FlowBoardsView
│   │                                  #    Moved from features/main/hooks (used by universal FlowBoardsView)
│   ├── useResizable.tsx               # ⭐ Drag-to-resize functionality for sidebars
│   │                                  #    Handles mouse events for drag-based width adjustment
│   │                                  #    Returns: { width, isResizing, handleMouseDown }
│   │                                  #    Features: min/max width constraints, smooth resizing
│   │                                  #    Used by: ChatManager for resizable chat sidebar (308-600px)
│   ├── useWelcomeFlowHandler.ts       # ⭐ Post-auth welcome flow handler
│   │                                  #    Handles: Creating seeded chat after signup from welcome page
│   │                                  #             Creating CardNode with Q&A on user's board
│   │                                  #             Navigating to the board, opening chat sidebar
│   │                                  #    Returns: { isProcessing }
│   │                                  #    Board ID fallback: boardId → currentBoard → homeBoard
│   │                                  #    Storage: Reads/clears welcome_seed_chat_payload from localStorage
│   │                                  #    Notifications: Uses showErrorToast for error handling
│   │                                  #    Used by: AppLayout (runs once after authentication)
│   ├── useClipboard.ts                # Clipboard copy/paste operations
│   ├── useContextMenuState.ts         # Context menu state management
│   ├── useKeyboardShortcuts.ts        # Global keyboard shortcuts
│   ├── useCopyToClipboard.ts          # Copy to clipboard with toast notification
│   │                                  #    Exports: useCopyToClipboard() hook
│   │                                  #    Features: Copies text to clipboard, shows success/error toast
│   │                                  #    Used by: features/signal/*, features/board/*
│   ├── useSignalSSE.ts                # ⭐ SSE (Server-Sent Events) for real-time signal notifications
│   │                                  #    Connects to /api/signal/stream endpoint with Bearer token auth
│   │                                  #    Features:
│   │                                  #      • Auto-reconnects on connection errors (exponential backoff)
│   │                                  #      • Handles 401 errors gracefully (waits for token refresh)
│   │                                  #      • Minimal dependencies to prevent unnecessary reconnections
│   │                                  #      • Direct node update in boardStore (no full board re-initialization)
│   │                                  #      • Preserves card positions when signal updates arrive
│   │                                  #    Implementation: Updates only specific node.data in boardStore.nodes
│   │                                  #                    and boardStore.allCards, bypassing React Query cache
│   │                                  #                    to avoid triggering useBoard.ts hash recalculation
│   │                                  #      • Always updates React Query cache when signal received
│   │                                  #      • Invalidates signal data history cache (for modal)
│   │                                  #      • Conditionally shows toast based on show_toast_notification flag
│   │                                  #      • Toast includes ticker icon + link to board
│   │                                  #      • Link format: /ideas/{board_id}?cardId={card_id}
│   │                                  #      • Passes ticker and security_id for icon display
│   │                                  #    Dependencies: [isAuthenticated, accessToken] only
│   │                                  #    Used by: App.tsx (global SSE connection for authenticated users)
│   ├── useSpeechRecognition.ts        # Speech-to-text functionality
│   └── useYandexMetrika.ts            # ⭐ Yandex Metrica analytics tracking
│                                      #    Exports: useYandexMetrika hook, trackYMEvent standalone function
│                                      #    Types: YMGoal, YMEventParams and specific param interfaces
│                                      #    Goals tracked: registration_completed, login, logout, active,
│                                      #                   onboarding_started, onboarding_completed, onboarding_failed,
│                                      #                   chat_survey_gate_started, quiz_required_completed, quiz_full_completed, quiz_stopped,
│                                      #                   broker_connect_started, broker_connected, broker_connect_failed,
│                                      #                   portfolio_opened, portfolio_created, trades_loaded, trade_selected,
│                                      #                   news_viewed, board_opened, board_widget_create, ticker_added, ai_chat_opened,
│                                      #                   ai_response_received, ai_tool_news_activated, ai_tool_news_widget_added,
│                                      #                   note_create, note_delete, note_drag, note_send_to_chat,
│                                      #                   board_create, news_drop_to_board (+ ticker param), ticker_search,
│                                      #                   fundamentals_save_to_board, technicals_save_to_board,
│                                      #                   fundamentals_send_to_chat, technicals_send_to_chat,
│                                      #                   chat_create, chat_send_message, finam_token_connect,
│                                      #                   explore_news_loaded, explore_empty, explore_ai_click,
│                                      #                   explore_bookmark_click, explore_scroll_depth, explore_time_on_widget
│                                      #    Config: NEXT_PUBLIC_YM_ID environment variable (defaults to 105778281)
│                                      #    Features: Auto-initializes YM on first hook usage (script injection),
│                                      #              auto-adds user_id to all events, dev mode logging
│                                      #    Used by: CreateCardDialog, CreateBoardDialog, ChatManager, ChatWindow,
│                                      #             useBoardActions, useBoardHandlers, TickerPickerModal,
│                                      #             useCreateTickerCards, BrokerSelectionWizard, statisticsStore, IdeaBoardPage, portfolio-catalog, statistics tables
│
├── 📄 views/                          # Page-level view components (used by Next.js App Router)
│   ├── WelcomePage.tsx                # ⭐ Welcome/landing page for unauthenticated users
│   │                                  #    Route: app/(welcome)/welcome/[sparklyId]/page.tsx
│   │                                  #    Note: legacy /welcome?sparkly=<id> redirects to /welcome/<id>, otherwise to /login
│   │                                  #    Uses: Welcome component from features/welcome
│   │
│   ├── MainPage.tsx                   # ⭐ Main page with boards overview (grid/flow views)
│   │                                  #    Features: Board creation, conditional view rendering based on global mode
│   │                                  #    Views: MainGridView (grid layout), FlowBoardsView (ReactFlow canvas)
│   │                                  #    Centralized board creation logic with CreateBoardDialog
│   │                                  #    Uses: useBoardsAllQuery, useCreateBoardMutation, appViewStore (global mode)
│   │                                  #    Performance: optimized with useCallback
│   │
│   ├── IdeasPage.tsx                  # ⭐ Ideas boards list page (Flow view only)
│   │                                  #    Features: Boards list in ReactFlow mode, board creation
│   │                                  #    Uses: FlowBoardsView with viewportKey="ideas-flow-viewport"
│   │                                  #    Navigation: Click on board → /ideas/:id
│   │                                  #    Route: /ideas, layoutMode: 'flow'
│   │
│   ├── IdeaBoardPage.tsx              # ⭐ Single board canvas (ideas + portfolio workspace)
│   │                                  #    Routes: /ideas/:id, /portfolio/:id, /strategies/:id
│   │                                  #    YM: board_opened; portfolio_opened on /portfolio/*; board_widget_create (news_feed from bottom bar)
│   │                                  #    Uses: Board, useBoardQuery, BottomNavigationMenu, usePathname
│   │
│   ├── PortfoliosPage.tsx             # ⭐ Portfolios list page (Grid/Flow modes)
│   │                                  #    Architecture: Supports 3 view modes:
│   │                                  #      - Grid mode (gridSubMode='grid'): PortfoliosGridView
│   │                                  #      - List mode (gridSubMode='list'): PortfoliosListView
│   │                                  #      - Flow mode: FlowBoardsView (ReactFlow visualization)
│   │                                  #    Features: Portfolio creation dialog, view mode switching
│   │                                  #    State: viewMode (from useViewStore), gridSubMode (local useState)
│   │                                  #    Uses: PortfoliosGridView, PortfoliosListView, FlowBoardsView
│   │                                  #          CreatePortfolioDialog, useFlowLayoutParams hook
│   │                                  #    Data: usePortfoliosQuery, useCreatePortfolioMutation
│   │                                  #    Navigation: Click on portfolio → /portfolio/:id
│   │                                  #    Route: /portfolio, layoutMode: 'both'
│   │
│   ├── BoardSectionPage.tsx           # ⭐ Generic board section page (Ideas, Portfolios, Strategies)
│   │                                  #    Shared page for all board section types via BoardSectionConfig
│   │                                  #    Features: Grid/List views, board creation dialog, context menu
│   │                                  #    Publish to marketplace: strategy boards only (feature-gated)
│   │                                  #    Uses: IdeasGridView, IdeasListView, CreateBoardDialog,
│   │                                  #           PublishToMarketplaceModal, useDevStrategyCatalog
│   │
│   ├── StrategiesCatalogPage.tsx      # ⭐ Strategies catalog page with filtering and tabs
│   │                                  #    Route: app/(app)/strategies-catalog/page.tsx
│   │                                  #    Features: Strategy list with search/filter, Current/Archived tabs
│   │                                  #              AI strategy selection landing block (default view)
│   │                                  #    Props: strategiesIds (from URL query params ?strategyId=)
│   │                                  #    Views: AiStrategyBlock (empty state), StrategiesList (filtered)
│   │                                  #    Uses: StrategiesTabs, StrategiesList, AiStrategyBlock
│   │                                  #    Layout: Max-w-5xl, centered container with purple AI accents
│   │                                  #    Feature flag: Protected by useDevStrategyCatalog hook (layout.tsx)
│   │
│   ├── StrategiesCatalogDetailPage.tsx # ⭐ Strategy detail page with two-column layout
│   │                                  #    Route: app/(app)/strategies-catalog/[id]/page.tsx
│   │                                  #    Features: Performance chart, AI analysis, composition, tariffs,
│   │                                  #              connection conditions, sidebar with key metrics
│   │                                  #    Layout: Two-column with container queries, sticky bottom bar
│   │                                  #    Props: id (strategy ID from URL params)
│   │                                  #    Uses: StrategyDetailHeader, StrategyDetailSchedule,
│   │                                  #           StrategyDetailSidebar, StrategyDetailAiAnalysis,
│   │                                  #           StrategyDetailDescription, StrategyDetailConnectionConditions,
│   │                                  #           StrategyDetailTariffs, ConnectStrategyModal
│   │                                  #    Data: useGetStrategyCatalogById, useGetProfitPoints
│   │                                  #    i18n: All labels from strategiesCatalog.detail namespace
│   │
│   ├── PortfolioPage.tsx              # ⭐ Single portfolio view page
│   │                                  #    Features: Displays portfolio positions (PositionsTable)
│   │                                  #    Responsive grid layout: ProfitabilityChart + WidgetPlaceholder
│   │                                  #    Chart: 2/3 width on small screens, 1/2 on large (col-span-4 lg:col-span-3)
│   │                                  #    Widget: 1/3 width on small screens, 1/2 on large (col-span-2 lg:col-span-3)
│   │                                  #    Layout: Fixed height (300px) for chart/widget, flex-1 for positions table
│   │                                  #    Gets portfolioId from URL params (useParams)
│   │                                  #    Uses: PositionsTable, ProfitabilityChart, WidgetPlaceholder, broker dialogs
│   │                                  #    Route: /portfolio/:id, layoutMode: 'grid'
│   ├── ProfilePage.tsx                # User profile page (legacy — available at /profile-old)
│   ├── ProfilePageNew.tsx             # ⭐ New profile page (Figma TD-1053 layout)
│   │                                  #    Layout: full-page with ProfileHeader + ProfileNav + section content
│   │                                  #    Sections: my-profile, general, portfolios, tariff, payments
│   │                                  #    Components: src/features/profile/components/*
│   │                                  #    Route: /profile
│   ├── CookiePolicyPage.tsx           # Cookie policy page — fetches GET /api/cookie-policy, renders via LegalDocContent
│   ├── TermsPage.tsx                  # Terms of service page — fetches GET /api/terms, renders via LegalDocContent
│   ├── DisclaimerPage.tsx             # Disclaimer page — fetches GET /api/disclaimer, renders via LegalDocContent
│   ├── LegalDocAppPage.tsx            # ⭐ Authenticated legal doc viewer (settings zone)
│   │                                  #    Props: doc (key from LEGAL_DOCS_META)
│   │                                  #    Features: back button → /profile/legal, fetches content via apiClient
│   │                                  #    Renders via LegalDocContent with Tailwind design tokens
│   └── profile/
│       └── index.tsx                  # Profile page alternative entry
│
│   ├── 👤 profile/                    # Profile page feature module (TD-1053)
│   │   └── components/
│   │       ├── ProfileHeader.tsx      # Purple branded banner header (circuit pattern + logo)
│   │       ├── ProfileNav.tsx         # Internal sidebar navigation for profile page
│   │       │                          #    Sections: my-profile, general, portfolios, tariff, payments
│   │       │                          #    Export: ProfileSection type
│   │       ├── ChangePasswordModal.tsx # Modal for changing user password (3 fields: old, new, confirm)
│   │       └── sections/              # Per-section content components
│   │           ├── MyProfileSection.tsx   # Avatar, name/email fields, token usage, delete
│   │           ├── GeneralSection.tsx     # Language, theme (useTheme), currency
│   │           ├── PortfoliosSection.tsx  # Wraps ConnectedBrokers
│   │           ├── TariffSection.tsx      # 3-column pricing cards (stub data)
│   │           ├── TariffPlanCard.tsx     # Single plan card (id, price, recommended, featureKeys)
│   │           ├── PaymentsSection.tsx    # Placeholder
│   │           └── LegalSection.tsx       # List of 4 legal docs → /profile/legal/:doc
│   │                                      #    Data from LEGAL_DOCS_META, labels via i18n profile namespace
│   │
├── 🌐 services/                       # API clients & external services
│   │
│   ├── api/
│   │   ├── client.ts                  # ⭐⭐ Axios instance configuration
│   │   │                              #    Sets up: base URL, auth interceptors, token refresh
│   │   │                              #    Exports: apiClient, authTokens, currentBoard helpers
│   │   ├── analytics.ts               # POST /api/analytics/utm (optional legacy client; app uses attribution flow)
│   │   ├── attribution.ts            # POST /api/attribution/events — JWT batch attribution (errors swallowed at caller)
│   │   ├── chartExport.ts            # Chart export API: exportJson (GET /chart-export/:id/json), exportCsv (blob download)
│   │   │
│   │   ├── linkPreview.ts             # GET /api/link-preview?url= — fetch OG-preview data
│   │   │                              #    Exports: fetchLinkPreview(url), LinkPreviewData interface
│   │   │                              #    Used by: hooks/useLinkPreview, utils/ogExtractor
│   │   │
│   │   ├── clientStrategiesCatalog.ts # ⭐⭐ Strategies catalog Axios instance (marketplace API)
│   │   │                              #    Base URL: https://marketplace-api.changesandbox.ru/api/public/v1/strategies
│   │   │                              #    Features:
│   │   │                              #      • Authorization interceptor (Bearer token from cookieStorage)
│   │   │                              #      • Auto token refresh on 401 errors (uses tokenRefresh.ts)
│   │   │                              #      • GlitchTip/Sentry error reporting for non-auth errors
│   │   │                              #      • Dev diagnostics (window.__API_STRATEGIES_CATALOG_URL__)
│   │   │                              #      • Public route detection (skip refresh on /login, /welcome, etc.)
│   │   │                              #    Interceptors:
│   │   │                              #      • Request: Adds Bearer token from cookieStorage.getAccessToken()
│   │   │                              #      • Response: Handles 401 errors with retry logic
│   │   │                              #                Refreshes token, retries request with new token
│   │   │                              #                Redirects to /login on refresh failure
│   │   │                              #    Error handling:
│   │   │                              #      • Auth errors (401/Network Error): Token refresh flow
│   │   │                              #      • Other errors (403, 404): Skip Sentry reporting
│   │   │                              #      • All other errors: Reported to GlitchTip/Sentry
│   │   │                              #    Used by: strategiesCatalog.ts API client
│   │   │
│   │   ├── boards.ts                  # Board API client
│   │   │                              #    Functions: getBoards(), getBoard(), createBoard()
│   │   │
│   │   ├── cards.ts                   # Card API client
│   │   │                              #    Functions: createCard(), updateCard(), deleteCard()
│   │   │
│   │   ├── chat.ts                    # Chat API client
│   │   │                              #    Functions: getChats(), sendMessage(), createChat(), countTokens()
│   │   │                              #               estimateTokens(content, modelId, fileIds, cardIds) - includes attachment tokens
│   │   │                              #               createSurveyMessage(chatId, questionText, answerTexts)
│   │   │                              #               createWelcomeAck(chatId) - creates welcome_ack message
│   │   │                              #    SSE Parsing: Tracks event type for proper routing (message/tool_progress/done/error)
│   │   │                              #    Exports: ToolProgressEvent type for tool execution status
│   │   │                              #    sendMessage supports onToolProgress callback for streaming tool status
│   │   │
│   │   ├── publicChat.ts              # ⭐ Public chat API client (unauthenticated welcome page)
│   │   │                              #    Functions: sendMessage(content, contextMessages, onChunk)
│   │   │                              #    Features: SSE streaming, no auth required
│   │   │                              #    Types: ContextMessage, PublicMessageRequest, PublicChatResponse
│   │   │                              #    Endpoint: POST /api/chat/public-message
│   │   │                              #    Used by: Welcome.tsx for unauthenticated AI chat
│   │   │
│   │   ├── auth.ts                    # ⭐ Authentication API client
│   │   │                              #    Functions: login(), register() (with privacy consent params),
│   │   │                              #               refresh(), logout()
│   │   │                              #    register() uses named parameters with destructuring:
│   │   │                              #      { email, password, first_name?, last_name?,
│   │   │                              #        accepted_privacy_policy?, accepted_marketing? }
│   │   │
│   │   ├── survey.ts                  # Onboarding survey API client
│   │   │                              #    Functions: getStatus(), getNext(include_optional), putAnswer(), complete()
│   │   │                              #               getReminderStatus(min_gap), updateReminderStatus({is_completed, decrement_message, reset_reminder})
│   │   │                              #    Endpoints: GET /api/survey/status, GET /api/survey/next
│   │   │                              #               PUT /api/survey/answer, PUT /api/survey/status
│   │   │                              #               GET /api/survey/reminder-status, PUT /api/survey/reminder-status
│   │   │                              #    Error handling: Errors propagate to caller (outer catch in useChatSurveyGate)
│   │   │                              #    Used by: ChatWindow (blocks chat until required questions answered)
│   │   │
│   │   ├── tickers.ts                 # Ticker data API client
│   │   │                              #    Functions: getTickers(search, market, type, page, limit)
│   │   │                              #              getTickersBySymbols(symbols[]) - Batch endpoint (POST /api/ticker/batch)
│   │   │                              #                                              Single request for multiple symbols
│   │   │                              #              getMarkets() - Available (not used in UI currently)
│   │   │                              #                             Fetches from /api/ticker/markets
│   │   │                              #                             Maps Market[] to TickerCategory[] with IDs
│   │   │                              #              getTickersByMarket(marketId) - Uses market ID filtering
│   │   │                              #                                           Special Crypto handling (id=5, type=7)
│   │   │                              #              searchTickers(), getNews(), getNewsByTickers()
│   │   │                              #              getFundamentalData(), getTechnicalData(), getAnalyticsTabs()
│   │   │                              #    Batch optimization: All *ByTickers methods use getTickersBySymbols() via fetchTickersMap()
│   │   │                              #                       helper (getNewsByTickers, getFundamentalDataByTickers, getTechnicalDataByTickers)
│   │   │                              #                       Single batch request replaces N individual requests
│   │   │                              #    News API: Maps content and url fields from backend response
│   │   │                              #              Handles both published_at and published fields
│   │   │                              #    Integrated with backend: Uses market parameter (singular, not markets[])
│   │   │                              #    Type mapping: MarketBackend { id, type?, title } → TickerCategory
│   │   │                              #                  TickerListItemBackend: currency is optional (defaults to USD)
│   │   │
│   │   ├── files.ts                   # ⭐ File upload/download API client (S3-based)
│   │   │                              #    Functions: uploadFile(file, cardId?) - Upload file to S3
│   │   │                              #              getFile(fileId) - Get file info with pre-signed download URL
│   │   │                              #              getFilePreview(fileId) - Get file content for preview
│   │   │                              #    Endpoints: POST /api/files/upload
│   │   │                              #              GET /api/files/{fileId}
│   │   │    Response types: FileUploadResponse (with file_type), FileInfoResponse
│   │   │                              #    Integration: Used by useBoardActions (3-step upload flow)
│   │   │                              #    Preview: Downloads file and parses with xlsx/mammoth for previews
│   │   │
│   │   ├── broker.ts                  # Broker API client
│   │   │                              #    Functions: getConnections(), createConnection()
│   │   │                              #              updateConnection(), deleteConnection()
│   │   │                              #              getAccounts(), syncConnection(), enableAutoSync()
│   │   │
│   │   ├── statistics.ts              # Statistics API client
│   │   │                              #    Functions: getPositions(), getTrades()
│   │   │                              #              getTransactions(), syncAccount()
│   │   │
│   │   ├── signals.ts                 # ⭐ Webhook signal (TradingView, Telegram) API client
│   │   │                              #    Functions: getSignals() - List all signals for current user
│   │   │                              #              getSignal(id) - Get single signal by ID
│   │   │                              #              createSignal(data) - Create new signal with auto-generated card
│   │   │                              #              updateSignal(id, data) - Update signal description/active status
│   │   │                              #              deleteSignal(id) - Soft delete signal
│   │   │                              #              getSignalData(id, limit?) - Get signal webhook data history
│   │   │                              #    Endpoints: GET/POST/PUT/DELETE /api/signal, GET /api/signal/{id}/data
│   │   │                              #    Used by: features/signal/queries.ts, SignalModal, SignalDropdown
│   │   │
│   │   ├── privacyPolicy.ts           # ⭐ Privacy policy and cookie consent API client
│   │   │                              #    Functions: getCookiePolicy() - Get cookie policy content as plain text
│   │   │                              #              checkCookieConsentStatus() - Check consent status + currentVersion
│   │   │                              #              acceptCookieConsent(versionNumber?) - Record acceptance with version
│   │   │                              #    Types: CookieConsentStatusResponse { accepted, currentVersion }
│   │   │                              #    Endpoints: GET /api/cookie-policy
│   │   │                              #               GET /api/cookie-policy/cookie-consent-status → { accepted, currentVersion }
│   │   │                              #               POST /api/cookie-policy/accept-cookie-consent { versionNumber? }
│   │   │                              #    Used by: CookieBanner, CookiePolicyPage
│   │   │
│   │   ├── analysis.ts                # AI analysis API client
│   │   ├── files.ts                   # File upload API client
│   │   ├── edges.ts                   # Edge/connection API client
│   │   ├── deployments.ts             # Deployment & trading ideas API client
│   │   │                              #    Functions: getDeployments, getDeployment, getIdeas, downloadCSV, deploy (SSE)
│   │   │                              #    deploy() uses fetch + ReadableStream for SSE streaming (matches pipeline.ts pattern)
│   │   │                              #    Endpoints: POST /api/strategy/:id/deploy (SSE)
│   │   │                              #               GET /api/strategy/:id/deployments
│   │   │                              #               GET /api/strategy/:id/deployments/:did/ideas
│   │   │                              #               GET /api/strategy/:id/deployments/:did/csv
│   │   │                              #    Used by: features/strategy/queries.ts, StrategyContent.tsx
│   │   │
│   │   ├── sparkle.ts                 # ⭐ Sparkle dialogs API client (welcome page scenarios)
│   │   │                              #    Functions: getAll() - Get all active sparkles (public)
│   │   │                              #              getBySlug(slug) - Get sparkle by slug (public)
│   │   │                              #              getAllAdmin() - Get all sparkles including inactive (auth)
│   │   │                              #              create(data) - Create new sparkle (auth)
│   │   │                              #              update(id, data) - Update sparkle (auth)
│   │   │                              #              delete(id) - Delete sparkle (auth)
│   │   │                              #    Types: SparkleDialog, SparkleDialogFull, SparkleMessage
│   │   │                              #    Endpoints: GET /api/sparkle (public)
│   │   │                              #               GET /api/sparkle/{slug} (public)
│   │   │                              #               GET /api/sparkle/admin/all (auth)
│   │   │                              #               POST/PUT/DELETE /api/sparkle (auth)
│   │   │                              #    Used by: Welcome.tsx for loading predefined dialog scenarios
│   │   │
│   │   ├── strategies.ts              # Strategy API client
│   │   │                              #    Functions: getStrategy(id), getStrategies(boardId),
│   │   │                              #              createStrategy(data), updateStrategy(id, data),
│   │   │                              #              publishToMarketplace(id, data) - mock (backend not ready)
│   │   │                              #    Endpoints: /api/strategy/*
│   │   │                              #    Used by: features/strategy/queries.ts
│   │   │
│   │   ├── strategiesCatalog.ts       # ⭐ Strategies catalog API client (marketplace integration)
│   │   │                              #    Functions: getStrategy(id) - Get strategy by ID
│   │   │                              #              getProfitPoints(id) - Get strategy profit points
│   │   │                              #    Base URL: https://marketplace-api.changesandbox.ru/api/public/v1/strategies
│   │   │                              #    Uses: apiClientStrategiesCatalog (separate axios instance)
│   │   │                              #    Types: TradingStrategyDto, StrategyProfitPointsResponse
│   │   │                              #    Used by: features/strategiesCatalog/queries.ts
│   │   │
│   │   ├── strategyBinding.ts         # TD-986 Comon binding API client (mock until backend integration)
│   │   │                              #    Functions: initBinding(), listBindings(), listBindingsWithDetails()
│   │   │                              #    Guard: isStrategiesCatalogEnabled(); mocks via dynamic import when flag on
│   │   │                              #    Used by: features/strategy-binding/queries.ts
│   │   │
│   │   └── index.ts                   # API barrel: merged `api` spreads domain modules; strategy binding is `api.strategyBinding` (not spread) to avoid generic key collisions; exports `strategyBindingApi`
│   │
│   ├── chartWidgetController/          # TxChart widget lifecycle controller (pure TS, no React)
│   │   ├── constants.ts               #    Magic numbers: timeouts, type IDs, instrument type arrays
│   │   ├── types.ts                   #    Interfaces: ChartWidgetControllerOptions, ChartCardData, ChartTheme, AiInstrument
│   │   ├── utils.ts                   #    Pure functions: unwrapChartState, extractMountOptions, buildAiInstruments
│   │   ├── ChartWidgetController.ts   #    Main class: init/destroy/saveState/resize/changeTheme/injectAiInstruments
│   │   └── index.ts                   #    Barrel export
│   │
│   └── oauth.ts                       # OAuth provider integration
│
├── 🗄️ stores/                         # Global state management (Zustand)
│   │
│   ├── authStore.ts                   # ⭐ Authentication state
│   │                                  #    State: isAuthenticated, currentUser, accessToken
│   │                                  #    Actions: setAuth(), clearAuth(), restoreAuth() → Promise<userId|null> after /auth/me
│   │
│   ├── authModalStore.ts              # ⭐ Auth modal state management
│   │                                  #    State: isOpen, mode ('login' | 'register' | 'forgot-password')
│   │                                  #    Actions: openModal(mode?), closeModal(), setMode()
│   │                                  #    Used by: WelcomeLayout, ChatForm, AuthModal
│   │
│   ├── deploymentNavStore.ts           # Shared deployment nav index + deploying flag (strategyId-keyed)
│   │                                  #    Used by: StrategyContent, TradingIdeaContent, TradingIdeaOuterHeader
│   ├── boardStore.ts                  # ⭐ Board canvas state
│   │                                  #    State: nodes, edges, boardId, viewport, allCards
│   │                                  #    Actions: setNodes(), setEdges(), initializeBoardData()
│   │                                  #    Viewport: Always saved to store state (for CreateCardDialog, ChatManager, etc.)
│   │                                  #             Persisted to localStorage per-board (board-{id}-viewport) when boardId available
│   │                                  #             Fixes race condition: viewport saved even when boardId not yet set
│   │                                  #    saveViewport: set(viewport) first, then localStorage if boardId exists
│   │                                  #    loadViewport: reads from localStorage using current boardId
│   │                                  #    onNodesChange filters out ReactFlow select events (selection handled manually in useBoard)
│   │                                  #    resetBoard: clears overlay + draft stores in addition to selection/UI
│   │
│   ├── boardOverlayStore.ts           # Board overlay fullscreen state
│   │                                  #    State: isOpen, descriptor (BoardOverlayDescriptor | null)
│   │                                  #    Actions: open(descriptor), close(), replaceContent(descriptor)
│   │                                  #    Guards: getState().isOpen used in board handlers for early returns
│   │
│   ├── noteDraftStore.ts              # Shared note draft between modal and overlay
│   │                                  #    State: draft (cardId, boardId, title, content, color, originalTitle, originalContent, isDirty)
│   │                                  #    Actions: openDraft(card, boardId), closeDraft(), setTitle(), setContent(), setColor()
│   │                                  #    isDirty: title !== originalTitle || content !== originalContent (color excluded)
│   │
│   ├── statisticsStore.ts             # ⭐ Statistics filters and state
│   │                                  #    State: positionsFilters (search, account_ids, status, dates, etc.)
│   │                                  #           selectedAccountIds (null | string[]) - null=all, []=none, [...]=specific
│   │                                  #           dateRange, showBrokerDialog, showBrokerManagementDialog
│   │                                  #           isDataSyncInProgress (boolean) - triggers polling for broker data sync
│   │                                  #           brokerDialogReturnTo - navigation state for wizard back button
│   │                                  #    Actions: setPositionsFilters(), setDateRange(), setSelectedAccountIds()
│   │                                  #             setShowBrokerDialog() — YM broker_connect_started when dialog opens (false→true)
│   │                                  #             setShowBrokerManagementDialog()
│   │                                  #             setBrokerDialogReturnTo() - for wizard navigation
│   │                                  #    Search: Case-insensitive partial match across instrument/symbol/broker
│   │                                  #    Filter logic: null=show all, []=show none, [...ids]=show specific accounts
│   │                                  #    Persistence: localStorage via Zustand persist (statistics-filters-state)
│   │                                  #                 Persists: dateRange, selectedAccountIds, specific positionsFilters
│   │
│   ├── appViewStore.ts                # ⭐ Global view mode, theme, and container width state
│   │                                  #    State: viewMode ('grid' | 'flow'), theme ('light' | 'dark'), containerWidth (number | undefined)
│   │                                  #    Actions: setViewMode(mode), toggleViewMode(), setContainerWidth(width)
│   │                                  #             setTheme(theme), toggleTheme()
│   │                                  #    Theme system: Uses data-theme attribute on document.documentElement
│   │                                  #                  CSS variables defined in app/globals.css (:root, [data-theme="dark"])
│   │                                  #                  Theme-aware classes: theme-surface, theme-text-primary,
│   │                                  #                                       theme-text-secondary, theme-border, theme-bg-hover
│   │                                  #    containerWidth: Measured by AppLayout ResizeObserver, corrected for overlay sidebars
│   │                                  #                    Used by useColsCount for consistent grid/flow column calculation
│   │                                  #    Default: viewMode='grid', theme='light', containerWidth=undefined
│   │                                  #    Persists viewMode and theme to localStorage via Zustand persist (app-view-state)
│   │                                  #    Used by: MainPage, TopNavigation, AppLayout, useColsCount, useTheme
│   │
│   ├── sidebarStore.ts                # ⭐ Main sidebar state (collapsed/expanded)
│   │                                  #    State: isCollapsed, expandedSection (boards/portfolios/strategies/null)
│   │                                  #    Actions: toggleCollapsed, expand, collapse, toggleSection, setExpandedSection
│   │                                  #    Persistence: localStorage via Zustand persist (sidebar-state)
│   │                                  #    Used by: Sidebar component
│   │
│   ├── chatStore.ts                   # ⭐ Chat sidebar state with resizable width and context cards
│   │                                  #    State: isChatSidebarOpen, isSidebarCollapsed, activeChatId, chatWidth
│   │                                  #           chatTradesContext (chatId, tradeIds, tickerSecurityIds)
│   │                                  #           chatContextCards: Record<chatId, cardIds[]> - persisted card context
│   │                                  #           onClearTradesSelection - callback to clear selection in PositionsTable
│   │                                  #    Actions: toggleChatSidebar(), setIsChatSidebarOpen(), toggleCollapse()
│   │                                  #             setActiveChatId(), setIsSidebarCollapsed(), setChatWidth()
│   │                                  #             setChatTradesContext(), setOnClearTradesSelection(), closeAll()
│   │                                  #             setChatContextCards(chatId, cardIds) - sets card context for chat
│   │                                  #             addCardsToChatContext(chatId, cardIds) - adds cards, returns newly added count
│   │                                  #             removeChatContextCards(chatId) - removes all cards for chat
│   │                                  #    Chat width: Dynamic 308-600px (default: 420px)
│   │                                  #    Trades context: Temporary in-memory context for current chat session
│   │                                  #                    tickerSecurityIds: Record<ticker, security_id | null> - unified tickers with icon info
│   │                                  #                    NOT persisted to localStorage (cleared on page refresh)
│   │                                  #    Context cards: Persisted in localStorage via zustand persist middleware
│   │                                  #                   Migration: Old chat_*_context_cards localStorage keys auto-migrated on first load
│   │                                  #                   Centralized storage instead of scattered localStorage entries
│   │                                  #                    Allows passing selected trades from PositionsTable to chat
│   │                                  #    Persistence: localStorage via Zustand persist (chat-sidebar-state)
│   │                                  #                 Persists: sidebar visibility, active chat, width
│   │                                  #                 Excludes: chatTradesContext (session-only)
│   │                                  #    Used by: ChatManager (resizable), TopNavigation (dynamic spacing), AppLayout,
│   │                                  #             PositionsTable (trade selection integration)
│   │
│   ├── useChatStoreHydrated.ts        # Hook: returns true once chatStore persist middleware finishes rehydrating
│   │                                  #    Uses useSyncExternalStore for SSR-safe hydration detection
│   │                                  #    Used by: OnboardingWidget (gate chat creation until hydration completes)
│   │
│   ├── newsWidgetModalStore.ts         # News widget modal state (legacy, kept for type compatibility)
│   ├── newsFeedConfigStore.ts          # Inline config mode for news feed cards — tracks configuringCardId
│   │                                  #    Actions: openConfig(cardId), closeConfig()
│   │
│   ├── newsFeedWidgetStore.ts          # First 5 news items per news_feed widget card (for AI toolbar action)
│   │                                  #    State: itemsByCard (Record<cardId, NewsItem[]>)
│   │                                  #    Actions: setItems(), getItems(), clearItems()
│   │
│   ├── newsSidebarStore.ts            # ⭐ News sidebar state
│   │                                  #    State: isOpen
│   │                                  #    Actions: toggleSidebar(), setIsOpen()
│   │                                  #    Persistence: localStorage via Zustand persist (news-sidebar-state)
│   │                                  #                 Persists sidebar visibility across sessions
│   │
│   ├── demoChatStore.ts               # ⭐ Demo chat state with persist (welcome page)
│   │                                  #    State: messages, userMessageCount, neededAuth, initialQuestion, isStreaming
│   │                                  #    Persistence: localStorage via Zustand persist (demo-welcome)
│   │                                  #    partialize: messages only persisted when !isStreaming (prevents truncated data)
│   │                                  #    Replaces manual localStorage for demo chat state
│   │
│   ├── demoNoteStore.ts               # ⭐ Demo board note state (welcome page)
│   │                                  #    State: title (user question), content (AI response)
│   │                                  #    Actions: setTitle(), setContent(), reset()
│   │                                  #    Bridges DemoChat (writer) and DemoBoard (reader)
│   │                                  #    No persistence — ephemeral demo state, reset on unmount
│   │
│   └── settingsNavStore.ts            # Settings navigation referrer state
│                                      #    State: referrer (string | null)
│                                      #    Actions: saveReferrer() - captures current pathname
│                                      #             consumeReferrer() - returns referrer and clears it (defaults to '/')
│                                      #    Persistence: sessionStorage via Zustand persist (settings-referrer)
│                                      #    Used by: SidebarProfile, ProfileMenuDropdown, ProfileNav
│
├── 🔧 utils/                          # ⚠️ MOVED to shared/utils/ — see shared/ section above
│   │
│   ├── formatters.ts                  # Data formatting utilities
│   │                                  #    Exports: formatCurrency(amount, currency) - Formats currency with Russian locale
│   │                                  #             formatPercent(value) - Formats percentage with sign
│   │                                  #             formatDate(dateString) - Formats date in short format (ru-RU)
│   │                                  #             formatDateTime(dateString) - Formats date and time in full format
│   │                                  #             formatTickerPrice(price, currency?) - Formats ticker price with currency symbol
│   │                                  #             formatTickerPercent(percent) - Formats ticker percentage (Russian format)
│   │                                  #             getTickerChangeColor(change) - Returns CSS class for price change color
│   │                                  #    Used by: features/ticker/*, components/preview/*
│   │
│   ├── timeUtils.ts                   # ⭐ Time and date formatting utilities
│   │                                  #    Exports: formatTime(timestamp) - Chat message time formatting ("Только что", "2ч назад")
│   │                                  #             formatBoardDate(dateString?) - Board update date formatting
│   │                                  #               Returns: "Изменено только что", "Изменено сегодня",
│   │                                  #                        "Изменено вчера", or "d MMMM" (e.g., "15 ноября")
│   │                                  #               Uses date-fns (differenceInHours, format, isToday, isYesterday, ru locale)
│   │                                  #    Used by: MainGridView, IdeasGridView, BoardFlowNode
│   │                                  #    Eliminates code duplication (was in 3 separate files)
│   │
│   ├── fileUtils.ts                   # File type and metadata utilities
│   │                                  #    Exports: getFileIcon(fileType) - Returns emoji icon for file type
│   │                                  #             getFileTypeFromExtension(filename) - Extracts file type from extension
│   │                                  #             getFileInfo(filename) - Returns FileInfo object (name, type, extension)
│   │                                  #             getFileTypeColor(fileType) - Returns color hex code for file type
│   │                                  #             isImageFile(fileType) - Checks if file is an image
│   │                                  #             isDocumentFile(fileType) - Checks if file is a document
│   │                                  #             isSpreadsheetFile(fileType) - Checks if file is a spreadsheet
│   │                                  #    Used by: components/preview/FilePreview.tsx, features/board/*
│   │
│   ├── filePreviewStrategy.ts         # File preview strategy determination (DEPRECATED)
│   │                                  #    Note: No longer used after S3 simplification
│   │                                  #    FilePreview now uses direct download instead of preview strategies
│   │
│   ├── brokerTransform.ts             # Broker data transformation utilities
│   │                                  #    Functions: transformBrokerData(), formatAccount()
│   │
│   ├── ticker.ts                      # Ticker parsing utilities
│   │                                  #    Functions: getTickerFromSymbol() - extracts ticker from symbol (e.g., "LKOH@MISX" -> "lkoh")
│   │
│   ├── logger.ts                      # Structured logging utilities
│   │                                  #    Exports: logger.debug(module, message, data?) - Debug level logging
│   │                                  #             logger.info(module, message, data?) - Info level logging
│   │                                  #             logger.warning(module, message, data?) - Warning level logging
│   │                                  #             logger.warn(module, message, data?) - Alias for warning
│   │                                  #             logger.error(module, message, data?) - Error level logging
│   │                                  #    Used by: All modules for consistent logging
│   │
│   ├── chartWidget.ts                 # TxChart environment loader (TD-825)
│   │                                  #    Exports: createChartInstance() - factory, loads mf-loader + auth + chart modules
│   │                                  #             ChartWidgetInstance, TokenProvider interfaces
│   │                                  #    Env vars: NEXT_PUBLIC_CHART_WIDGET_URL, NEXT_PUBLIC_GA_HOST_URL
│   │                                  #    Used by: ChartWidgetContent.tsx
│   │
│   ├── chartHandlerRegistry.ts        # Registry for TxChart handler instances (TD-825)
│   │                                  #    Exports: registerChartHandler(cardId, handler)
│   │                                  #             unregisterChartHandler(cardId)
│   │                                  #    Used by: ChartWidgetController.ts (register/unregister)
│   │
│   ├── cookies.ts                     # Cookie storage helpers (for JWT tokens and cookie policy)
│   │                                  #    Exports: cookieStorage.getAccessToken() - Gets access token from cookies
│   │                                  #             cookieStorage.getRefreshToken() - Gets refresh token from cookies
│   │                                  #             cookieStorage.setAccessToken(token) - Sets access token (1 hour expiry)
│   │                                  #             cookieStorage.setRefreshToken(token) - Sets refresh token (7 days expiry)
│   │                                  #             cookieStorage.setTokens(accessToken, refreshToken?) - Sets both tokens
│   │                                  #             cookieStorage.clearTokens() - Removes both tokens
│   │                                  #             cookieStorage.hasTokens() - Checks if tokens exist
│   │                                  #             cookieStorage.getCookiePolicyVersion() - Returns accepted version number or null
│   │                                  #             cookieStorage.getCookiePolicyAcceptance() - Returns boolean (delegates to getCookiePolicyVersion)
│   │                                  #             cookieStorage.setCookiePolicyAcceptance(version) - Stores version number (90 days)
│   │                                  #             cookieStorage.clearCookiePolicyAcceptance() - Removes acceptance cookie
│   │                                  #    Used by: stores/authStore.ts, services/api/client.ts, components/CookieBanner.tsx
│   │
│   ├── ymEngagement.ts                # Yandex Metrika engagement helpers (sidebar on/off, device, client registration ts)
│   │                                  #    Exports: getYmSidebarEngagementParams, getYmDeviceType, ymRegisteredAtStorageKey,
│   │                                  #             setClientRegistrationTimestamp, readClientRegistrationTimestamp,
│   │                                  #             clearClientRegistrationTimestamp, clearYmActiveSessionSentFlag,
│   │                                  #             retentionDaysBetween, YM_ACTIVE_SESSION_STORAGE_KEY, YM_MOBILE_BREAKPOINT_PX
│   │                                  #    Used by: authStore (clear on logout), auth.ts, oauth.ts, useYandexMetrika flows, YmActiveSessionTracker
│   │
│   ├── version.ts                     # App version management utilities
│   │                                  #    Exports: loadLocalVersion() - Loads version info from local fallback
│   │                                  #             loadServerVersion() - Loads version info from server API
│   │                                  #             logVersionInfo(versionInfo) - Logs version info to console
│   │                                  #    Types: VersionInfo interface (version, release_name, features, etc.)
│   │                                  #    Used by: App.tsx (on app initialization)
│   │
│   ├── toast.tsx                      # ⭐ Toast notification utilities (react-toastify wrapper)
│   │                                  #    Exports: showSignalToast(source, messageTicker?, message, button?, duration?)
│   │                                  #             showSuccessToast(message, duration?)
│   │                                  #             showErrorToast(message, duration?)
│   │                                  #             showWarningToast(message, duration?)
│   │                                  #             showInfoToast(message, duration?)
│   │                                  #    Types: SignalSource ('tradingview' | 'telegram' | 'custom')
│   │                                  #    Features: Centralized toast API, auto-configures icons for signal sources
│   │                                  #    Components: Uses CustomToast and SignalToast components
│   │                                  #    Used by: All features, hooks/useSignalSSE.ts, hooks/useCopyToClipboard.ts
│   │
│   ├── sanitizeHtml.ts                # HTML sanitization utilities
│   │                                  #    Exports: sanitizeHtml(dirty) - Sanitizes HTML via DOMPurify (whitelist of tags/attrs)
│   │                                  #             stripEmptyHtml(html) - Returns '' if HTML has no text content
│   │                                  #    Used by: cardContent/FileContent, NewsPreviewModal
│   │
│   └── ogExtractor.ts                 # Open Graph metadata extraction utilities
│                                      #    Exports: isValidUrl(string) - Validates URL string
│                                      #             extractOGMetadata(url) - Fetches OG metadata via backend /api/link-preview
│                                      #             processImageUrl(imageUrl, baseUrl) - Processes relative/absolute image URLs
│                                      #             createFallbackMetadata(url) - Creates fallback metadata from URL
│                                      #    Types: OGMetadata interface (title, description, image, url, etc.)
│                                      #    Used by: hooks/useOGCard.ts, features/board/*
│
├── ⚙️ config/                         # ⚠️ MOVED to shared/config/ — see shared/ section above
│   ├── region.ts                      # ⭐ Deployment region config (DEPLOYMENT_REGION=ru|us)
│   │                                  #    Exports: REGION, regionConfig, currentRegionConfig
│   │                                  #    Controls: theme (finam/lime), i18n defaults, broker list, analytics
│   ├── environment.ts                 # Environment utilities
│   │                                  #    Exports: isDev, isProd, isTest - environment detection constants
│   │                                  #    Exports: getTickerIconUrl(securityId) - CloudFront URL helper
│   │                                  #    CloudFront: ticker icons fetched from NEXT_PUBLIC_CLOUDFRONT_URL
│   ├── routes.ts                      # ⭐ Route metadata configuration for Next.js App Router
│   │                                  #    Exports: ROUTES (route metadata for layout detection)
│   │                                  #             NAV_ROUTES (filtered routes for navigation display)
│   │                                  #             LayoutType ('guest' | 'app' | 'settings' | 'welcome')
│   │                                  #             LayoutMode ('flow' | 'grid' | 'both')
│   │                                  #    Types: Route (path, layout, showInNav, title, layoutMode?)
│   │                                  #    layoutMode: Declares which view modes page supports
│   │                                  #                'flow' - always overlay sidebars (Ideas pages)
│   │                                  #                'grid' - sidebars take space (not used yet)
│   │                                  #                'both' - respects global toggle (MainPage, default)
│   │                                  #    Note: Routing is handled by Next.js app/ directory structure
│   │                                  #    Layout types: guest (GuestLayout), app (AppLayout), settings (SettingsLayout)
│   │                                  #    Routes: / (MainPage), /ideas (IdeasPage), /ideas/:id (IdeaBoardPage)
│
├── 📚 lib/                            # Third-party library integrations
│   └── queryClient.ts                 # ⭐ TanStack Query client configuration
│                                      #    Exports: queryClient (used in App.tsx)
│
├── 💾 data/                           # Static data and constants
│   └── investment-factors.ts          # Investment analysis factor definitions
│
├── 🎨 styles/                         # ⚠️ MOVED to shared/styles/ — see shared/ section above
│   └── toast.css                      # ⭐ React-toastify style overrides
│                                      #    Purpose: Override default react-toastify styles for custom toasts
│                                      #    Classes: .custom-toast-wrapper, .custom-toast-body
│                                      #              .Toastify__toast-container, .Toastify__toast
│                                      #    Features: Removes default paddings, backgrounds, shadows
│                                      #              Sets container width constraints (min: 337px, max: 400px)
│                                      #    Note: All component styles use Tailwind CSS, this is only for toast library overrides
│
├── 📂 app/                            # Next.js App Router directory structure
│   ├── globals.css                    # ⭐⭐⭐ Global styles and theme CSS variables
│   │                                  #    Imported by: app/layout.tsx (root) - available in all layouts
│   │                                  #    Contains: CSS Custom Properties, Tailwind directives, theme variables
│   │                                  #    Theme Variables: Light/Dark themes with semantic colors, text, borders
│   │                                  #    Special Styles: ReactFlow, Card nodes, MUI overrides, News content
│   │                                  #    Dark Theme: Applied via [data-theme="dark"] attribute on <html>
│   │
│   ├── layout.tsx                     # ⭐ Root layout for entire application
│   │                                  #    Imports: ./globals.css (global styles with theme variables)
│   │                                  #    Provides: Providers wrapper (QueryClient, Theme, Notification)
│   │                                  #    Sets up: Inter font, metadata (title, description, icons)
│   │
│   ├── providers.tsx                  # ⭐ Global providers wrapper
│   │                                  #    Wraps: QueryClientProvider, ThemeProvider, CssBaseline
│   │                                  #    Renders: AttributionTracker (localStorage queue + POST /api/attribution/events), Notification, CookieBanner
│   │                                  #    RU: YandexMetrikaScript + UtmTracker (Metrika visit params + sessionStorage UTM)
│   │
│   ├── (app)/                         # ⭐ Authenticated app routes group
│   │   ├── layout.tsx                 #    App-specific layout (authenticated pages)
│   │   │                              #    Features: Sidebar, NewsSidebar, ChatManager, OnboardingWidget, theme support
│   │   │                              #    Uses: AuthGuard, useOnboardingGuideYmOpen (YM onboarding_started), useWelcomeFlowHandler, useSignalSSE
│   │   ├── page.tsx                   #    Main page (boards overview) - route: /
│   │   ├── ideas/                     #    Ideas/signals pages
│   │   ├── portfolio/                 #    Portfolio management pages
│   │   ├── strategies/                #    Trading strategies pages
│   │   ├── training/                  #    Training/education pages
│   │   └── execute/                   #    Trade execution pages
│   │
│   ├── (guest)/                       # ⭐ Guest/unauthenticated routes group
│   │   ├── layout.tsx                 #    Guest-specific layout
│   │   ├── login/                     #    Login page
│   │   ├── register/                  #    Registration page
│   │   ├── auth/                      #    Auth callback pages
│   │   ├── forgot-password/           #    Password recovery
│   │   ├── reset-password/            #    Password reset
│   │   └── (legal)/                   #    Route group: all legal docs share LegalDocsLayout (sidebar)
│   │       ├── layout.tsx             #    Wraps children with LegalDocsLayout
│   │       ├── privacy-policy/        #    /privacy-policy → PrivacyPolicyPage
│   │       ├── cookie-policy/         #    /cookie-policy → CookiePolicyPage
│   │       ├── terms/                 #    /terms → TermsPage
│   │       └── disclaimer/            #    /disclaimer → DisclaimerPage
│   │
│   ├── (welcome)/                     # ⭐ Welcome/landing routes group
│   │   ├── layout.tsx                 #    Minimal shell: full-screen container + WelcomeAuthModal
│   │   └── welcome/                   #    Route: /welcome
│   │       └── page.tsx               #    ⭐ Unified welcome page with two states:
│   │                                  #       "welcome" — centered input with dotted bg, header, footer
│   │                                  #       "demo" — full demo scene (DemoScene)
│   │                                  #    State: pageState ('welcome' | 'demo')
│   │                                  #    On submit: saves question to localStorage → switches to demo state
│   │
│   ├── (settings)/                    # ⭐ Settings routes group
│   │   ├── layout.tsx                 #    Settings-specific layout
│   │   └── profile/                   #    Profile settings pages
│   │       ├── [section]/             #    /profile/:section — my-profile, general, portfolios, tariff, payments, legal
│   │       │   └── page.tsx
│   │       └── legal/
│   │           └── [doc]/             #    /profile/legal/:doc — individual legal doc (terms, privacy-policy, cookie-policy, disclaimer)
│   │               └── page.tsx       #    Validates doc via LEGAL_DOCS_META, renders LegalDocAppPage
│
└── 📂 public/                         # Static assets
    └── icons/                         # Icon assets
        ├── brokers/                   # Broker logo icons
        │   ├── finam.svg              # Finam broker logo
        │   ├── tinkoff.svg            # Tinkoff broker logo
        │   ├── limex.svg              # Limex broker logo
        │   └── demo.svg               # Demo broker logo
        │
        └── tickers/                   # Stock ticker icons
            ├── sber.svg               # Sberbank ticker icon
            ├── vtb.svg                # VTB ticker icon
            ├── lkoh.svg               # Lukoil ticker icon
            ├── rosn.svg               # Rosneft ticker icon
            ├── ydex.svg               # Yandex ticker icon
            └── default.svg            # Default ticker icon

📦 Root Configuration Files:
├── config-overrides.js                # ⭐ Webpack configuration override (react-app-rewired)
│                                      #    - Loads .env from project root
│                                      #    - Configures webpack aliases (@/ paths)
│                                      #    - SVG handling with @svgr/webpack
│
├── 📂 tokens/                         # Design tokens for Tailwind theme
│   ├── tailwind-theme.js              # Pre-generated CSS variable references for Tailwind
│   │                                  #    Used by: tailwind.config.js
│   ├── manual-overrides.css           # Manually maintained CSS variables not yet in Figma
│   ├── brand-finam.css               # Finam brand CSS variables (purple accent)
│   └── brand-lime.css                # Lime/LIMEX brand CSS variables (green accent #A9DC4D)
│
├── 📂 scripts/                        # Build and utility scripts
│   └── update-tokens.js               # Token update script
│                                      #    Usage: npm run update-tokens
│                                      #    Regenerates tokens/tailwind-theme.js
│
├── package.json                       # Dependencies and scripts
│                                      #    Includes: update-tokens script
├── tsconfig.json                      # TypeScript configuration
├── tailwind.config.js                 # Tailwind CSS theme configuration
│                                      #    Imports tokens from ./tokens/tailwind-theme.js
│                                      #    Extends: colors, fontFamily, fontSize, fontWeight,
│                                      #             spacing, borderRadius
├── postcss.config.js                  # PostCSS configuration for Tailwind
└── .env                               # Environment variables (not in repo)
```

## 🎯 Key Principles

### 1. 🎯 Feature-First Organization

Each feature module (`features/`) contains everything related to that feature:

- ⚛️ Components specific to the feature
- 🪝 Hooks used only within the feature
- 🔌 API queries for that feature
- 🔧 Helper functions and constants

**Example:**

```typescript
// Board feature is self-contained
features/board/
  ├── components/    # ⚛️ UI components
  ├── hooks/         # 🪝 Business logic hooks
  ├── queries.ts     # 🔌 API integration
  ├── helpers.ts     # 🔧 Data transformation
  └── constants.ts   # 📌 Feature constants
```

### 2. 📝 Domain-Organized Types

Types are organized by domain instead of a single monolithic file:

```typescript
// Import from specific domain
import { Card, Board } from '@/types/board';
import { Chat, Message } from '@/types/chat';

// Or import everything through index
import { Card, Board, Chat, Message } from '@/types';
```

### 3. 🧩 Shared Components in `components/`

Only truly reusable, cross-feature components live in `components/`:

- 🏗️ Layout components (AppLayout)
- 🎨 Generic UI primitives (Button, Input)
- 💬 Shared dialogs
- 🔔 Global utilities (Loading, Toast notifications)

### 4. 🪝 Feature-Specific vs Shared Hooks

**Feature hooks** (in `features/*/hooks/`):

- `useBoard`, `useBoardActions`, `useBoardHandlers` - Board-specific
- `useCardSelection`, `usePasteToBoard` - Board operations

**Shared hooks** (in `hooks/`):

- `useClipboard` - Generic clipboard operations
- `useKeyboardShortcuts` - Global shortcuts
- `useCopyToClipboard` - Copy to clipboard with toast notifications

## 📦 Import Patterns

### ❌ Before (Old Structure)

```typescript
import Board from '@/components/board/Board';
import { useBoard } from '@/hooks/useBoard';
import { useBoardsAllQuery } from '@/features/home/queries';
import ChatManager from '@/components/chat/ChatManager';
```

### ✅ After (Current Structure)

```typescript
// Feature components
import { Board } from '@/features/board/components/Board';
import { useBoard } from '@/features/board/hooks/useBoard';
import { useBoardsAllQuery } from '@/features/board/queries';
import { ChatManager } from '@/features/chat/components/ChatManager';

// Shared layer (FSD)
import { cn } from '@/shared/utils/cn';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { useTranslation } from '@/shared/i18n/client';
import { LAYOUT_CONSTANTS } from '@/shared/constants/layout';
import Button from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
```

## ✨ Benefits

1. **🎯 Clear Ownership**: Each feature owns its complete vertical slice
2. **🧭 Easier Navigation**: Related code lives together
3. **📈 Better Scalability**: Add new features without touching existing code
4. **🧠 Reduced Cognitive Load**: Smaller, focused files
5. **🔒 Type Safety**: Domain-specific types are easier to find and maintain
6. **👥 Better for Teams**: Feature teams can work independently

## 🆕 Adding a New Feature

To add a new feature (e.g., `portfolio`):

### 1️⃣ Create feature directory:

```bash
mkdir -p src/features/portfolio/{components,hooks}
```

### 2️⃣ Add components:

```typescript
// src/features/portfolio/components/PortfolioView.tsx
export const PortfolioView = () => { ... };
```

### 3️⃣ Add queries:

```typescript
// src/features/portfolio/queries.ts
export const usePortfolioQuery = () => { ... };
```

### 4️⃣ Add types (if needed):

```typescript
// src/types/portfolio.ts
export interface Portfolio { ... }
```

### 5️⃣ Create view component:

```typescript
// src/views/PortfolioPage.tsx
import { PortfolioView } from '@/features/portfolio/components/PortfolioView';
export default function PortfolioPage() {
  return <PortfolioView />;
}
```

## 🔄 Architecture Layers

The frontend follows a clean layered architecture:

```
┌─────────────────────────────────────┐
│  📄 Pages (Route Components)        │  ← Next.js App Router pages
├─────────────────────────────────────┤
│  🎯 Features (Business Logic)       │  ← Feature modules with components
├─────────────────────────────────────┤
│  🌐 Services (API Integration)      │  ← Axios clients, API calls
├─────────────────────────────────────┤
│  🗄️ Stores (Global State)           │  ← Zustand state management
├─────────────────────────────────────┤
│  📝 Types (Type Definitions)        │  ← TypeScript interfaces
└─────────────────────────────────────┘
```

## 🔌 API Integration

### TanStack Query Pattern

Each feature module uses TanStack Query for API integration:

```typescript
// features/board/queries.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { boardsApi } from '@/services/api/boards';

export const useBoardsAllQuery = () => {
  return useQuery({
    queryKey: ['boards'],
    queryFn: boardsApi.getAll,
  });
};

export const useCreateBoardMutation = () => {
  return useMutation({
    mutationFn: boardsApi.create,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};
```

### API Service Layer

```typescript
// services/api/boards.ts
import { apiClient } from './client';
import { Board, CreateBoardRequest } from '@/types/board';

export const boardsApi = {
  getAll: async (): Promise<Board[]> => {
    const { data } = await apiClient.get('/api/boards');
    return data;
  },

  create: async (request: CreateBoardRequest): Promise<Board> => {
    const { data } = await apiClient.post('/api/boards', request);
    return data;
  },
};
```

## 🗄️ State Management

### Zustand Store Pattern

```typescript
// stores/boardStore.ts
import { create } from 'zustand';
import { Board } from '@/types/board';

interface BoardState {
  currentBoard: Board | null;
  setCurrentBoard: (board: Board | null) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  currentBoard: null,
  setCurrentBoard: (board) => set({ currentBoard: board }),
}));
```

### Store Usage

```typescript
// In a component
import { useBoardStore } from '@/stores/boardStore';

const MyComponent = () => {
  const { currentBoard, setCurrentBoard } = useBoardStore();

  return <div>{currentBoard?.name}</div>;
};
```

## 🎨 Styling Approach

**Tailwind CSS Only** - The project uses Tailwind CSS exclusively for styling.

- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration
- **Design Tokens**: Centralized tokens in `tokens/tailwind-theme.js` with manual overrides in `tokens/manual-overrides.css`
- **Custom Theme**: Extended theme in `tailwind.config.js` importing design tokens
- **Global Styles**: `app/globals.css` - imported in root `app/layout.tsx` for global availability
  - **CSS Custom Properties**: Theme variables (--bg-base, --text-primary, --color-accent, etc.)
  - **Light/Dark Theme**: Automatic switching via [data-theme="dark"] selector
  - **Button Colors**: --Black-Inverse-A* and --White-Inverse-A* for theme-aware buttons
  - **Component Styles**: .news-card-content for HTML content, ReactFlow node customizations
  - **Tailwind Layers**: @layer base, @layer components, @layer utilities
  - **Imported by**: app/layout.tsx (root) - available in all layouts (app, welcome, settings)
- **Component Styles**: Inline Tailwind utility classes in components
- **Custom CSS**: Only when absolutely necessary, using standard CSS (no preprocessors)

**Design Token Workflow:**

1. Run `npm run update-tokens` to regenerate `tokens/tailwind-theme.js`
2. `tailwind.config.js` automatically uses updated tokens
3. For variables not yet in Figma, add them to `tokens/manual-overrides.css`

**Color Palettes (from Figma):**

- `primary-*` / `blue-*` - Primary brand colors (50-1000)
- `gray-*` - Gray scale (50-1000)
- `red-*`, `orange-*`, `yellow-*` - Warm colors
- `green-*`, `cyan-*`, `lime-*` - Cool colors
- `violet-*`, `pink-*`, `brown-*` - Accent colors
- `success`, `error`, `warning` - Semantic colors

**Key Configuration:**

- All brand colors, typography, shadows defined in `tailwind.config.js`
- Design tokens imported from `./tokens/tailwind-theme.js`
- Base layer (@layer base) for global HTML/body styles
- Components layer (@layer components) for reusable class patterns
- No SCSS or other CSS preprocessors

## 📚 Best Practices

### ✅ DO:

- Keep features self-contained
- Use TypeScript strictly
- Co-locate related code
- Use TanStack Query for server state
- Use Zustand for client state
- Write reusable components in `components/`
- Use Tailwind CSS utility classes for all styling
- Use Material-UI (MUI) icons for all icon needs (`@mui/icons-material`)

### ❌ DON'T:

- Mix feature-specific code in shared folders
- Create circular dependencies
- Duplicate API calls (use queries)
- Put business logic in components (use hooks)
- Ignore TypeScript errors
- Use inline styles or CSS preprocessors (use Tailwind)

## 🔧 Development Tools

- **React**: UI framework
- **TypeScript**: Type safety
- **TanStack Query**: Server state management
- **Zustand**: Client state management
- **Next.js**: Framework and routing
- **Axios**: HTTP client
- **React Flow**: Canvas/board visualization
- **Tailwind CSS**: Utility-first CSS
- **Storybook 8.3.6**: Component documentation (`npm run storybook` → port 6006)
- **Agentation**: UI annotation devtool for AI agents — click any element to get CSS selectors, React component hierarchy, and computed styles. MCP server streams annotations to Claude Code. Active only in `NODE_ENV=development`. Component mounted in `app/providers.tsx`, MCP server configured in `.mcp.json`.

### Storybook

Config: `.storybook/` (main.ts, preview.tsx, next.config.js, preview-head.html)

**UI Component stories** — `src/components/ui/**/*.stories.tsx`:
Avatar, Button, CardControls, CountryFlag, Icon, IconButton, Input, Loading, SegmentedControl, Switch, Tabs, Tooltip, Tag,
Dropdown, SearchInput, DebouncedSearch, ErrorState, LoadingState, Container, TextArea,
AnswerOptionButton, MarkdownRenderer, BottomNavigationMenu, Table, DataTable, Modal, Snackbar,
SidebarNav

**Design System pages** — `src/stories/design-system/`:

- `Colors.stories.tsx` — все CSS-переменные цветов (реагируют на смену темы)
- `Typography.stories.tsx` — шрифты, размеры, веса
- `Spacing.stories.tsx` — отступы, border-radius, тени, z-index, высоты компонентов

**Theme switcher**: toolbar ☀/☾ → переключает `data-theme` атрибут (light/dark)

**Pinned version**: `@storybook/nextjs@8.3.6` — 8.6.x несовместима с Next.js 14.2.x (версии без `^` в package.json)

## 🚪 Entry Points (Start Here for AI Understanding)

When analyzing or working with the frontend codebase, start with these key files:

### 1. ⭐⭐⭐ Application Entry

- **`src/index.tsx`** - ReactDOM render entry point
- **`src/App.tsx`** - Main app component with routing, providers, and layout

### 2. ⭐⭐ Type System

- **`src/types/index.ts`** - Central type definitions barrel export
- **`src/types/board.ts`** - Core Board, Card, Edge types
- **`src/types/chat.ts`** - Chat and Message types

### 3. ⭐⭐ API Integration

- **`src/services/api/client.ts`** - Axios setup with auth interceptors and token refresh
- **`src/lib/queryClient.ts`** - TanStack Query configuration

### 4. ⭐⭐ State Management

- **`src/stores/authStore.ts`** - Authentication state (login/logout)
- **`src/stores/boardStore.ts`** - Board canvas state (nodes, edges, viewport)

### 5. ⭐ Core Features

- **`src/features/board/components/Board.tsx`** - Main board canvas
- **`src/features/board/queries.ts`** - Board API queries and mutations
- **`src/features/auth/components/AuthGuard.tsx`** - Route protection

### 6. ⭐ Routing

- **Next.js App Router** - File-system based routing via `app/` directory
- **`src/config/routes.ts`** - Navigation metadata configuration for layout detection and view modes
- **`app/layout.tsx`** - Root layout with providers (QueryClient, Theme, etc.)

## 📊 Module Dependency Map

Understanding how files import and depend on each other:

### High-Level Flow

```
index.tsx
  └─→ App.tsx
        ├─→ QueryClientProvider (from lib/queryClient.ts)
        ├─→ Next.js App Router (app/ directory)
        ├─→ ThemeProvider (@mui/material)
        ├─→ views/* (page components)
        └─→ stores/* (via hooks in components)
```

### Feature Module Flow (Board Example)

```
features/board/components/Board.tsx
  ├─→ features/board/queries.ts (TanStack Query hooks)
  │     └─→ services/api/boards.ts (API calls)
  │           └─→ services/api/client.ts (axios instance)
  ├─→ features/board/hooks/useBoard.ts
  │     └─→ stores/boardStore.ts
  ├─→ features/board/helpers.ts (data transformation)
  └─→ types/board.ts (TypeScript types)
```

### API Call Flow

```
Component
  ├─→ features/*/queries.ts (useQuery/useMutation hook)
  │     └─→ services/api/*.ts (API function)
  │           └─→ services/api/client.ts (apiClient.get/post)
  │                 ├─→ Request interceptor (adds Bearer token)
  │                 ├─→ Backend API call
  │                 └─→ Response interceptor (handles 401, refreshes token)
  └─→ Updates UI based on query state (data, isLoading, error)
```

### Authentication Flow

```
User Login
  └─→ services/api/auth.ts::login()
        └─→ apiClient.post('/api/auth/login')
              └─→ Response: { access_token, refresh_token }
                    └─→ stores/authStore.ts::setAuth()
                          ├─→ Saves tokens to cookies (utils/cookies.ts)
                          └─→ Updates state (isAuthenticated = true)

Protected Route Access
  └─→ features/auth/components/AuthGuard.tsx
        └─→ stores/authStore.ts::restoreAuth()
              ├─→ Reads token from cookies
              ├─→ Calls /api/auth/me to verify
              └─→ If valid: renders children, else: redirect to /login
```

### State Management Flow

```
Component
  └─→ const { state, action } = useStore()
        └─→ stores/*Store.ts (Zustand store)
              ├─→ State updates (set() function)
              └─→ Persists to localStorage (if configured)
```

## 📑 File Purpose Quick Reference

| File Pattern                  | Purpose            | Key Exports                                                        | Example Usage                               |
| ----------------------------- | ------------------ | ------------------------------------------------------------------ | ------------------------------------------- |
| `types/*.ts`                  | TypeScript types   | Interfaces, Types, Enums                                           | `import { Card } from '@/types/board'`      |
| `features/*/queries.ts`       | API query hooks    | `useQuery`, `useMutation` hooks                                    | `const { data } = useBoardsAllQuery()`      |
| `features/*/hooks/*.ts`       | Feature hooks      | Custom React hooks                                                 | `const { handleDrop } = useBoardHandlers()` |
| `features/*/components/*.tsx` | Feature components | React components                                                   | `<Board />`, `<ChatWindow />`               |
| `features/*/helpers.ts`       | Utility functions  | Pure functions                                                     | `convertBoardDataToNodes(data)`             |
| `services/api/*.ts`           | API clients        | Async functions                                                    | `await boardApi.getBoards()`                |
| `stores/*.ts`                 | State stores       | Zustand hooks                                                      | `const { user } = useAuthStore()`           |
| `components/*.tsx`            | Shared components  | Reusable components                                                | `<Button />`, `<Loading />`                 |
| `hooks/*.ts`                  | Shared hooks       | Cross-feature hooks                                                | `useClipboard()`, `useCopyToClipboard()`    |
| `utils/*.ts`                  | Utilities          | Pure helper functions                                              | `formatDate()`, `getCookie()`               |
| `utils/utm.ts`                | UTM helpers        | Parse UTM (+ utm_id) from URL, persist in sessionStorage, tab session_id |
| `utils/attribution.ts`        | Attribution queue  | Events only if any `utm_*` in payload; `landing_url` from query `landing_url` / `landing` if set, else current URL; queue, flush, drain |
| `utils/ymEngagement.ts`       | Yandex Metrika     | Sidebar explore/chat on\|off, device, client `registeredAt` localStorage, active-session sessionStorage key |

## 🔄 Common Code Patterns

### TanStack Query Pattern (API Integration)

```typescript
// In features/*/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardApi } from '@/services/api/boards';

// Query (GET)
export const useBoardsAllQuery = () => {
  return useQuery({
    queryKey: ['boards'],
    queryFn: () => boardApi.getBoards(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

// Mutation (POST/PUT/DELETE)
export const useCreateBoardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBoardRequest) => boardApi.createBoard(data),
    onSuccess: () => {
      // Invalidate cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
};

// Usage in component
function MyComponent() {
  const { data: boards, isLoading } = useBoardsAllQuery();
  const createBoard = useCreateBoardMutation();

  if (isLoading) return <Loading />;

  return (
    <div>
      {boards?.map((board) => (
        <div key={board.id}>{board.name}</div>
      ))}
      <button onClick={() => createBoard.mutate({ name: 'New Board' })}>
        Create
      </button>
    </div>
  );
}
```

### Zustand Store Pattern

```typescript
// In stores/*.ts
import { create } from 'zustand';

interface MyState {
  count: number;
  user: User | null;

  // Actions
  increment: () => void;
  setUser: (user: User) => void;
}

export const useMyStore = create<MyState>((set) => ({
  // Initial state
  count: 0,
  user: null,

  // Actions
  increment: () => set((state) => ({ count: state.count + 1 })),
  setUser: (user) => set({ user }),
}));

// Usage in component
function MyComponent() {
  const { count, increment, user } = useMyStore();

  return <button onClick={increment}>Count: {count}</button>;
}
```

### Feature Module Structure Pattern

```typescript
// features/myfeature/queries.ts - API integration
export const useItemsQuery = () => useQuery({...});
export const useCreateItemMutation = () => useMutation({...});

// features/myfeature/hooks/useMyFeature.ts - Business logic
export const useMyFeature = () => {
  const { data } = useItemsQuery();
  const createItem = useCreateItemMutation();

  const handleCreate = (item) => {
    createItem.mutate(item);
  };

  return { data, handleCreate };
};

// features/myfeature/components/MyFeature.tsx - UI
export const MyFeature = () => {
  const { data, handleCreate } = useMyFeature();

  return <div>...</div>;
};
```

### API Client Pattern

```typescript
// services/api/items.ts
import { apiClient } from './client';
import type { Item, CreateItemRequest } from '@/types';

export const itemsApi = {
  getAll: async (): Promise<Item[]> => {
    const { data } = await apiClient.get('/api/items');
    return data;
  },

  create: async (request: CreateItemRequest): Promise<Item> => {
    const { data } = await apiClient.post('/api/items', request);
    return data;
  },
};
```

### Navigation Configuration Pattern

```typescript
// In config/routes.ts - Route metadata for Next.js App Router
export type NavRoute = {
  path: string;
  layout: LayoutType;
  showInNav?: boolean;
  title?: string;
  layoutMode?: LayoutMode;
};

// Route metadata used by navigation components
// Note: Actual routing is handled by Next.js app/ directory structure

export type Route = {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  layout: LayoutType; // Layout type: guest (unauth), app (main pages), settings (profile/config)
  showInNav?: boolean; // Show in navigation
  title?: string; // Title for navigation (i18n key)
  layoutMode?: LayoutMode; // Sidebar mode: 'flow'=always overlay, 'grid'=never overlay, 'both'=respect toggle
};

export const ROUTES: Route[] = [
  // Guest routes (no auth required) - GuestLayout
  { path: '/login', component: AuthModal, layout: 'guest' },
  { path: '/register', component: AuthModal, layout: 'guest' },

  // Main app routes (auth required) - AppLayout with chat, news, AI
  {
    path: '/',
    component: MainPage,
    layout: 'app',
    showInNav: true,
    title: 'Обзор',
    layoutMode: 'both',
  },
  {
    path: '/ideas',
    component: IdeasPage,
    layout: 'app',
    showInNav: true,
    title: 'Идеи',
    layoutMode: 'both',
  },
  {
    path: '/ideas/:id',
    component: IdeaBoardPage,
    layout: 'app',
    layoutMode: 'flow',
  },
  {
    path: '/portfolio',
    component: PortfoliosPage,
    layout: 'app',
    showInNav: true,
    title: 'Портфель',
    layoutMode: 'both',
  },
  {
    path: '/portfolio/:id',
    component: PortfolioPage,
    layout: 'app',
    layoutMode: 'grid',
  },

  // Settings routes (auth required) - SettingsLayout without chat
  { path: '/profile', component: ProfilePage, layout: 'settings' },
];

// NAV_ROUTES used in TopNavigation for tabs
export const NAV_ROUTES = ROUTES.filter((route) => route.showInNav);

// In config/router.tsx - Automatic rendering with Suspense
const GUEST_ROUTES = ROUTES.filter((r) => r.layout === 'guest');
const APP_ROUTES = ROUTES.filter((r) => r.layout === 'app');
const SETTINGS_ROUTES = ROUTES.filter((r) => r.layout === 'settings');

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Guest routes (no auth required) - GuestLayout */}
      <Route element={<GuestLayout />}>
        {GUEST_ROUTES.map((route) => {
          const Component = route.component;
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <Suspense fallback={<Loading />}>
                  <Component />
                </Suspense>
              }
            />
          );
        })}
      </Route>

      {/* Main app routes (auth required) - AppLayout with chat, news, AI */}
      <Route element={<AppLayout />}>
        {APP_ROUTES.map((route) => {
          const Component = route.component;
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <AuthGuard>
                  <Suspense fallback={<Loading />}>
                    <Component />
                  </Suspense>
                </AuthGuard>
              }
            />
          );
        })}
      </Route>

      {/* Settings routes (auth required) - SettingsLayout without chat */}
      <Route element={<SettingsLayout />}>
        {SETTINGS_ROUTES.map((route) => {
          const Component = route.component;
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <AuthGuard>
                  <Suspense fallback={<Loading />}>
                    <Component />
                  </Suspense>
                </AuthGuard>
              }
            />
          );
        })}
      </Route>
    </Routes>
  );
};
```

## ⚙️ Configuration & Environment

**Dependencies:**

- `react-app-rewired` - CRA configuration override tool
- `@svgr/webpack` - SVG to React component transformer
- `url-loader` - URL/DataURL loader for webpack
- `dotenv` - Environment variable parser

### Required Environment Variables

**Next.js Client-Side Variables (in root `.env.local`):**

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000  # Required - backend API base URL
```

**Optional Configuration:**

```bash
NEXT_PUBLIC_CLOUDFRONT_URL=  # CloudFront CDN URL for assets
NEXT_PUBLIC_YM_ID=  # Yandex Metrika ID
NEXT_PUBLIC_GLITCHTIP_DSN=  # GlitchTip/Sentry DSN for error tracking
NEXT_PUBLIC_VERSION=0.8.0  # Application version
```

**Important:**

- All client-side environment variables in Next.js must be prefixed with `NEXT_PUBLIC_`
- Environment file must be in the **root directory** (not in `frontend/`)
- API URL is automatically constructed as `${NEXT_PUBLIC_BACKEND_URL}/api`

### Key Package Dependencies

From `package.json`:

**Core Framework:**

- **React** `^18.2.0` - UI library
- **Next.js** `^14.2.15` - Framework and routing
- **TypeScript** `^5.3.0` - Type safety

**File Parsing:**

- **xlsx** `^0.18.5` - Excel/CSV file parsing for table preview
- **mammoth** `^1.8.0` - DOCX file parsing to HTML for document preview

**State Management:**

- **Zustand** `^5.0.8` - Global state management
- **TanStack Query** `^5.90.3` - Server state & caching
- **TanStack Query Devtools** `^5.90.2` - Dev tools for debugging queries
- **TanStack Virtual** `^3.x` - Virtual scrolling for performance optimization

**API & Data:**

- **Axios** `^1.6.2` - HTTP client
- **js-cookie** `^3.0.5` - Cookie management (JWT tokens)
- **date-fns** `^4.1.0` - Date formatting and manipulation (relative dates, localization)

**UI Components:**

- **Material-UI** `^5.18.0` - UI component library
  - **Note:** Use `@mui/icons-material` for all icons in the application
  - **Example:** `import { Add, Close, Search } from '@mui/icons-material';`
- **@emotion/react** `^11.14.0` - CSS-in-JS
- **@emotion/styled** `^11.14.1` - Styled components
- **Tailwind CSS** `^3.4.17` - Utility-first CSS
- **react-toastify** `^9.1.3` - Toast notification system
- **finsignal-feed-explore** `^3.1.1` - News feed components with dark theme support (FeedList, FilterButton, SearchButton, SearchInput)

**Board/Canvas:**

- **ReactFlow** `^11.10.1` - Interactive node-based UI (Flow view)
- **react-grid-layout** `^1.5.2` - Draggable grid layout (Grid view)
- **@types/react-grid-layout** `^1.3.6` - TypeScript types for react-grid-layout

**Charts & Visualization:**

- **Recharts** `^3.2.1` - Chart library

**Dev Tools:**

- **React Scripts** `5.0.1` - Build tooling (CRA)
- **React App Rewired** `^2.2.1` - Override CRA config
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting

### Application Structure Notes

**State Management Strategy:**

- **TanStack Query** for server state (API data, caching, invalidation)
- **Zustand** for client state (UI state, user preferences, temporary data)
- **localStorage** for persistence (viewport, board preferences)
- **Cookies** for authentication tokens (httpOnly for security)

**Type Safety:**

- All API responses typed with TypeScript interfaces
- Strict mode enabled in `tsconfig.json`
- Path aliases configured (`@/` maps to `src/`)

**Build Configuration:**

- **Create React App** (with react-app-rewired for customization)
- **Tailwind CSS** integrated via PostCSS for all styling
- **Path aliases** configured in `tsconfig.json`
- **No CSS preprocessors** - Tailwind utilities only

### Proxy Configuration

From `package.json`:

- Next.js handles API routing and proxying automatically
- Environment variables are configured in root `.env.local` file
- Production builds use `NEXT_PUBLIC_BACKEND_URL` environment variable
- API client automatically constructs full API URL as `${NEXT_PUBLIC_BACKEND_URL}/api`

## 🆕 Recent Additions

### Toast Notification System Refactoring

**New Files:**

- `components/toast/CustomToast.tsx` - Generic toast component (success, error, warning, info)
- `components/toast/SignalToast.tsx` - Specialized toast for signal notifications
- `utils/toast.tsx` - Toast utility functions (showSuccessToast, showErrorToast, etc.)
- `config/toastConfig.ts` - React-toastify configuration (no inline styles)
- `styles/toast.css` - CSS overrides for react-toastify library
- `hooks/useCopyToClipboard.ts` - Copy to clipboard with toast notification

**Removed Files:**

- `components/Notification.tsx` - Replaced by react-toastify toast system
- `hooks/useNotifications.ts` - Replaced by utils/toast.tsx
- `stores/appStore.ts` - Removed global notification state (now using toast API)

**Modified Files:**

- `App.tsx` - Replaced Notification component with ToastContainer
- `hooks/useSignalSSE.ts` - Uses showSignalToast() instead of setNotification()
- All feature components and hooks - Migrated to new toast utility functions
- `package.json` - Added react-toastify dependency

**Features:**

- Unified toast notification system with react-toastify
- Tailwind CSS styling (no inline styles)
- Specialized toast components for different use cases
- Signal toasts with ticker icons and source branding
- Action buttons with navigation support
- Centralized toast API (utils/toast.tsx)

### Real-time Signal Notifications (SSE)

**New Files:**

- `hooks/useSignalSSE.ts` - SSE connection hook for real-time signal notifications
- `features/board/hooks/useCenterOnCard.ts` - Hook for centering viewport on specific card

**Modified Files:**

- `App.tsx` - Integrated `useSignalSSE` for authenticated users
- `pages/IdeaBoardPage.tsx` - Extracts `cardId` from URL and passes as `highlightCardId`
- `features/board/hooks/useBoard.ts` - Passes `isLoading` and `isSuccess` to `useCenterOnCard`
- `features/board/components/Board.tsx` - Accepts `highlightCardId` prop

**Features:**

- Real-time signal notifications via Server-Sent Events (SSE)
- Auto-updates card cache when signal received
- Toast notifications with ticker icons and links to boards
- Automatic viewport centering on target card when navigating from notification
- URL cleanup after centering (removes `cardId` query parameter)
- Fault-tolerant SSE implementation (never blocks webhook processing)

### Support Request Modal (D-1459)

**New Files:**

- `features/support/api/supportApi.ts` - API client for POST /api/support/request
- `features/support/components/SupportModal.tsx` - Support request modal (react-hook-form + zod, readonly name/email, reason dropdown, message textarea, clipboard copy for care@finam.ru)
- `features/support/index.ts` - Barrel export

**Modified Files:**

- `components/Sidebar/SidebarBottomActions.tsx` - Added "Поддержка" action item
- `components/Sidebar/Sidebar.tsx` - Wired SupportModal open/close state
- `i18n/locales/ru/common.json` - Added `sidebar.support` and `support.*` keys
- `i18n/locales/en/common.json` - Added `sidebar.support` and `support.*` keys

## 📖 Related Documentation

- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **TanStack Query**: https://tanstack.com/query/
- **Zustand**: https://zustand-demo.pmnd.rs/
- **React Flow**: https://reactflow.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Material-UI**: https://mui.com/
- **Next.js**: https://nextjs.org/
