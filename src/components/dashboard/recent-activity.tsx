'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Zap, Server } from 'lucide-react';

interface RecentActivity {
  id: string;
  type:
    | 'job_submitted'
    | 'job_completed'
    | 'job_failed'
    | 'endpoint_registered'
    | 'dataset_uploaded'
    | 'image_built';
  message: string;
  timestamp: string;
  user?: string;
}

export function RecentActivity() {
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'job_completed',
          message: 'Molecular dynamics simulation completed successfully',
          timestamp: '2 minutes ago',
          user: 'alice@university.edu'
        },
        {
          id: '2',
          type: 'image_built',
          message: 'New container image "pytorch-gpu:latest" built',
          timestamp: '5 minutes ago',
          user: 'bob@research.org'
        },
        {
          id: '3',
          type: 'endpoint_registered',
          message: 'New compute endpoint "cluster-gpu-01" registered',
          timestamp: '15 minutes ago'
        },
        {
          id: '4',
          type: 'dataset_uploaded',
          message: 'Dataset "protein-structures-v2" uploaded to public catalog',
          timestamp: '30 minutes ago',
          user: 'charlie@lab.ac.uk'
        },
        {
          id: '5',
          type: 'job_failed',
          message: 'Image processing job failed due to memory limit',
          timestamp: '1 hour ago',
          user: 'david@institute.edu'
        }
      ];
      setRecentActivity(mockActivity);
      setLoading(false);
    }, 500);
  }, []);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'job_completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'job_submitted':
        return <Zap className="h-3 w-3" />;
      case 'job_failed':
        return <XCircle className="h-3 w-3" />;
      case 'endpoint_registered':
        return <Server className="h-3 w-3" />;
      case 'dataset_uploaded':
        return <CheckCircle className="h-3 w-3" />;
      case 'image_built':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Zap className="h-3 w-3" />;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'job_completed':
      case 'dataset_uploaded':
      case 'image_built':
        return 'bg-green-500';
      case 'job_submitted':
        return 'bg-blue-500';
      case 'job_failed':
        return 'bg-red-500';
      case 'endpoint_registered':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Recent Activity
      </h3>
      <div className="space-y-3">
        {loading
          ? // Loading skeleton
            [...Array(4)].map((_, i) => (
              <div key={i} className="flex animate-pulse items-start space-x-3">
                <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            ))
          : recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs text-white ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-900 dark:text-gray-100">
                    {activity.message}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{activity.timestamp}</span>
                    {activity.user && (
                      <>
                        <span>•</span>
                        <span>{activity.user}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
