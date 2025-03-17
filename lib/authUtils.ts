'use server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { clearTokensFromCookies } from '@/lib/globusAuth';

// No need for FLASK_URL anymore
// const NODE_ENV = process.env.NODE_ENV;
// const FLASK_URL = NODE_ENV === 'development' ? 'http://' + process.env.FLASK_URL : 'https://' + process.env.FLASK_URL;

export async function is_authenticated() {
  // Check for tokens in cookies
  const tokensCookie = cookies().get('tokens');
  const isAuthenticatedCookie = cookies().get('is_authenticated');
  const accessTokenCookie = cookies().get('access_token');
  const idTokenCookie = cookies().get('id_token');
  
  // Log authentication check
  console.log('Authenticating request for:', process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost');
  
  // If we have any of the authentication cookies, consider the user authenticated
  if (tokensCookie || isAuthenticatedCookie || accessTokenCookie || idTokenCookie) {
    console.log('Authentication status: true');
    return true;
  }
  
  // Check for user profile cookies as a fallback
  const nameCookie = cookies().get('name');
  const emailCookie = cookies().get('email');
  
  if (nameCookie || emailCookie) {
    console.log('Authentication status (via profile cookies): true');
    return true;
  }
  
  // No authentication tokens found
  console.log('Authentication status: false');
  return false;
}

export async function logout() {
  try {
    // Use signOut which now handles client-side cookie clearing
    await signOut();
    redirect('/sign-in');  // Redirect to sign-in page after logout
  } catch (error) {
    console.error('Logout failed:', error);
    // Still redirect to sign-in page even if there's an error
    redirect('/sign-in');
  }
}

export async function signOut() {
  // Create a response that redirects to the sign-in page
  const response = NextResponse.redirect('/sign-in');
  
  // Clear all auth-related cookies
  response.cookies.delete('tokens');
  response.cookies.delete('is_authenticated');
  response.cookies.delete('name');
  response.cookies.delete('email');
  response.cookies.delete('primary_identity');
  response.cookies.delete('primary_username');
  response.cookies.delete('institution');
  
  // Note: This server-side cookie clearing complements the client-side
  // clearTokensFromCookies function for a comprehensive logout
  
  return response;
}

export async function getUserInfo() {
  const nameCookie = cookies().get('name');
  const emailCookie = cookies().get('email');
  const primary_identityCookie = cookies().get('primary_identity');
  const institutionCookie = cookies().get('institution');
  
  if (!nameCookie || !emailCookie) {
    throw new Error('No userInfo found in cookies');
  }
  
  const name = nameCookie.value;
  const email = emailCookie.value;
  const primary_identity = primary_identityCookie!.value;
  const institution = institutionCookie!.value;
  return {
    name: name,
    email: email,
    primary_identity: primary_identity,
    institution: institution,
  };
}
