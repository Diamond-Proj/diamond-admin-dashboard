'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-full w-full items-center justify-center">
      <div className="container mx-auto max-w-xl px-6 py-12">
        <div className="-translate-y-14 space-y-6 text-center lg:translate-x-[-110px] lg:translate-y-[-60px]">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="bg-destructive/10 rounded-full p-4">
              <AlertTriangle className="text-destructive h-12 w-12" />
            </div>
          </div>

          {/* Error Title */}
          <div className="space-y-2">
            <h1 className="text-foreground text-3xl font-bold tracking-tight">
              Something went wrong!
            </h1>
            <p className="text-muted-foreground">
              We apologize for the inconvenience. An unexpected error occurred.
            </p>
          </div>

          {/* Error Details */}
          <div className="space-y-4">
            {error.message && (
              <div className="bg-card rounded-lg border p-4 text-left">
                <h3 className="text-card-foreground mb-2 font-medium">
                  Error Message:
                </h3>
                <p className="text-muted-foreground font-mono text-sm break-words">
                  {error.message}
                </p>
              </div>
            )}

            {error.digest && (
              <div className="bg-card rounded-lg border p-4 text-left">
                <h3 className="text-card-foreground mb-2 font-medium">
                  Error Digest:
                </h3>
                <p className="text-muted-foreground font-mono text-sm break-words">
                  {error.digest}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={reset}
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md px-8 text-sm font-medium transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>

            <Link
              href="/"
              className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-11 items-center justify-center gap-2 rounded-md border px-8 text-sm font-medium transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-95"
            >
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          {/* Help Text */}
          <div className="text-muted-foreground text-sm">
            <p>
              If the problem persists, try refreshing the page or contact
              support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
