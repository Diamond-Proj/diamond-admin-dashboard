'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCodeForTokens, persistTokensInCookies } from '@/lib/globusAuth';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [processingStep, setProcessingStep] = useState<string>('Initializing authentication...');

  useEffect(() => {
    async function processCallback() {
      try {
        // Check for error in the URL
        const errorParam = searchParams.get('error');
        if (errorParam) {
          const errorDescription = searchParams.get('error_description') || 'Authentication failed';
          const errorMessage = `${errorParam}: ${errorDescription}`;
          console.error('Auth callback error from URL:', errorMessage);
          setError(errorMessage);
          setIsProcessing(false);
          
          toast({
            title: "Authentication Error",
            description: errorMessage,
            variant: "destructive",
          });
          return;
        }

        // Get the code from the URL
        const code = searchParams.get('code');
        if (!code) {
          const errorMessage = 'No authorization code found in the callback URL';
          console.error(errorMessage);
          setError(errorMessage);
          setIsProcessing(false);
          
          toast({
            title: "Authentication Error",
            description: errorMessage,
            variant: "destructive",
          });
          return;
        }

        setProcessingStep('Exchanging authorization code for tokens...');
        console.log('Exchanging code for tokens...');
        
        try {
          // Exchange the code for tokens using our direct function
          const responseData = await exchangeCodeForTokens(code);
          
          console.log('Token exchange successful, received data structure:', Object.keys(responseData));
          
          setProcessingStep('Storing authentication data...');
          console.log('Storing tokens in cookies...');
          
          // Store tokens in cookies
          const success = persistTokensInCookies(responseData.tokens);
          
          if (!success) {
            throw new Error('Failed to store authentication tokens');
          }
          
          setProcessingStep('Preparing user data...');
          console.log('Calling data prep API...');
          
          const dataPrepResponse = await fetch('/api/data_prep', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
  
          if (!dataPrepResponse.ok) {
            const errorDetail = await dataPrepResponse.text();
            console.error('Data preparation failed:', errorDetail);
            throw new Error('Data preparation failed');
          }
  
          console.log('Data preparation successful');

          // Log success and show toast
          console.log('Authentication successful', { 
            userInfo: responseData.userInfo,
            tokenTypes: Object.keys(responseData.tokens)
          });
          
          toast({
            title: "Authentication Successful",
            description: `Welcome${responseData.userInfo?.name ? `, ${responseData.userInfo.name}` : ''}! You are now signed in.`,
            variant: "default",
          });
          
          setProcessingStep('Authentication complete! Redirecting...');
          
          // Redirect to the home page or a protected route
          setTimeout(() => {
            // Force a page refresh to ensure all components update
            window.location.href = '/';
          }, 1000); // Short delay to show the success message
        } catch (fetchError) {
          console.error('Error during token exchange:', fetchError);
          throw fetchError;
        }
      } catch (err) {
        console.error('Error processing auth callback:', err);
        
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        setIsProcessing(false);
        
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }

    processCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <h1 className="text-xl font-semibold text-red-700 mb-4">Authentication Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => router.push('/sign-in')}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Return to Sign In
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md w-full text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Completing Authentication</h1>
        <p className="text-gray-600 mb-4">{processingStep}</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
} 