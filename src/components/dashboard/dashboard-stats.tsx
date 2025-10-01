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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Tasks Card */}
      <Link
        href="/tasks"
        className="group relative overflow-hidden rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-300/80 hover:shadow-xl hover:shadow-blue-500/10 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-blue-600/80 dark:hover:shadow-blue-500/20"
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-blue-100/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-900/50 dark:to-blue-800/50 dark:group-hover:opacity-20"></div>

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 transition-colors duration-300 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400">
                Tasks
              </p>
              <p className="text-3xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                {loading ? '---' : tasksTotal.toLocaleString()}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-200 group-hover:shadow-md dark:bg-blue-900/50 dark:group-hover:bg-blue-800/70">
              <BarChart3 className="h-6 w-6 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400" />
            </div>
          </div>

          <div className="space-y-4">
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
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {loading ? '(-%%)' : `(${tasksCompletionRate.toFixed(1)}%)`}
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-400 ease-out"
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
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {loading ? '(-%%)' : `(${tasksRunningRate.toFixed(1)}%)`}
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-400 ease-out"
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
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {loading ? '(-%%)' : `(${tasksFailureRate.toFixed(1)}%)`}
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-400 ease-out"
                style={{ width: `${tasksFailureRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Link>

      {/* Endpoints Card */}
      <Link
        href="/settings"
        className="group relative overflow-hidden rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-green-300/80 hover:shadow-xl hover:shadow-green-500/10 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-green-600/80 dark:hover:shadow-green-500/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-green-100/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-green-900/50 dark:to-green-800/50 dark:group-hover:opacity-20"></div>

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 transition-colors duration-300 group-hover:text-green-600 dark:text-gray-400 dark:group-hover:text-green-400">
                Endpoints
              </p>
              <p className="text-3xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-green-600 dark:text-gray-100 dark:group-hover:text-green-400">
                {loading ? '--' : endpointsTotal}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-green-200 group-hover:shadow-md dark:bg-green-900/50 dark:group-hover:bg-green-800/70">
              <Server className="h-6 w-6 text-green-600 transition-transform duration-300 group-hover:scale-110 dark:text-green-400" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-green-500 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Online
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {loading ? '-' : stats?.endpoints.online}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {loading ? '(-%%)' : `(${endpointsOnlineRate.toFixed(1)}%)`}
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-400 ease-out"
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
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {loading ? '(-%%)' : `(${endpointsOfflineRate.toFixed(1)}%)`}
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-400 ease-out"
                style={{ width: `${endpointsOfflineRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Link>

      {/* Datasets Card */}
      <Link
        href="/datasets"
        className="group relative overflow-hidden rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-purple-300/80 hover:shadow-xl hover:shadow-purple-500/10 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-purple-600/80 dark:hover:shadow-purple-500/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-purple-100/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-purple-900/50 dark:to-purple-800/50 dark:group-hover:opacity-20"></div>

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 transition-colors duration-300 group-hover:text-purple-600 dark:text-gray-400 dark:group-hover:text-purple-400">
                Datasets
              </p>
              <p className="text-3xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-purple-600 dark:text-gray-100 dark:group-hover:text-purple-400">
                {loading ? '--' : datasetsTotal}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-200 group-hover:shadow-md dark:bg-purple-900/50 dark:group-hover:bg-purple-800/70">
              <Database className="h-6 w-6 text-purple-600 transition-transform duration-300 group-hover:scale-110 dark:text-purple-400" />
            </div>
          </div>

          <div className="space-y-4">
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
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {loading ? '(-%%)' : `(${datasetsPublicRate.toFixed(1)}%)`}
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-400 ease-out"
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
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {loading ? '(-%%)' : `(${datasetsPrivateRate.toFixed(1)}%)`}
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-gray-500 to-gray-400 transition-all duration-400 ease-out"
                style={{ width: `${datasetsPrivateRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Link>

      {/* Images Card */}
      <Link
        href="/images"
        className="group relative overflow-hidden rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-orange-300/80 hover:shadow-xl hover:shadow-orange-500/10 dark:border-gray-700/60 dark:bg-gray-800 dark:hover:border-orange-600/80 dark:hover:shadow-orange-500/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-orange-100/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-orange-900/50 dark:to-orange-800/50 dark:group-hover:opacity-20"></div>

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 transition-colors duration-300 group-hover:text-orange-600 dark:text-gray-400 dark:group-hover:text-orange-400">
                Images
              </p>
              <p className="text-3xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-orange-600 dark:text-gray-100 dark:group-hover:text-orange-400">
                {loading ? '--' : imagesTotal}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-200 group-hover:shadow-md dark:bg-orange-900/50 dark:group-hover:bg-orange-800/70">
              <Container className="h-6 w-6 text-orange-600 transition-transform duration-300 group-hover:scale-110 dark:text-orange-400" />
            </div>
          </div>

          <div className="space-y-4">
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
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {loading ? '(-%%)' : `(${imagesPublicRate.toFixed(1)}%)`}
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-400 ease-out"
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
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {loading ? '(-%%)' : `(${imagesPrivateRate.toFixed(1)}%)`}
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-gray-500 to-gray-400 transition-all duration-400 ease-out"
                style={{ width: `${imagesPrivateRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
