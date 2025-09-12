import './globals.css';

import Link from 'next/link';
import { Logo } from '@/components/icons';
import { is_authenticated } from '@/lib/authUtils';
import { Toaster } from '@/components/ui/toaster';

import { AuthStatus } from '@/components/auth-status';
import ThemeToggle from '@/components/layout/ThemeToggle/theme-toggle';
import ThemeProvider from '@/components/layout/ThemeToggle/theme-provider';
import { SideNav } from '@/components/layout/SideNav';

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
    <html lang="en" className="scroll-smooth">
      <body className="overflow-x-hidden antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Main layout: sidebar + content area */}
          <div className="flex h-screen w-screen flex-col bg-gray-100/40 dark:bg-gray-800/40 lg:flex-row">
            {/* Sidebar - Desktop only */}
            <div className="hidden h-full w-[220px] overflow-hidden border-r bg-gray-100/40 dark:bg-gray-800/40 lg:block">
              <div className="flex h-full flex-col">
                {/* Logo header */}
                <div className="flex h-[60px] items-center border-b px-7">
                  <Link
                    className="flex items-center gap-2 font-semibold"
                    href="/"
                  >
                    <Logo />
                    <span className="text-lg font-bold text-rose_red dark:text-honolulu_blue">
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
              <header className="flex h-14 items-center justify-between gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 lg:h-[60px] lg:justify-end">
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
