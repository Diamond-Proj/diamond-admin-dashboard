'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearTokensFromCookies } from '@/lib/globusAuth';
import { toast } from '@/components/ui/use-toast';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear tokens from cookies
        clearTokensFromCookies();
        
        // Show success toast
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of the Diamond service.",
          variant: "default",
        });
        
        // Redirect to sign-in page
        router.push('/sign-in');
      } catch (error) {
        console.error('Logout error:', error);
        
        // Show error toast
        toast({
          title: "Logout Error",
          description: "There was a problem logging you out. Please try again.",
          variant: "destructive",
        });
        
        // Still redirect to sign-in page even if there's an error
        router.push('/sign-in');
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
        <p className="text-gray-600">Please wait while we log you out.</p>
      </div>
    </div>
  );
}