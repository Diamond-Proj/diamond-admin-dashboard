import type { TokenStore, UserInfo, TokenData } from './types';
import { REFRESH_BUFFER_SECONDS, TOKEN_COOKIE_MAX_AGE } from './types';

export class TokenManager {
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
   * Get tokens from client-side cookies
   * Reads the 'tokens' cookie which contains by_resource_server JSON
   */
  static getTokensFromClientCookies(): TokenStore | null {
    if (typeof document === 'undefined') return null;

    try {
      const cookies = document.cookie.split(';').reduce(
        (acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>
      );

      const tokensCookie = cookies['tokens'];
      const idToken = cookies['id_token'];

      if (!tokensCookie) {
        return null;
      }

      // DECODE - 因为我们用 document.cookie 手动设置时编码了
      const decodedTokens = decodeURIComponent(tokensCookie);
      const byResourceServer = JSON.parse(decodedTokens) as Record<
        string,
        TokenData
      >;

      console.log('✓ Loaded tokens from client cookies');
      console.log('Resource servers:', Object.keys(byResourceServer));

      // Decode ID token claims if present
      let idTokenClaims: TokenStore['id_token_claims'];
      if (idToken) {
        try {
          const parts = idToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            idTokenClaims = {
              sub: payload.sub,
              name: payload.name,
              email: payload.email,
              preferred_username: payload.preferred_username,
              organization: payload.organization
            };
          }
        } catch (e) {
          console.error('Failed to decode ID token from cookie', e);
        }
      }

      return {
        by_resource_server: byResourceServer,
        id_token: idToken,
        id_token_claims: idTokenClaims
      };
    } catch (error) {
      console.error('Failed to get tokens from cookies:', error);
      return null;
    }
  }

  /**
   * Set tokens in client-side cookies
   */
  static setTokensInClientCookies(tokens: TokenStore): void {
    const userInfo = this.getUserInfo(tokens);
    const maxAge = TOKEN_COOKIE_MAX_AGE;

    // Store tokens cookie as by_resource_server JSON (for Flask backend)
    // ENCODE - 因为用 document.cookie 需要手动编码
    const byResourceServerJson = JSON.stringify(tokens.by_resource_server);
    const encodedTokens = encodeURIComponent(byResourceServerJson);
    document.cookie = `tokens=${encodedTokens}; path=/; max-age=${maxAge}; SameSite=Lax`;

    // Set authentication flag
    document.cookie = `is_authenticated=true; path=/; max-age=${maxAge}; SameSite=Lax`;

    // Set individual tokens
    const authToken = tokens.by_resource_server['auth.globus.org'];
    if (authToken) {
      document.cookie = `access_token=${authToken.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      if (authToken.refresh_token) {
        document.cookie = `refresh_token=${authToken.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
    }

    if (tokens.id_token) {
      document.cookie = `id_token=${tokens.id_token}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }

    // Set user info (encodeURIComponent needed for manual cookie setting)
    if (userInfo) {
      if (userInfo.name) {
        document.cookie = `name=${encodeURIComponent(userInfo.name)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
      if (userInfo.email) {
        document.cookie = `email=${encodeURIComponent(userInfo.email)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
      if (userInfo.id) {
        document.cookie = `primary_identity=${encodeURIComponent(userInfo.id)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
      if (userInfo.username) {
        document.cookie = `primary_username=${encodeURIComponent(userInfo.username)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
      if (userInfo.organization) {
        document.cookie = `institution=${encodeURIComponent(userInfo.organization)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
    }
  }

  /**
   * Clear all auth cookies
   */
  static clearClientCookies(): void {
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
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
  }
}
