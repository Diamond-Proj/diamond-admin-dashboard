'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavItem({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActivePath = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const isActive = isActivePath(href);

  return (
    <Link
      href={href}
      className={`mx-1 my-1 flex items-center gap-4 rounded-lg px-4 py-3 text-gray-600 transition-all duration-200 hover:translate-x-1 hover:bg-primary/5 hover:text-gray-700 hover:shadow-xs active:scale-95 dark:text-gray-400 dark:hover:bg-primary/10 dark:hover:text-gray-300 ${
        isActive
          ? 'border-l-4 border-primary bg-primary/10 text-primary shadow-xs dark:bg-primary/20 dark:text-primary-foreground'
          : 'border-l-4 border-transparent'
      } `}
    >
      {children}
    </Link>
  );
}
