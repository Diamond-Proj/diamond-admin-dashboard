'use client';

import Link from 'next/link';
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
import { type DashboardStats } from '@/components/dashboard/dashboard.types';

export function DashboardStatsCards({
  stats,
  loading
}: {
  stats: DashboardStats | null;
  loading: boolean;
}) {
  // Calculate totals and percentages
  const tasksTotal = stats
    ? stats.tasks.completed + stats.tasks.running + stats.tasks.failed
    : 0;
  const tasksCompletionRate =
    stats && tasksTotal > 0 ? (stats.tasks.completed / tasksTotal) * 100 : 0;
  const tasksRunningRate =
    stats && tasksTotal > 0 ? (stats.tasks.running / tasksTotal) * 100 : 0;
  const tasksFailureRate =
    stats && tasksTotal > 0 ? (stats.tasks.failed / tasksTotal) * 100 : 0;

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
      {/* Tasks Card */}
      <Link
        href="/task-manager"
        className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-xs transition-all duration-300 hover:scale-105 hover:border-blue-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 transition-colors group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400">
              Tasks
            </p>
            <p className="text-3xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
              {loading ? '---' : tasksTotal.toLocaleString()}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 transition-colors group-hover:bg-blue-200 dark:bg-blue-900 dark:group-hover:bg-blue-800">
            <BarChart3 className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110 dark:text-blue-400" />
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
                {loading ? '---' : stats?.tasks.completed}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? '(-%%)' : `(${tasksCompletionRate.toFixed(1)}%)`}
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-green-500 transition-all duration-300"
              style={{ width: `${tasksCompletionRate}%` }}
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
                {loading ? '--' : stats?.tasks.running}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? '(-%%)' : `(${tasksRunningRate.toFixed(1)}%)`}
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-yellow-500 transition-all duration-300"
              style={{ width: `${tasksRunningRate}%` }}
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
                {loading ? '--' : stats?.tasks.failed}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? '(-%%)' : `(${tasksFailureRate.toFixed(1)}%)`}
              </span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-red-500 transition-all duration-300"
              style={{ width: `${tasksFailureRate}%` }}
            ></div>
          </div>
        </div>
      </Link>

      {/* Endpoints Card */}
      <Link
        href="/settings"
        className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-xs transition-all duration-300 hover:scale-105 hover:border-green-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-600"
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 transition-colors group-hover:text-green-600 dark:text-gray-400 dark:group-hover:text-green-400">
              Endpoints
            </p>
            <p className="text-3xl font-bold text-gray-900 transition-colors group-hover:text-green-600 dark:text-gray-100 dark:group-hover:text-green-400">
              {loading ? '--' : endpointsTotal}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 transition-colors group-hover:bg-green-200 dark:bg-green-900 dark:group-hover:bg-green-800">
            <Server className="h-5 w-5 text-green-600 transition-transform group-hover:scale-110 dark:text-green-400" />
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
              className="h-2 rounded-full bg-green-500 transition-all duration-300"
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
              className="h-2 rounded-full bg-red-500 transition-all duration-300"
              style={{ width: `${endpointsOfflineRate}%` }}
            ></div>
          </div>
        </div>
      </Link>

      {/* Datasets Card */}
      <Link
        href="/datasets"
        className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-xs transition-all duration-300 hover:scale-105 hover:border-purple-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600"
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 transition-colors group-hover:text-purple-600 dark:text-gray-400 dark:group-hover:text-purple-400">
              Datasets
            </p>
            <p className="text-3xl font-bold text-gray-900 transition-colors group-hover:text-purple-600 dark:text-gray-100 dark:group-hover:text-purple-400">
              {loading ? '--' : datasetsTotal}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 transition-colors group-hover:bg-purple-200 dark:bg-purple-900 dark:group-hover:bg-purple-800">
            <Database className="h-5 w-5 text-purple-600 transition-transform group-hover:scale-110 dark:text-purple-400" />
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
              className="h-2 rounded-full bg-blue-500 transition-all duration-300"
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
              className="h-2 rounded-full bg-gray-500 transition-all duration-300"
              style={{ width: `${datasetsPrivateRate}%` }}
            ></div>
          </div>
        </div>
      </Link>

      {/* Images Card */}
      <Link
        href="/images"
        className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-xs transition-all duration-300 hover:scale-105 hover:border-orange-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-orange-600"
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 transition-colors group-hover:text-orange-600 dark:text-gray-400 dark:group-hover:text-orange-400">
              Images
            </p>
            <p className="text-3xl font-bold text-gray-900 transition-colors group-hover:text-orange-600 dark:text-gray-100 dark:group-hover:text-orange-400">
              {loading ? '--' : imagesTotal}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 transition-colors group-hover:bg-orange-200 dark:bg-orange-900 dark:group-hover:bg-orange-800">
            <Container className="h-5 w-5 text-orange-600 transition-transform group-hover:scale-110 dark:text-orange-400" />
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
              className="h-2 rounded-full bg-blue-500 transition-all duration-300"
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
              className="h-2 rounded-full bg-gray-500 transition-all duration-300"
              style={{ width: `${imagesPrivateRate}%` }}
            ></div>
          </div>
        </div>
      </Link>
    </div>
  );
}
