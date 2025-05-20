// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1]
    
    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }
    const response = await fetch('http://localhost:5001/api/Auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Logout failed on backend' },
        { status: response.status }
      )
    }

    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    )
  }
}