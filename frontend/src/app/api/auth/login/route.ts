// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // 1) parse & validate
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email and password are required' },
      { status: 400 }
    )
  }

  try {
    // 2) proxy to ASP.NET
    const resp = await fetch(
      `http://localhost:5001/api/Auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Password: password }),
      }
    )

    // 3) read raw JSON
    const payload = await resp.json().catch(() => ({}))
    console.log('Login proxy payload:', payload)

    // 4) if backend errored, pass it along
    if (!resp.ok) {
      return NextResponse.json(
        { message: payload.message || 'Authentication failed' },
        { status: resp.status }
      )
    }

    // 5) normalize token + user keys
    const token = payload.Token ?? payload.token
    const userData = payload.User ?? payload.user

    if (!token || !userData) {
      console.error('Missing token or user in payload', payload)
      return NextResponse.json(
        { message: 'Invalid login response shape' },
        { status: 502 }
      )
    }

    // 6) build the front-end user object
    const responsePayload = {
      name: userData.Name ?? userData.name,
      email: userData.Email ?? userData.email,
      profilePic: userData.ProfilePictureUrl ?? userData.profilePictureUrl,
      token,
    }

    // 7) set cookie + return JSON
    const responseObj = NextResponse.json(responsePayload)
    responseObj.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    })

    return responseObj
  } catch (error) {
    console.error('Login proxy error', error)
    return NextResponse.json(
      { message: 'Service unavailable. Check backend.' },
      { status: 503 }
    )
  }
}
