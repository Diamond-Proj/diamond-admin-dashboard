'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { initiateLogin } from '@/lib/globusAuth';
import { toast } from '@/components/ui/use-toast';

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async () => {
    try {
      setIsLoading(true);
      // Get the login URL from our Globus auth manager
      const loginUrl = initiateLogin();
      // Redirect to Globus Auth
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      
      // Show error toast to the user
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to initiate login. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Button
      variant={'outline'}
      size={'default'}
      onClick={handleLogin}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <span>Sign In with Globus</span>
      )}
    </Button>
  );
}
