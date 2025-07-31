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

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"

import { CollectionBrowser, Provider as GlobusProvider } from '@globus/react-components'
import { getTransferAPIToken } from '@/lib/globusAuth'

export function DataTransferPanel({isAuthenticated}: {isAuthenticated: boolean}) {
    const [transferToken, setTransferToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }

        // Get the transfer token using our enhanced function
        const token = getTransferAPIToken();
        setTransferToken(token);
        setIsLoading(false);
        
        if (!token) {
            console.warn('No Transfer API token available - CollectionBrowser may not work');
            return;
        }

        console.log('✓ Transfer API token available for CollectionBrowser');

        // Store original fetch
        const originalFetch = window.fetch;

        // Create a custom fetch function that adds authorization headers for Globus API calls
        window.fetch = function(input: RequestInfo | URL, init: RequestInit = {}) {
            const url = typeof input === 'string' ? input : input.toString();
            
            // Check if this is a Globus API call
            if (url.includes('globus.org') || url.includes('transfer.api.globus')) {
                const headers = new Headers(init.headers || {});
                
                // Add authorization header if not already present
                if (!headers.has('Authorization')) {
                    headers.set('Authorization', `Bearer ${token}`);
                    console.log('Added auth header to Globus API call:', url);
                }
                
                init = {
                    ...init,
                    headers: headers
                };
            }
            
            return originalFetch(input, init);
        };

        // Cleanup function to restore original fetch
        return () => {
            window.fetch = originalFetch;
        };
    }, [isAuthenticated]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-gray-500">Loading authentication...</p>
                </div>
            </div>
        );
    }

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

    if (!transferToken) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-amber-600 mb-2">⚠️ Transfer API access not available</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Your authentication doesn't include Transfer API access.
                    </p>
                    <p className="text-xs text-gray-400">
                        Make sure the Transfer API scope is included in your Globus application configuration:
                    </p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">
                        urn:globus:auth:scope:transfer.api.globus.org:all
                    </code>
                </div>
            </div>
        );
    }

    return (
        <GlobusProvider>
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-green-600">
                    <span>✓ Authenticated with Globus Transfer API</span>
                    <span className="text-xs text-gray-400">
                        (Token: {transferToken.substring(0, 8)}...)
                    </span>
                </div>
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel>
                        <h1 className="text-lg font-semibold mb-4">Source Collection</h1>
                        <div data-globus-component>
                            <CollectionBrowser 
                                onSelect={(selection) => {
                                    console.log('Selected source collection:', selection);
                                    // You can now handle the selection for transfer operations
                                    // The selection object contains:
                                    // - collection: the selected collection info
                                    // - path: optional path within the collection
                                    
                                    // Example: Store source selection
                                    // setSourceCollection(selection);
                                }} 
                            />
                        </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel>
                        <h1 className="text-lg font-semibold mb-4">Destination Collection</h1>
                        <div data-globus-component>
                            <CollectionBrowser 
                                onSelect={(selection) => {
                                    console.log('Selected destination collection:', selection);
                                    // Handle the destination selection for transfer operations
                                    
                                    // Example: Store destination selection
                                    // setDestinationCollection(selection);
                                }} 
                            />
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
                
                {/* Optional: Add transfer controls */}
                <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                        💡 Select source and destination collections above to enable transfer operations.
                    </p>
                    <p className="text-xs text-gray-400">
                        The transferToken ({transferToken.substring(0, 12)}...) is being used to authenticate all Globus API calls.
                    </p>
                </div>
            </div>
        </GlobusProvider>
    )
}