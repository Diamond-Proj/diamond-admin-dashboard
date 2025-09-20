'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ExternalLink } from 'lucide-react';

export function SetupGuide() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200/60 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800">
      {/* Header - Always visible */}
      <div
        className="group flex cursor-pointer items-center justify-between p-6 transition-all duration-300 hover:bg-gray-50/80 dark:hover:bg-gray-700/30"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-200 dark:bg-blue-900/50 dark:group-hover:bg-blue-800/70">
            <HelpCircle className="h-5 w-5 text-blue-600 transition-transform duration-300 group-hover:rotate-12 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
              Setup Guide
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              First time using Diamond? Start here
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="hidden text-xs text-gray-500 transition-colors duration-300 group-hover:text-blue-600 sm:block dark:text-gray-400 dark:group-hover:text-blue-400">
            {isExpanded ? 'Hide' : 'Show'} setup instructions
          </span>
          <div className="rounded-lg bg-gray-100 p-2 transition-all duration-300 group-hover:bg-blue-100 dark:bg-gray-700 dark:group-hover:bg-blue-900/50">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <div
        className={`space-y-6 overflow-hidden border-t border-gray-100/60 transition-all duration-300 ease-out dark:border-gray-700/60 ${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col gap-6 p-6">
          {/* Globus Compute Endpoint Setup Information */}
          <div>
            <h4 className="text-md mb-4 font-semibold text-gray-900 dark:text-gray-100">
              Globus Compute Endpoint Setup
            </h4>
            <div className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-blue-50/50 p-6 shadow-sm dark:border-blue-800/60 dark:from-blue-900/20 dark:to-blue-900/10">
              <p className="mb-4 font-medium text-blue-800 dark:text-blue-200">
                <strong>Important:</strong> Before using Diamond services, you
                need to create a{' '}
                <Link
                  href="https://globus-compute.readthedocs.io/en/2.6.0/endpoints.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 underline transition-colors duration-300 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Globus Compute endpoint
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>{' '}
                on your HPC machine.
              </p>

              <div className="space-y-4">
                <div>
                  <p className="mb-3 text-blue-800 dark:text-blue-200">
                    Install Globus Compute Endpoint package:
                  </p>
                  <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400 shadow-inner dark:bg-gray-950">
                    python3 -m pipx install globus-compute-endpoint
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-blue-800 dark:text-blue-200">
                    Create an endpoint on your HPC machine:
                  </p>
                  <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400 shadow-inner dark:bg-gray-950">
                    globus-compute-endpoint configure &lt;endpoint-name&gt;
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-blue-800 dark:text-blue-200">
                    Start your endpoint:
                  </p>
                  <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400 shadow-inner dark:bg-gray-950">
                    globus-compute-endpoint start &lt;endpoint-name&gt;
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-blue-700 dark:text-blue-300">
                Replace &lt;endpoint-name&gt; with a unique name for your
                endpoint. This step is required to connect your HPC resources
                with Diamond.
              </p>
            </div>
          </div>

          {/* Getting Started Information */}
          <div>
            <h4 className="text-md mb-4 font-semibold text-gray-900 dark:text-gray-100">
              Getting Started
            </h4>
            <div className="rounded-xl border border-gray-200/60 bg-gradient-to-br from-gray-50 to-gray-50/50 p-6 shadow-sm dark:border-gray-600/60 dark:from-gray-700/50 dark:to-gray-700/30">
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Welcome to Diamond! You can now use the navigation menu to
                access various features:
              </p>
              <ul className="list-disc space-y-3 pl-6 text-gray-700 dark:text-gray-300">
                <li className="transition-colors duration-300 hover:text-gray-900 dark:hover:text-gray-100">
                  <strong className="text-gray-900 dark:text-gray-100">
                    Image Builder
                  </strong>{' '}
                  - Create custom container images for your HPC workloads
                </li>
                <li className="transition-colors duration-300 hover:text-gray-900 dark:hover:text-gray-100">
                  <strong className="text-gray-900 dark:text-gray-100">
                    Image Manager
                  </strong>{' '}
                  - Manage your existing container images
                </li>
                <li className="transition-colors duration-300 hover:text-gray-900 dark:hover:text-gray-100">
                  <strong className="text-gray-900 dark:text-gray-100">
                    Job Composer
                  </strong>{' '}
                  - Create and submit jobs to HPC resources
                </li>
                <li className="transition-colors duration-300 hover:text-gray-900 dark:hover:text-gray-100">
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
