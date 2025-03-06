import { authorization } from '@globus/sdk';
// Import getSDKOptions using a proper path
import type { Environment } from '@globus/sdk/dist/esm/core/global';

// Get client ID from environment variable
const GLOBUS_CLIENT_ID = process.env.NEXT_PUBLIC_GLOBUS_CLIENT_ID;

// Get scopes from environment variable 
const GLOBUS_SCOPES = process.env.NEXT_PUBLIC_GLOBUS_SCOPES || '';

// Get redirect URI based on environment
export function getRedirectUri() {
  const isProduction = process.env.NODE_ENV === 'production';
  const hostname = isProduction 
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL || 'diamondhpc.ai'}`
    : 'http://localhost:3000';
  
  return `${hostname}/auth/callback`;
}

// Create Globus Auth Manager
export function createGlobusAuthManager() {
  // Set GLOBUS_SDK_ENVIRONMENT to 'production' (will be picked up by the SDK)
  if (typeof process !== 'undefined') {
    process.env.GLOBUS_SDK_ENVIRONMENT = 'production';
  }
  
  if (!GLOBUS_CLIENT_ID) {
    throw new Error('NEXT_PUBLIC_GLOBUS_CLIENT_ID environment variable is not set');
  }
  
  return authorization.create({
    client: GLOBUS_CLIENT_ID,
    redirect: getRedirectUri(),
    scopes: GLOBUS_SCOPES,
    useRefreshTokens: true
  });
}

// Function to handle the auth flow - returns a string URL
export function initiateLogin(): string {
  try {
    // Construct the authorization URL manually
    const params = new URLSearchParams({
      client_id: GLOBUS_CLIENT_ID || '',
      redirect_uri: getRedirectUri(),
      scope: GLOBUS_SCOPES,
      response_type: 'code',
      state: '_default'
    });
    
    return `https://auth.globus.org/v2/oauth2/authorize?${params.toString()}`;
  } catch (error) {
    console.error('Error initiating login:', error);
    throw new Error('Failed to create login URL. Please check your configuration.');
  }
}

// Function to persist tokens in cookies
export function persistTokensInCookies(tokens: any) {
  try {
    if (!tokens) {
      console.error('No tokens provided to persistTokensInCookies');
      return false;
    }
    
    console.log('Persisting tokens in cookies, token structure:', Object.keys(tokens));
    
    // Set the authentication flag cookie
    document.cookie = `is_authenticated=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    
    // First, store individual token properties for client-side use
    let individualTokensStored = false;
    
    if (tokens.access_token) {
      document.cookie = `access_token=${encodeURIComponent(tokens.access_token)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      individualTokensStored = true;
    }
    
    if (tokens.refresh_token) {
      document.cookie = `refresh_token=${encodeURIComponent(tokens.refresh_token)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      individualTokensStored = true;
    }
    
    if (tokens.id_token) {
      document.cookie = `id_token=${encodeURIComponent(tokens.id_token)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      individualTokensStored = true;
    }
    
    // Most importantly, store the by_resource_server structure for backend compatibility
    // This is what the backend @authenticated decorator expects
    if (tokens.by_resource_server) {
      try {
        // If we have the by_resource_server structure, store it as expected by the backend
        const tokensString = JSON.stringify(tokens.by_resource_server);
        document.cookie = `tokens=${encodeURIComponent(tokensString)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        console.log('Stored by_resource_server tokens structure required by backend');
        individualTokensStored = true;
      } catch (resourceServerError) {
        console.error('Error storing by_resource_server structure:', resourceServerError);
      }
    }
    
    // If we don't have by_resource_server or failed to store it, try to store the full tokens object as fallback
    if (!tokens.by_resource_server || document.cookie.indexOf('tokens=') === -1) {
      try {
        // Store tokens as a JSON string, but first clean up any circular references
        const tokensCopy = { ...tokens };
        // Remove any potential circular references or non-serializable data
        delete tokensCopy.client;
        
        // Test if tokens can be stringified
        const tokensString = JSON.stringify(tokensCopy);
        document.cookie = `tokens=${encodeURIComponent(tokensString)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        console.log('Full tokens cookie set as fallback');
      } catch (stringifyError) {
        console.error('Error stringifying tokens:', stringifyError);
        // If we couldn't store the full tokens object but did store individual tokens, that's still a success
        if (!individualTokensStored) {
          console.error('Failed to store tokens in any format');
          return false;
        }
      }
    }
    
    // If you have user profile info in the tokens:
    const idToken = tokens.id_token_claims;
    if (idToken) {
      console.log('Setting user profile cookies from ID token claims');
      try {
        if (idToken.name) {
          document.cookie = `name=${encodeURIComponent(idToken.name)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
        
        if (idToken.email) {
          document.cookie = `email=${encodeURIComponent(idToken.email)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
        
        if (idToken.sub) {
          document.cookie = `primary_identity=${encodeURIComponent(idToken.sub)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
        
        if (idToken.preferred_username) {
          document.cookie = `primary_username=${encodeURIComponent(idToken.preferred_username)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
        
        if (idToken.organization) {
          document.cookie = `institution=${encodeURIComponent(idToken.organization)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
      } catch (profileError) {
        console.error('Error setting profile cookies:', profileError);
      }
    } else {
      console.log('No ID token claims found in tokens');
    }
    
    // Verify that cookies were set
    const cookies = document.cookie.split(';');
    console.log('Current cookies after setting:', cookies);
    
    const hasAuthCookie = cookies.some(cookie => cookie.trim().startsWith('is_authenticated='));
    const hasTokensCookie = cookies.some(cookie => cookie.trim().startsWith('tokens='));
    
    if (!hasAuthCookie || !hasTokensCookie) {
      console.error('Failed to set authentication cookies. Current cookies:', cookies);
      return false;
    }
    
    console.log('Authentication cookies set successfully');
    return true;
  } catch (error) {
    console.error('Error persisting tokens in cookies:', error);
    return false;
  }
}

// Function to clear tokens
export function clearTokensFromCookies() {
  try {
    console.log('Clearing tokens from cookies');
    
    // This function will need to be called client-side
    const cookiesToClear = [
      'is_authenticated',
      'tokens',
      'name',
      'email',
      'primary_identity',
      'primary_username',
      'institution',
      // Add individual token cookies
      'access_token',
      'refresh_token',
      'id_token'
    ];
    
    // Clear each cookie
    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    });
    
    // Verify that cookies were cleared
    const cookies = document.cookie.split(';');
    console.log('Cookies after clearing:', cookies);
    
    const hasAuthCookie = cookies.some(cookie => 
      cookie.trim().startsWith('is_authenticated=') || 
      cookie.trim().startsWith('tokens=') ||
      cookie.trim().startsWith('access_token=')
    );
    
    if (hasAuthCookie) {
      console.error('Failed to clear authentication cookies. Remaining cookies:', cookies);
      return false;
    }
    
    console.log('All authentication cookies cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing tokens from cookies:', error);
    return false;
  }
}

// Function to directly exchange an authorization code for tokens
export async function exchangeCodeForTokens(code: string): Promise<any> {
  try {
    console.log('Exchanging authorization code for tokens directly');
    
    // Make the request to our API route
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || 'Failed to exchange code for tokens');
    }
    
    const data = await response.json();
    
    if (!data.tokens) {
      throw new Error('No tokens received from token exchange');
    }
    
    return data;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw error;
  }
} 