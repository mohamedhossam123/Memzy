// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface BackendLoginResponse {
  Token?: string
  token?: string
  User?: {
    UserId?: number
    Name?: string
    Email?: string
    ProfilePictureUrl?: string
    Bio?: string
  }
  user?: {
    userId?: number
    name?: string
    email?: string
    profilePictureUrl?: string
    bio?: string
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Call ASP.NET Core backend:
    const backendResponse = await fetch(
      'http://localhost:5001/api/Auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Password: password }),
      }
    )

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      return NextResponse.json(
        { message: errorData.message || 'Authentication failed' },
        { status: backendResponse.status }
      )
    }

    const responseData = await backendResponse.json()
    
    // Get token from response data
    const token = responseData.token || responseData.Token

    if (!token || !responseData.user?.userId) {
      console.error('Invalid backend response:', responseData)
      return NextResponse.json(
        { message: 'Invalid server response format' },
        { status: 500 }
      )
    }

    // Create the response JSON for the frontend:
    const frontendResponse = NextResponse.json({
      token,
      user: {
        userId: responseData.user.userId,
        name: responseData.user.name,
        email: responseData.user.email,
        profilePictureUrl: responseData.user.profilePictureUrl ?? null,
        bio: responseData.user.bio ?? null,
      },
    })

    return frontendResponse
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}