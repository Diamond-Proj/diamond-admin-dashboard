import { NextResponse } from 'next/server';
import { TokenManagerServer } from '@/lib/auth/tokenManager.server';

function unauthorized(error: string) {
  const response = NextResponse.json({ error }, { status: 401 });
  TokenManagerServer.clearCookiesOnResponse(response);
  return response;
}

export async function POST() {
  try {
    console.log('Token refresh request received');

    // Get tokens from cookies
    const tokens = await TokenManagerServer.getTokensFromServerCookies();

    if (!tokens) {
      console.error('No tokens found in cookies');
      return unauthorized('No tokens found');
    }

    // Get refresh token
    const refreshToken = TokenManagerServer.getRefreshToken(tokens);

    if (!refreshToken) {
      console.error('No refresh token available');
      return unauthorized('No refresh token available');
    }

    // Refresh tokens
    const refreshedTokens = await TokenManagerServer.refreshTokens(refreshToken);

    if (!refreshedTokens) {
      console.error('Failed to refresh tokens');
      return unauthorized('Failed to refresh tokens');
    }

    const newTokens = TokenManagerServer.mergeTokenStores(
      tokens,
      refreshedTokens
    );

    console.log('Tokens refreshed successfully');

    const response = NextResponse.json({
      success: true,
      session: TokenManagerServer.buildSession(newTokens)
    });

    TokenManagerServer.setTokensOnResponse(response, newTokens);

    return response;
  } catch (error) {
    console.error('Error in token refresh:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
