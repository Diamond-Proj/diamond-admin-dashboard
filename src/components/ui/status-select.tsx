'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

// Custom StatusSelectItem for color-coded items
export const StatusSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    status: "online" | "offline"
  }
>(({ className, children, status, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-hidden data-disabled:pointer-events-none data-disabled:opacity-50',
      status === "online" 
        ? "text-green-600 dark:text-green-400 hover:bg-green-50/80 hover:text-green-700 dark:hover:bg-green-950/20 dark:hover:text-green-300 focus:bg-green-100 focus:text-green-800 dark:focus:bg-green-900/30 dark:focus:text-green-200"
        : "text-red-600 dark:text-red-400 hover:bg-red-50/80 hover:text-red-700 dark:hover:bg-red-950/20 dark:hover:text-red-300 focus:bg-red-100 focus:text-red-800 dark:focus:bg-red-900/30 dark:focus:text-red-200",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
StatusSelectItem.displayName = "StatusSelectItem"; 
