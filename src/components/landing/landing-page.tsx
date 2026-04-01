import Image from 'next/image';
import Link from 'next/link';
import { Lora, Plus_Jakarta_Sans } from 'next/font/google';
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

const landingDisplayFont = Lora({
  subsets: ['latin'],
  display: 'swap'
});

const landingBodyFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap'
});

const highlightIcons = {
  cpu: Cpu,
  layers: Layers3,
  database: Database,
  rocket: Rocket
} as const;

const statCardStyles = [
  'border-white/75 bg-[linear-gradient(160deg,rgba(255,255,255,0.94),rgba(244,247,251,0.96))]',
  'border-white/75 bg-[linear-gradient(160deg,rgba(255,255,255,0.94),rgba(247,244,246,0.96))]',
  'border-white/75 bg-[linear-gradient(160deg,rgba(255,255,255,0.94),rgba(242,246,250,0.96))]'
] as const;

const highlightCardStyles = [
  'bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(245,247,251,0.92))]',
  'bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,244,246,0.92))]',
  'bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(244,246,250,0.92))]',
  'bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,245,248,0.92))]'
] as const;

const personaCardStyles = [
  'bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,247,251,0.92))]',
  'bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(247,244,246,0.92))]',
  'bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(244,246,250,0.92))]'
] as const;

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
          ? 'inline-flex items-center justify-center gap-2 rounded-full bg-[#c90a37] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(201,10,55,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#b50931] hover:shadow-[0_18px_34px_rgba(201,10,55,0.2)] dark:bg-[#c90a37] dark:text-white dark:shadow-[0_14px_30px_rgba(0,0,0,0.24)]'
          : 'inline-flex items-center justify-center gap-2 rounded-full border border-white/75 bg-white/78 px-5 py-3 text-sm font-semibold text-slate-700 shadow-[0_10px_26px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-slate-950 dark:border-slate-700/80 dark:bg-slate-950/72 dark:text-slate-200 dark:shadow-[0_18px_40px_rgba(2,6,23,0.25)] dark:hover:border-slate-500 dark:hover:bg-slate-900'
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

function HeaderActionLink({
  href,
  label,
  external = false
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="hidden h-10 items-center rounded-full border border-white/80 bg-white/72 px-4 text-sm font-medium text-slate-700 shadow-[0_8px_22px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 md:inline-flex dark:border-slate-700/80 dark:bg-slate-950/68 dark:text-slate-200 dark:shadow-[0_14px_30px_rgba(2,6,23,0.24)] dark:hover:border-slate-500 dark:hover:bg-slate-900"
    >
      {label}
    </Link>
  );
}

export function LandingPage({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { header, hero, stats, highlights, personas, closing } =
    landingPageContent;

  return (
    <main className="relative overflow-hidden bg-[#f4f6f9] dark:bg-[#0b1018]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,10,55,0.08),transparent_24%),radial-gradient(circle_at_top_right,rgba(14,121,178,0.06),transparent_28%),radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.94),transparent_38%),linear-gradient(180deg,#f3f6fa_0%,#f7f9fc_34%,#f4f6f9_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(201,10,55,0.12),transparent_22%),radial-gradient(circle_at_top_right,rgba(14,121,178,0.08),transparent_26%),radial-gradient(circle_at_50%_18%,rgba(15,23,42,0.72),transparent_36%),linear-gradient(180deg,#0b1018_0%,#0d1320_34%,#101623_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.18)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,white,transparent_90%)] bg-size-[56px_56px] opacity-60 dark:opacity-35" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_72%)] dark:bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.82),transparent_72%)]" />

      <header className="fixed inset-x-0 top-0 z-50">
        <div className="container py-4">
          <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 rounded-[1.75rem] border border-white/70 bg-white/64 px-4 py-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:px-5 dark:border-slate-800/80 dark:bg-slate-950/72 dark:shadow-[0_28px_90px_rgba(2,6,23,0.4)]">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-2xl border border-white/80 bg-white/78 p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:border-slate-800/80 dark:bg-slate-900/86 dark:shadow-none">
                <Logo width={42} height={42} className="shrink-0" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">
                  {header.eyebrow}
                </p>
                <p className="truncate text-xs tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
                  {header.label}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <HeaderActionLink
                href={header.docsHref}
                label={header.docsLabel}
                external
              />
              {!isAuthenticated ? (
                <HeaderActionLink
                  href={header.signInHref}
                  label={header.signInLabel}
                />
              ) : null}
              <ThemeToggle triggerClassName="rounded-full border-white/80 bg-white/72 shadow-[0_8px_22px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/68 dark:shadow-[0_14px_30px_rgba(2,6,23,0.24)]" />
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

      <div className="relative z-10 container pt-28 pb-8 md:pt-32 md:pb-10">
        <section className={`${landingBodyFont.className} px-1 py-6 lg:py-10`}>
          <div className="relative mx-auto max-w-4xl px-2 text-center">
            <div className="pointer-events-none absolute -top-12 left-[10%] h-36 w-36 rounded-full bg-[rgba(201,10,55,0.07)] blur-3xl dark:bg-[rgba(201,10,55,0.1)]" />
            <div className="relative">
              <h1
                className={`${landingDisplayFont.className} text-[2.15rem] leading-[1.14] font-medium tracking-[-0.045em] text-slate-950 md:text-[3.7rem] dark:text-slate-50`}
              >
                {hero.headline}
              </h1>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
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
            </div>
          </div>

          <div className="relative mx-auto mt-6 max-w-[92rem]">
            <div className="pointer-events-none absolute inset-x-10 bottom-0 h-20 bg-[radial-gradient(circle,rgba(15,23,42,0.14),transparent_72%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(2,6,23,0.42),transparent_72%)]" />
            <div className="pointer-events-none absolute -top-10 right-[6%] h-48 w-48 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/10" />

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-[linear-gradient(135deg,rgba(245,247,251,0.94),rgba(255,255,255,0.94),rgba(247,244,246,0.94))] p-4 shadow-[0_32px_90px_rgba(15,23,42,0.1)] md:p-5 dark:border-slate-800/80 dark:bg-[linear-gradient(135deg,rgba(12,18,30,0.94),rgba(16,22,34,0.94),rgba(28,14,24,0.94))] dark:shadow-[0_34px_100px_rgba(2,6,23,0.42)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.4),transparent)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)]" />
              <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                <div className="overflow-hidden rounded-[1.7rem] border border-slate-200/80 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-slate-800/80 dark:bg-slate-950 dark:shadow-none">
                  <Image
                    src={hero.screenshot.src}
                    alt={hero.screenshot.alt}
                    width={2516}
                    height={1332}
                    priority
                    className="h-auto w-full"
                  />
                </div>

                <div className="grid gap-3">
                  <p className="px-1 text-sm font-semibold tracking-[0.18em] text-slate-600 uppercase dark:text-slate-300">
                    {hero.screenshot.sideCardLabel}
                  </p>

                  {hero.screenshot.sideCardItems.map((item, index) => (
                    <article
                      key={item}
                      className="grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-3 rounded-[1.6rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(244,247,251,0.94))] px-4 py-4 shadow-[0_18px_44px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-[linear-gradient(180deg,rgba(16,22,34,0.9),rgba(13,18,29,0.96))] dark:shadow-[0_18px_44px_rgba(2,6,23,0.22)]"
                    >
                      <p className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase shadow-[0_10px_22px_rgba(15,23,42,0.08)] dark:border-slate-700/80 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.92),rgba(15,23,42,0.94))] dark:text-slate-300 dark:shadow-none">
                        0{index + 1}
                      </p>
                      <p className="pt-1 text-[0.98rem] leading-7 text-slate-700 dark:text-slate-200">
                        {item}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <article
              key={`${stat.value}-${stat.label}`}
              className={`rounded-[1.9rem] border p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70 dark:shadow-[0_26px_90px_rgba(2,6,23,0.32)] ${statCardStyles[index % statCardStyles.length]}`}
            >
              <p className="text-3xl font-semibold tracking-[-0.05em] text-slate-950 dark:text-slate-50">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-semibold tracking-[0.16em] text-slate-500 uppercase dark:text-slate-400">
                {stat.label}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {stat.detail}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 py-12 lg:grid-cols-[0.86fr_minmax(0,1.14fr)] lg:pt-12 lg:pb-8">
          <div className="max-w-xl space-y-6">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-4xl dark:text-slate-50">
                {highlights.title}
              </h2>
              {highlights.description ? (
                <p className="mt-4 max-w-lg text-base leading-8 text-slate-600 dark:text-slate-300">
                  {highlights.description}
                </p>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(240,247,255,0.9))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.8),rgba(12,18,30,0.92))] dark:shadow-[0_20px_60px_rgba(2,6,23,0.26)]">
              <ul className="space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {highlights.supportPanel.points.map((point) => (
                  <li
                    key={point}
                    className="rounded-[1.35rem] border border-white/80 bg-white/72 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-slate-800/80 dark:bg-slate-900/72 dark:shadow-none"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {highlights.items.map((item, index) => {
              const Icon =
                highlightIcons[item.icon as keyof typeof highlightIcons];

              return (
                <article
                  key={item.title}
                  className={`rounded-[1.9rem] border border-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/72 dark:shadow-[0_24px_80px_rgba(2,6,23,0.28)] ${highlightCardStyles[index % highlightCardStyles.length]}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c90a37] text-white shadow-[0_10px_24px_rgba(201,10,55,0.16)] dark:shadow-none">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-slate-50">
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

        <section className="pt-8 pb-12 lg:pt-8 lg:pb-16">
          <div className="rounded-[2.25rem] border border-white/80 bg-white/62 p-8 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/68 dark:shadow-[0_28px_100px_rgba(2,6,23,0.34)]">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-50">
              {personas.title}
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {personas.items.map((persona, index) => (
                <article
                  key={persona.title}
                  className={`rounded-[1.8rem] border border-white/80 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-none ${personaCardStyles[index % personaCardStyles.length]}`}
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
        </section>

        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(244,247,251,0.92),rgba(247,244,246,0.9))] px-6 py-8 shadow-[0_30px_100px_rgba(15,23,42,0.1)] md:px-8 md:py-10 dark:border-slate-800/80 dark:bg-[linear-gradient(135deg,rgba(12,18,30,0.94),rgba(37,15,30,0.9),rgba(17,29,43,0.92))] dark:shadow-[0_30px_110px_rgba(2,6,23,0.42)]">
          <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-[rgba(201,10,55,0.08)] blur-3xl dark:bg-[rgba(201,10,55,0.12)]" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-400/12" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-4xl dark:text-slate-50">
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
