'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { fetchAuthSession, notifyAuthSessionChanged } from './client';
import {
  AUTH_REFRESH_CHECK_INTERVAL_MS,
  AUTH_REFRESH_ENDPOINT,
  CLIENT_AUTH_REDIRECT_EXEMPT_ROUTES,
  pathnameMatches,
  SIGN_IN_ROUTE
} from './constants';

export function useTokenRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRefreshingRef = useRef(false);

  const refreshTokens = useCallback(async () => {
    if (isRefreshingRef.current) {
      console.log('Token refresh already in progress, skipping...');
      return false;
    }

    try {
      isRefreshingRef.current = true;
      console.log('Starting token refresh...');

      const response = await fetch(AUTH_REFRESH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.status);

        if (response.status === 401) {
          console.log('Refresh token invalid, redirecting to login...');
          router.push(SIGN_IN_ROUTE);
        }

        return false;
      }

      console.log('Tokens refreshed successfully');
      notifyAuthSessionChanged();
      router.refresh();
      return true;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [router]);

  const checkAndRefresh = useCallback(async () => {
    try {
      const session = await fetchAuthSession();

      if (!session.isAuthenticated) {
        console.log('No tokens found, stopping auto-refresh');
        if (!pathnameMatches(pathname, CLIENT_AUTH_REDIRECT_EXEMPT_ROUTES)) {
          router.push(SIGN_IN_ROUTE);
        }
        return;
      }

      if (session.needsRefresh) {
        console.log('Tokens need refresh, refreshing...');
        await refreshTokens();
      }
    } catch (error) {
      console.error('Failed to fetch auth session for refresh check:', error);
    }
  }, [pathname, refreshTokens, router]);

  useEffect(() => {
    // Check immediately on mount
    checkAndRefresh();

    // Set up periodic checking
    refreshTimerRef.current = setInterval(
      checkAndRefresh,
      AUTH_REFRESH_CHECK_INTERVAL_MS
    );

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
