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

// Custom hook to set up authentication for Globus API calls
// This leverages the existing persistTokensInCookies structure
const useGlobusTransferAuth = () => {
  const [transferToken, setTransferToken] = useState<string | null>(null);
  useEffect(() => {

    // Get the transfer token using our enhanced function
    const token = getTransferAPIToken();
    setTransferToken(token);
    
    if (!token) {
      console.warn('No Transfer API token available - CollectionBrowser may not work');
      return;
    }

    // Store original fetch
    // const originalFetch = window.fetch;

    // // Create a custom fetch function that adds authorization headers for Globus API calls
    // window.fetch = function(input: RequestInfo | URL, init: RequestInit = {}) {
    //   const url = typeof input === 'string' ? input : input.toString();
      
    //   // Check if this is a Globus API call
    //   if (url.includes('globus.org') || url.includes('transfer.api.globus')) {
    //     const headers = new Headers(init.headers || {});
        
    //     // Add authorization header if not already present
    //     if (!headers.has('Authorization')) {
    //       headers.set('Authorization', `Bearer ${token}`);
    //     }
        
    //     init = {
    //       ...init,
    //       headers: headers
    //     };
    //   }
      
    //   return originalFetch(input, init);
    // };

    // Cleanup function to restore original fetch
    // return () => {
    //   window.fetch = originalFetch;
    // };
    
  }, []);
  
  return { transferToken, hasValidToken: !!transferToken };
};

// Inner component that uses Globus hooks - must be inside GlobusProvider
function GlobusTransferContent() {
    const { authorization } = useGlobusAuth();
    const { transferToken, hasValidToken } = useGlobusTransferAuth();
    
    useEffect(() => {
       if (!authorization || !authorization.tokenResponse) return;
       authorization.addTokenResponse({ transferToken });
    }, [authorization, transferToken]);

    if (!authorization || !authorization.tokenResponse) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-amber-600 mb-2">⚠️ Transfer API access not available</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Your authentication doesn't include Transfer API access.
                    </p>
                    <p className="text-xs text-gray-400">
                        Make sure the Transfer API scope is included in your Globus application configuration.
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
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel>
                    <h1 className="text-lg font-semibold mb-4">Source</h1>
                    <div data-globus-component>
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
                    <div data-globus-component>
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
        <GlobusProvider clientId={process.env.NEXT_PUBLIC_GLOBUS_CLIENT_ID} scope={process.env.NEXT_PUBLIC_GLOBUS_SCOPE} redirect=''>
            <GlobusTransferContent />
        </GlobusProvider>
    )
}
