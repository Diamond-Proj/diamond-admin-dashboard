'use client';

import { useEffect, useState } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

// Define the data prep status type
export type DataPrepStatus = 'idle' | 'loading' | 'success' | 'error';

interface DataPrepStatusProps {
  initialIsAuthenticated: boolean;
}

export function DataPrepStatus({ initialIsAuthenticated }: DataPrepStatusProps) {
  const [isAuthenticated] = useState(initialIsAuthenticated);
  const [dataPrepStatus, setDataPrepStatus] = useState<DataPrepStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Handle data preparation when authenticated
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let abortController: AbortController | null = null;
    
    const dataPrep = async () => {
      setDataPrepStatus('loading');
      
      try {
        abortController = new AbortController();
        timeoutId = setTimeout(() => {
          if (abortController) abortController.abort();
        }, 300000); // 5 minute timeout
        
        const dataPrepResponse = await fetch('/api/data_prep', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortController.signal,
          // Increase fetch timeout
          cache: 'no-store',
        });
        
        clearTimeout(timeoutId);

        if (!dataPrepResponse.ok) {
          let errorData;
          try {
            errorData = await dataPrepResponse.json();
          } catch (e) {
            // If JSON parsing fails, use text
            const textError = await dataPrepResponse.text();
            errorData = { message: textError || 'Unknown error' };
          }
          
          console.error('Data preparation failed:', errorData);
          setErrorMessage(errorData.message || `Error ${dataPrepResponse.status}`);
          setDataPrepStatus('error');
          return;
        }

        const responseData = await dataPrepResponse.json();
        console.log('Data preparation successful:', responseData);
        
        if (responseData.status === 'success') {
          setDataPrepStatus('success');
        } else {
          setErrorMessage(responseData.message || 'Unknown error');
          setDataPrepStatus('error');
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Data preparation failed:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Connection error');
        setDataPrepStatus('error');
      } finally {
        abortController = null;
      }
    };

    if (isAuthenticated) {
      dataPrep();
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (abortController) abortController.abort();
    };
  }, [isAuthenticated]);

  if (dataPrepStatus === 'idle' || !isAuthenticated) {
    return null;
  }
  
  return (
    <div className="flex items-center">
      <HoverCard openDelay={100} closeDelay={200}>
        <HoverCardTrigger asChild>
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-full py-1 px-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-help">
            <div 
              className={`w-2.5 h-2.5 rounded-full mr-2 ${
                dataPrepStatus === 'loading' ? 'bg-yellow-400' : 
                dataPrepStatus === 'success' ? 'bg-green-500' : 
                'bg-red-500'
              }`}
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
              {dataPrepStatus === 'loading' ? 'Data preparation in progress' : 
               dataPrepStatus === 'success' ? 'Data preparation complete' : 
               'Data preparation failed'}
            </span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-4 shadow-lg" side="bottom" align="end">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Important Notice</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {dataPrepStatus === 'loading' 
                ? 'You must wait for data preparation to complete before using any functionality. This process prepares necessary data for your session.'
                : dataPrepStatus === 'success'
                ? 'Data preparation is complete. You can now use all functionality.'
                : `Data preparation has failed: ${errorMessage}. Some functionality may be unavailable. Please try refreshing the page or contact support.`}
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
} 