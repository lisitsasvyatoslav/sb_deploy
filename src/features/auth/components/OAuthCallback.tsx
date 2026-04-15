'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/shared/i18n/client';
import { googleOAuth } from '@/services/oauth';
import { logger } from '@/shared/utils/logger';

/**
 * OAuth Callback Page
 * Handles the OAuth redirect after user consents on provider's page
 * This page receives the authorization code and exchanges it for tokens
 */
const OAuthCallback: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation('auth');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const isProcessing = useRef(false); // Protection against multiple calls
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    // Prevent multiple processing (React Strict Mode calls useEffect twice)
    if (isProcessing.current) {
      return;
    }
    isProcessing.current = true;

    const handleCallback = async () => {
      try {
        if (!searchParams) {
          throw new Error('No URL parameters found');
        }
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(
            error === 'access_denied'
              ? 'Authentication cancelled'
              : `OAuth error: ${error}`
          );
        }

        if (!code || !state) {
          throw new Error('Missing OAuth parameters');
        }

        // Validate state to prevent CSRF attacks
        const storedState = localStorage.getItem('oauth_state');
        if (state !== storedState) {
          throw new Error('Invalid state parameter. Possible CSRF attack.');
        }

        const provider = localStorage.getItem('oauth_provider');

        let result;
        switch (provider) {
          case 'Google':
            result = await googleOAuth.handleCallback(code, state);
            break;
          default:
            throw new Error('Unknown OAuth provider');
        }

        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { type: 'oauth_success', data: result },
            '*'
          );
          window.close();
        } else {
          setStatus('success');
          const returnUrl = localStorage.getItem('oauth_return_url') || '/';
          localStorage.removeItem('oauth_state');
          localStorage.removeItem('oauth_provider');
          localStorage.removeItem('oauth_return_url');

          timersRef.current.push(
            setTimeout(() => {
              router.push(returnUrl);
            }, 1500)
          );
        }
      } catch (err: unknown) {
        logger.error('OAuthCallback', 'OAuth callback error', err);
        const message =
          err instanceof Error ? err.message : 'Authentication failed';
        setErrorMessage(message);
        setStatus('error');

        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { type: 'oauth_error', error: message },
            '*'
          );
          timersRef.current.push(setTimeout(() => window.close(), 3000));
        } else {
          timersRef.current.push(
            setTimeout(() => {
              router.push('/login');
            }, 3000)
          );
        }
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-base p-5">
      <div className="max-w-[400px] w-full p-10 bg-white rounded-xl shadow-lg text-center">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-gray-200 border-t-accent rounded-full mx-auto mb-5 animate-spin" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              {t('oauth.completingLogin')}
            </h2>
            <p className="text-gray-600 text-sm mb-0">
              {t('oauth.pleaseWait')}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-5 flex items-center justify-center text-white">
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              {t('oauth.loginSuccess')}
            </h2>
            <p className="text-gray-600 text-sm mb-0">
              {t('oauth.redirecting')}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-500 rounded-full mx-auto mb-5 flex items-center justify-center text-white">
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">
              {t('oauth.loginError')}
            </h2>
            <p className="text-gray-600 text-sm mb-4">{errorMessage}</p>
            <p className="text-gray-400 text-xs mb-0">
              {t('oauth.redirectingToLogin')}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
