import type { TranslateFn } from '@/shared/i18n';
import { logger } from '@/shared/utils/logger';
import { fetchLinkPreview } from '@/services/api/linkPreview';

export interface OGMetadata {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  siteName?: string;
  type?: string;
}

export const isValidUrl = (string: string): boolean => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

export const extractOGMetadata = async (
  url: string
): Promise<OGMetadata | null> => {
  if (!isValidUrl(url)) {
    return null;
  }

  try {
    const data = await fetchLinkPreview(url);
    return {
      title: data.title,
      description: data.description,
      image: data.image,
      url: data.url,
      siteName: data.domain,
    };
  } catch (error) {
    logger.error(
      'ogExtractor',
      'Error extracting OG metadata via backend',
      error
    );
    return createFallbackMetadata(url);
  }
};

const createSmartTitle = (hostname: string): string => {
  const cleanHostname = hostname.replace(/^www\./, '');
  const parts = cleanHostname.split('.');

  if (parts.length > 2) {
    const mainDomain = parts.slice(-2).join('.');
    return formatDomainName(mainDomain);
  }

  return formatDomainName(cleanHostname);
};

const formatDomainName = (domain: string): string => {
  const nameWithoutTld = domain.split('.').slice(0, -1).join('.');
  const withSpaces = nameWithoutTld.replace(/-/g, ' ');

  return withSpaces
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const createFaviconUrl = (urlObj: URL): string | undefined => {
  const { hostname } = urlObj;
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
};

export const createFallbackMetadata = (
  url: string,
  t?: TranslateFn
): OGMetadata => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    const smartTitle = createSmartTitle(hostname);
    const description = t ? t('ogCard.linkWithUrl', { url }) : `Link: ${url}`;
    const faviconUrl = createFaviconUrl(urlObj);

    return {
      title: smartTitle,
      description: description,
      url: url,
      siteName: hostname,
      image: faviconUrl,
    };
  } catch {
    return {
      title: t ? t('ogCard.link') : 'Link',
      description: url,
      url: url,
    };
  }
};

export const processImageUrl = (imageUrl: string, baseUrl: string): string => {
  if (!imageUrl) return '';

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  try {
    const base = new URL(baseUrl);
    return new URL(imageUrl, base.origin).href;
  } catch {
    return imageUrl;
  }
};
