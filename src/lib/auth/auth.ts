import { NextRequest, NextResponse } from 'next/server';
import { TokenManagerServer } from './tokenManager.server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/sign-in', '/auth/callback'];

// API routes that don't need auth check
const API_ROUTES = ['/api/auth', '/api/healthcheck'];

function getBaseUrl(request: NextRequest): string {
  return request.nextUrl.origin;
}

function redirectToSignIn(request: NextRequest): NextResponse {
  const signInUrl = new URL('/sign-in', getBaseUrl(request));
  console.log('Redirecting to sign-in:', signInUrl.toString());
  return NextResponse.redirect(signInUrl);
}

function initiateGlobusLogin(request: NextRequest): NextResponse {
  try {
    const clientId = process.env.NEXT_PUBLIC_GLOBUS_CLIENT_ID;
    const scopes = process.env.NEXT_PUBLIC_GLOBUS_SCOPES;
    const redirectUri = `${getBaseUrl(request)}/auth/callback`;

    if (!clientId) {
      throw new Error('GLOBUS_CLIENT_ID not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes || 'openid email profile urn:globus:auth:scope:transfer.api.globus.org:all https://auth.globus.org/scopes/facd7ccc-c5f4-42aa-916b-a0e270e2c2a9/all https://auth.globus.org/scopes/eec9b274-0c81-4334-bdc2-54e90e689b9a/all',
      access_type: 'offline'
    });

    const loginUrl = `https://auth.globus.org/v2/oauth2/authorize?${params.toString()}`;
    console.log('Initiating Globus login:', loginUrl);

    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error('Error initiating Globus login:', error);
    return redirectToSignIn(request);
  }
}

async function signOut(request: NextRequest): Promise<NextResponse> {
  console.log('Processing sign-out...');

  await TokenManagerServer.clearServerCookies();

  const response = NextResponse.redirect(new URL('/sign-in', request.url));

  console.log('Sign-out successful');
  return response;
}

export async function auth(request: NextRequest): Promise<NextResponse> {
  try {
    const pathname = request.nextUrl.pathname;
    console.log('Auth check for:', pathname);

    // Handle logout
    if (pathname.startsWith('/logout')) {
      return signOut(request);
    }

    // Handle login initiation
    if (pathname.startsWith('/login')) {
      return initiateGlobusLogin(request);
    }

    // Allow public routes without any auth check
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
      console.log('Public route, allowing access');
      return NextResponse.next();
    }

    // Allow API routes (they handle their own auth)
    if (API_ROUTES.some((route) => pathname.startsWith(route))) {
      console.log('API route, allowing access');
      return NextResponse.next();
    }

    // Check authentication for protected routes
    const tokens = await TokenManagerServer.getTokensFromServerCookies();

    if (!tokens) {
      console.log('No tokens found, redirecting to sign-in');
      return redirectToSignIn(request);
    }

    // Check if tokens are expired
    if (TokenManagerServer.isExpired(tokens)) {
      console.log('Tokens expired, attempting refresh...');

      const refreshToken = TokenManagerServer.getRefreshToken(tokens);

      if (!refreshToken) {
        console.log('No refresh token, redirecting to sign-in');
        await TokenManagerServer.clearServerCookies();
        return redirectToSignIn(request);
      }

      // Try to refresh
      const newTokens = await TokenManagerServer.refreshTokens(refreshToken);

      if (!newTokens) {
        console.log('Token refresh failed, redirecting to sign-in');
        await TokenManagerServer.clearServerCookies();
        return redirectToSignIn(request);
      }

      // Save refreshed tokens
      await TokenManagerServer.setTokensInServerCookies(newTokens);
      console.log('Tokens refreshed in middleware');
    }

    // Allow authenticated request
    console.log('User authenticated, allowing access');
    return NextResponse.next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return redirectToSignIn(request);
  }
}

export { initiateGlobusLogin as signIn, signOut };
