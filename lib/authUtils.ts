'use server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

const NODE_ENV = process.env.NODE_ENV;
const HOST = NODE_ENV === 'development' ? 'http://' + process.env.HOST : 'https://' + process.env.HOST;
const NEXT_URL = process.env.NEXT_URL;
const FLASK_URL = NODE_ENV === 'development' ? 'http://' + process.env.FLASK_URL : 'https://' + process.env.FLASK_URL;

export async function is_authenticated() {
  const tokens = cookies().get('tokens');
  let sessionData = null;
  const headers: Record<string, string> = {};
  if (tokens) {
    // headers['Authorization'] = `Bearer ${tokens.value}`;
    headers['Content-Type'] = 'application/json';
    headers['Cookie'] = `tokens=${JSON.stringify(tokens)}`;
  }
  console.log('in authUtils', `${FLASK_URL}/api/is_authenticated`);
  const resp = fetch(`${FLASK_URL}/api/is_authenticated`, {
    credentials: 'include', // Ensure cookies are sent with the request if needed
    headers: headers
  });
  const response = await resp;
  if (!response.ok) {
    if (response.status === 401) {
      sessionData = { is_authenticated: false };
    } else {
      throw new Error(
        `Failed to fetch session data: ${response.status} ${response.statusText}`
      );
    }
  } else {
    sessionData = await response.json();
  }
  return sessionData.is_authenticated;
}

export async function logout() {
  try {
    await signOut();
    redirect('/');  // Redirect to home page after logout
  } catch (error) {
    console.error('Logout failed:', error);
    // You could throw an error here to be caught by error boundaries
    // or return an error message to be displayed
  }
}

export async function signOut() {
  const response = NextResponse.redirect(`${FLASK_URL}/api/logout`);
  response.cookies.delete('tokens');
  return response;
}
