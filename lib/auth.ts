import { NextRequest, NextResponse } from 'next/server';
import { is_authenticated, signOut } from './authUtils';
import { initiateLogin } from '@/lib/globusAuth';

function getBaseUrl(request: NextRequest) {
  return request.nextUrl.origin;
}

function redirectToSignIn(request: NextRequest) {
  return NextResponse.redirect(getBaseUrl(request) + '/sign-in');
}

function signIn(request: NextRequest) {
  try {
    // Get the login URL from our Globus auth manager
    const loginUrl = initiateLogin();
    console.log('Redirecting to Globus Auth:', loginUrl);
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error('Error initiating Globus login:', error);
    // If our direct Globus auth fails, redirect to sign-in page
    // where the user can try again
    return redirectToSignIn(request);
  }
}

async function auth(request: NextRequest) {
  try {
    // Always log incoming requests for debugging
    console.log('Authenticating request for:', request.nextUrl.pathname);

    // P1: Route to Globus login page if the URL starts with '/login'
    if (
      request.nextUrl.pathname.startsWith('/login') &&
      !request.cookies.get('tokens')
    ) {
      console.debug('Initiating sign-in flow...');
      return signIn(request);
    }

    // P2: Handle logout if the URL starts with '/logout'
    if (request.nextUrl.pathname.startsWith('/logout')) {
      console.debug('Processing logout request...');
      return signOut();
    }

    // P3: Check if the user is authenticated directly from cookies
    // This avoids unnecessary server calls
    const tokensInCookies = request.cookies.get('tokens');
    const isAuthenticatedCookie = request.cookies.get('is_authenticated');
    const isAuthenticated = !!tokensInCookies || !!isAuthenticatedCookie;
    
    console.log('Authentication status for', request.nextUrl.pathname, ':', isAuthenticated);

    // P4: Redirect to profile if authenticated and URL starts with '/profile'
    if (isAuthenticated && request.nextUrl.pathname.startsWith('/profile')) {
      console.log('Redirecting authenticated user from profile to home...');
      return NextResponse.redirect(request.nextUrl.origin);
    }

    // P5: Redirect to Sign-in if not authenticated and URL is not '/login', '/sign-in', or '/auth/callback'
    if (!isAuthenticated && 
        !request.nextUrl.pathname.startsWith('/login') && 
        !request.nextUrl.pathname.startsWith('/sign-in') &&
        !request.nextUrl.pathname.startsWith('/auth/callback')) {
      console.log('Redirecting unauthenticated user to sign-in page...');
      return redirectToSignIn(request);
    }

    // P6: Proceed to the requested route if all conditions are met
    return NextResponse.next();
  } catch (error) {
    // Global error handler for the auth function
    console.error('Unexpected error in auth middleware:', error);
    
    // In case of error, redirect to sign-in as a fallback
    return redirectToSignIn(request);
  }
}

export { auth, signIn, signOut };
