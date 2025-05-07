// app/api/auth/check/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 401 }
    )
  }

  try {
    const resp = await fetch('http://localhost:5001/api/Auth/getCurrentUser', {
      headers: { Authorization: `Bearer ${token}` },
    })
    

    if (!resp.ok) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: resp.status }
      )
    }

    const user = await resp.json()
return NextResponse.json({
  authenticated: true,
  user: {
    name: user.Name ?? user.name,
    email: user.Email ?? user.email,
    profilePic: user.ProfilePictureUrl ?? user.profilePic ?? null,
    bio: user.Bio ?? null,
    humorTypeId: user.HumorTypeId ?? null,
    createdAt: user.CreatedAt ?? null,
    token,
  },
})

  } catch (error) {
    console.error('Auth check proxy error:', error)
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500 }
    )
  }
}
