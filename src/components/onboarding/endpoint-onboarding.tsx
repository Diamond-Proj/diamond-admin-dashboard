'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Settings, Sparkles, X } from 'lucide-react';

interface EndpointOnboardingProps {
  isAuthenticated: boolean;
}

export function EndpointOnboarding({
  isAuthenticated
}: EndpointOnboardingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function checkInitialization() {
      if (!isAuthenticated || pathname === '/endpoints') {
        return;
      }

      const cookies = document.cookie.split(';');
      const cookieObj: Record<string, string> = {};

      cookies.forEach((cookie) => {
        const [name, value] = cookie.trim().split('=');
        if (name) cookieObj[name] = decodeURIComponent(value || '');
      });

      const primaryIdentity = cookieObj['primary_identity'];
      if (!primaryIdentity) {
        return;
      }

      try {
        const response = await fetch(
          `/api/profile?identity_id=${primaryIdentity}`
        );
        const data = await response.json();

        if (response.ok && data.profile && !data.profile.is_initialized) {
          setTimeout(() => {
            if (window.location.pathname !== '/endpoints') {
              setIsVisible(true);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Error checking profile initialization:', error);
      }
    }

    checkInitialization();
  }, [isAuthenticated, pathname]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-slate-950/60 backdrop-blur-sm"
        onClick={() => setIsVisible(false)}
        aria-label="Close onboarding dialog"
      />

      <div className="dashboard-card relative w-full max-w-xl overflow-hidden p-7">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/6 blur-2xl" />
        <div className="pointer-events-none absolute -left-6 -bottom-12 h-36 w-36 rounded-full bg-sky-400/6 blur-2xl" />

        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-4 cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/70 dark:hover:text-white"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Sparkles className="h-3 w-3" />
            First-Time Setup
          </span>

          <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
            Configure your compute endpoint
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Diamond needs one active Globus Compute endpoint to run workloads. You can finish setup in under five minutes.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-200/75 bg-slate-50/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/45">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                <Settings className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Endpoint settings
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Add your endpoint ID and enable health checks.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <Link
              href="/endpoints"
              onClick={() => setIsVisible(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:brightness-95"
            >
              Go to Endpoints
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setIsVisible(false)}
              className="w-full cursor-pointer rounded-xl border border-slate-300/70 bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
