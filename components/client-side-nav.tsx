'use client';

import { useEffect, useState, useCallback } from 'react';
import { NavItem } from './nav-item';
import {
  SettingsIcon,
  EditIcon,
  UsersIcon,
  FolderIcon,
  TaskIcon,
  DataTransferIcon,
} from '@/components/icons';
import { DashboardIcon, GlobeIcon } from '@radix-ui/react-icons';
import { debounce } from 'lodash';

export function ClientSideNav({ initialIsAuthenticated }: { initialIsAuthenticated: boolean }) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [isLoading, setIsLoading] = useState(!initialIsAuthenticated);

  const checkAuth = useCallback(debounce(() => {
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
    
    const hasAuthCookie = cookies.some(cookie => {
      const cookieName = cookie.trim().split('=')[0];
      return authCookies.includes(cookieName);
    });
    
    if (hasAuthCookie !== isAuthenticated || isLoading) {
      console.log('Navigation: Auth status changed to', hasAuthCookie);
      setIsAuthenticated(hasAuthCookie);
      setIsLoading(false);
    }
  }, 300), [isAuthenticated, isLoading]);

  useEffect(() => {
    checkAuth();

    const observer = new MutationObserver(checkAuth);
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });

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
      <div className="grid items-start px-4 text-sm font-medium gap-2">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="grid items-start px-4 text-sm font-medium">
      <NavItem href="/">
        <DashboardIcon className="h-6 w-6" />
        Dashboard
      </NavItem>
      <NavItem href="/data-transfer">
        <DataTransferIcon className="h-6 w-6" />
        Data Transfer
      </NavItem>
      <NavItem href="/image-builder">
        <GlobeIcon className="h-6 w-6" />
        Image Builder
      </NavItem>
      <NavItem href="/image-manager">
        <FolderIcon className="h-6 w-6" />
        Image Manager
      </NavItem>
      <NavItem href="/job-composer">
        <EditIcon className="h-6 w-6" />
        Job Composer
      </NavItem>
      <NavItem href="/task-manager">
        <TaskIcon className="h-6 w-6" />
        Task Manager
      </NavItem>
      <NavItem href="/users">
        <UsersIcon className="h-6 w-6" />
        Users
      </NavItem>
      <NavItem href="/settings">
        <SettingsIcon className="h-6 w-6" />
        Settings
      </NavItem>
    </nav>
  );
} 