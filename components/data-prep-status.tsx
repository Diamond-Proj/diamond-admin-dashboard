'use client';

import { useEffect, useState } from 'react';

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
          signal: AbortSignal.timeout(60000)
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
      <div 
        className={`w-2.5 h-2.5 rounded-full mr-2 ${
          dataPrepStatus === 'loading' ? 'bg-yellow-400' : 
          dataPrepStatus === 'success' ? 'bg-green-500' : 
          'bg-red-500'
        }`}
      />
      <span className="text-xs mr-4">
        {dataPrepStatus === 'loading' ? 'Data preparation in progress' : 
         dataPrepStatus === 'success' ? 'Data preparation complete' : 
         'Data preparation failed'}
      </span>
    </div>
  );
} 