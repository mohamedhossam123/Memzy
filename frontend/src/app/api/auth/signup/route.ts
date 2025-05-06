// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const resp = await fetch(`${BACKEND}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await resp.json() 
    return NextResponse.json(data, { status: resp.status })
  } catch (err) {
    console.error('Signup proxy error:', err)
    return NextResponse.json(
      { message: 'Proxy error during signup' },
      { status: 500 }
    )
  }
}
