'use client';

import { useEffect, useState } from 'react';
import { LoginButton } from './login-button';
import { LogoutButton } from './logout-button';
import { useRouter, usePathname } from 'next/navigation';

export function AuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Function to check authentication status from cookies
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      console.log('Checking auth status, cookies:', cookies.map(c => c.trim().split('=')[0]));
      
      const authCookies = [
        'is_authenticated',
        'tokens',
        'access_token',
        'id_token',
        'refresh_token',
        'name',
        'email',
        'primary_identity'
      ];
      
      const hasAuthCookie = cookies.some(cookie => {
        const cookieName = cookie.trim().split('=')[0];
        return authCookies.includes(cookieName);
      });
      
      console.log('Auth status check result:', hasAuthCookie);
      
      // Only update state if it changed to avoid unnecessary re-renders
      if (hasAuthCookie !== isAuthenticated || isLoading) {
        setIsAuthenticated(hasAuthCookie);
        setIsLoading(false);
      }
    };

    // Check auth on mount and when pathname changes
    checkAuth();

    // Set up an interval to periodically check auth status
    const interval = setInterval(checkAuth, 2000);

    // Also check auth status when the window gets focus
    const handleFocus = () => {
      console.log('Window focused, checking auth status');
      checkAuth();
    };
    
    window.addEventListener('focus', handleFocus);

    // Clean up interval and event listener on unmount
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [pathname, isAuthenticated, isLoading]);

  if (isLoading) {
    return <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-md"></div>;
  }

  return isAuthenticated ? <LogoutButton /> : <LoginButton />;
} 