import './globals.css';
import '@mantine/core/styles.css';

import Link from 'next/link';
import {
  Logo,
  SettingsIcon,
  EditIcon,
  UsersIcon,
  FolderIcon,
  TaskIcon,
} from '@/components/icons';
import { NavItem } from './nav-item';
import { is_authenticated } from '@/lib/authUtils';
import { Toaster } from '@/components/ui/toaster';
import { DashboardIcon, GlobeIcon } from '@radix-ui/react-icons';
import { ImageIcon } from '@radix-ui/react-icons';

import { AuthStatus } from '@/components/auth-status';
import { DataPrepStatus } from '@/components/data-prep-status';
import ThemeToggle from '@/components/layout/ThemeToggle/theme-toggle';
import ThemeProvider from '@/components/layout/ThemeToggle/theme-provider';
import { ClientSideNav } from '@/components/client-side-nav';
import { ClientMantineProvider } from '@/components/layout/mantine-provider';
import { ClientQueryProvider } from '@/components/layout/query-client-provider';

export const metadata = {
  title: 'Diamond Admin Dashboard',
  description:
    'Diamond admin dashboard configured with Flask server backend, SQLite database, Next.js, Tailwind CSS, TypeScript, and Prettier.'
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Get initial authentication status for server-side rendering
  const isAuthenticated = await is_authenticated();

  return (
    <html lang="en" className="h-full bg-baby_powder dark:bg-raisin_black">
      <body>
      <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
        <ClientQueryProvider>
          <ClientMantineProvider>
          <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
              <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-[60px] items-center border-b px-5">
                  <Link
                    className="flex items-center gap-2 font-semibold"
                    href="/"
                  >
                    <Logo />
                    <span className="text-rose_red dark:text-honolulu_blue">DIAMOND</span>
                  </Link>
                </div>
                <div className="flex-1 overflow-auto py-2 h-full">
                  {/* Replace with client-side navigation component */}
                  <ClientSideNav initialIsAuthenticated={isAuthenticated} />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 justify-between lg:justify-end">
                <Link
                  className="flex items-center gap-2 font-semibold lg:hidden"
                  href="/"
                >
                  <Logo />
                  <span className="text-rose_red dark:text-honolulu_blue">DIAMOND</span>
                </Link>

                <div className="flex items-center gap-4">
                  <DataPrepStatus initialIsAuthenticated={isAuthenticated} />
                  <AuthStatus />
                </div>

              </header>
              {children}
            </div>
            <div className="flex justify-end me-2 flex-col items-end mb-2">
                  <ThemeToggle />
            </div>
            <Toaster />
          </div>
          </ClientMantineProvider>
        </ClientQueryProvider>
      </ThemeProvider>
      </body>
    </html>
  );
}
