// app/api/auth/check/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  try {
    const backendResponse = await fetch('http://localhost:5001/api/Auth/check', {
      credentials: 'include'
    })

    if (!backendResponse.ok) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()

    // Validate backend response structure
    if (
      typeof data.authenticated !== 'boolean' ||
      (data.authenticated && !data.user?.UserId)
    ) {
      console.error('Invalid check response:', data)
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 500 }
      )
    }

    return NextResponse.json({
      authenticated: data.authenticated,
      user: data.authenticated
        ? {
            userId: data.user.UserId,
            name: data.user.Name,
            email: data.user.Email,
            profilePictureUrl: data.user.ProfilePictureUrl ?? null,
            bio: data.user.Bio ?? null,
          }
        : null,
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500 }
    )
  }
}
