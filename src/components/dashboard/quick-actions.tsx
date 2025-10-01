'use client';

import Link from 'next/link';
import { Container, Database, ChevronRight, Settings } from 'lucide-react';
import { TaskIcon } from '@/components/icons';

export function QuickActions() {
  return (
    <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
      <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Quick Actions
      </h3>
      <div className="space-y-3">
        {/* Images - Container management and building */}
        <Link
          href="/images"
          className="group flex w-full items-center rounded-xl bg-gradient-to-r from-blue-50 to-blue-50/70 p-4 text-left transition-all duration-300 hover:-translate-x-1 hover:from-blue-100 hover:to-blue-100/80 hover:shadow-md dark:from-blue-900/20 dark:to-blue-900/10 dark:hover:from-blue-900/40 dark:hover:to-blue-900/30"
        >
          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
            <Container className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-300">
              Images
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage and build container images
            </p>
          </div>
          <div className="opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
            <ChevronRight className="h-5 w-5 text-blue-500" />
          </div>
        </Link>

        {/* Datasets - Data collection management and registration */}
        <Link
          href="/datasets"
          className="group flex w-full items-center rounded-xl bg-gradient-to-r from-green-50 to-green-50/70 p-4 text-left transition-all duration-300 hover:-translate-x-1 hover:from-green-100 hover:to-green-100/80 hover:shadow-md dark:from-green-900/20 dark:to-green-900/10 dark:hover:from-green-900/40 dark:hover:to-green-900/30"
        >
          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-green-700 dark:text-gray-100 dark:group-hover:text-green-300">
              Datasets
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage and register data collections
            </p>
          </div>
          <div className="opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
            <ChevronRight className="h-5 w-5 text-green-500" />
          </div>
        </Link>

        {/* Tasks - Job status monitoring and management */}
        <Link
          href="/tasks"
          className="group flex w-full items-center rounded-xl bg-gradient-to-r from-orange-50 to-orange-50/70 p-4 text-left transition-all duration-300 hover:-translate-x-1 hover:from-orange-100 hover:to-orange-100/80 hover:shadow-md dark:from-orange-900/20 dark:to-orange-900/10 dark:hover:from-orange-900/40 dark:hover:to-orange-900/30"
        >
          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
            <TaskIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-orange-700 dark:text-gray-100 dark:group-hover:text-orange-300">
              Tasks
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor and manage HPC tasks
            </p>
          </div>
          <div className="opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
            <ChevronRight className="h-5 w-5 text-orange-500" />
          </div>
        </Link>

        {/* Settings - Application configuration */}
        <Link
          href="/settings"
          className="group flex w-full items-center rounded-xl bg-gradient-to-r from-gray-50 to-gray-50/70 p-4 text-left transition-all duration-300 hover:-translate-x-1 hover:from-gray-100 hover:to-gray-100/80 hover:shadow-md dark:from-gray-900/20 dark:to-gray-900/10 dark:hover:from-gray-900/40 dark:hover:to-gray-900/30"
        >
          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-500 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-gray-700 dark:text-gray-100 dark:group-hover:text-gray-300">
              Settings
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure application preferences
            </p>
          </div>
          <div className="opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </div>
        </Link>
      </div>
    </div>
  );
}
