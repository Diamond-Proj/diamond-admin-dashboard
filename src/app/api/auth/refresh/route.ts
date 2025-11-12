import { NextRequest, NextResponse } from 'next/server';
import { TokenManagerServer } from '@/lib/auth/tokenManager.server';

export async function POST(request: NextRequest) {
  try {
    console.log('Token refresh request received');

    // Get tokens from cookies
    const tokens = await TokenManagerServer.getTokensFromServerCookies();

    if (!tokens) {
      console.error('No tokens found in cookies');
      return NextResponse.json({ error: 'No tokens found' }, { status: 401 });
    }

    // Get refresh token
    const refreshToken = TokenManagerServer.getRefreshToken(tokens);

    if (!refreshToken) {
      console.error('No refresh token available');
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 401 }
      );
    }

    // Refresh tokens
    const newTokens = await TokenManagerServer.refreshTokens(refreshToken);

    if (!newTokens) {
      console.error('Failed to refresh tokens');
      return NextResponse.json(
        { error: 'Failed to refresh tokens' },
        { status: 401 }
      );
    }

    // Save new tokens
    await TokenManagerServer.setTokensInServerCookies(newTokens);

    console.log('Tokens refreshed successfully');

    return NextResponse.json({
      success: true,
      tokens: newTokens
    });
  } catch (error) {
    console.error('Error in token refresh:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}
