/**
 * Privacy Policy and Cookie Consent API Client
 */
import { apiClient } from './client';

export interface CookieConsentStatusResponse {
  accepted: boolean;
  currentVersion: number;
}

export interface CookieConsentAcceptResponse {
  success: boolean;
}

/**
 * Privacy Policy API service
 */
export const privacyPolicyApi = {
  /**
   * Get cookie policy content as plain text
   */
  async getCookiePolicy(): Promise<string> {
    const response = await apiClient.get<string>('/cookie-policy');
    return response.data;
  },

  /**
   * Check if the current user has accepted cookie consent
   */
  async checkCookieConsentStatus(): Promise<CookieConsentStatusResponse> {
    const response = await apiClient.get<CookieConsentStatusResponse>(
      '/cookie-policy/cookie-consent-status'
    );
    return response.data;
  },

  /**
   * Record user's acceptance of cookie consent
   */
  async acceptCookieConsent(
    versionNumber?: number
  ): Promise<CookieConsentAcceptResponse> {
    const response = await apiClient.post<CookieConsentAcceptResponse>(
      '/cookie-policy/accept-cookie-consent',
      versionNumber ? { versionNumber } : undefined
    );
    return response.data;
  },
};
