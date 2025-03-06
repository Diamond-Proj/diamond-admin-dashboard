import { LoginButton } from '@/components/login-button';
import { is_authenticated } from '@/lib/authUtils';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function SignInPage() {
  // Check for authentication directly from cookies
  const tokensInCookies = cookies().get('tokens');
  const isAuthenticatedCookie = cookies().get('is_authenticated');
  const isAuthenticated = !!tokensInCookies || !!isAuthenticatedCookie;
  
  console.debug('Authentication status on SignIn Page:', isAuthenticated);

  // If already authenticated, redirect to home page
  if (isAuthenticated) {
    redirect('/');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <Image 
              src="/Diamond logo.png" 
              alt="Diamond Logo" 
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Welcome to Diamond</h2>
          <p className="mt-2 text-center text-gray-600">
            Please sign in with your Globus account to access the Diamond HPC service.
          </p>
        </div>
        
        <div className="mt-8 flex flex-col items-center">
          <LoginButton />
          <p className="mt-4 text-sm text-gray-500">
            By signing in, you agree to the Diamond service terms and conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
