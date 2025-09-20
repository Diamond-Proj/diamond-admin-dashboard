'use client';

import Link from 'next/link';
import { Zap, Activity, Database, Container } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="rounded-xl border border-gray-200/60 bg-white p-6 shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
      <h3 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Quick Actions
      </h3>
      <div className="space-y-3">
        <Link
          href="/job-composer"
          className="group flex w-full items-center rounded-xl bg-gradient-to-r from-blue-50 to-blue-50/70 p-4 text-left transition-all duration-300 hover:-translate-x-1 hover:from-blue-100 hover:to-blue-100/80 hover:shadow-md dark:from-blue-900/20 dark:to-blue-900/10 dark:hover:from-blue-900/40 dark:hover:to-blue-900/30"
        >
          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-300">
              Submit New Job
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and submit HPC job
            </p>
          </div>
          <div className="opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
            <svg
              className="h-5 w-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>

        <Link
          href="/image-builder"
          className="group flex w-full items-center rounded-xl bg-gradient-to-r from-green-50 to-green-50/70 p-4 text-left transition-all duration-300 hover:-translate-x-1 hover:from-green-100 hover:to-green-100/80 hover:shadow-md dark:from-green-900/20 dark:to-green-900/10 dark:hover:from-green-900/40 dark:hover:to-green-900/30"
        >
          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
            <Container className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-green-700 dark:text-gray-100 dark:group-hover:text-green-300">
              Build Container
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create custom image
            </p>
          </div>
          <div className="opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
            <svg
              className="h-5 w-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>

        <Link
          href="/task-manager"
          className="group flex w-full items-center rounded-xl bg-gradient-to-r from-purple-50 to-purple-50/70 p-4 text-left transition-all duration-300 hover:-translate-x-1 hover:from-purple-100 hover:to-purple-100/80 hover:shadow-md dark:from-purple-900/20 dark:to-purple-900/10 dark:hover:from-purple-900/40 dark:hover:to-purple-900/30"
        >
          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-purple-700 dark:text-gray-100 dark:group-hover:text-purple-300">
              Monitor Tasks
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View job status
            </p>
          </div>
          <div className="opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
            <svg
              className="h-5 w-5 text-purple-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>

        <Link
          href="/image-manager"
          className="group flex w-full items-center rounded-xl bg-gradient-to-r from-orange-50 to-orange-50/70 p-4 text-left transition-all duration-300 hover:-translate-x-1 hover:from-orange-100 hover:to-orange-100/80 hover:shadow-md dark:from-orange-900/20 dark:to-orange-900/10 dark:hover:from-orange-900/40 dark:hover:to-orange-900/30"
        >
          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-orange-700 dark:text-gray-100 dark:group-hover:text-orange-300">
              Manage Images
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Browse container images
            </p>
          </div>
          <div className="opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
            <svg
              className="h-5 w-5 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}
