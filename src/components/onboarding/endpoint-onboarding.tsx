'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ArrowRight, Settings } from 'lucide-react';

const STORAGE_KEY = 'diamond-endpoint-onboarding';

interface EndpointOnboardingProps {
  isAuthenticated: boolean;
}

export function EndpointOnboarding({
  isAuthenticated
}: EndpointOnboardingProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(STORAGE_KEY) === 'completed';

    if (isAuthenticated && !hasCompleted) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, [isAuthenticated]);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'completed');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative mx-4 w-full max-w-lg">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Getting Started
            </h2>
            <button
              onClick={handleClose}
              className="cursor-pointer rounded-lg p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="mb-6 text-center">
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                Configure Your Endpoints
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Set up and manage your API endpoints to get started with
                Diamond.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/settings"
                onClick={handleComplete}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
              >
                <span>Go to Settings</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                onClick={handleComplete}
                className="w-full cursor-pointer py-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
