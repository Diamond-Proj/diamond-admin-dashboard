'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Cpu, LogOut, UserCircle2 } from 'lucide-react';

import { TokenManager } from '@/lib/auth/tokenManager.client';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

function getCookieValue(name: string): string {
  if (typeof document === 'undefined') return '';

  const key = `${name}=`;
  const cookie = document.cookie
    .split(';')
    .find((item) => item.trim().startsWith(key));

  if (!cookie) return '';

  const rawValue = cookie.trim().slice(key.length);
  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

export function UserAvatar() {
  const [userName] = useState(() => getCookieValue('name') || 'User');
  const [userEmail] = useState(() => getCookieValue('email'));
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initials = (() => {
    if (!userName || userName === 'User') return 'U';
    const parts = userName.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  })();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      TokenManager.clearClientCookies();

      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of the Diamond service.'
      });

      await new Promise((resolve) => setTimeout(resolve, 350));
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);

      toast({
        title: 'Logout Error',
        description: 'There was a problem logging you out. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-300/70 bg-transparent p-0.5 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="Open account menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/15 text-primary text-[11px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="px-2.5 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {userName}
            </p>
            {userEmail && (
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {userEmail}
              </p>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-2.5 py-2">
          <Link href="/profile">
            <UserCircle2 className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-2.5 py-2">
          <Link href="/endpoints">
            <Cpu className="mr-2 h-4 w-4" />
            Endpoints
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer rounded-lg px-2.5 py-2 text-rose-600 focus:text-rose-700 dark:text-rose-400 dark:focus:text-rose-300"
          disabled={isLoggingOut}
          onSelect={(event) => {
            event.preventDefault();
            void handleLogout();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Signing out...' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
