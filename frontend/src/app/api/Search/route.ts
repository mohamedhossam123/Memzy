// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json(
      { message: 'Search query is required' },
      { status: 400 }
    )
  }

  try {
    const resp = await fetch(
      `http://localhost:5001/api/Search/userSearch?searchTerm=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
        }
      }
    )

    const payload = await resp.json().catch(() => ({}))
    console.log('Search proxy payload:', payload)

    if (!resp.ok) {
      return NextResponse.json(
        { message: payload.message || 'Search failed' },
        { status: resp.status }
      )
    }

    const results = (payload.Results ?? payload.results ?? payload).map((item: any) => ({
      name: item.Name ?? item.name,
      profilePic: item.ProfilePictureUrl ?? item.profilePictureUrl ?? item.profilePic,
      bio: item.Bio ?? item.bio
    }))

    return NextResponse.json(results)

  } catch (error) {
    console.error('Search proxy error', error)
    return NextResponse.json(
      { message: 'Search service unavailable' },
      { status: 503 }
    )
  }
}