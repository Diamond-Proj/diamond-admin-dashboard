'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { AlertCircle, ExternalLink } from 'lucide-react';

import type {
  DashboardStats,
  RecentTask,
  UserInfo,
  StatsResponse
} from '@/components/dashboard/dashboard.types';

import { getUserProfile, updateUserProfile } from '@/lib/taskHandlers';
import { TokenManager } from '@/lib/auth/tokenManager.client';
import { useTokenRefresh } from '@/lib/auth/useTokenRefresh';

import { DataPrepStatus } from '@/components/data-prep-status';
import { SetupGuide } from '@/components/dashboard/setup-guide';
import { DashboardStatsCards } from '@/components/dashboard/dashboard-stats';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { QuickActions } from '@/components/dashboard/quick-actions';

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [isPending, startTransition] = useTransition();

  // Enable automatic token refresh
  useTokenRefresh();

  useEffect(() => {
    // Check authentication status from cookies client-side
    const checkAuth = () => {
      const tokens = TokenManager.getTokensFromClientCookies();
      const hasAuth = !!tokens;

      setIsAuthenticated(hasAuth);

      // If authenticated, get user info from tokens or cookies
      if (hasAuth) {
        // First try to get from tokens
        const tokenUserInfo = tokens ? TokenManager.getUserInfo(tokens) : null;

        if (tokenUserInfo) {
          setUserInfo({
            name: tokenUserInfo.name || '',
            email: tokenUserInfo.email || '',
            primary_identity: tokenUserInfo.id || '',
            institution: tokenUserInfo.organization || ''
          });
        } else {
          // Fallback to cookies
          const cookies = document.cookie.split(';');
          const cookieObj: Record<string, string> = {};
          cookies.forEach((cookie) => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) cookieObj[name] = decodeURIComponent(value);
          });

          setUserInfo({
            name: cookieObj['name'] || '',
            email: cookieObj['email'] || '',
            primary_identity: cookieObj['primary_identity'] || '',
            institution: cookieObj['institution'] || ''
          });
        }
      }
    };

    // Check auth only once when component mounts
    checkAuth();
  }, []);

  // Fetch stats data
  useEffect(() => {
    if (isAuthenticated) {
      startTransition(async () => {
        try {
          const response = await fetch('/api/stats', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            console.error(`Server error: ${response.statusText}`);
            return;
          }

          const data: StatsResponse = await response.json();
          console.log('Fetched stats from /api/stats API:', data);

          setStats({
            tasks: data.tasks,
            endpoints: data.endpoints,
            datasets: data.datasets,
            images: data.images
          });

          setRecentTasks(data.recent_tasks || []);
        } catch (error) {
          console.error('Error fetching stats:', error);
        }
      });
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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
      <DashboardStatsCards stats={stats} loading={isPending} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <RecentActivity recentTasks={recentTasks} loading={isPending} />

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Getting Started Section */}
      <div className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50 to-indigo-50/80 p-6 shadow-sm dark:border-blue-800/60 dark:from-blue-900/20 dark:to-indigo-900/10">
        <div className="flex items-start space-x-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">
              New to Diamond HPC?
            </h3>
            <p className="mb-4 text-blue-800 dark:text-blue-200">
              Get started with our platform in just a few steps. Set up your
              compute endpoint and submit your first job.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="group inline-flex items-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
              >
                Setup Profile
                <svg
                  className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
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
              </Link>
              <Link
                href="https://docs.diamondhpc.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center rounded-xl border border-blue-200 bg-white/80 px-6 py-3 text-sm font-medium text-blue-600 shadow-md backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg dark:border-blue-700 dark:bg-gray-800/80 dark:text-blue-400 dark:hover:bg-gray-700"
              >
                View Documentation
                <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
