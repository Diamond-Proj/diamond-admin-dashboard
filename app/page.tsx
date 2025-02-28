import React from 'react';
import { cookies } from 'next/headers';
import { is_authenticated } from '@/lib/authUtils';

export default async function DashboardPage({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) {
  const isAuthenticated = await is_authenticated();
  
  // Try to get tokens from various cookie sources
  const tokensCookie = cookies().get('tokens');
  const accessTokenCookie = cookies().get('access_token');
  const idTokenCookie = cookies().get('id_token');
  const refreshTokenCookie = cookies().get('refresh_token');
  
  let extractedTokens = null;
  let tokenDisplay = 'No tokens found';
  
  // First try the combined tokens cookie - which should have the by_resource_server structure
  if (tokensCookie) {
    try {
      // First try to parse as JSON directly
      try {
        extractedTokens = JSON.parse(decodeURIComponent(tokensCookie.value));
        console.log('Tokens parsed from cookie, structure:', typeof extractedTokens === 'object' ? Object.keys(extractedTokens) : typeof extractedTokens);
      } catch (e) {
        // If that fails, try to unescape and then parse
        const unescapedTokens = decodeURIComponent(tokensCookie.value).replace(/\\054/g, ',').replace(/\\"/g, '"');
        extractedTokens = JSON.parse(unescapedTokens);
        console.log('Tokens parsed after unescaping');
      }
    } catch (error) {
      console.error('Error parsing tokens cookie:', error);
    }
  }
  
  // If we couldn't get tokens from the combined cookie, try individual cookies
  if (!extractedTokens && (accessTokenCookie || idTokenCookie || refreshTokenCookie)) {
    extractedTokens = {} as Record<string, string>;
    
    if (accessTokenCookie) {
      extractedTokens.access_token = accessTokenCookie.value;
    }
    
    if (idTokenCookie) {
      extractedTokens.id_token = idTokenCookie.value;
    }
    
    if (refreshTokenCookie) {
      extractedTokens.refresh_token = refreshTokenCookie.value;
    }
  }
  
  // Format tokens for display
  if (extractedTokens) {
    try {
      // Check if we have the by_resource_server structure or individual tokens
      const isByResourceServer = typeof extractedTokens === 'object' && 
        Object.keys(extractedTokens).some(key => 
          typeof extractedTokens[key] === 'object' && extractedTokens[key]?.access_token
        );
      
      if (isByResourceServer) {
        // Create masked version of by_resource_server structure
        const maskedTokens: Record<string, any> = {};
        
        Object.keys(extractedTokens).forEach(server => {
          const serverTokens = extractedTokens[server];
          maskedTokens[server] = { ...serverTokens };
          
          // Mask sensitive token values
          if (serverTokens.access_token) {
            const tokenStart = serverTokens.access_token.substring(0, 10);
            const tokenEnd = serverTokens.access_token.substring(serverTokens.access_token.length - 5);
            maskedTokens[server].access_token = `${tokenStart}...${tokenEnd}`;
          }
          
          if (serverTokens.refresh_token) {
            const tokenStart = serverTokens.refresh_token.substring(0, 10);
            const tokenEnd = serverTokens.refresh_token.substring(serverTokens.refresh_token.length - 5);
            maskedTokens[server].refresh_token = `${tokenStart}...${tokenEnd}`;
          }
        });
        
        tokenDisplay = JSON.stringify(maskedTokens, null, 2);
      } else {
        // For security, mask the actual token values but show their existence
        const displayTokens = { ...extractedTokens };
        
        // Mask sensitive token values
        if (displayTokens.access_token) {
          const tokenStart = displayTokens.access_token.substring(0, 10);
          const tokenEnd = displayTokens.access_token.substring(displayTokens.access_token.length - 5);
          displayTokens.access_token = `${tokenStart}...${tokenEnd}`;
        }
        
        if (displayTokens.refresh_token) {
          const tokenStart = displayTokens.refresh_token.substring(0, 10);
          const tokenEnd = displayTokens.refresh_token.substring(displayTokens.refresh_token.length - 5);
          displayTokens.refresh_token = `${tokenStart}...${tokenEnd}`;
        }
        
        if (displayTokens.id_token) {
          const tokenStart = displayTokens.id_token.substring(0, 10);
          const tokenEnd = displayTokens.id_token.substring(displayTokens.id_token.length - 5);
          displayTokens.id_token = `${tokenStart}...${tokenEnd}`;
        }
        
        tokenDisplay = JSON.stringify(displayTokens, null, 2);
      }
    } catch (error) {
      console.error('Error formatting tokens for display:', error);
      tokenDisplay = 'Error formatting tokens for display';
    }
  } else {
    // Check if we have any authentication cookies at all
    const nameCookie = cookies().get('name');
    const emailCookie = cookies().get('email');
    
    if (nameCookie || emailCookie) {
      tokenDisplay = 'Authentication successful, but token details are not available for display';
    } else {
      tokenDisplay = 'No authentication tokens found';
    }
  }
  
  console.log('Authentication status:', isAuthenticated);
  
  return (
    <>
      <main className="flex flex-1 flex-col p-4 md:p-6">
        <div className="flex items-center mb-8">
          <h1 className="font-semibold text-lg md:text-2xl">Dashboard</h1>
        </div>
        <div className="w-full mb-4">
          {/* <Search value={searchParams.q} /> */}
        </div>
        <div className="w-full mb-4">
          {isAuthenticated ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md mb-6">
                <p className="text-green-700 dark:text-green-400 font-medium">
                  ✓ You are successfully authenticated
                </p>
              </div>
              
              <h3 className="text-lg font-medium mb-2">Your Authentication Tokens:</h3>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md overflow-auto max-h-96">
                <pre className="text-sm whitespace-pre-wrap break-all">
                  {tokenDisplay}
                </pre>
              </div>
              
              {/* Display user profile information if available */}
              {(cookies().get('name') || cookies().get('email')) && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Your Profile Information:</h3>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md">
                    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {cookies().get('name') && (
                        <>
                          <dt className="font-medium text-gray-500 dark:text-gray-400">Name:</dt>
                          <dd>{cookies().get('name')?.value}</dd>
                        </>
                      )}
                      {cookies().get('email') && (
                        <>
                          <dt className="font-medium text-gray-500 dark:text-gray-400">Email:</dt>
                          <dd>{cookies().get('email')?.value}</dd>
                        </>
                      )}
                      {cookies().get('primary_username') && (
                        <>
                          <dt className="font-medium text-gray-500 dark:text-gray-400">Username:</dt>
                          <dd>{cookies().get('primary_username')?.value}</dd>
                        </>
                      )}
                      {cookies().get('institution') && (
                        <>
                          <dt className="font-medium text-gray-500 dark:text-gray-400">Institution:</dt>
                          <dd>{cookies().get('institution')?.value}</dd>
                        </>
                      )}
                    </dl>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                <p className="text-yellow-700 dark:text-yellow-400">
                  You are not authenticated. Please sign in to access the dashboard.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
