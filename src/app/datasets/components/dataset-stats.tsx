'use client';

import { Database, Globe, Lock } from 'lucide-react';
import { DisplayDataset } from '../datasets.types';

interface DatasetStatsProps {
  datasets: DisplayDataset[];
  loading: boolean;
}

export function DatasetStats({ datasets, loading }: DatasetStatsProps) {
  const publicCount = datasets.filter((d) => d.public).length;
  const privateCount = datasets.filter((d) => !d.public).length;

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="group rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all duration-200 hover:border-purple-200 hover:shadow-md dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-purple-600/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Datasets
            </p>
            <p className="text-3xl font-bold text-gray-900 transition-colors duration-200 group-hover:text-purple-600 dark:text-gray-100 dark:group-hover:text-purple-400">
              {loading ? '--' : datasets.length}
            </p>
          </div>
          <div className="rounded-lg bg-purple-100 p-3 transition-colors duration-200 group-hover:bg-purple-200 dark:bg-purple-900/50 dark:group-hover:bg-purple-800/60">
            <Database className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      <div className="group rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-blue-600/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Public
            </p>
            <p className="text-3xl font-bold text-gray-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
              {loading ? '--' : publicCount}
            </p>
          </div>
          <div className="rounded-lg bg-blue-100 p-3 transition-colors duration-200 group-hover:bg-blue-200 dark:bg-blue-900/50 dark:group-hover:bg-blue-800/60">
            <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      <div className="group rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Private
            </p>
            <p className="text-3xl font-bold text-gray-900 transition-colors duration-200 group-hover:text-gray-700 dark:text-gray-100 dark:group-hover:text-gray-300">
              {loading ? '--' : privateCount}
            </p>
          </div>
          <div className="rounded-lg bg-gray-100 p-3 transition-colors duration-200 group-hover:bg-gray-200 dark:bg-gray-700/50 dark:group-hover:bg-gray-600/60">
            <Lock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
