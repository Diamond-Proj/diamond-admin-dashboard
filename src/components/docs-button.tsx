'use client';

import { FileTextIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { Button } from './ui/button';

export function DocsButton() {
  return (
    <Button
      variant="outline"
      size="default"
      asChild
      className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
    >
      <Link
        href="https://docs.diamondhpc.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2"
      >
        <FileTextIcon className="h-4 w-4" />
        <span>Documentation</span>
      </Link>
    </Button>
  );
} 