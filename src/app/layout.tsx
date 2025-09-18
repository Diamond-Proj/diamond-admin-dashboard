import type { Metadata } from 'next';

import './globals.css';

import Link from 'next/link';

import { is_authenticated } from '@/lib/authUtils';

import { ThemeProvider } from 'next-themes';
import { Logo } from '@/components/icons';
import { Toaster } from '@/components/ui/toaster';
import { AuthStatus } from '@/components/auth-status';
import ThemeToggle from '@/components/layout/theme-toggle';

import { SideNav } from '@/components/layout/SideNav';

export const metadata: Metadata = {
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="overflow-x-hidden antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Main layout: sidebar + content area */}
          <div className="flex h-screen w-screen flex-col bg-gray-100/40 lg:flex-row dark:bg-gray-800/40">
            {/* Sidebar - Desktop only */}
            <div className="hidden h-full w-[220px] overflow-hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
              <div className="flex h-full flex-col">
                {/* Logo header */}
                <div className="flex h-[60px] items-center border-b px-7">
                  <Link
                    className="flex items-center gap-2 font-semibold"
                    href="/"
                  >
                    <Logo />
                    <span className="text-rose_red dark:text-honolulu_blue text-lg font-bold">
                      DIAMOND
                    </span>
                  </Link>
                </div>

                {/* Navigation menu */}
                <div className="flex-1 overflow-auto py-2">
                  <SideNav initialIsAuthenticated={isAuthenticated} />
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex h-full flex-1 flex-col overflow-hidden">
              {/* Top header */}
              <header className="flex h-14 items-center justify-between gap-4 border-b bg-gray-100/40 px-6 lg:h-[60px] lg:justify-end dark:bg-gray-800/40">
                {/* Mobile logo */}
                <Link
                  className="flex items-center gap-2 font-semibold lg:hidden"
                  href="/"
                >
                  <Logo />
                  <span className="text-rose_red dark:text-honolulu_blue">
                    DIAMOND
                  </span>
                </Link>

                <div className="flex items-center gap-4">
                  {/* Theme toggle button */}
                  <ThemeToggle />

                  {/* Status components */}
                  <AuthStatus />
                </div>
              </header>

              {/* Page content */}
              <main className="flex-1 overflow-auto bg-gray-100/40 dark:bg-gray-800/40">
                {children}
              </main>
            </div>

            {/* Toast notifications */}
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
