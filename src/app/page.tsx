import type { Metadata } from 'next';

import { LandingPage } from '@/components/landing/landing-page';
import { landingPageContent } from '@/content/landing-page-content';
import { TokenManagerServer } from '@/lib/auth/tokenManager.server';

export const metadata: Metadata = {
  description: landingPageContent.seo.description
};

export default async function HomePage() {
  const tokens = await TokenManagerServer.getTokensFromServerCookies();
  const session = TokenManagerServer.buildSession(tokens);

  return <LandingPage isAuthenticated={session.isAuthenticated} />;
}
