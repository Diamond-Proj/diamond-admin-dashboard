import { NextRequest, NextResponse } from 'next/server';
import { auth } from './lib/auth';

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.endsWith('/sign-in')
    //   request.nextUrl.pathname.endsWith('/logout')
  ) {
    console.log('Redirecting to Sign in...');
    return NextResponse.next();
  }
  console.log(
    'authenticating... from middleware.ts with ',
    request.nextUrl.pathname
  );
  return await auth(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|Diamond%20logo.png|.*\\.png$).*)'
  ]
};
