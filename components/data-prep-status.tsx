'use client';

import { useEffect, useState } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { registerAllEndpoints, loadAccountsPartitions } from '@/lib/taskHandlers';

// Define the data prep status type
export type DataPrepStatus = 'idle' | 'loading' | 'success' | 'error' | 'failed';

interface DataPrepStatusProps {
  initialIsAuthenticated: boolean;
}

interface EndpointResult {
  endpoint_name: string;
  success: boolean;
  completed: boolean;
}

const MAX_PARALLEL_CALLS = 5; // max number of endpoints to process at a time

export function DataPrepStatus({ initialIsAuthenticated }: DataPrepStatusProps) {
  const [isAuthenticated] = useState(initialIsAuthenticated);
  const [dataPrepStatus, setDataPrepStatus] = useState<DataPrepStatus>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0, currentEndpoint: '' });
  const [endpointResults, setEndpointResults] = useState<EndpointResult[]>([]);
  
  // Handle data preparation when authenticated
  useEffect(() => {
    const dataPrep = async () => {
      setDataPrepStatus('loading');
      
      try {
        // Step 1: Register all endpoints
        setProgress({ current: 0, total: 0, currentEndpoint: 'Registering endpoints...' });
        const registerData = await registerAllEndpoints();
        const endpoints = registerData.endpoints || [];
        // get only online endpoints
        const active_endpoints = endpoints.filter((endpoint: any) => endpoint["endpoint_status"] == "online")
        
        if (endpoints.length === 0) {
          console.error('No endpoints found');
          setDataPrepStatus('failed');
          return;
        }
        if (active_endpoints.length === 0) {
          console.error('No active endpoints found');
          setDataPrepStatus('failed');
          return;
        }

        // Initialize endpoint results
        const initialResults: EndpointResult[] = active_endpoints.map((endpoint: any) => ({
          endpoint_name: endpoint.endpoint_name,
          success: false,
          completed: false
        }));
        setEndpointResults(initialResults);

        setProgress({ current: 0, total: active_endpoints.length, currentEndpoint: 'Starting data preparation...' });

        // Step 2: Load accounts and partitions for endpoints with controlled parallelism
        const results = [];
        
        // Process endpoints in batches of MAX_PARALLEL_CALLS
        for (let i = 0; i < active_endpoints.length; i += MAX_PARALLEL_CALLS) {
          const batch = active_endpoints.slice(i, i + MAX_PARALLEL_CALLS);
          const batchIndices = Array.from({ length: batch.length }, (_, j) => i + j);
          
          // Process current batch in parallel
          const batchPromises = batch.map(async (endpoint: any, batchIndex: number) => {
            const index = batchIndices[batchIndex];
            try {
              setProgress({ 
                current: index, 
                total: active_endpoints.length, 
                currentEndpoint: `Loading data for ${endpoint.endpoint_name}...` 
              });

              // Add timeout for each endpoint (5 minutes)
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), 5 * 60 * 1000);
              });

              const loadPromise = loadAccountsPartitions({ endpoint_uuid: endpoint.endpoint_uuid });
              
              await Promise.race([loadPromise, timeoutPromise]);
              
              // Update endpoint result to success
              setEndpointResults(prev => prev.map((result, i) => 
                i === index ? { ...result, success: true, completed: true } : result
              ));
              
              setProgress({ 
                current: index + 1, 
                total: active_endpoints.length, 
                currentEndpoint: `Completed ${endpoint.endpoint_name}` 
              });

              return { success: true, endpoint: endpoint.endpoint_name };
            } catch (error) {
              console.error(`Error loading data for endpoint ${endpoint.endpoint_name}:`, error);
              
              // Update endpoint result to failure
              setEndpointResults(prev => prev.map((result, i) => 
                i === index ? { ...result, success: false, completed: true } : result
              ));
              
              setProgress({ 
                current: index + 1, 
                total: active_endpoints.length, 
                currentEndpoint: `Failed ${endpoint.endpoint_name}` 
              });
              return { success: false, endpoint: endpoint.endpoint_name };
            }
          });

          // Wait for current batch to complete before starting next batch
          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);
        }

        const failedEndpoints = results.filter(result => !result.success);

        if (failedEndpoints.length > 0) {
          console.warn('Some endpoints failed to load data:', failedEndpoints);
          // Still consider it a success if at least some endpoints loaded successfully
          if (failedEndpoints.length === results.length) {
            setDataPrepStatus('error');
            return;
          }
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
  
  const completedCount = endpointResults.filter(result => result.completed).length;
  const successCount = endpointResults.filter(result => result.success).length;
  
  return (
    <div className="flex items-center">
      <HoverCard openDelay={100} closeDelay={200}>
        <HoverCardTrigger asChild>
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-full py-1 px-3 shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-help">
            <div 
              className={`w-2.5 h-2.5 rounded-full mr-2 ${
                dataPrepStatus === 'loading' ? 'bg-yellow-400' : 
                dataPrepStatus === 'success' ? 'bg-green-500' : 
                dataPrepStatus === 'failed' ? 'bg-red-500' :
                'bg-red-500'
              }`}
            />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
              {dataPrepStatus === 'loading' 
                ? `Data preparation (${completedCount}/${endpointResults.length})` 
                : dataPrepStatus === 'success' 
                ? 'Data preparation complete' 
                : dataPrepStatus === 'failed'
                ? 'No endpoints available'
                : 'Data preparation failed'}
            </span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-4 shadow-lg" side="bottom" align="end">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Data Preparation Status</h4>
            
            {dataPrepStatus === 'loading' && endpointResults.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>Progress:</span>
                  <span>{completedCount} / {endpointResults.length}</span>
                </div>
                
                {/* Progress bar with splits */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 flex overflow-hidden">
                  {endpointResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex-1 h-full transition-all duration-300 ${
                        result.completed
                          ? result.success
                            ? 'bg-green-500'
                            : 'bg-red-500'
                          : 'bg-yellow-400'
                      } ${index > 0 ? 'ml-px' : ''}`}
                    />
                  ))}
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {progress.currentEndpoint}
                </p>
                
                {/* Endpoint status list */}
                <div className="space-y-1">
                  {endpointResults.map((result, index) => (
                    <div key={index} className="flex items-center text-xs">
                      <div 
                        className={`w-2 h-2 rounded-full mr-2 ${
                          result.completed
                            ? result.success
                              ? 'bg-green-500'
                              : 'bg-red-500'
                            : 'bg-yellow-400'
                        }`}
                      />
                      <span className="text-gray-600 dark:text-gray-300">
                        {result.endpoint_name}
                      </span>
                      <span className="ml-auto text-gray-500">
                        {result.completed
                          ? result.success
                            ? '✓'
                            : '✗'
                          : '...'}
                      </span>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Processing up to {MAX_PARALLEL_CALLS} endpoints at a time. This process may take several minutes.
                </p>
              </div>
            )}
            
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {dataPrepStatus === 'loading' 
                ? 'Registering endpoints and loading account/partition data. This process prepares necessary data for your session.'
                : dataPrepStatus === 'success'
                ? `Data preparation is complete. ${successCount} of ${endpointResults.length} endpoints loaded successfully.`
                : dataPrepStatus === 'failed'
                ? 'No active endpoints found. Please check your endpoint configuration.'
                : 'Data preparation has failed. Some functionality may be unavailable. Please try refreshing the page or contact support.'}
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
} 