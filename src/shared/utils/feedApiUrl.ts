const FEED_API_URLS: Record<string, string> = {
  ru: 'https://explore-gateway.changesandbox.ru',
  us: 'https://us-explore-gateway.changesandbox.tech',
};

const DEFAULT_REGION = 'ru';

export const FEED_API_URL =
  FEED_API_URLS[
    process.env.DEPLOYMENT_REGION ||
      process.env.NEXT_PUBLIC_DEPLOYMENT_REGION ||
      DEFAULT_REGION
  ] ?? FEED_API_URLS[DEFAULT_REGION];
