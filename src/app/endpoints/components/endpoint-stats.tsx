'use client';

import { Server, CheckCircle2, AlertCircle, FolderOpen } from 'lucide-react';

interface EndpointStatsProps {
  totalEndpoints: number;
  managedEndpoints: number;
  availableEndpoints: number;
  configuredEndpoints: number;
}

export function EndpointStats({
  totalEndpoints,
  managedEndpoints,
  availableEndpoints,
  configuredEndpoints
}: EndpointStatsProps) {
  const statItems = [
    {
      label: 'Total Endpoints',
      value: totalEndpoints,
      icon: Server,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/50',
      hoverBorder: 'hover:border-purple-200 dark:hover:border-purple-600/50',
      hoverColor:
        'group-hover:text-purple-600 dark:group-hover:text-purple-400',
      hoverBgColor:
        'group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60'
    },
    {
      label: 'Managed',
      value: managedEndpoints,
      icon: CheckCircle2,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
      hoverBorder: 'hover:border-blue-200 dark:hover:border-blue-600/50',
      hoverColor: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
      hoverBgColor: 'group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60'
    },
    {
      label: 'Available',
      value: availableEndpoints,
      icon: AlertCircle,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/50',
      hoverBorder: 'hover:border-orange-200 dark:hover:border-orange-600/50',
      hoverColor:
        'group-hover:text-orange-600 dark:group-hover:text-orange-400',
      hoverBgColor:
        'group-hover:bg-orange-200 dark:group-hover:bg-orange-800/60'
    },
    {
      label: 'Configured',
      value: configuredEndpoints,
      icon: FolderOpen,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/50',
      hoverBorder: 'hover:border-green-200 dark:hover:border-green-600/50',
      hoverColor: 'group-hover:text-green-600 dark:group-hover:text-green-400',
      hoverBgColor: 'group-hover:bg-green-200 dark:group-hover:bg-green-800/60'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                  {stat.value}
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
