'use client';

import Link from 'next/link';
import { Zap, Server, Activity, Database, Container } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Quick Actions
      </h3>
      <div className="space-y-3">
        <Link
          href="/job-composer"
          className="flex w-full items-center rounded-lg bg-blue-50 p-3 text-left transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
        >
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Submit New Job
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and submit HPC job
            </p>
          </div>
        </Link>

        <Link
          href="/image-builder"
          className="flex w-full items-center rounded-lg bg-green-50 p-3 text-left transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30"
        >
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
            <Container className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Build Container
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create custom image
            </p>
          </div>
        </Link>

        <Link
          href="/task-manager"
          className="flex w-full items-center rounded-lg bg-purple-50 p-3 text-left transition-colors hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30"
        >
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Monitor Tasks
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View job status
            </p>
          </div>
        </Link>

        <Link
          href="/image-manager"
          className="flex w-full items-center rounded-lg bg-orange-50 p-3 text-left transition-colors hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30"
        >
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
            <Database className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Manage Images
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Browse container images
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
