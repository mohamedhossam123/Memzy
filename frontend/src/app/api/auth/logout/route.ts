// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  // Create response and clear the auth cookie
  const response = NextResponse.json({ success: true });
  
  // Clear auth token cookie
  response.cookies.set({
    name: 'auth_token',
    value: '',
    expires: new Date(0),
    path: '/',
  });
  
  return response;
}