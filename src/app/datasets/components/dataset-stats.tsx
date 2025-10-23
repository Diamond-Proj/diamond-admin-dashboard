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

  const statItems = [
    {
      label: 'Total Datasets',
      value: datasets.length,
      icon: Database,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/50',
      hoverBorder: 'hover:border-purple-200 dark:hover:border-purple-600/50',
      hoverColor:
        'group-hover:text-purple-600 dark:group-hover:text-purple-400',
      hoverBgColor:
        'group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60'
    },
    {
      label: 'Public',
      value: publicCount,
      icon: Globe,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
      hoverBorder: 'hover:border-blue-200 dark:hover:border-blue-600/50',
      hoverColor: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
      hoverBgColor: 'group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60'
    },
    {
      label: 'Private',
      value: privateCount,
      icon: Lock,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-700/50',
      hoverBorder: 'hover:border-gray-300 dark:hover:border-gray-600',
      hoverColor: 'group-hover:text-gray-700 dark:group-hover:text-gray-300',
      hoverBgColor: 'group-hover:bg-gray-200 dark:group-hover:bg-gray-600/60'
    }
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`group rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700/60 dark:bg-gray-800 ${stat.hoverBorder}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p
                  className={`text-3xl font-bold text-gray-900 transition-colors duration-200 dark:text-gray-100 ${stat.hoverColor}`}
                >
                  {loading ? '--' : stat.value}
                </p>
              </div>
              <div
                className={`rounded-lg p-3 transition-colors duration-200 ${stat.bgColor} ${stat.hoverBgColor}`}
              >
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
