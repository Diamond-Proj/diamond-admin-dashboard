import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAMES, GLOBUS_TOKEN_URL } from './constants';
import type {
  AuthSession,
  TokenStore,
  UserInfo,
  GlobusTokenResponse,
  TokenData
} from './types';
import {
  GLOBUS_COMPUTE_SCOPE,
  REFRESH_BUFFER_SECONDS,
  TOKEN_COOKIE_MAX_AGE
} from './types';

type CookieWriter = {
  set: NextResponse['cookies']['set'];
  delete: NextResponse['cookies']['delete'];
};

type OAuthTokenData = {
  access_token: string;
  refresh_token?: string | null;
  expires_in?: number;
  resource_server?: string;
  token_type?: string;
  scope?: string;
};

export class TokenManagerServer {
  private static normalizeResourceServer(
    resourceServer?: string,
    scope?: string
  ): string | null {
    if (scope?.split(' ').includes(GLOBUS_COMPUTE_SCOPE)) {
      return 'funcx_service';
    }

    if (resourceServer) {
      return resourceServer;
    }

    return null;
  }

  private static normalizeTokenData(
    token: Omit<TokenData, 'resource_server'> & { resource_server?: string }
  ): TokenData {
    const resourceServer =
      this.normalizeResourceServer(token.resource_server, token.scope) ||
      'auth.globus.org';

    return {
      ...token,
      resource_server: resourceServer
    };
  }

  private static decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const [, payload] = token.split('.');

      if (!payload) {
        return null;
      }

      const normalizedPayload = payload
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(payload.length / 4) * 4, '=');

      const decoded =
        typeof atob === 'function'
          ? atob(normalizedPayload)
          : Buffer.from(normalizedPayload, 'base64').toString('utf8');

      return JSON.parse(decoded) as Record<string, unknown>;
    } catch (error) {
      console.error('Failed to decode JWT payload:', error);
      return null;
    }
  }

  private static buildIdTokenClaims(idToken?: string): TokenStore['id_token_claims'] {
    if (!idToken) {
      return undefined;
    }

    const payload = this.decodeJwtPayload(idToken);

    if (!payload) {
      return undefined;
    }

    return {
      sub: typeof payload.sub === 'string' ? payload.sub : '',
      name: typeof payload.name === 'string' ? payload.name : undefined,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      preferred_username:
        typeof payload.preferred_username === 'string'
          ? payload.preferred_username
          : undefined,
      organization:
        typeof payload.organization === 'string'
          ? payload.organization
          : undefined
    };
  }

  private static getCookieOptions() {
    return {
      path: '/',
      maxAge: TOKEN_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production'
    };
  }

  private static buildCookieValues(tokens: TokenStore): Record<string, string> {
    const userInfo = this.getUserInfo(tokens);
    const values: Record<string, string> = {
      tokens: JSON.stringify(tokens.by_resource_server)
    };

    if (tokens.id_token) {
      values.id_token = tokens.id_token;
    }

    if (userInfo?.id) {
      values.primary_identity = userInfo.id;
    }

    return values;
  }

  private static createTokenData(
    token: OAuthTokenData,
    now: number,
    fallbackRefreshToken?: string
  ): TokenData {
    const resourceServer =
      this.normalizeResourceServer(token.resource_server, token.scope) ||
      'auth.globus.org';

    return {
      access_token: token.access_token,
      refresh_token: token.refresh_token ?? fallbackRefreshToken ?? null,
      expires_at_seconds: now + (token.expires_in || 3600),
      resource_server: resourceServer,
      token_type: token.token_type || 'Bearer',
      scope: token.scope || ''
    };
  }

  private static clearCookies(clearCookie: (name: string) => void): void {
    AUTH_COOKIE_NAMES.forEach((name) => {
      clearCookie(name);
    });
  }

  private static getPrimaryToken(tokens: TokenStore): TokenData | null {
    return (
      tokens.by_resource_server['auth.globus.org'] ||
      Object.values(tokens.by_resource_server)[0] ||
      null
    );
  }

  private static parseTokenStore(
    tokensCookie?: string,
    idToken?: string
  ): TokenStore | null {
    if (!tokensCookie) {
      return null;
    }

    const parsedTokens = JSON.parse(tokensCookie) as Record<string, TokenData>;
    const byResourceServer = Object.values(parsedTokens).reduce<
      Record<string, TokenData>
    >((acc, token) => {
      const normalizedToken = this.normalizeTokenData(token);
      acc[normalizedToken.resource_server] = normalizedToken;
      return acc;
    }, {});

    return {
      by_resource_server: byResourceServer,
      id_token: idToken,
      id_token_claims: this.buildIdTokenClaims(idToken)
    };
  }

  /**
   * Check if tokens are expired or need refresh
   */
  static needsRefresh(tokens: TokenStore): boolean {
    const now = Math.floor(Date.now() / 1000);

    return Object.values(tokens.by_resource_server).some((token) => {
      const expiresIn = token.expires_at_seconds - now;
      return expiresIn <= REFRESH_BUFFER_SECONDS;
    });
  }

  /**
   * Check if the current auth session is expired.
   * We validate the primary auth token rather than waiting for every
   * resource token to expire, otherwise an expired session can look valid.
   */
  static isExpired(tokens: TokenStore): boolean {
    const now = Math.floor(Date.now() / 1000);
    const primaryToken = this.getPrimaryToken(tokens);

    return !primaryToken || primaryToken.expires_at_seconds <= now;
  }

  /**
   * Get refresh token from token store
   */
  static getRefreshToken(tokens: TokenStore): string | null {
    const token = Object.values(tokens.by_resource_server).find(
      (t) => t.refresh_token
    );
    return token?.refresh_token || null;
  }

  /**
   * Extract user info from tokens
   */
  static getUserInfo(tokens: TokenStore): UserInfo | null {
    const claims = tokens.id_token_claims;
    if (!claims) return null;

    return {
      id: claims.sub,
      name: claims.name,
      email: claims.email,
      username: claims.preferred_username,
      organization: claims.organization
    };
  }

  static buildSession(tokens: TokenStore | null): AuthSession {
    if (!tokens) {
      return {
        isAuthenticated: false,
        userInfo: null,
        needsRefresh: false
      };
    }

    const hasRefreshToken = !!this.getRefreshToken(tokens);
    const isExpired = this.isExpired(tokens);

    return {
      isAuthenticated: !isExpired || hasRefreshToken,
      userInfo: this.getUserInfo(tokens),
      needsRefresh: this.needsRefresh(tokens)
    };
  }

  /**
   * Refresh tokens using Globus OAuth
   */
  static async refreshTokens(refreshToken: string): Promise<TokenStore | null> {
    try {
      const clientId = process.env.NEXT_PUBLIC_GLOBUS_CLIENT_ID;
      const clientSecret = process.env.GLOBUS_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('Missing Globus credentials');
      }

      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      });

      const response = await fetch(GLOBUS_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Token refresh failed:', errorData);
        return null;
      }

      const tokenResponse: GlobusTokenResponse = await response.json();

      // Format tokens
      return this.formatTokenResponse(tokenResponse, refreshToken);
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      return null;
    }
  }

  static mergeTokenStores(
    currentTokens: TokenStore,
    refreshedTokens: TokenStore
  ): TokenStore {
    const mergedResourceServers = {
      ...currentTokens.by_resource_server
    };

    Object.entries(refreshedTokens.by_resource_server).forEach(
      ([resourceServer, refreshedToken]) => {
        const currentToken = mergedResourceServers[resourceServer];

        mergedResourceServers[resourceServer] = {
          ...currentToken,
          ...refreshedToken,
          refresh_token:
            refreshedToken.refresh_token ?? currentToken?.refresh_token ?? null
        };
      }
    );

    return {
      by_resource_server: mergedResourceServers,
      id_token: refreshedTokens.id_token || currentTokens.id_token,
      id_token_claims:
        refreshedTokens.id_token_claims || currentTokens.id_token_claims
    };
  }

  /**
   * Format Globus token response into our TokenStore structure
   */
  static formatTokenResponse(
    tokenResponse: GlobusTokenResponse,
    fallbackRefreshToken?: string
  ): TokenStore {
    const now = Math.floor(Date.now() / 1000);
    const primaryToken = this.createTokenData(
      tokenResponse,
      now,
      fallbackRefreshToken
    );
    const byResourceServer: Record<string, TokenData> = {
      [primaryToken.resource_server]: primaryToken
    };

    // Handle other_tokens if present
    if (
      tokenResponse.other_tokens &&
      Array.isArray(tokenResponse.other_tokens)
    ) {
      tokenResponse.other_tokens.forEach((token) => {
        const normalizedToken = this.createTokenData(token, now);
        byResourceServer[normalizedToken.resource_server] = normalizedToken;
      });
    }

    // Decode ID token claims if present
    return {
      by_resource_server: byResourceServer,
      id_token: tokenResponse.id_token,
      id_token_claims: this.buildIdTokenClaims(tokenResponse.id_token)
    };
  }

  /**
   * Get tokens from server-side cookies
   * Reads the 'tokens' cookie which contains by_resource_server JSON (Flask backend format)
   */
  static async getTokensFromServerCookies(): Promise<TokenStore | null> {
    const cookieStore = await cookies();

    try {
      // Read the 'tokens' cookie which contains by_resource_server structure
      const tokensCookie = cookieStore.get('tokens')?.value;
      const idToken = cookieStore.get('id_token')?.value;

      console.log('Reading tokens from cookies:', {
        hasTokensCookie: !!tokensCookie,
        hasIdToken: !!idToken
      });

      if (!tokensCookie) {
        console.log('No tokens cookie found');
        return null;
      }

      const tokenStore = this.parseTokenStore(tokensCookie, idToken);

      if (!tokenStore) {
        return null;
      }

      console.log('✓ Parsed by_resource_server from tokens cookie');
      console.log(
        'Resource servers:',
        Object.keys(tokenStore.by_resource_server)
      );

      console.log('✓ Successfully loaded TokenStore from cookies');
      return tokenStore;
    } catch (error) {
      console.error('Failed to get tokens from cookies:', error);
      return null;
    }
  }

  static getTokensFromRequest(request: NextRequest): TokenStore | null {
    try {
      const tokensCookie = request.cookies.get('tokens')?.value;
      const idToken = request.cookies.get('id_token')?.value;

      return this.parseTokenStore(tokensCookie, idToken);
    } catch (error) {
      console.error('Failed to get tokens from request cookies:', error);
      return null;
    }
  }

  /**
   * Set auth cookies on a response object.
   */
  static setTokensOnResponse(
    response: { cookies: CookieWriter },
    tokens: TokenStore
  ): void {
    const cookieOptions = this.getCookieOptions();
    const values = this.buildCookieValues(tokens);

    this.clearCookiesOnResponse(response);

    // Store tokens cookie as by_resource_server JSON (for Flask backend)
    Object.entries(values).forEach(([name, value]) => {
      response.cookies.set(name, value, cookieOptions);
    });

    console.log('✓ Set auth cookies on response');
  }

  static setTokensOnRequest(request: NextRequest, tokens: TokenStore): void {
    const values = this.buildCookieValues(tokens);

    this.clearCookiesOnRequest(request);

    Object.entries(values).forEach(([name, value]) => {
      request.cookies.set(name, value);
    });
  }

  /**
   * Clear auth cookies on a response object.
   */
  static clearCookiesOnResponse(response: { cookies: CookieWriter }): void {
    this.clearCookies((name) => {
      response.cookies.delete(name);
    });
  }

  static clearCookiesOnRequest(request: NextRequest): void {
    this.clearCookies((name) => {
      request.cookies.delete(name);
    });
  }

  /**
   * Clear all auth cookies (server-side)
   */
  static async clearServerCookies(): Promise<void> {
    const cookieStore = await cookies();
    const responseLike = {
      cookies: {
        set: cookieStore.set.bind(cookieStore),
        delete: cookieStore.delete.bind(cookieStore)
      } satisfies CookieWriter
    };

    this.clearCookiesOnResponse(responseLike);
  }
}
