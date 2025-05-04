// For App Router: app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { email, password } = await req.json();
    
    console.log('Login attempt:', { email });
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Simple validation example (replace with your actual authentication logic)
    if (email === 'user@example.com' && password === 'password') {
      const userData = {
        name: 'Test User',
        email: email,
        profilePic: '/default-avatar.png',
        token: 'sample-jwt-token'
      };
      return NextResponse.json(userData);
    } else {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

