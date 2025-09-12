import { LoginButton } from '@/components/login-button';
import { is_authenticated } from '@/lib/authUtils';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function SignInPage() {
  // Check for authentication directly from cookies
  const cookieStore = await cookies();
  const tokensInCookies = cookieStore.get('tokens');
  const isAuthenticatedCookie = cookieStore.get('is_authenticated');
  const isAuthenticated = !!tokensInCookies || !!isAuthenticatedCookie;

  console.debug('Authentication status on SignIn Page:', isAuthenticated);

  // If already authenticated, redirect to home page
  if (isAuthenticated) {
    redirect('/');
  }

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4">
      <div className="bg-card text-card-foreground w-full max-w-md space-y-8 rounded-lg p-8 shadow-md">
        <div className="flex flex-col items-center">
          <div className="relative mb-4 h-32 w-32">
            <Image
              src="/Diamond logo.png"
              alt="Diamond Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <h2 className="text-foreground mt-2 text-2xl font-bold">
            Welcome to Diamond
          </h2>
          <p className="text-muted-foreground mt-2 text-center">
            Please sign in with your Globus account to access the Diamond HPC
            service.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <LoginButton />
          <p className="text-muted-foreground mt-4 text-sm">
            By signing in, you agree to the Diamond service terms and
            conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
