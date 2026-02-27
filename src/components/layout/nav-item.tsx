'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

export function NavItem({
  href,
  icon,
  label,
  compact = false
}: {
  href: string;
  icon: ReactNode;
  label?: string;
  compact?: boolean;
}) {
  const pathname = usePathname();

  const isActivePath = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const isActive = isActivePath(href);

  return (
    <Link
      href={href}
      className={`group relative mx-2 my-1 flex min-h-11 items-center rounded-xl border py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.99] ${
        compact ? 'justify-center px-0' : 'px-4'
      } ${
        isActive
          ? 'border-primary/35 bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20 dark:bg-primary/15'
          : 'border-transparent text-slate-600 hover:border-slate-300/80 hover:bg-slate-100/90 hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-700/45 dark:hover:text-slate-100'
      }`}
      title={compact ? label : undefined}
    >
      <span
        className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-opacity ${
          isActive ? 'bg-primary opacity-100' : 'opacity-0 group-hover:opacity-55'
        }`}
      />
      <span
        className={`flex items-center  ${
          compact ? 'justify-center' : 'w-full gap-3'
        }`}
      >
        <span
          className={`inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center transition-transform duration-200 ${
            isActive ? 'scale-105' : 'group-hover:scale-105'
          }`}
        >
          {icon}
        </span>
        <span
          className={`overflow-hidden whitespace-nowrap text-sm transition-[max-width,opacity] duration-300 ease-out ${
            compact ? 'max-w-0 opacity-0' : 'max-w-35 opacity-100'
          }`}
        >
          {label}
        </span>
      </span>
    </Link>
  );
}
