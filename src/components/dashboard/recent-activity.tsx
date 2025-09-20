'use client';

import { CheckCircle, XCircle, Zap, Clock } from 'lucide-react';
import { type RecentTask } from '@/components/dashboard/dashboard.types';

const getActivityIcon = (status: RecentTask['status']) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4" />;
    case 'PENDING':
      return <Clock className="h-4 w-4" />;
    case 'RUNNING':
      return <Zap className="h-4 w-4" />;
    case 'FAILED':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getActivityColor = (status: RecentTask['status']) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-500';
    case 'PENDING':
      return 'bg-gray-500';
    case 'RUNNING':
      return 'bg-blue-500';
    case 'FAILED':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusBadgeStyle = (status: RecentTask['status']) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    case 'PENDING':
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700';
    case 'RUNNING':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700';
  }
};

const formatTimeAgo = (timeString: string) => {
  try {
    const date = new Date(timeString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  } catch {
    return timeString;
  }
};

const formatDateTime = (timeString: string) => {
  try {
    const date = new Date(timeString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return timeString;
  }
};

export function RecentActivity({
  recentTasks,
  loading
}: {
  recentTasks: RecentTask[];
  loading: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Recent Activity
      </h3>
      <div className="flex flex-col gap-4">
        {/* Loading skeleton */}
        {loading && (
          <>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-start space-x-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-600"></div>
                    <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-600"></div>
                    <div className="h-3 w-36 rounded bg-gray-200 dark:bg-gray-600"></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* No recent tasks found */}
        {!loading && recentTasks.length === 0 && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              No recent tasks found
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Tasks will appear here once you start submitting jobs
            </p>
          </div>
        )}

        {/* Recent tasks list */}
        {!loading &&
          recentTasks.length > 0 &&
          recentTasks.map((task) => (
            <div
              key={task.task_id}
              className="dark:hover:bg-gray-750 flex items-start space-x-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${getActivityColor(
                  task.status
                )}`}
              >
                {getActivityIcon(task.status)}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {task.name}
                  </p>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2 py-1 text-xs font-medium ${getStatusBadgeStyle(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <span className="mr-1 font-medium">Created:</span>
                      {formatDateTime(task.create_time)}
                    </span>
                    <span className="flex items-center">
                      <span className="mr-1 font-medium">Updated:</span>
                      {formatTimeAgo(task.last_update_time)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1 font-medium">Task ID:</span>
                    <span className="font-mono text-xs break-all">
                      {task.task_id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
