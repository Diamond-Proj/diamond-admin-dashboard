import { NextRequest, NextResponse } from 'next/server';
import { is_authenticated, signOut } from './authUtils';

const NODE_ENV = process.env.NODE_ENV;
const FLASK_URL = NODE_ENV === 'development' ? 'http://localhost:5328' : `https://${process.env.FLASK_URL}`;

function getBaseUrl(request: NextRequest) {
  return request.nextUrl.origin;
}

function redirectToSignIn(request: NextRequest) {
  return NextResponse.redirect(getBaseUrl(request) + '/sign-in');
}

function signIn(request: NextRequest) {
  console.log('signIn() redirecting to ', `${FLASK_URL}/api/login`);
  return NextResponse.redirect(`${FLASK_URL}/api/login`);
}

async function auth(request: NextRequest) {
  // Always log incoming requests for debugging
  console.log('authenticating... from auth.ts with ', FLASK_URL);

  // P1: Route to Globus login page if the URL starts with '/login'
  if (
    request.nextUrl.pathname.startsWith('/login') &&
    !request.cookies.get('tokens')
  ) {
    console.debug('Signing in...');
    return signIn(request);
  }

  // P2: Handle logout if the URL starts with '/logout'
  if (request.nextUrl.pathname.startsWith('/logout')) {
    console.debug('Signing out...');
    return signOut();
  }

  // P3: Check if the user is authenticated
  const isAuthenticated = await is_authenticated();
  console.log('session in frontend: ', isAuthenticated);
  console.log('request url: ', request.nextUrl.pathname);

  // P4: Redirect to profile if authenticated and URL starts with '/profile'
  if (isAuthenticated && request.nextUrl.pathname.startsWith('/profile')) {
    console.log('Redirecting to profile...');
    return NextResponse.redirect(request.nextUrl.origin);
  }

  // P5: Redirect to Sign-in if not authenticated and URL is not '/login'
  if (!isAuthenticated && !request.nextUrl.pathname.startsWith('/login')) {
    console.log('Redirecting to Sign in...');
    return redirectToSignIn(request);
  }

  // P6: Proceed to the requested route if all conditions are met
  console.log('NextResponse.next()');
  return NextResponse.next();
}

export { auth, signIn, signOut };
