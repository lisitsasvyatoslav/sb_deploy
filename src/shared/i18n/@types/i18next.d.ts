import 'i18next';
import type enCommon from '../locales/en/common.json';
import type enAuth from '../locales/en/auth.json';
import type enBoard from '../locales/en/board.json';
import type enChat from '../locales/en/chat.json';
import type enStatistics from '../locales/en/statistics.json';
import type enTicker from '../locales/en/ticker.json';
import type enSignal from '../locales/en/signal.json';
import type enBroker from '../locales/en/broker.json';
import type enPortfolio from '../locales/en/portfolio.json';
import type enErrors from '../locales/en/errors.json';
import type enProfile from '../locales/en/profile.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof enCommon;
      auth: typeof enAuth;
      board: typeof enBoard;
      chat: typeof enChat;
      statistics: typeof enStatistics;
      ticker: typeof enTicker;
      signal: typeof enSignal;
      broker: typeof enBroker;
      portfolio: typeof enPortfolio;
      errors: typeof enErrors;
      profile: typeof enProfile;
    };
  }
}
