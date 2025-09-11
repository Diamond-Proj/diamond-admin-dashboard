'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserProfile, updateUserProfile } from '@/lib/taskHandlers';
import { DataPrepStatus } from '@/components/data-prep-status';
import { SetupGuide } from '@/components/dashboard/setup-guide';
import { DashboardStatsCards } from '@/components/dashboard/dashboard-stats';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { AlertCircle, ExternalLink } from 'lucide-react';

export default function DashboardPage({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) {
  console.log('searchParams', searchParams);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

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
      <DashboardStatsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <RecentActivity />

        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Getting Started Section */}
      <div className="rounded-lg border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-start space-x-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500">
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
