'use client';

import { type CSSProperties, type ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';

import { Logo } from '@/components/icons';
import { AuthStatus } from '@/components/auth-status';
import { DocsButton } from '@/components/docs-button';
import ThemeToggle from '@/components/layout/theme-toggle';
import { SideNav } from '@/components/layout/SideNav';
import { EndpointOnboarding } from '@/components/onboarding/endpoint-onboarding';
import { Toaster } from '@/components/ui/toaster';

const routeTitles = [
  { match: (path: string) => path === '/', title: 'Dashboard' },
  { match: (path: string) => path.startsWith('/sign-in'), title: 'Sign In' },
  { match: (path: string) => path.startsWith('/images'), title: 'Images' },
  { match: (path: string) => path.startsWith('/datasets'), title: 'Datasets' },
  { match: (path: string) => path.startsWith('/tasks'), title: 'Tasks' },
  { match: (path: string) => path.startsWith('/endpoints'), title: 'Endpoints' },
  { match: (path: string) => path.startsWith('/profile'), title: 'Profile' }
];

const getFallbackTitle = (path: string) => {
  const firstSegment = path.split('/').filter(Boolean)[0];
  if (!firstSegment) return 'Dashboard';
  return firstSegment
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

export function AppShell({
  children,
  isAuthenticated
}: {
  children: ReactNode;
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [desktopNavCollapsed, setDesktopNavCollapsed] = useState(false);
  const currentTitle =
    routeTitles.find((item) => item.match(pathname))?.title ||
    getFallbackTitle(pathname);

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,57,84,0.03),transparent_36%),radial-gradient(circle_at_top_right,rgba(14,121,178,0.03),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-size-[48px_48px] opacity-25 dark:opacity-20" />

      <div
        className="relative grid h-full grid-cols-1 transition-[grid-template-columns] duration-300 ease-out lg:grid-cols-(--shell-cols)"
        style={
          {
            '--shell-cols': desktopNavCollapsed
              ? '90px minmax(0,1fr)'
              : '208px minmax(0,1fr)'
          } as CSSProperties
        }
      >
        <aside className="hidden min-h-0 lg:block">
          <div className="flex h-full min-h-0 flex-col overflow-hidden border-r border-slate-200/70 bg-[hsl(var(--dashboard-surface))] dark:border-slate-700/70">
            <div
              className={`flex h-16 shrink-0 items-center border-b border-slate-200/60 dark:border-slate-700/60 px-6`}
            >
              <Link className="flex items-center gap-2 font-semibold" href="/">
                <Logo className="drop-shadow-sm" />
                <span
                  className={`text-rose_red dark:text-honolulu_blue overflow-hidden whitespace-nowrap text-lg font-bold tracking-wide transition-[max-width,opacity,margin] duration-300 ease-out ${
                    desktopNavCollapsed
                      ? 'ml-0 max-w-0 opacity-0'
                      : 'ml-1 max-w-35 opacity-100'
                  }`}
                >
                  DIAMOND
                </span>
              </Link>
            </div>
            <div className="min-h-0 flex-1 overflow-auto py-4">
              <SideNav compact={desktopNavCollapsed} />
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[hsl(var(--dashboard-stroke))] bg-[hsl(var(--dashboard-surface))] px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-300/70 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800 lg:inline-flex"
                onClick={() => setDesktopNavCollapsed((collapsed) => !collapsed)}
                aria-label="Toggle sidebar"
              >
                {desktopNavCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>

              <button
                type="button"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-300/70 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
              <h1 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                {currentTitle}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <DocsButton />
              <ThemeToggle />
              <AuthStatus />
            </div>
          </header>

          <div className="min-h-0 flex-1">
            <main className="h-full overflow-auto">
              <div className="px-4 py-4 md:px-6 md:py-6">{children}</div>
            </main>
          </div>
        </section>
      </div>

      <div
        className={`fixed inset-0 z-40 transition lg:hidden ${
          mobileNavOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <button
          type="button"
          className={`absolute inset-0 cursor-pointer bg-black/45 backdrop-blur-sm transition-opacity ${
            mobileNavOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMobileNavOpen(false)}
          aria-label="Close navigation"
        />
        <aside
          className={`absolute inset-y-0 left-0 w-60 border-r border-slate-200/70 bg-[hsl(var(--dashboard-surface))] p-0 transition-transform dark:border-slate-700/70 ${
            mobileNavOpen ? 'translate-x-0' : '-translate-x-[120%]'
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-200/60 px-5 dark:border-slate-700/60">
            <Link
              className="flex items-center gap-2 font-semibold"
              href="/"
              onClick={() => setMobileNavOpen(false)}
            >
              <Logo className="drop-shadow-sm" />
              <span className="text-rose_red dark:text-honolulu_blue text-base font-bold tracking-wide">
                DIAMOND
              </span>
            </Link>
            <button
              type="button"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-auto py-3">
              <SideNav />
            </div>
          </div>
        </aside>
      </div>

      <Toaster />
      <EndpointOnboarding isAuthenticated={isAuthenticated} />
    </div>
  );
}
