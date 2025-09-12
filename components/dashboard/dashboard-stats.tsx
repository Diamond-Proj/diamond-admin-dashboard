'use client';

import { useEffect, useState } from 'react';
import {
  BarChart3,
  Activity,
  Server,
  Database,
  Container,
  WifiOff,
  Lock,
  Globe,
  XCircle,
  CheckCircle
} from 'lucide-react';

export interface DashboardStats {
  jobs: {
    completed: number;
    running: number;
    failed: number;
  };
  endpoints: {
    online: number;
    offline: number;
  };
  datasets: {
    public: number;
    private: number;
  };
  images: {
    public: number;
    private: number;
  };
}

export function DashboardStatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      const mockStats: DashboardStats = {
        jobs: {
          completed: 1198,
          running: 23,
          failed: 26
        },
        endpoints: {
          online: 8,
          offline: 2
        },
        datasets: {
          public: 45,
          private: 123
        },
        images: {
          public: 32,
          private: 67
        }
      };
      setStats(mockStats);
      setLoading(false);
    }, 500);
  }, []);

  // Calculate totals and percentages
  const jobsTotal = stats
    ? stats.jobs.completed + stats.jobs.running + stats.jobs.failed
    : 0;
  const jobsCompletionRate =
    stats && jobsTotal > 0 ? (stats.jobs.completed / jobsTotal) * 100 : 0;
  const jobsRunningRate =
    stats && jobsTotal > 0 ? (stats.jobs.running / jobsTotal) * 100 : 0;
  const jobsFailureRate =
    stats && jobsTotal > 0 ? (stats.jobs.failed / jobsTotal) * 100 : 0;

  const endpointsTotal = stats
    ? stats.endpoints.online + stats.endpoints.offline
    : 0;
  const endpointsOnlineRate =
    stats && endpointsTotal > 0
      ? (stats.endpoints.online / endpointsTotal) * 100
      : 0;
  const endpointsOfflineRate =
    stats && endpointsTotal > 0
      ? (stats.endpoints.offline / endpointsTotal) * 100
      : 0;

  const datasetsTotal = stats
    ? stats.datasets.public + stats.datasets.private
    : 0;
  const datasetsPublicRate =
    stats && datasetsTotal > 0
      ? (stats.datasets.public / datasetsTotal) * 100
      : 0;
  const datasetsPrivateRate =
    stats && datasetsTotal > 0
      ? (stats.datasets.private / datasetsTotal) * 100
      : 0;

  const imagesTotal = stats ? stats.images.public + stats.images.private : 0;
  const imagesPublicRate =
    stats && imagesTotal > 0 ? (stats.images.public / imagesTotal) * 100 : 0;
  const imagesPrivateRate =
    stats && imagesTotal > 0 ? (stats.images.private / imagesTotal) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Jobs Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Jobs
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '---' : jobsTotal.toLocaleString()}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {loading ? '---' : stats?.jobs.completed}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? '(-%%)' : `(${jobsCompletionRate.toFixed(1)}%)`}
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${jobsCompletionRate}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="mr-2 h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Running
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {loading ? '--' : stats?.jobs.running}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? '(-%%)' : `(${jobsRunningRate.toFixed(1)}%)`}
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-yellow-500"
              style={{ width: `${jobsRunningRate}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Failed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {loading ? '--' : stats?.jobs.failed}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? '(-%%)' : `(${jobsFailureRate.toFixed(1)}%)`}
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-red-500"
              style={{ width: `${jobsFailureRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Endpoints Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Endpoints
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '--' : endpointsTotal}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Server className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Online
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {loading ? '-' : stats?.endpoints.online}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? '(-%%)' : `(${endpointsOnlineRate.toFixed(1)}%)`}
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${endpointsOnlineRate}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <WifiOff className="mr-2 h-3 w-3 text-red-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Offline
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {loading ? '-' : stats?.endpoints.offline}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? '(-%%)' : `(${endpointsOfflineRate.toFixed(1)}%)`}
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-red-500"
              style={{ width: `${endpointsOfflineRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Datasets Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Datasets
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '--' : datasetsTotal}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
            <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="mr-2 h-3 w-3 text-blue-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Public
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {loading ? '-' : stats?.datasets.public}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? '(-%%)' : `(${datasetsPublicRate.toFixed(1)}%)`}
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${datasetsPublicRate}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Lock className="mr-2 h-3 w-3 text-gray-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Private
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {loading ? '-' : stats?.datasets.private}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? '(-%%)' : `(${datasetsPrivateRate.toFixed(1)}%)`}
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-gray-500"
              style={{ width: `${datasetsPrivateRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Images Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Images
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '--' : imagesTotal}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
            <Container className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="mr-2 h-3 w-3 text-blue-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Public
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {loading ? '-' : stats?.images.public}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? '(-%%)' : `(${imagesPublicRate.toFixed(1)}%)`}
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${imagesPublicRate}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Lock className="mr-2 h-3 w-3 text-gray-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Private
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {loading ? '-' : stats?.images.private}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? '(-%%)' : `(${imagesPrivateRate.toFixed(1)}%)`}
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-gray-500"
              style={{ width: `${imagesPrivateRate}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
