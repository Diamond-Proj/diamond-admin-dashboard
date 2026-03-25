import Link from 'next/link';
import {
  ArrowRight,
  Cpu,
  Database,
  ExternalLink,
  Layers3,
  Rocket
} from 'lucide-react';

import { Logo } from '@/components/icons';
import ThemeToggle from '@/components/layout/theme-toggle';
import { landingPageContent } from '@/content/landing-page-content';

const highlightIcons = {
  cpu: Cpu,
  layers: Layers3,
  database: Database,
  rocket: Rocket
} as const;

function CtaLink({
  href,
  label,
  variant = 'primary',
  external = false
}: {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary';
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={
        variant === 'primary'
          ? 'inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white'
          : 'inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/75 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition-transform duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900/75 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white'
      }
    >
      {label}
      {external ? (
        <ExternalLink className="h-4 w-4" />
      ) : (
        <ArrowRight className="h-4 w-4" />
      )}
    </Link>
  );
}

export function LandingPage({
  isAuthenticated
}: {
  isAuthenticated: boolean;
}) {
  const {
    header,
    hero,
    showcase,
    stats,
    highlights,
    workflow,
    personas,
    audiencePanel,
    closing
  } = landingPageContent;

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(191,19,99,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(14,121,178,0.1),transparent_34%),linear-gradient(to_bottom,rgba(255,255,255,0.35),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(191,19,99,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(14,121,178,0.16),transparent_30%),linear-gradient(to_bottom,rgba(15,23,42,0.35),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-size-[56px_56px] opacity-40 dark:opacity-20" />

      <header className="fixed inset-x-0 top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4 rounded-full border border-white/70 bg-white/80 px-4 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:px-5 dark:border-slate-800/80 dark:bg-slate-950/78 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
            <div className="flex min-w-0 items-center gap-3">
              <Logo width={44} height={44} className="shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">
                  {header.eyebrow}
                </p>
                <p className="truncate text-xs tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                  {header.label}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={header.docsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 md:inline-flex dark:text-slate-300 dark:hover:text-white"
              >
                {header.docsLabel}
              </Link>
              {!isAuthenticated ? (
                <Link
                  href={header.signInHref}
                  className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 md:inline-flex dark:text-slate-300 dark:hover:text-white"
                >
                  {header.signInLabel}
                </Link>
              ) : null}
              <ThemeToggle />
              <CtaLink
                href={header.primaryCta.href}
                label={
                  isAuthenticated
                    ? header.primaryCta.authenticatedLabel
                    : header.primaryCta.label
                }
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container relative z-10 pt-28 pb-8 md:pt-32 md:pb-10">
        <section className="grid gap-10 px-1 py-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end lg:py-20">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
              {hero.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-slate-950 md:text-6xl dark:text-slate-50">
              {hero.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              {hero.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink
                href={hero.primaryCta.href}
                label={
                  isAuthenticated
                    ? hero.primaryCta.authenticatedLabel
                    : hero.primaryCta.label
                }
              />
              <CtaLink
                href={
                  isAuthenticated
                    ? hero.secondaryCta.authenticatedHref
                    : hero.secondaryCta.href
                }
                label={
                  isAuthenticated
                    ? hero.secondaryCta.authenticatedLabel
                    : hero.secondaryCta.label
                }
                variant="secondary"
                external={isAuthenticated}
              />
            </div>

            <ul className="mt-8 grid gap-3 text-sm text-slate-600 md:grid-cols-3 dark:text-slate-300">
              {hero.supportingPoints.map((point) => (
                <li
                  key={point}
                  className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/60 dark:shadow-[0_18px_60px_rgba(2,6,23,0.3)]"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <aside className="relative overflow-hidden rounded-4xl border border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.92),rgba(247,248,250,0.75))] p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] dark:border-slate-800/80 dark:bg-[linear-gradient(160deg,rgba(15,23,42,0.94),rgba(2,6,23,0.82))] dark:shadow-[0_32px_100px_rgba(2,6,23,0.48)]">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/18 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-14 -left-12 h-36 w-36 rounded-full bg-sky-400/18 blur-3xl" />

            <div className="relative">
              <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-700/80 dark:bg-slate-900/70">
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                    {showcase.entryCard.eyebrow}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {showcase.entryCard.title}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-950 p-5 text-slate-50 dark:border-slate-700/80 dark:bg-slate-100 dark:text-slate-950">
                <p className="text-xs font-semibold tracking-[0.18em] text-slate-300 uppercase dark:text-slate-600">
                  {showcase.workspaceCard.eyebrow}
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                  {showcase.workspaceCard.title}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300 dark:text-slate-700">
                  {showcase.workspaceCard.description}
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {stats.slice(0, 2).map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-700/80 dark:bg-slate-900/75"
                  >
                    <p className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-slate-50">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {stat.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <article
              key={`${stat.value}-${stat.label}`}
              className="rounded-[1.75rem] border border-slate-200/80 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/65 dark:shadow-[0_24px_90px_rgba(2,6,23,0.32)]"
            >
              <p className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
                {stat.label}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {stat.detail}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 py-16 lg:grid-cols-[0.85fr_minmax(0,1.15fr)] lg:py-20">
          <div className="max-w-xl space-y-6">
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                {highlights.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950 md:text-4xl dark:text-slate-50">
                {highlights.title}
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                {highlights.description}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/70 dark:shadow-[0_18px_70px_rgba(2,6,23,0.28)]">
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                {highlights.supportPanel.eyebrow}
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-slate-950 dark:text-slate-50">
                {highlights.supportPanel.title}
              </h3>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {highlights.supportPanel.points.map((point) => (
                  <li
                    key={point}
                    className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 dark:border-slate-800/70 dark:bg-slate-900/70"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {highlights.items.map((item) => {
              const Icon = highlightIcons[item.icon as keyof typeof highlightIcons];

              return (
                <article
                  key={item.title}
                  className="rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)] dark:border-slate-800/80 dark:bg-slate-950/70 dark:shadow-[0_24px_90px_rgba(2,6,23,0.28)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/18">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                    {item.eyebrow}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-slate-950 dark:text-slate-50">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="rounded-4xl border border-slate-200/80 bg-white/75 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur md:p-8 dark:border-slate-800/80 dark:bg-slate-950/65 dark:shadow-[0_28px_100px_rgba(2,6,23,0.34)]">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                {workflow.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-slate-50">
                {workflow.title}
              </h2>
            </div>

            <ol className="grid flex-1 gap-4 md:grid-cols-3">
              {workflow.steps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800/80 dark:bg-slate-900/65"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-950">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-50">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="grid gap-6 py-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-20">
          <div className="rounded-4xl border border-slate-200/80 bg-white/75 p-8 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/65 dark:shadow-[0_28px_100px_rgba(2,6,23,0.34)]">
            <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
              {personas.eyebrow}
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-slate-50">
              {personas.title}
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {personas.items.map((persona) => (
                <article
                  key={persona.title}
                  className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800/80 dark:bg-slate-900/65"
                >
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                    {persona.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {persona.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-4xl border border-slate-200/80 bg-slate-950 p-8 text-slate-50 shadow-[0_28px_100px_rgba(15,23,42,0.18)] dark:border-slate-700/80 dark:bg-slate-100 dark:text-slate-950 dark:shadow-[0_24px_80px_rgba(2,6,23,0.2)]">
            <p className="text-xs font-semibold tracking-[0.18em] text-slate-300 uppercase dark:text-slate-600">
              {audiencePanel.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">
              {audiencePanel.title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300 dark:text-slate-700">
              {audiencePanel.description}
            </p>
          </aside>
        </section>

        <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(251,243,246,0.92),rgba(239,248,255,0.92))] px-6 py-8 shadow-[0_30px_100px_rgba(15,23,42,0.1)] md:px-8 md:py-10 dark:border-slate-800/80 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.94),rgba(58,10,31,0.9),rgba(10,38,55,0.92))] dark:shadow-[0_30px_110px_rgba(2,6,23,0.42)]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/18 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-20 h-44 w-44 rounded-full bg-sky-400/16 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">
                {closing.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-slate-950 md:text-4xl dark:text-slate-50">
                {closing.title}
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-700 dark:text-slate-200">
                {closing.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <CtaLink
                href={closing.primaryCta.href}
                label={
                  isAuthenticated
                    ? closing.primaryCta.authenticatedLabel
                    : closing.primaryCta.label
                }
              />
              <CtaLink
                href={closing.secondaryCta.href}
                label={closing.secondaryCta.label}
                variant="secondary"
                external
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
