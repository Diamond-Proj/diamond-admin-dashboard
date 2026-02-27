'use client';

import { useEffect, useRef, useCallback } from 'react';
import { TokenManager } from './tokenManager.client';
import { useRouter } from 'next/navigation';

const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute

export function useTokenRefresh() {
  const router = useRouter();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  const refreshTokens = useCallback(async () => {
    if (isRefreshingRef.current) {
      console.log('Token refresh already in progress, skipping...');
      return false;
    }

    try {
      isRefreshingRef.current = true;
      console.log('Starting token refresh...');

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.status);

        if (response.status === 401) {
          console.log('Refresh token invalid, redirecting to login...');
          TokenManager.clearClientCookies();
          router.push('/sign-in');
        }

        return false;
      }

      const { tokens } = await response.json();
      TokenManager.setTokensInClientCookies(tokens);

      console.log('Tokens refreshed successfully');
      return true;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [router]);

  const checkAndRefresh = useCallback(async () => {
    const tokens = TokenManager.getTokensFromClientCookies();

    if (!tokens) {
      console.log('No tokens found, stopping auto-refresh');
      return;
    }

    if (TokenManager.isExpired(tokens)) {
      console.log('Tokens expired, attempting refresh...');
      await refreshTokens();
    } else if (TokenManager.needsRefresh(tokens)) {
      console.log('Tokens need refresh, refreshing...');
      await refreshTokens();
    }
  }, [refreshTokens]);

  useEffect(() => {
    // Check immediately on mount
    checkAndRefresh();

    // Set up periodic checking
    refreshTimerRef.current = setInterval(checkAndRefresh, CHECK_INTERVAL_MS);

    // Check on window focus
    const handleFocus = () => {
      console.log('Window focused, checking token status...');
      checkAndRefresh();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkAndRefresh]);

  return { refreshTokens };
}
