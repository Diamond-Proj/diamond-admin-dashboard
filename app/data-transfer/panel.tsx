'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
// Assuming these are the functions that interface with your backend to execute the tasks
import {registerContainer} from '@/lib/taskHandlers';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { PropsWithChildren, useEffect, useState } from 'react'

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"

import {
useGlobusAuth,
Provider as GlobusAuthorizationManagerProvider,
} from "@globus/react-auth-context";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { getTransferAPIToken } from '@/lib/globusAuth'

// Function to get auth.globus.org token from cookies
const getGlobusAuthToken = () => {
    if (typeof window === 'undefined') {
      return null;
    }
  
    try {
      const cookies = document.cookie.split(';');
      const tokensCookie = cookies.find(cookie => cookie.trim().startsWith('tokens='));
  
      if (!tokensCookie) {
        return null;
      }
  
      const tokensValue = decodeURIComponent(tokensCookie.split('=')[1]);
      const tokensByResourceServer = JSON.parse(tokensValue);
  
      // Look for auth.globus.org token
      if (tokensByResourceServer['auth.globus.org']) {
        return tokensByResourceServer['auth.globus.org'];
      }
  
      return null;
    } catch (error) {
      console.error('Error getting Globus Auth token:', error);
      return null;
    }
};

// Custom hook to get the transfer token
const useGlobusTransferAuth = () => {
    const [transferToken, setTransferToken] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<any>(null);
  
    useEffect(() => {
      // Get the transfer token using our enhanced function
      const token = getTransferAPIToken();
      const authTokenData = getGlobusAuthToken();
  
      console.log('Transfer token:', token);
      console.log('Auth token:', authTokenData);
  
      setTransferToken(token);
      setAuthToken(authTokenData);
  
      if (!token) {
        console.warn('No Transfer API token available - CollectionBrowser may not work');
        return;
      }
  
      // Monitor fetch requests to debug API calls
      const originalFetch = window.fetch;
      window.fetch = function(input: RequestInfo | URL, init: RequestInit = {}) {
        const url = typeof input === 'string' ? input : input.toString();
  
        // Log all Globus-related API calls
        if (url.includes('globus') || url.includes('transfer.api')) {
          console.log('🌐 Globus API call detected:', {
            url: url,
            method: init.method || 'GET',
            headers: init.headers,
            hasAuthHeader: !!(init.headers && Object.entries(init.headers || {}).some(([key]) => 
              key.toLowerCase() === 'authorization'
            ))
          });
        }
  
        return originalFetch(input, init);
      };
  
      // Cleanup
      return () => {
        window.fetch = originalFetch;
      };
    }, []);
  
    return { transferToken, authToken, hasValidToken: !!transferToken };
  };
  
  // Inner component that uses Globus hooks - must be inside GlobusProvider
  function GlobusTransferContent() {
      const { authorization } = useGlobusAuth();
      const { transferToken, authToken, hasValidToken } = useGlobusTransferAuth();
  
      useEffect(() => {
          if (!authorization || !transferToken || !authToken) {
              console.log('Authorization or tokens not available:', { 
                  hasAuthorization: !!authorization, 
                  hasTransferToken: !!transferToken,
                  hasAuthToken: !!authToken
              });
              return;
          }
  
          console.log('Authorization object type:', typeof authorization);
          console.log('Authorization object keys:', Object.keys(authorization));
          console.log('Authorization object methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(authorization)));
          console.log('Adding tokens to authorization context...');
  
          try {
              // Check what addTokenResponse expects
              console.log('addTokenResponse method:', typeof authorization.addTokenResponse);
  
              // First add the Globus Auth token (required for authenticated state)
              console.log('Adding auth.globus.org token...');
              // authorization.addTokenResponse({token: transferToken}); // did not work
              authorization.addTokenResponse({
                  access_token: authToken.access_token,
                  token_type: authToken.token_type || 'Bearer',
                  scope: authToken.scope || 'openid profile email',
                  resource_server: 'auth.globus.org',
                  expires_in: authToken.expires_in || 3600,
                  expires_at_seconds: authToken.expires_at_seconds || (Math.floor(Date.now() / 1000) + 3600),
                  id_token: authToken.id_token,
                  other_tokens: authToken.other_tokens
              });
  
              // Then add the Transfer API token
              console.log('Adding transfer.api.globus.org token...');
              authorization.addTokenResponse({
                  access_token: transferToken,
                  token_type: 'Bearer',
                  scope: 'urn:globus:auth:scope:transfer.api.globus.org:all',
                  resource_server: 'transfer.api.globus.org',
                  expires_in: 3600
              });
  
              console.log('✓ Successfully called addTokenResponse for both tokens');
  
              // Check immediately and after timeout
              console.log('Immediate authorization state:', {
                  authenticated: authorization.authenticated,
                  hasGlobusAuthToken: authorization.hasGlobusAuthToken(),
                  tokens: authorization.tokens,
                  storageKeys: Object.keys(authorization.storage)
              });
  
              setTimeout(() => {
                  console.log('Authorization state after timeout:', {
                      authenticated: authorization.authenticated,
                      hasGlobusAuthToken: authorization.hasGlobusAuthToken(),
                      tokens: authorization.tokens,
                      authorizationKeys: Object.keys(authorization)
                  });
              }, 100);
  
          } catch (error) {
              console.error('❌ Failed to add tokens to authorization context:', error);
              if (error instanceof Error) {
                  console.error('Error details:', {
                      name: error.name,
                      message: error.message,
                      stack: error.stack
                  });
              }
          }
      }, [authorization, transferToken, authToken]);
      

      return (
        <ResizablePanelGroup direction="horizontal" className="min-h-[400px] w-full rounded border">
            <ResizablePanel defaultSize={50} className="p-4">
                <h2 className="font-semibold mb-2">Source</h2>
                <div className="text-sm text-muted-foreground">Select source endpoint</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} className="p-4">
                <h2 className="font-semibold mb-2">Destination</h2>
                <div className="text-sm text-muted-foreground">Select destination endpoint</div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );

}


const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * Many errors encountered during queries need to be manually addressed,
         * so we disable automatic retries by default.
         */
        retry: false,
      },
    },
});

function reset() {
    queryClient.cancelQueries();
    queryClient.removeQueries();
    queryClient.clear();
}
  
  const QueryProvider = ({ children }: PropsWithChildren) => {
    const auth = useGlobusAuth();
    useEffect(() => {
      auth.authorization?.events.revoke.addListener(reset);
      auth.authorization?.events.authenticated.addListener(reset);
      return () => {
        auth.authorization?.events.revoke.removeListener(reset);
        auth.authorization?.events.authenticated.removeListener(reset);
      };
    }, [auth.authorization]);
    return (
      <>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </>
    );
  };
  
function DataTransferPanelContent() {
    const auth = useGlobusAuth();

    useEffect(() => {
        auth.authorization?.addTokenResponse({
            token: 'token-from-cookie',
            scope: 'transfer.api.globus.org',
        })
        auth.authorization?.events.revoke.addListener(reset);
        auth.authorization?.events.authenticated.addListener(reset);
        return () => {
        auth.authorization?.events.revoke.removeListener(reset);
        auth.authorization?.events.authenticated.removeListener(reset);
        };
    }, [auth.authorization]);
    console.log(auth); // Auth.isAuthenticated is false here.

    return (
        <ResizablePanelGroup direction="horizontal" className="min-h-[400px] w-full rounded border">
            <ResizablePanel defaultSize={50} className="p-4">
                <h2 className="font-semibold mb-2">Source</h2>
                <div className="text-sm text-muted-foreground">Select source endpoint</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} className="p-4">
                <h2 className="font-semibold mb-2">Destination</h2>
                <div className="text-sm text-muted-foreground">Select destination endpoint</div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}


export function DataTransferPanel({isAuthenticated}: {isAuthenticated: boolean}) {
    const [transferToken, setTransferToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    if (!isAuthenticated) {
        return (
        <div className="w-full rounded border p-6">
            <p className="text-sm text-muted-foreground">Please sign in to access Data Transfer.</p>
        </div>
        );
    }

    return (
        <GlobusAuthorizationManagerProvider client={process.env.NEXT_PUBLIC_GLOBUS_CLIENT_ID} scopes={process.env.NEXT_PUBLIC_GLOBUS_SCOPE} redirect=''>
            <QueryProvider>
                <GlobusTransferContent />
            </QueryProvider>
        </GlobusAuthorizationManagerProvider>
    );
}
