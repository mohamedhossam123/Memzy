// app/api/auth/check/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  if (!token) return NextResponse.json({ authenticated: false, user: null })

  try {
    const resp = await fetch('http://localhost:5001/api/Auth/validate', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!resp.ok) {
      return NextResponse.json({ authenticated: false, user: null })
    }
    const user = await resp.json()
    return NextResponse.json({
      authenticated: true,
      user: {
        name: user.Name,
        email: user.Email,
        profilePic: user.ProfilePictureUrl,
        token,
      },
    })
  } catch (e) {
    console.error('Auth check proxy error', e)
    return NextResponse.json({ authenticated: false, user: null })
  }
}
