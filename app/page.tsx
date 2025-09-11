'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserProfile, updateUserProfile } from '@/lib/taskHandlers';
import { DataPrepStatus } from '@/components/data-prep-status';
import { SetupGuide } from '@/components/setup-guide';
import {
  BarChart3,
  Activity,
  Server,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Zap,
  ExternalLink
} from 'lucide-react';

interface DashboardStats {
  totalJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  activeEndpoints: number;
  totalUsers: number;
  systemLoad: number;
  uptime: string;
}

interface RecentActivity {
  id: string;
  type:
    | 'job_submitted'
    | 'job_completed'
    | 'job_failed'
    | 'endpoint_registered';
  message: string;
  timestamp: string;
  user?: string;
}

export default function DashboardPage({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) {
  console.log('searchParams', searchParams);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status from cookies client-side
    const checkAuth = () => {
      const cookies = document.cookie.split(';');

      const authCookies = [
        'is_authenticated',
        'tokens',
        'access_token',
        'id_token',
        'refresh_token',
        'name',
        'email',
        'primary_identity'
      ];

      const hasAuthCookie = cookies.some((cookie) => {
        const cookieName = cookie.trim().split('=')[0];
        return authCookies.includes(cookieName);
      });

      setIsAuthenticated(hasAuthCookie);

      // If authenticated, get user info from cookies
      if (hasAuthCookie) {
        const cookieObj: Record<string, string> = {};
        cookies.forEach((cookie) => {
          const [name, value] = cookie.trim().split('=');
          if (name) cookieObj[name] = decodeURIComponent(value || '');
        });

        setUserInfo({
          name: cookieObj['name'],
          email: cookieObj['email'],
          primary_identity: cookieObj['primary_identity'],
          institution: cookieObj['institution']
        });
      }
    };

    // Check auth only once when component mounts
    checkAuth();
  }, []);

  // Mock data - replace with real API calls in future
  useEffect(() => {
    if (isAuthenticated) {
      // Simulate API call delay
      setTimeout(() => {
        const mockStats: DashboardStats = {
          totalJobs: 1247,
          runningJobs: 23,
          completedJobs: 1198,
          failedJobs: 26,
          activeEndpoints: 8,
          totalUsers: 145,
          systemLoad: 0.67,
          uptime: '99.8%'
        };
        setStats(mockStats);

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
            type: 'job_submitted',
            message: 'New container build job submitted',
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
            type: 'job_failed',
            message: 'Image processing job failed due to memory limit',
            timestamp: '1 hour ago',
            user: 'charlie@lab.ac.uk'
          }
        ];
        setRecentActivity(mockActivity);

        setLoading(false);
      }, 500);
    }
  }, [isAuthenticated]);

  // Update user profile once when authenticated and user info is available
  useEffect(() => {
    const checkAndUpdateProfile = async () => {
      console.log('checkAndUpdateProfile');
      if (isAuthenticated && userInfo && userInfo.primary_identity) {
        console.log('userInfo', userInfo);
        try {
          const profile = await getUserProfile({
            identity_id: userInfo.primary_identity
          });
          console.log('profile', profile);
          // If the profile is not found, create it or if any of the fields are different, update it
          if (
            !profile.profile ||
            profile.profile.institution !== userInfo.institution
          ) {
            console.log('updating profile');
            await updateUserProfile({
              identity_id: userInfo.primary_identity,
              name: userInfo.name,
              email: userInfo.email,
              institution: userInfo.institution
            });
            console.log('profile updated');
          }
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      }
    };

    checkAndUpdateProfile();
  }, [isAuthenticated, userInfo]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-6">
        <div className="text-center">
          <p>Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex flex-1 flex-col p-4 md:p-6">
        <div className="mb-4 w-full">
          <div className="card p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Welcome to Diamond HPC Platform
            </h2>
            <div className="bg-warning rounded-md p-4">
              <p className="text-warning-foreground">
                Please sign in to access your dashboard and start managing your
                HPC workloads.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
      {/* Welcome Header */}
      <div className="flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {userInfo?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {"Here's what's happening with your HPC workloads today"}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <DataPrepStatus initialIsAuthenticated={isAuthenticated} />
        </div>
      </div>

      {/* Setup Guide - Expandable */}
      <SetupGuide />

      {/* System Status Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Jobs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {loading ? '---' : stats?.totalJobs.toLocaleString()}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            <span className="text-green-600 dark:text-green-400">
              +12% from last month
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Running Jobs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {loading ? '--' : stats?.runningJobs}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Activity className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <Clock className="mr-1 h-3 w-3 text-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">
              Active workloads
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Endpoints
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {loading ? '-' : stats?.activeEndpoints}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Server className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
            <span className="text-green-600 dark:text-green-400">
              All systems operational
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                System Uptime
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {loading ? '---%' : stats?.uptime}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Last 30 days
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Job Status Overview */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Job Status Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {loading ? '---' : stats?.completedJobs}
                </p>
                <div className="h-1.5 w-20 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-1.5 rounded-full bg-green-500"
                    style={{
                      width: loading
                        ? '0%'
                        : `${(stats!.completedJobs / stats!.totalJobs) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="mr-2 h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Running
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {loading ? '--' : stats?.runningJobs}
                </p>
                <div className="h-1.5 w-20 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-1.5 rounded-full bg-yellow-500"
                    style={{
                      width: loading
                        ? '0%'
                        : `${(stats!.runningJobs / stats!.totalJobs) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Failed
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {loading ? '--' : stats?.failedJobs}
                </p>
                <div className="h-1.5 w-20 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-1.5 rounded-full bg-red-500"
                    style={{
                      width: loading
                        ? '0%'
                        : `${(stats!.failedJobs / stats!.totalJobs) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {loading
              ? // Loading skeleton
                [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex animate-pulse items-start space-x-3"
                  >
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
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs text-white ${
                        activity.type === 'job_completed'
                          ? 'bg-green-500'
                          : activity.type === 'job_submitted'
                            ? 'bg-blue-500'
                            : activity.type === 'job_failed'
                              ? 'bg-red-500'
                              : 'bg-purple-500'
                      }`}
                    >
                      {activity.type === 'job_completed' && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      {activity.type === 'job_submitted' && (
                        <Zap className="h-3 w-3" />
                      )}
                      {activity.type === 'job_failed' && (
                        <XCircle className="h-3 w-3" />
                      )}
                      {activity.type === 'endpoint_registered' && (
                        <Server className="h-3 w-3" />
                      )}
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

        {/* Quick Actions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
                <Server className="h-4 w-4 text-white" />
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
          </div>
        </div>
      </div>

      {/* Getting Started Section */}
      <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-start space-x-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500">
            <AlertCircle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100">
              New to Diamond HPC?
            </h3>
            <p className="mb-4 text-blue-800 dark:text-blue-200">
              Get started with our platform in just a few steps. Set up your
              compute endpoint and submit your first job.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Setup Profile
              </Link>
              <Link
                href="https://docs.diamondhpc.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-gray-50 dark:border-blue-700 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
              >
                View Documentation
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
