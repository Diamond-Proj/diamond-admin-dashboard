import { NextRequest, NextResponse } from 'next/server';
import { TokenManagerServer } from '@/lib/auth/tokenManager.server';
import type { TokenStore, TokenData } from '@/lib/auth/types';

type ExpireMode = 'refreshable' | 'hard';

function expireTokens(tokens: TokenStore, mode: ExpireMode): TokenStore {
  const expiredAt = Math.floor(Date.now() / 1000) - 60;

  const byResourceServer = Object.fromEntries(
    Object.entries(tokens.by_resource_server).map(([resourceServer, token]) => {
      const nextToken: TokenData = {
        ...token,
        expires_at_seconds: expiredAt,
        refresh_token: mode === 'hard' ? null : token.refresh_token
      };

      return [resourceServer, nextToken];
    })
  );

  return {
    ...tokens,
    by_resource_server: byResourceServer
  };
}

function getMode(request: NextRequest): ExpireMode {
  const mode = request.nextUrl.searchParams.get('mode');
  return mode === 'hard' ? 'hard' : 'refreshable';
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const tokens = await TokenManagerServer.getTokensFromServerCookies();

  if (!tokens) {
    return NextResponse.json(
      { error: 'No auth tokens found in cookies' },
      { status: 401 }
    );
  }

  const mode = getMode(request);
  const expiredTokens = expireTokens(tokens, mode);

  const response = NextResponse.json({
    success: true,
    mode,
    resource_servers: Object.keys(expiredTokens.by_resource_server),
    message:
      mode === 'hard'
        ? 'Expired all tokens and removed refresh tokens.'
        : 'Expired all tokens but kept refresh tokens.'
  });

  TokenManagerServer.setTokensOnResponse(response, expiredTokens);

  return response;
}
