'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { LoginButton } from './login-button';
import { UserAvatar } from './user-avatar';
import { useTokenRefresh } from '@/lib/auth/useTokenRefresh';

export function AuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useTokenRefresh();

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const hasAuthCookie = cookies.some((cookie) => {
        const cookieName = cookie.trim().split('=')[0];
        return cookieName === 'is_authenticated' || cookieName === 'tokens';
      });

      setIsAuthenticated(hasAuthCookie);
      setIsLoading(false);
    };

    checkAuth();
    const interval = setInterval(checkAuth, 2000);
    const handleFocus = () => checkAuth();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-700/70" />
    );
  }

  return (
    <div className="flex items-center">
      {isAuthenticated ? <UserAvatar /> : <LoginButton />}
    </div>
  );
}
