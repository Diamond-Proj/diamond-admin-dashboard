'use client';
import { MoonIcon, SunIcon, DesktopIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const themeIcon =
    theme === 'light' ? (
      <SunIcon className="h-4.5 w-4.5" />
    ) : theme === 'dark' ? (
      <MoonIcon className="h-4.5 w-4.5" />
    ) : (
      <DesktopIcon className="h-4.5 w-4.5" />
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 cursor-pointer rounded-lg border border-slate-300/70 bg-transparent text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          {themeIcon}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          className="cursor-pointer rounded-lg px-2.5 py-2"
          onClick={() => setTheme('light')}
        >
          <SunIcon className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer rounded-lg px-2.5 py-2"
          onClick={() => setTheme('dark')}
        >
          <MoonIcon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer rounded-lg px-2.5 py-2"
          onClick={() => setTheme('system')}
        >
          <DesktopIcon className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
