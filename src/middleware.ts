import { NextRequest, NextResponse } from 'next/server';
import { auth } from './lib/auth';

export async function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = [
    '/sign-in',
    '/auth/callback',
    '/api/',
    '/_next/static',
    '/_next/image',
    '/favicon.ico',
    '/Diamond_Logo.png',
    '/Diamond logo transparent.png'
  ];

  // Check if the current path matches any of the public routes
  const isPublicRoute = publicRoutes.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith(route)
  );

  // Skip auth check for public routes
  if (isPublicRoute) {
    console.log(
      'Skipping auth check for public route:',
      request.nextUrl.pathname
    );
    return NextResponse.next();
  }

  // For all other routes, perform authentication check
  console.log('Authenticating request for:', request.nextUrl.pathname);
  return await auth(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|Diamond%20logo.png|.*\\.png$).*)'
  ]
};
