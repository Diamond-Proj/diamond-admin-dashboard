'use client';

import { Button } from '@/components/ui/button';
import { Server, X, Loader2, Activity } from 'lucide-react';
import { DiamondPathForm } from './diamond-path-form';

interface Endpoint {
  endpoint_uuid: string;
  endpoint_name: string;
  is_managed: boolean;
  diamond_dir?: string;
}

interface EndpointDetail {
  endpoint_name: string;
  endpoint_uuid: string;
  endpoint_host: string;
  endpoint_status: string;
  diamond_dir: string;
}

interface ManagedEndpointCardProps {
  endpoint: Endpoint;
  endpointDetail?: EndpointDetail;
  isManaging: boolean;
  onRemove: () => void;
}

export function ManagedEndpointCard({
  endpoint,
  endpointDetail,
  isManaging,
  onRemove
}: ManagedEndpointCardProps) {
  const isOnline = endpointDetail?.endpoint_status === 'online';

  return (
    <div className="group rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700/60 dark:bg-gray-800">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {endpoint.endpoint_name}
              </h3>
              <p className="mt-0.5 font-mono text-xs text-gray-600 dark:text-gray-400">
                UUID: {endpoint.endpoint_uuid}
              </p>

              {!endpointDetail && (
                <div className="mt-2 flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Loading details...
                  </span>
                </div>
              )}

              {endpointDetail && (
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Activity
                      className={`h-3.5 w-3.5 ${
                        isOnline
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        isOnline
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {endpointDetail.endpoint_status}
                    </span>
                  </div>
                  {endpointDetail.endpoint_host && (
                    <>
                      <span className="text-gray-300 dark:text-gray-600">
                        •
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500 dark:text-gray-400">
                          Host:
                        </span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          {endpointDetail.endpoint_host}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={onRemove}
            disabled={isManaging}
            variant="ghost"
            size="sm"
            className="cursor-pointer gap-2 text-gray-600 transition-all hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/20 dark:hover:text-red-400"
          >
            {isManaging ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <X className="h-4 w-4" />
                Remove
              </>
            )}
          </Button>
        </div>

        <DiamondPathForm endpoint={endpoint} />
      </div>
    </div>
  );
}
