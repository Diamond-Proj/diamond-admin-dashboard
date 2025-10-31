'use client';

import { RefreshCw, Loader2 } from 'lucide-react';

interface SettingsHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function SettingsHeader({
  isRefreshing,
  onRefresh
}: SettingsHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-3xl font-bold">
          Endpoint Management
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your Diamond compute endpoints and configure work paths
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="group flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:from-green-700 hover:to-green-800 hover:shadow-md focus:ring-2 focus:ring-green-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRefreshing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin transition-transform duration-200" />
            Refreshing...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            Refresh Endpoints
          </>
        )}
      </button>
    </div>
  );
}
