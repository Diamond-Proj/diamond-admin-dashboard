'use client';
import { MoonIcon, SunIcon, DesktopIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [themeIcon, setThemeIcon] = useState<React.ReactElement | null>(null);

  useEffect(() => {
    switch (theme) {
      case 'light':
        setThemeIcon(<SunIcon className="h-[1.2rem] w-[1.2rem]" />);
        break;
      case 'dark':
        setThemeIcon(<MoonIcon className="h-[1.2rem] w-[1.2rem]" />);
        break;
      case 'system':
        setThemeIcon(<DesktopIcon className="h-[1.2rem] w-[1.2rem]" />);
        break;
      default:
        setThemeIcon(<DesktopIcon className="h-[1.2rem] w-[1.2rem]" />);
        break;
    }
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="cursor-pointer">
          {themeIcon}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setTheme('light')}
        >
          <SunIcon className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setTheme('dark')}
        >
          <MoonIcon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setTheme('system')}
        >
          <DesktopIcon className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
