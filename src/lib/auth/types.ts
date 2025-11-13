export interface TokenData {
  access_token: string;
  refresh_token: string | null;
  expires_at_seconds: number;
  resource_server: string;
  token_type: string;
  scope: string;
}

export interface TokenStore {
  by_resource_server: Record<string, TokenData>;
  id_token?: string;
  id_token_claims?: {
    sub: string;
    name?: string;
    email?: string;
    preferred_username?: string;
    organization?: string;
  };
}

export interface UserInfo {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  organization?: string;
}

export interface GlobusTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  resource_server?: string;
  token_type?: string;
  scope?: string;
  id_token?: string;
  other_tokens?: Array<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    resource_server?: string;
    token_type?: string;
    scope?: string;
  }>;
}

export const REFRESH_BUFFER_SECONDS = 300; // 5 minutes before expiry
export const TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days
