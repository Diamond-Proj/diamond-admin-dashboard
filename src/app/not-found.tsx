'use client';

import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-full w-full items-center justify-center">
      <div className="container mx-auto max-w-xl px-6 py-12">
        <div className="-translate-y-14 space-y-6 text-center lg:translate-x-[-110px] lg:translate-y-[-60px]">
          {/* 404 Title */}
          <div className="space-y-2">
            <div className="text-primary text-6xl font-bold tracking-tight">
              404
            </div>
            <h1 className="text-foreground text-3xl font-bold tracking-tight">
              Page Not Found
            </h1>
            <p className="text-muted-foreground">
              Sorry, we couldn{"'"}t find the page you{"'"}re looking for. The
              page may have been moved, deleted, or doesn{"'"}t exist.
            </p>
          </div>

          {/* Search Suggestion */}
          <div className="bg-card rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-2">
              <Search className="text-muted-foreground h-4 w-4" />
              <h3 className="text-card-foreground text-sm font-medium">
                What you can do:
              </h3>
            </div>
            <ul className="text-muted-foreground space-y-1 text-left text-sm">
              <li>• Check the URL for typos</li>
              <li>• Return to the dashboard</li>
              <li>• Use the navigation menu to find what you need</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 items-center justify-center gap-2 rounded-md px-8 text-sm font-medium transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-95"
            >
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Link>

            <button
              onClick={() => window.history.back()}
              className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border px-8 text-sm font-medium transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-95"
            >
              Go Back
            </button>
          </div>

          {/* Help Text */}
          <div className="text-muted-foreground text-sm">
            <p>Need help? Contact support or visit our documentation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
