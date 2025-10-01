'use client';

import { Task } from '../tasks.types';
import { Play, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';

interface TaskStatsProps {
  tasks: Task[];
  loading: boolean;
}

export function TaskStats({ tasks, loading }: TaskStatsProps) {
  const stats = {
    total: tasks.length,
    running: tasks.filter((task) => task.status === 'RUNNING').length,
    completed: tasks.filter((task) => task.status === 'COMPLETED').length,
    pending: tasks.filter((task) => task.status === 'PENDING').length,
    failed: tasks.filter((task) => task.status === 'FAILED').length
  };

  const statItems = [
    {
      label: 'Total Tasks',
      value: stats.total,
      icon: Play,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/50',
      hoverBorder: 'hover:border-blue-200 dark:hover:border-blue-600/50',
      hoverColor: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
      hoverBgColor: 'group-hover:bg-blue-200 dark:group-hover:bg-blue-800/60'
    },
    {
      label: 'Running',
      value: stats.running,
      icon: Loader,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
      hoverBorder: 'hover:border-yellow-200 dark:hover:border-yellow-600/50',
      hoverColor:
        'group-hover:text-yellow-600 dark:group-hover:text-yellow-400',
      hoverBgColor:
        'group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800/60'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/50',
      hoverBorder: 'hover:border-green-200 dark:hover:border-green-600/50',
      hoverColor: 'group-hover:text-green-600 dark:group-hover:text-green-400',
      hoverBgColor: 'group-hover:bg-green-200 dark:group-hover:bg-green-800/60'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/50',
      hoverBorder: 'hover:border-orange-200 dark:hover:border-orange-600/50',
      hoverColor:
        'group-hover:text-orange-600 dark:group-hover:text-orange-400',
      hoverBgColor:
        'group-hover:bg-orange-200 dark:group-hover:bg-orange-800/60'
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/50',
      hoverBorder: 'hover:border-red-200 dark:hover:border-red-600/50',
      hoverColor: 'group-hover:text-red-600 dark:group-hover:text-red-400',
      hoverBgColor: 'group-hover:bg-red-200 dark:group-hover:bg-red-800/60'
    }
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
