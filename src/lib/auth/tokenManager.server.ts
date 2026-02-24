import { cookies } from 'next/headers';
import type {
  TokenStore,
  UserInfo,
  GlobusTokenResponse,
  TokenData
} from './types';
import { REFRESH_BUFFER_SECONDS, TOKEN_COOKIE_MAX_AGE } from './types';

export class TokenManagerServer {
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
   * Check if tokens are completely expired
   */
  static isExpired(tokens: TokenStore): boolean {
    const now = Math.floor(Date.now() / 1000);

    return Object.values(tokens.by_resource_server).every((token) => {
      return token.expires_at_seconds <= now;
    });
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

      const response = await fetch('https://auth.globus.org/v2/oauth2/token', {
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

  /**
   * Format Globus token response into our TokenStore structure
   */
  static formatTokenResponse(
    tokenResponse: GlobusTokenResponse,
    fallbackRefreshToken?: string
  ): TokenStore {
    const resourceServer = tokenResponse.resource_server || 'auth.globus.org';
    const now = Math.floor(Date.now() / 1000);

    const byResourceServer: Record<string, TokenData> = {
      [resourceServer]: {
        access_token: tokenResponse.access_token,
        refresh_token:
          tokenResponse.refresh_token || fallbackRefreshToken || null,
        expires_at_seconds: now + (tokenResponse.expires_in || 3600),
        resource_server: resourceServer,
        token_type: tokenResponse.token_type || 'Bearer',
        scope: tokenResponse.scope || ''
      }
    };

    // Handle other_tokens if present
    if (
      tokenResponse.other_tokens &&
      Array.isArray(tokenResponse.other_tokens)
    ) {
      tokenResponse.other_tokens.forEach((token) => {
        if (token.resource_server) {
          byResourceServer[token.resource_server] = {
            access_token: token.access_token,
            refresh_token: token.refresh_token || null,
            expires_at_seconds: now + (token.expires_in || 3600),
            resource_server: token.resource_server,
            token_type: token.token_type || 'Bearer',
            scope: token.scope || ''
          };
        }
      });
    }

    // Decode ID token claims if present
    let idTokenClaims: TokenStore['id_token_claims'];
    if (tokenResponse.id_token) {
      try {
        const parts = tokenResponse.id_token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], 'base64').toString()
          );
          idTokenClaims = {
            sub: payload.sub,
            name: payload.name,
            email: payload.email,
            preferred_username: payload.preferred_username,
            organization: payload.organization
          };
        }
      } catch (error) {
        console.error('Failed to decode ID token:', error);
      }
    }

    return {
      by_resource_server: byResourceServer,
      id_token: tokenResponse.id_token,
      id_token_claims: idTokenClaims
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

      // cookieStore.get() already returns decoded value - no need for decodeURIComponent
      const byResourceServer = JSON.parse(tokensCookie) as Record<
        string,
        TokenData
      >;
      console.log('✓ Parsed by_resource_server from tokens cookie');
      console.log('Resource servers:', Object.keys(byResourceServer));

      // Decode ID token claims if present
      let idTokenClaims: TokenStore['id_token_claims'];
      if (idToken) {
        try {
          const parts = idToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(
              Buffer.from(parts[1], 'base64').toString()
            );
            idTokenClaims = {
              sub: payload.sub,
              name: payload.name,
              email: payload.email,
              preferred_username: payload.preferred_username,
              organization: payload.organization
            };
            console.log('✓ Decoded ID token claims');
          }
        } catch (e) {
          console.error('Failed to decode ID token:', e);
        }
      }

      const tokenStore: TokenStore = {
        by_resource_server: byResourceServer,
        id_token: idToken,
        id_token_claims: idTokenClaims
      };

      console.log('✓ Successfully loaded TokenStore from cookies');
      return tokenStore;
    } catch (error) {
      console.error('Failed to get tokens from cookies:', error);
      return null;
    }
  }

  /**
   * Set tokens in server-side cookies
   * Stores 'tokens' cookie as by_resource_server JSON (Flask backend format)
   */
  static async setTokensInServerCookies(tokens: TokenStore): Promise<void> {
    const cookieStore = await cookies();
    const userInfo = this.getUserInfo(tokens);

    const cookieOptions = {
      path: '/',
      maxAge: TOKEN_COOKIE_MAX_AGE,
      httpOnly: false,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production'
    };

    // Store tokens cookie as by_resource_server JSON (for Flask backend)
    // NO encodeURIComponent - cookieStore.set() handles encoding automatically
    const byResourceServerJson = JSON.stringify(tokens.by_resource_server);
    cookieStore.set('tokens', byResourceServerJson, cookieOptions);
    console.log('✓ Set tokens cookie (by_resource_server)');

    // Set authentication flag
    cookieStore.set('is_authenticated', 'true', cookieOptions);

    // Set individual tokens
    const authToken = tokens.by_resource_server['auth.globus.org'];
    if (authToken) {
      cookieStore.set('access_token', authToken.access_token, cookieOptions);
      if (authToken.refresh_token) {
        cookieStore.set(
          'refresh_token',
          authToken.refresh_token,
          cookieOptions
        );
      }
    }

    if (tokens.id_token) {
      cookieStore.set('id_token', tokens.id_token, cookieOptions);
    }

    // Set user info
    if (userInfo) {
      if (userInfo.name) cookieStore.set('name', userInfo.name, cookieOptions);
      if (userInfo.email)
        cookieStore.set('email', userInfo.email, cookieOptions);
      if (userInfo.id)
        cookieStore.set('primary_identity', userInfo.id, cookieOptions);
      if (userInfo.username)
        cookieStore.set('primary_username', userInfo.username, cookieOptions);
      if (userInfo.organization)
        cookieStore.set('institution', userInfo.organization, cookieOptions);
    }
  }

  /**
   * Clear all auth cookies (server-side)
   */
  static async clearServerCookies(): Promise<void> {
    const cookieStore = await cookies();
    const cookieNames = [
      'tokens',
      'is_authenticated',
      'name',
      'email',
      'primary_identity',
      'primary_username',
      'institution',
      'access_token',
      'refresh_token',
      'id_token'
    ];

    cookieNames.forEach((name) => {
      cookieStore.delete(name);
    });
  }
}
