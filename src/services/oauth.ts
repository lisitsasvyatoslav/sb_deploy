import { trackYMEvent } from '@/shared/hooks/useYandexMetrika';
import { apiClient, currentBoard } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { flushAttributionAfterAuth } from '@/shared/utils/attribution';
import { useChatStore } from '@/stores/chatStore';
import { logger } from '@/shared/utils/logger';
import { getYmSidebarEngagementParams } from '@/shared/utils/ymEngagement';

export interface OAuthProvider {
  name: string;
  getAuthUrl: () => Promise<{ authorization_url: string; state: string }>;
  handleCallback: (
    code: string,
    state: string
  ) => Promise<{
    accessToken: string;
    refreshToken?: string;
    boardId?: number;
    chatId?: number;
  }>;
}

/**
 * Google OAuth Mock Service
 * Simulates real Google OAuth flow for development/testing
 */
export const googleOAuth: OAuthProvider = {
  name: 'Google',

  /**
   * Step 1: Get authorization URL from backend
   * This would normally redirect to Google's OAuth consent screen
   */
  async getAuthUrl() {
    try {
      const response = await apiClient.get('/auth/google/url');
      return response.data;
    } catch (error) {
      logger.error('OAuth', 'Failed to get Google OAuth URL', error);
      throw error;
    }
  },

  /**
   * Step 2: Handle OAuth callback
   * Exchange authorization code for tokens
   */
  async handleCallback(code: string, state: string) {
    try {
      const response = await apiClient.get('/auth/google/callback', {
        params: { code, state },
      });

      const { accessToken, refreshToken, boardId, chatId } = response.data;

      if (!accessToken) {
        throw new Error('No access token received');
      }

      // Сохраняем токены в cookies
      useAuthStore.getState().setAuth(accessToken, refreshToken);

      // Загружаем данные пользователя через restoreAuth (избегаем дублирования запросов)
      await useAuthStore.getState().restoreAuth();

      await flushAttributionAfterAuth('login');

      // Store boardId if provided
      if (typeof boardId === 'number' && boardId > 0) {
        currentBoard.setId(boardId);
      }

      // Set active chat if created during OAuth registration
      if (typeof chatId === 'number' && chatId > 0) {
        useChatStore.getState().setActiveChatId(chatId);
      }

      // Same `login` goal as password login; new vs returning Google user is not distinguished yet.
      trackYMEvent('login', getYmSidebarEngagementParams());

      return response.data;
    } catch (error) {
      logger.error('OAuth', 'OAuth callback failed', error);
      throw error;
    }
  },
};

/**
 * Initiates OAuth flow by opening authorization URL in popup window
 * This simulates the real OAuth flow where user is redirected to provider's consent screen
 */
export function initiateOAuthFlow(
  provider: OAuthProvider,
  onSuccess: () => void,
  onError: (error: string) => void
) {
  provider
    .getAuthUrl()
    .then(({ authorization_url, state }) => {
      // Store state for validation in callback - используем localStorage чтобы popup мог получить доступ
      localStorage.setItem('oauth_state', state);
      localStorage.setItem('oauth_provider', provider.name);

      // Open OAuth consent screen in popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authorization_url,
        'oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        onError('Popup blocked. Please allow popups for this site.');
        return;
      }

      // Listen for OAuth callback
      const handleMessage = async (event: MessageEvent) => {
        // In production, validate event.origin
        if (event.data?.type === 'oauth_success') {
          window.removeEventListener('message', handleMessage);
          localStorage.removeItem('oauth_state');
          localStorage.removeItem('oauth_provider');

          // Обновляем состояние в основном окне
          await useAuthStore.getState().restoreAuth();

          await flushAttributionAfterAuth('login');

          onSuccess();
        } else if (event.data?.type === 'oauth_error') {
          window.removeEventListener('message', handleMessage);
          localStorage.removeItem('oauth_state');
          localStorage.removeItem('oauth_provider');
          onError(event.data.error || 'OAuth authentication failed');
        }
      };

      window.addEventListener('message', handleMessage);

      // Check if popup was closed without completing OAuth
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          // Don't show error if we already got success/error message
          const stateStillExists = localStorage.getItem('oauth_state');
          if (stateStillExists) {
            localStorage.removeItem('oauth_state');
            localStorage.removeItem('oauth_provider');
            onError('Authentication cancelled');
          }
        }
      }, 500);
    })
    .catch((error) => {
      logger.error('OAuth', 'Failed to initiate OAuth', error);
      onError('Failed to start authentication. Please try again.');
    });
}

/**
 * Alternative: Redirect-based OAuth flow (instead of popup)
 * Use this if popup approach doesn't work or for mobile devices
 */
export function initiateOAuthRedirect(provider: OAuthProvider) {
  provider
    .getAuthUrl()
    .then(({ authorization_url, state }) => {
      // Store state and return URL for validation in callback
      localStorage.setItem('oauth_state', state);
      localStorage.setItem('oauth_provider', provider.name);
      localStorage.setItem('oauth_return_url', window.location.pathname);

      // Redirect to OAuth consent screen
      window.location.href = authorization_url;
    })
    .catch((error) => {
      logger.error('OAuth', 'Failed to initiate OAuth', error);
      alert('Failed to start authentication. Please try again.');
    });
}
