'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ExternalLink } from 'lucide-react';

export function SetupGuide() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header - Always visible */}
      <div
        className="flex cursor-pointer items-center justify-between rounded-t-lg p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Setup Guide
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              First time using Diamond? Start here
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
            {isExpanded ? 'Hide' : 'Show'} setup instructions
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expandable Content */}
      <div
        className={`space-y-6 overflow-hidden border-t border-gray-100 transition-all duration-300 dark:border-gray-700 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="flex flex-col gap-6 p-4">
          {/* Globus Compute Endpoint Setup Information */}
          <div>
            <h4 className="text-md mb-3 font-medium text-gray-900 dark:text-gray-100">
              Globus Compute Endpoint Setup
            </h4>
            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="mb-3 font-medium text-blue-800 dark:text-blue-200">
                <strong>Important:</strong> Before using Diamond services, you
                need to create a{' '}
                <Link
                  href="https://globus-compute.readthedocs.io/en/2.6.0/endpoints.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Globus Compute endpoint
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>{' '}
                on your HPC machine.
              </p>

              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-blue-800 dark:text-blue-200">
                    Install Globus Compute Endpoint package:
                  </p>
                  <div className="rounded bg-gray-800 p-3 font-mono text-sm text-green-400 dark:bg-gray-900">
                    python3 -m pipx install globus-compute-endpoint
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-blue-800 dark:text-blue-200">
                    Create an endpoint on your HPC machine:
                  </p>
                  <div className="rounded bg-gray-800 p-3 font-mono text-sm text-green-400 dark:bg-gray-900">
                    globus-compute-endpoint configure &lt;endpoint-name&gt;
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-blue-800 dark:text-blue-200">
                    Start your endpoint:
                  </p>
                  <div className="rounded bg-gray-800 p-3 font-mono text-sm text-green-400 dark:bg-gray-900">
                    globus-compute-endpoint start &lt;endpoint-name&gt;
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-blue-700 dark:text-blue-300">
                Replace &lt;endpoint-name&gt; with a unique name for your
                endpoint. This step is required to connect your HPC resources
                with Diamond.
              </p>
            </div>
          </div>

          {/* Getting Started Information */}
          <div>
            <h4 className="text-md mb-3 font-medium text-gray-900 dark:text-gray-100">
              Getting Started
            </h4>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
              <p className="mb-3 text-gray-700 dark:text-gray-300">
                Welcome to Diamond! You can now use the navigation menu to
                access various features:
              </p>
              <ul className="list-disc space-y-2 pl-5 text-gray-700 dark:text-gray-300">
                <li>
                  <strong className="text-gray-900 dark:text-gray-100">
                    Image Builder
                  </strong>{' '}
                  - Create custom container images for your HPC workloads
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-gray-100">
                    Image Manager
                  </strong>{' '}
                  - Manage your existing container images
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-gray-100">
                    Job Composer
                  </strong>{' '}
                  - Create and submit jobs to HPC resources
                </li>
                <li>
                  <strong className="text-gray-900 dark:text-gray-100">
                    Task Manager
                  </strong>{' '}
                  - Monitor and manage your running tasks
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
