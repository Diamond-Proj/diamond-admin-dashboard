'use client';

import { Database, Globe, Lock, Copy, Check } from 'lucide-react';
import { DisplayDataset } from '../datasets.types';
import { useToast } from '@/components/ui/use-toast';
import { useState, useMemo } from 'react';
import { debounce } from '@/lib/debounce';

interface DatasetListProps {
  datasets: DisplayDataset[];
  loading: boolean;
}

export function DatasetList({ datasets, loading }: DatasetListProps) {
  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading datasets...
        </p>
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Database className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
          No datasets found
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {datasets.map((dataset) => (
        <DatasetListItem key={dataset.id} dataset={dataset} />
      ))}
    </div>
  );
}

function DatasetListItem({ dataset }: { dataset: DisplayDataset }) {
  const { toast } = useToast();
  const [copiedItem, setCopiedItem] = useState<'path' | 'uuid' | null>(null);

  const resetCopiedItem = useMemo(
    () =>
      debounce(() => {
        setCopiedItem(null);
      }, 1500),
    []
  );

  const copyToClipboard = async (text: string, type: 'path' | 'uuid') => {
    try {
      await navigator.clipboard.writeText(text);

      // Set the copied item for visual feedback
      setCopiedItem(type);

      // Show toast notification
      toast({
        description: (
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
              <Check className="h-3 w-3 text-white" />
            </div>
            <span className="font-medium">
              {type === 'path' ? 'Dataset path' : 'Collection UUID'} copied!
            </span>
          </div>
        ),
        duration: 2000,
        className:
          'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
      });

      // Reset the copied state after animation
      resetCopiedItem();
    } catch {
      toast({
        description: (
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500">
              <span className="text-xs text-white">✕</span>
            </div>
            <span className="font-medium">Failed to copy to clipboard</span>
          </div>
        ),
        duration: 3000,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="group rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300/80 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600/80">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-3">
            <h3 className="text-xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-purple-600 dark:text-gray-100 dark:group-hover:text-purple-400">
              Dataset {dataset.id}
            </h3>
            <div className="flex items-center gap-2">
              {dataset.public ? (
                <div className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  <Globe className="h-3 w-3" />
                  Public
                </div>
              ) : (
                <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  <Lock className="h-3 w-3" />
                  Private
                </div>
              )}
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/50 dark:text-green-300">
                Active
              </span>
            </div>
          </div>

          <p className="mb-4 leading-relaxed text-gray-600 dark:text-gray-400">
            {dataset.description}
          </p>

          <div className="mb-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
              <span className="block text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Size
              </span>
              <span className="mt-1 block font-semibold text-gray-900 dark:text-gray-100">
                {dataset.size}
              </span>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
              <span className="block text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Format
              </span>
              <span className="mt-1 block font-semibold text-gray-900 dark:text-gray-100">
                {dataset.format}
              </span>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
              <span className="block text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                Machine
              </span>
              <span className="mt-1 block font-semibold text-gray-900 dark:text-gray-100">
                {dataset.machine_name}
              </span>
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-4 dark:border-gray-700">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Dataset Path
                </span>
                <span className="mt-1 block truncate font-mono text-sm text-gray-700 dark:text-gray-300">
                  {dataset.dataset_path}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(dataset.dataset_path, 'path')}
                className={`ml-3 cursor-pointer rounded-md p-2 transition-all duration-200 ${
                  copiedItem === 'path'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                    : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300'
                }`}
                title={copiedItem === 'path' ? 'Copied!' : 'Copy path'}
              >
                {copiedItem === 'path' ? (
                  <Check className="h-4 w-4 animate-pulse" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
                  Collection UUID
                </span>
                <span className="mt-1 block truncate font-mono text-sm text-gray-700 dark:text-gray-300">
                  {dataset.collection_uuid}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(dataset.collection_uuid, 'uuid')}
                className={`ml-3 cursor-pointer rounded-md p-2 transition-all duration-200 ${
                  copiedItem === 'uuid'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                    : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300'
                }`}
                title={copiedItem === 'uuid' ? 'Copied!' : 'Copy UUID'}
              >
                {copiedItem === 'uuid' ? (
                  <Check className="h-4 w-4 animate-pulse" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
