import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization code from the request body
    const body = await request.json();
    const { code } = body;
    
    if (!code) {
      console.error('No authorization code provided in request');
      return NextResponse.json(
        { error: 'No authorization code provided' },
        { status: 400 }
      );
    }
    
    // Get environment variables
    const clientId = process.env.NEXT_PUBLIC_GLOBUS_CLIENT_ID;
    const clientSecret = process.env.GLOBUS_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('Missing required environment variables', { 
        hasClientId: !!clientId, 
        hasClientSecret: !!clientSecret 
      });
      return NextResponse.json(
        { error: 'Server configuration error', details: 'Missing required authentication credentials' },
        { status: 500 }
      );
    }
    
    // Get scopes from environment variable 
    const scopes = process.env.NEXT_PUBLIC_GLOBUS_SCOPES || '';
    
    // Construct the redirect URI
    const isProduction = process.env.NODE_ENV === 'production';
    const hostname = isProduction 
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL || 'diamondhpc.ai'}`
      : 'http://localhost:3000';
    const redirectUri = `${hostname}/auth/callback`;
    
    console.log('Token exchange request details:', {
      redirectUri,
      isProduction,
      hostname,
      hasScopes: !!scopes
    });
    
    // Construct the token request parameters
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code: code
    });
    
    console.log('Making token request to Globus Auth');
    
    try {
      // Make the token request
      const response = await fetch('https://auth.globus.org/v2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      
      console.log('Token response status:', response.status);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Token exchange error response:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { error: 'Unknown error', error_description: response.statusText };
        }
        
        return NextResponse.json(
          { 
            error: 'Token exchange failed', 
            details: errorData.error_description || errorData.error || response.statusText,
            status: response.status
          },
          { status: response.status }
        );
      }
      
      const tokenResponse = await response.json();
      console.log('Token exchange successful, received token types:', Object.keys(tokenResponse));
      
      // Parse the ID token if present
      let userInfo = null;
      if (tokenResponse.id_token) {
        try {
          // Simple parsing of the JWT payload
          const payload = tokenResponse.id_token.split('.')[1];
          const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
          userInfo = JSON.parse(decodedPayload);
          
          // Store the decoded claims for easier access
          tokenResponse.id_token_claims = userInfo;
          console.log('Successfully parsed ID token claims');
        } catch (error) {
          console.error('Error parsing ID token:', error);
        }
      } else {
        console.log('No ID token present in response');
      }
      
      // Format tokens in the by_resource_server structure like the backend does
      // This is critical for compatibility with the backend @authenticated decorator
      const resourceServer = tokenResponse.resource_server || 'https://auth.globus.org'; 
      
      // Define the token structure type
      type TokenData = {
        access_token: string;
        refresh_token: string | null;
        expires_at_seconds: number;
        resource_server: string;
        token_type: string;
        scope: string;
      };
      
      // Create the by_resource_server structure
      const byResourceServer: Record<string, TokenData> = {
        [resourceServer]: {
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token || null,
          expires_at_seconds: Math.floor(Date.now() / 1000) + (tokenResponse.expires_in || 3600),
          resource_server: resourceServer,
          token_type: tokenResponse.token_type || 'Bearer',
          scope: tokenResponse.scope || scopes
        }
      };
      
      // Add any other tokens from the other_tokens array if present
      if (tokenResponse.other_tokens && Array.isArray(tokenResponse.other_tokens)) {
        tokenResponse.other_tokens.forEach((token: {
          resource_server: string;
          access_token: string;
          refresh_token?: string;
          expires_in?: number;
          token_type?: string;
          scope?: string;
        }) => {
          if (token.resource_server) {
            byResourceServer[token.resource_server] = {
              access_token: token.access_token,
              refresh_token: token.refresh_token || null,
              expires_at_seconds: Math.floor(Date.now() / 1000) + (token.expires_in || 3600),
              resource_server: token.resource_server,
              token_type: token.token_type || 'Bearer',
              scope: token.scope || ''
            };
          }
        });
      }
      
      // Add the formatted tokens to the response
      const formattedTokens = {
        ...tokenResponse,
        by_resource_server: byResourceServer
      };
      
      console.log('Formatted tokens with by_resource_server structure:', 
        Object.keys(formattedTokens.by_resource_server));
      
      // Return tokens and user info
      return NextResponse.json({
        tokens: formattedTokens,
        userInfo
      });
    } catch (fetchError) {
      console.error('Network error during token exchange:', fetchError);
      return NextResponse.json(
        { error: 'Network error', details: (fetchError as Error).message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in token exchange API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}