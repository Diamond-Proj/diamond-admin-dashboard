'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Cpu, Database, Layers3, Rocket } from 'lucide-react';

const cards = [
  {
    label: 'Endpoints',
    Icon: Cpu,
    className: 'left-0 top-4 md:w-46'
  },
  {
    label: 'Images',
    Icon: Layers3,
    className: 'left-6 bottom-4 md:w-42'
  },
  {
    label: 'Datasets',
    Icon: Database,
    className: 'right-6 top-4 md:w-44'
  },
  {
    label: 'Tasks',
    Icon: Rocket,
    className: 'right-0 bottom-4 md:w-40'
  }
] as const;

type BeamAnimation = {
  x: number[];
  opacity: number[];
};

const beamConfigs: Array<{
  className: string;
  animation: BeamAnimation;
  duration: number;
  delay: number;
}> = [
  {
    className:
      'left-[10.5rem] top-[2.55rem] w-[calc(50%-12rem)] bg-[linear-gradient(90deg,rgba(201,10,55,0.18),rgba(201,10,55,0.68),rgba(255,255,255,0))]',
    animation: { x: [-10, 26, -10], opacity: [0.24, 0.9, 0.24] },
    duration: 3.8,
    delay: 0.1
  },
  {
    className:
      'left-[11rem] bottom-[2.8rem] w-[calc(50%-12.5rem)] bg-[linear-gradient(90deg,rgba(201,10,55,0.16),rgba(201,10,55,0.62),rgba(255,255,255,0))]',
    animation: { x: [-8, 28, -8], opacity: [0.18, 0.82, 0.18] },
    duration: 4.1,
    delay: 0.9
  },
  {
    className:
      'right-[10.5rem] top-[2.55rem] w-[calc(50%-12rem)] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(201,10,55,0.68),rgba(201,10,55,0.18))]',
    animation: { x: [10, -26, 10], opacity: [0.24, 0.9, 0.24] },
    duration: 3.9,
    delay: 0.45
  },
  {
    className:
      'right-[9.8rem] bottom-[2.8rem] w-[calc(50%-12rem)] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(201,10,55,0.62),rgba(201,10,55,0.16))]',
    animation: { x: [8, -28, 8], opacity: [0.18, 0.82, 0.18] },
    duration: 4.2,
    delay: 1.3
  }
];

function ModuleCard({
  label,
  Icon,
  className,
  index,
  reducedMotion
}: {
  label: string;
  Icon: typeof Cpu;
  className: string;
  index: number;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      className={`absolute rounded-[1.35rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(245,247,251,0.98))] px-4 py-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-[linear-gradient(180deg,rgba(16,22,34,0.94),rgba(13,18,29,0.98))] dark:shadow-[0_18px_38px_rgba(2,6,23,0.28)] ${className}`}
      animate={
        reducedMotion
          ? undefined
          : {
              y: [0, index % 2 === 0 ? -4 : 4, 0],
              borderColor: [
                'rgba(255,255,255,0.8)',
                'rgba(201,10,55,0.28)',
                'rgba(255,255,255,0.8)'
              ]
            }
      }
      transition={{
        duration: 4.6,
        delay: index * 0.24,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/50 bg-[#c90a37] text-white shadow-[0_8px_18px_rgba(201,10,55,0.16)]">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {label}
        </p>
      </div>
    </motion.div>
  );
}

export function WorkspaceSignal() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = Boolean(prefersReducedMotion);

  return (
    <div className="mx-auto mt-6 max-w-4xl">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(244,247,251,0.92))] p-3 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-[linear-gradient(180deg,rgba(13,18,29,0.82),rgba(10,16,27,0.94))] dark:shadow-[0_24px_60px_rgba(2,6,23,0.28)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-size-[28px_28px] opacity-50 dark:opacity-18" />

        {!reducedMotion ? (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-5 left-0 w-40 rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)] opacity-70 blur-xl"
            animate={{ x: ['-15%', '290%'] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
          />
        ) : null}

        <div className="relative grid gap-2 md:hidden">
          {cards.map(({ label, Icon }, index) => (
            <motion.div
              key={label}
              className="rounded-[1.2rem] border border-white/80 bg-white/86 px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.06)] dark:border-slate-800/80 dark:bg-slate-950/84 dark:shadow-none"
              animate={
                reducedMotion
                  ? undefined
                  : {
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }
              }
              transition={{
                duration: 5,
                delay: index * 0.18,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{ backgroundSize: '200% 200%' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c90a37] text-white shadow-[0_8px_18px_rgba(201,10,55,0.16)]">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative hidden h-[11.75rem] md:block">
          <div className="pointer-events-none absolute inset-x-14 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(100,116,139,0.45),transparent)] dark:bg-[linear-gradient(90deg,transparent,rgba(148,163,184,0.22),transparent)]" />

          {!reducedMotion ? (
            <>
              {beamConfigs.map((beam) => (
                <motion.div
                  key={beam.className}
                  aria-hidden="true"
                  className={`pointer-events-none absolute h-[2px] rounded-full blur-[0.5px] ${beam.className}`}
                  animate={beam.animation}
                  transition={{
                    duration: beam.duration,
                    delay: beam.delay,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              ))}

              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c90a37]/20"
                animate={{
                  scale: [0.88, 1.18, 0.88],
                  opacity: [0.2, 0.42, 0.2]
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-500/10"
                animate={{
                  scale: [0.94, 1.08, 0.94],
                  opacity: [0.16, 0.3, 0.16]
                }}
                transition={{
                  duration: 4.8,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </>
          ) : null}

          <div className="absolute top-1/2 left-1/2 z-10 h-[4.9rem] w-[4.9rem] -translate-x-1/2 -translate-y-1/2">
            <motion.div
              className="absolute inset-0 rounded-[1.45rem] border border-[#c90a37]/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(244,247,251,0.92))] shadow-[0_18px_44px_rgba(15,23,42,0.14)] dark:bg-[linear-gradient(180deg,rgba(16,22,34,0.94),rgba(13,18,29,0.98))] dark:shadow-[0_18px_44px_rgba(2,6,23,0.34)]"
              animate={reducedMotion ? undefined : { rotate: [45, 225, 405] }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            <motion.div
              className="absolute inset-[0.65rem] rounded-[1rem] border border-[#c90a37]/35 bg-[#c90a37]"
              animate={reducedMotion ? undefined : { rotate: [0, -180, -360] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            <div className="absolute inset-[1.55rem] rounded-full bg-white/92 dark:bg-slate-950/92" />
          </div>

          {cards.map(({ label, Icon, className }, index) => (
            <ModuleCard
              key={label}
              label={label}
              Icon={Icon}
              className={className}
              index={index}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
