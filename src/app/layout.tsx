import type { Metadata } from 'next';
import { IBM_Plex_Mono, Manrope, Sora } from 'next/font/google';

import './globals.css';

import { TokenManagerServer } from '@/lib/auth/tokenManager.server';
import { ThemeProvider } from 'next-themes';
import { AppShell } from '@/components/layout/app-shell';

export const metadata: Metadata = {
  title: 'Diamond Admin Dashboard',
  description:
    'Diamond admin dashboard configured with Flask server backend, SQLite database, Next.js, Tailwind CSS, TypeScript, and Prettier.'
};

const displayFont = Sora({
  subsets: ['latin'],
  variable: '--font-display'
});

const bodyFont = Manrope({
  subsets: ['latin'],
  variable: '--font-body'
});

const monoFont = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono'
});

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const tokens = await TokenManagerServer.getTokensFromServerCookies();
  const initialSession = TokenManagerServer.buildSession(tokens);

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} overflow-x-hidden antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppShell initialSession={initialSession}>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
