'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';

import type {
  DashboardStats,
  RecentTask,
  UserInfo,
  StatsResponse
} from '@/components/dashboard/dashboard.types';

import { getUserProfile, updateUserProfile } from '@/lib/taskHandlers';
import { TokenManager } from '@/lib/auth/tokenManager.client';
import { useTokenRefresh } from '@/lib/auth/useTokenRefresh';

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

  useTokenRefresh();

  useEffect(() => {
    const checkAuth = () => {
      const tokens = TokenManager.getTokensFromClientCookies();
      const hasAuth = !!tokens;

      setIsAuthenticated(hasAuth);

      if (hasAuth) {
        const tokenUserInfo = tokens ? TokenManager.getUserInfo(tokens) : null;

        if (tokenUserInfo) {
          setUserInfo({
            name: tokenUserInfo.name || '',
            email: tokenUserInfo.email || '',
            primary_identity: tokenUserInfo.id || '',
            institution: tokenUserInfo.organization || ''
          });
          return;
        }

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
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

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
  }, [isAuthenticated]);

  useEffect(() => {
    const checkAndUpdateProfile = async () => {
      if (!isAuthenticated || !userInfo || !userInfo.primary_identity) {
        return;
      }

      try {
        const profile = await getUserProfile({
          identity_id: userInfo.primary_identity
        });

        if (!profile.profile || profile.profile.institution !== userInfo.institution) {
          await updateUserProfile({
            identity_id: userInfo.primary_identity,
            name: userInfo.name,
            email: userInfo.email,
            institution: userInfo.institution
          });
        }
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    };

    checkAndUpdateProfile();
  }, [isAuthenticated, userInfo]);

  if (isAuthenticated === null) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center p-6">
        <div className="dashboard-card w-full max-w-md p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
            Loading dashboard...
          </p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="flex flex-1 flex-col">
        <div className="dashboard-card p-7">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Welcome to Diamond HPC Platform
          </h2>
          <div className="mt-4 rounded-xl border border-amber-300/45 bg-amber-50/80 p-4 text-amber-900 dark:border-amber-600/40 dark:bg-amber-900/20 dark:text-amber-200">
            Please sign in to access your dashboard and start managing your HPC workloads.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col space-y-6">
      <section className="dashboard-card relative overflow-hidden p-5 md:p-6">
        <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-24 h-52 w-52 rounded-full bg-cyan-400/5 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Welcome back, {userInfo?.name?.split(' ')[0] || 'Researcher'}
            </h1>
          </div>
          <Link
            href="https://docs.diamondhpc.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-white"
          >
            Documentation
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SetupGuide />
      <DashboardStatsCards stats={stats} loading={isPending} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivity recentTasks={recentTasks} loading={isPending} />
        <QuickActions />
      </div>

      <section className="dashboard-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              New to Diamond HPC?
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Start by configuring one endpoint, then submit your first test task to validate your runtime stack.
            </p>
            <Link
              href="/endpoints"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:brightness-95"
            >
              Configure Endpoints
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}
