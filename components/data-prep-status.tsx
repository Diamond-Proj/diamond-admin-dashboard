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
  
  // Handle data preparation when authenticated
  useEffect(() => {
    const dataPrep = async () => {
      setDataPrepStatus('loading');
      
      try {
        const dataPrepResponse = await fetch('/api/data_prep', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!dataPrepResponse.ok) {
          const errorDetail = await dataPrepResponse.text();
          console.error('Data preparation failed:', errorDetail);
          setDataPrepStatus('error');
          return;
        }

        console.log('Data preparation successful');
        setDataPrepStatus('success');
      } catch (error) {
        console.error('Data preparation failed:', error);
        setDataPrepStatus('error');
      }
    };

    if (isAuthenticated) {
      dataPrep();
    }
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
                : 'Data preparation has failed. Some functionality may be unavailable. Please try refreshing the page or contact support.'}
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
} 