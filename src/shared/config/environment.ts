export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

/**
 * Get CloudFront URL for ticker icon by security ID
 * @param securityId - Security ID from backend
 * @returns Full CloudFront URL for the ticker icon
 */
export const getTickerIconUrl = (securityId: number): string => {
  const cloudfrontUrl = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || '';
  return `${cloudfrontUrl}/security/56/${securityId}.png`;
};
