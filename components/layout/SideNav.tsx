'use client';

import { useEffect, useState, useCallback } from 'react';
import { NavItem } from './nav-item';
import {
  SettingsIcon,
  EditIcon,
  FolderIcon,
  TaskIcon
} from '@/components/icons';
import { DashboardIcon, GlobeIcon, PersonIcon } from '@radix-ui/react-icons';
import { debounce } from 'lodash';

const navLinks = [
  { href: '/', label: 'Dashboard', Icon: DashboardIcon },
  { href: '/image-builder', label: 'Image Builder', Icon: GlobeIcon },
  { href: '/image-manager', label: 'Image Manager', Icon: FolderIcon },
  { href: '/job-composer', label: 'Job Composer', Icon: EditIcon },
  { href: '/task-manager', label: 'Task Manager', Icon: TaskIcon },
  { href: '/profile', label: 'Profile', Icon: PersonIcon },
  { href: '/settings', label: 'Settings', Icon: SettingsIcon }
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

  const checkAuth = useCallback(
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
        {[...Array(7)].map((_, i) => (
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
