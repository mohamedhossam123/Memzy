// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest) {
  try {
    const { email, password } = await _req.json()
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
        credentials: 'include',
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
    // ──────────────── IMPORTANT ─────────────────
    // The backend serializes with camelCase. So check `responseData.token` (lowercase),
    // and `responseData.user.userId` (lowercase).
    if (!responseData.token || !responseData.user?.userId) {
      console.error('Invalid backend response:', responseData)
      return NextResponse.json(
        { message: 'Invalid server response format' },
        { status: 500 }
      )
    }

    // Create the response JSON for the frontend:
    const frontendResponse = NextResponse.json({
      user: {
        userId: responseData.user.userId,
        name: responseData.user.name,
        email: responseData.user.email,
        profilePictureUrl: responseData.user.profilePictureUrl ?? null,
        bio: responseData.user.bio ?? null,
      },
    })

    // Copy any Set-Cookie header from the backend (so JWT cookie is forwarded):
    const setCookieHeader = backendResponse.headers.get('set-cookie')
    if (setCookieHeader) {
      frontendResponse.headers.set('set-cookie', setCookieHeader)
    }

    return frontendResponse
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
