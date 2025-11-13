'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { TokenManager } from '@/lib/auth/tokenManager.client';
import { toast } from '@/components/ui/use-toast';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // Clear tokens client-side using new TokenManager
      TokenManager.clearClientCookies();

      // Show success toast
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of the Diamond service.',
        variant: 'default'
      });

      // Small delay to allow toast to show
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect to sign-in page
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoading(false);

      // Show error toast
      toast({
        title: 'Logout Error',
        description: 'There was a problem logging you out. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Button
      variant={'outline'}
      size={'default'}
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Logging out...</span>
        </>
      ) : (
        <span>Logout</span>
      )}
    </Button>
  );
}
