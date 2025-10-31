'use client';

import { Button } from '@/components/ui/button';
import { Server, CheckCircle2, Plus } from 'lucide-react';

interface EmptyStateProps {
  type: 'managed' | 'available';
  onAction?: () => void;
}

export function EmptyState({ type, onAction }: EmptyStateProps) {
  if (type === 'managed') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-700">
          <Server className="h-12 w-12 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          No Managed Endpoints
        </h3>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Add endpoints from the &quot;Available Endpoints&quot; tab to start
          managing them.
        </p>
        {onAction && (
          <Button onClick={onAction} className="mt-6 cursor-pointer gap-2">
            <Plus className="h-4 w-4" />
            Browse Available Endpoints
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-700">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
        All Endpoints Managed
      </h3>
      <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
        All your available endpoints are already under Diamond management.
      </p>
    </div>
  );
}
