'use client';

import { useEffect, useState, useMemo } from 'react';
import { NavItem } from './nav-item';
import { TaskIcon } from '@/components/icons';
import { DashboardIcon, PersonIcon } from '@radix-ui/react-icons';
import { Database, Container, Cpu } from 'lucide-react';
import { debounce } from '@/lib/debounce';

const navLinks = [
  { href: '/', label: 'Dashboard', Icon: DashboardIcon },
  { href: '/endpoints', label: 'Endpoints', Icon: Cpu },
  { href: '/images', label: 'Images', Icon: Container },
  { href: '/datasets', label: 'Datasets', Icon: Database },
  { href: '/tasks', label: 'Tasks', Icon: TaskIcon },
  { href: '/profile', label: 'Profile', Icon: PersonIcon },
];

export function SideNav({
  initialIsAuthenticated
}: {
  initialIsAuthenticated: boolean;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    initialIsAuthenticated
  );
  const [isLoading, setIsLoading] = useState(!initialIsAuthenticated);

  const checkAuth = useMemo(
    () =>
      debounce(() => {
        const cookies = document.cookie.split(';');
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

        const hasAuthCookie = cookies.some((cookie) => {
          const cookieName = cookie.trim().split('=')[0];
          return authCookies.includes(cookieName);
        });

        if (hasAuthCookie !== isAuthenticated || isLoading) {
          console.log('Navigation: Auth status changed to', hasAuthCookie);
          setIsAuthenticated(hasAuthCookie);
          setIsLoading(false);
        }
      }, 300),
    [isAuthenticated, isLoading]
  );

  useEffect(() => {
    checkAuth();

    const observer = new MutationObserver(checkAuth);
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true
    });

    const handleFocus = () => {
      checkAuth();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      observer.disconnect();
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="grid items-start gap-2 px-4 text-sm font-medium">
        {[...Array(navLinks.length)].map((_, i) => (
          <div
            key={i}
            className="h-10 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"
          ></div>
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="grid items-start px-4 text-sm font-medium">
      {navLinks.map(({ href, label, Icon }) => (
        <NavItem key={href} href={href}>
          <Icon className="h-6 w-6" />
          {label}
        </NavItem>
      ))}
    </nav>
  );
}
