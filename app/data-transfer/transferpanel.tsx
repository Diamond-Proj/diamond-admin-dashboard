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
import { useEffect, useState } from 'react'
import { Provider as GlobusProvider, useGlobusAuth } from '@globus/react-auth-context';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"

import { CollectionBrowser } from '@globus/react-components'

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

    // Add a test function to verify API connectivity
    const testApiConnectivity = async () => {
        if (!transferToken) return;
        
        try {
            console.log('Testing direct API call to endpoint_search...');
            const response = await fetch('https://transfer.api.globusonline.org/v0.10/endpoint_search?filter_non_functional=false&limit=50&filter_scope=hide-no-permissions&filter_fulltext=ncs', {
                headers: {
                    'Authorization': `Bearer ${transferToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Direct API response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('Direct API response data:', data);
            } else {
                console.error('Direct API error:', await response.text());
            }
        } catch (error) {
            console.error('Direct API call failed:', error);
        }
    };

    if (!transferToken) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-amber-600 mb-2">⚠️ Transfer API access not available</p>
                    <p className="text-sm text-gray-500 mb-4">
                        No transfer token found in authentication.
                    </p>
                    <p className="text-xs text-gray-400">
                        Make sure you're authenticated with Globus and have transfer permissions.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-sm text-green-600">
                ✓ Authenticated with Globus Transfer API
            </div>
            <div className="text-xs text-gray-500 mb-2">
                Token: {transferToken.substring(0, 20)}...
            </div>
            <div className="mb-4">
                <button 
                    onClick={testApiConnectivity}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Test API Connectivity
                </button>
            </div>
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel>
                    <h1 className="text-lg font-semibold mb-4">Source</h1>
                    <div>
                        <CollectionBrowser 
                            onSelect={(selection) => {
                                console.log('Selected source collection:', selection);
                                // You can now handle the selection for transfer operations
                                // The selection object contains:
                                // - collection: the selected collection info
                                // - path: optional path within the collection
                            }} 
                        />
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                    <h1 className="text-lg font-semibold mb-4">Destination</h1>
                    <div>
                        <CollectionBrowser 
                            onSelect={(selection) => {
                                console.log('Selected destination collection:', selection);
                                // Handle the destination selection for transfer operations
                            }} 
                        />
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}

export function DataTransferPanel({isAuthenticated}: {isAuthenticated: boolean}) {
    // Don't render if user is not authenticated
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Please sign in to access data transfer.</p>
                    <p className="text-sm text-gray-400">You need to authenticate with Globus to browse collections.</p>
                </div>
            </div>
        );
    }

    return (
        <GlobusProvider client={process.env.NEXT_PUBLIC_GLOBUS_CLIENT_ID} scopes={process.env.NEXT_PUBLIC_GLOBUS_SCOPE} redirect=''>
            <GlobusTransferContent />
        </GlobusProvider>
    )
}
