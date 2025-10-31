'use client';

import { Button } from '@/components/ui/button';
import { Server, Plus, Loader2 } from 'lucide-react';

interface Endpoint {
  endpoint_uuid: string;
  endpoint_name: string;
  is_managed: boolean;
  diamond_dir?: string;
}

interface AvailableEndpointCardProps {
  endpoint: Endpoint;
  isAdding: boolean;
  onAdd: () => void;
}

export function AvailableEndpointCard({
  endpoint,
  isAdding,
  onAdd
}: AvailableEndpointCardProps) {
  return (
    <div className="dark:hover:bg-gray-750 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
          <Server className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-gray-900 dark:text-white">
            {endpoint.endpoint_name}
          </h3>
          <p className="truncate font-mono text-xs text-gray-600 dark:text-gray-400">
            UUID: {endpoint.endpoint_uuid}
          </p>
        </div>
      </div>
      <Button
        onClick={onAdd}
        disabled={isAdding}
        size="sm"
        className="ml-4 cursor-pointer gap-2"
      >
        {isAdding ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Add
          </>
        )}
      </Button>
    </div>
  );
}
