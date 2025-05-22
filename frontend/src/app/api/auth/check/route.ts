// app/api/auth/check/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1] || ''
    
    if (!token) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      )
    }

    const backendResponse = await fetch('http://localhost:5001/api/Auth/validate', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!backendResponse.ok) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    
    return NextResponse.json({
      authenticated: true,
      user: data.user ? {
        userId: data.user.userId,
        name: data.user.name,
        email: data.user.email,
        userName: data.user.userName, // Added username
        profilePictureUrl: data.user.profilePictureUrl ?? null,
        bio: data.user.bio ?? null,
      } : null,
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500 }
    )
  }
}