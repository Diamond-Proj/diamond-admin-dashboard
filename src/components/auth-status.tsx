'use client';

import { useEffect, useState } from 'react';
import { LoginButton } from './login-button';
import { UserAvatar } from './user-avatar';
import { DocsButton } from './docs-button';
import { usePathname } from 'next/navigation';
import { useTokenRefresh } from '@/lib/auth/useTokenRefresh';

export function AuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Enable automatic token refresh
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

    // Recheck periodically
    const interval = setInterval(checkAuth, 2000);

    // Check when window gains focus
    const handleFocus = () => checkAuth();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <DocsButton />
        <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <DocsButton />
      {isAuthenticated ? <UserAvatar /> : <LoginButton />}
    </div>
  );
}
