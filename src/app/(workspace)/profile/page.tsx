'use client';

import { BadgeCheck, Bug, Building2, IdCard, Mail, Shield } from 'lucide-react';
import { useAuthSessionContext } from '@/lib/auth/session-context';
import { setDeveloperMode, useDeveloperMode } from '@/lib/developer-mode';

export default function ProfilePage() {
  const { session } = useAuthSessionContext();
  const isDeveloperMode = useDeveloperMode();
  const userInfo = session.userInfo;

  const name = userInfo?.name || 'Not available';
  const email = userInfo?.email || 'Not available';
  const username = userInfo?.username || 'Not available';
  const institution = userInfo?.organization || 'Not available';
  const initials = name
    .split(' ')
    .map((value) => value[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="flex flex-1 flex-col gap-6">
      <section className="dashboard-card relative overflow-hidden p-5 md:p-6">
        <div className="bg-primary/6 pointer-events-none absolute -top-14 -right-10 h-36 w-36 rounded-full blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-sky-400/5 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground flex h-14 w-14 items-center justify-center rounded-xl text-base font-semibold shadow-sm">
              {initials || 'NA'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {name}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {email}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/25 dark:text-emerald-300">
            <BadgeCheck className="h-3.5 w-3.5" />
            Authenticated
          </span>
        </div>
      </section>

      <section className="dashboard-card p-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Account Details
        </h3>
        <dl className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-700/70 dark:bg-slate-900/45">
            <dt className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase dark:text-slate-400">
              <IdCard className="h-3.5 w-3.5" />
              Full Name
            </dt>
            <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {name}
            </dd>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-700/70 dark:bg-slate-900/45">
            <dt className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase dark:text-slate-400">
              <Mail className="h-3.5 w-3.5" />
              Email
            </dt>
            <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {email}
            </dd>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-700/70 dark:bg-slate-900/45">
            <dt className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase dark:text-slate-400">
              <Shield className="h-3.5 w-3.5" />
              Username
            </dt>
            <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {username}
            </dd>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-700/70 dark:bg-slate-900/45">
            <dt className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-[0.08em] text-slate-500 uppercase dark:text-slate-400">
              <Building2 className="h-3.5 w-3.5" />
              Institution
            </dt>
            <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {institution}
            </dd>
          </div>
        </dl>
      </section>

      <section className="dashboard-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Bug className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Developer Mode
              </h3>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Show detailed API response errors in this browser. This setting
                is stored locally and does not affect your account.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isDeveloperMode}
            onClick={() => setDeveloperMode(!isDeveloperMode)}
            className={`focus-visible:ring-primary/45 relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-slate-950 ${
              isDeveloperMode
                ? 'border-primary bg-primary'
                : 'border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700'
            }`}
          >
            <span className="sr-only">Toggle developer mode</span>
            <span
              aria-hidden="true"
              className={`mt-0.5 block h-5.5 w-5.5 rounded-full bg-white shadow-sm transition-transform ${
                isDeveloperMode ? 'translate-x-5.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </section>

      <section className="dashboard-card p-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Authentication
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          This account is managed by Globus Auth. Update identity information in
          your Globus profile settings.
        </p>
        <div className="mt-4 rounded-xl border border-emerald-300/60 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-700/60 dark:bg-emerald-900/20 dark:text-emerald-300">
          Globus session is active.
        </div>
      </section>
    </main>
  );
}
