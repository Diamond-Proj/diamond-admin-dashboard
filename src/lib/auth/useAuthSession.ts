'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AUTH_SESSION_CHANGED_EVENT } from './constants';
import { createDefaultAuthSession, fetchAuthSession } from './client';
import type { AuthSession } from './types';

export function useAuthSession(initialSession?: AuthSession) {
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession>(
    initialSession ?? createDefaultAuthSession()
  );
  const [isLoading, setIsLoading] = useState(!initialSession);

  const refreshSession = useCallback(async () => {
    try {
      const nextSession = await fetchAuthSession();
      setSession(nextSession);
      return nextSession;
    } catch (error) {
      console.error('Failed to refresh auth session:', error);
      const fallbackSession = createDefaultAuthSession();
      setSession(fallbackSession);
      return fallbackSession;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [pathname, refreshSession]);

  useEffect(() => {
    const handleFocus = () => {
      void refreshSession();
    };

    const handleSessionChanged = () => {
      void refreshSession();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChanged);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener(
        AUTH_SESSION_CHANGED_EVENT,
        handleSessionChanged
      );
    };
  }, [refreshSession]);

  return {
    session,
    isLoading,
    refreshSession,
    setSession
  };
}
