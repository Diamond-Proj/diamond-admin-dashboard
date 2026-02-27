import { NextRequest, NextResponse } from 'next/server';
import { TokenManagerServer } from '@/lib/auth/tokenManager.server';
import { type GlobusTokenResponse } from '@/lib/auth/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    console.log('=== Auth Callback Started ===');

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        new URL('/sign-in?error=oauth_failed', request.url)
      );
    }

    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect(
        new URL('/sign-in?error=no_code', request.url)
      );
    }

    // Exchange code for tokens
    const clientId = process.env.NEXT_PUBLIC_GLOBUS_CLIENT_ID;
    const clientSecret = process.env.GLOBUS_CLIENT_SECRET;
    const redirectUri = new URL('/auth/callback', request.url).toString();

    if (!clientId || !clientSecret) {
      console.error('Missing Globus credentials');
      return NextResponse.redirect(
        new URL('/sign-in?error=config_error', request.url)
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri
    });

    console.log('Exchanging code for tokens...');

    const tokenResponse = await fetch(
      'https://auth.globus.org/v2/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange failed:', tokenResponse.status, errorData);
      return NextResponse.redirect(
        new URL('/sign-in?error=token_exchange_failed', request.url)
      );
    }

    const tokenData = (await tokenResponse.json()) as GlobusTokenResponse;
    console.log('✓ Token exchange successful');
    console.log(
      'Received tokens for resource servers:',
      tokenData.other_tokens
        ? [
            'auth.globus.org',
            ...tokenData.other_tokens.map((token) => token.resource_server)
          ]
        : ['auth.globus.org']
    );

    // Format tokens
    const tokens = TokenManagerServer.formatTokenResponse(tokenData);
    console.log('✓ Tokens formatted');
    console.log(
      'Final resource servers:',
      Object.keys(tokens.by_resource_server)
    );

    // Check if we got funcx_service token
    if (!tokens.by_resource_server['funcx_service']) {
      console.warn('⚠️  WARNING: No funcx_service token received!');
      console.warn(
        'This may indicate missing scopes in the authorization request'
      );
    }

    const userInfo = TokenManagerServer.getUserInfo(tokens);
    console.log('✓ User info extracted:', userInfo);

    // Create redirect response
    const dashboardUrl = new URL('/', request.url);
    const response = NextResponse.redirect(dashboardUrl);

    const TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days
    const cookieOptions = {
      path: '/',
      maxAge: TOKEN_COOKIE_MAX_AGE,
      httpOnly: false,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production'
    };

    console.log('Setting cookies...');

    // Set tokens cookie as by_resource_server JSON (for Flask backend)
    const byResourceServerJson = JSON.stringify(tokens.by_resource_server);
    response.cookies.set('tokens', byResourceServerJson, cookieOptions);
    console.log(
      '✓ Set tokens cookie (by_resource_server):',
      byResourceServerJson.length,
      'chars'
    );
    console.log(
      'Resource servers in cookie:',
      Object.keys(tokens.by_resource_server)
    );

    // Set authentication flag
    response.cookies.set('is_authenticated', 'true', cookieOptions);

    // Set individual tokens
    const authToken = tokens.by_resource_server['auth.globus.org'];
    if (authToken) {
      response.cookies.set(
        'access_token',
        authToken.access_token,
        cookieOptions
      );
      console.log('✓ Set access_token');

      if (authToken.refresh_token) {
        response.cookies.set(
          'refresh_token',
          authToken.refresh_token,
          cookieOptions
        );
        console.log('✓ Set refresh_token');
      }
    }

    if (tokens.id_token) {
      response.cookies.set('id_token', tokens.id_token, cookieOptions);
      console.log('✓ Set id_token');
    }

    // Set user info
    if (userInfo) {
      if (userInfo.name)
        response.cookies.set('name', userInfo.name, cookieOptions);
      if (userInfo.email)
        response.cookies.set('email', userInfo.email, cookieOptions);
      if (userInfo.id)
        response.cookies.set('primary_identity', userInfo.id, cookieOptions);
      if (userInfo.username)
        response.cookies.set(
          'primary_username',
          userInfo.username,
          cookieOptions
        );
      if (userInfo.organization)
        response.cookies.set(
          'institution',
          userInfo.organization,
          cookieOptions
        );
      console.log('✓ Set user info cookies');
    }

    console.log('=== Auth Callback Completed ===');
    return response;
  } catch (error) {
    console.error('❌ Error in auth callback:', error);
    return NextResponse.redirect(
      new URL('/sign-in?error=callback_failed', request.url)
    );
  }
}
