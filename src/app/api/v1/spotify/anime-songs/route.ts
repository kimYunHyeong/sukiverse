import { NextRequest, NextResponse } from 'next/server'

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

/* Client Credentials로 Spotify 액세스 토큰 발급 */
async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('SPOTIFY_CLIENT_ID 또는 SPOTIFY_CLIENT_SECRET 환경변수가 없습니다.')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    next: { revalidate: 3500 }, // 토큰 유효시간 3600s 보다 짧게 캐시
  })

  if (!res.ok) throw new Error(`Spotify 토큰 발급 실패: ${res.status}`)
  const data = await res.json()
  return data.access_token as string
}

/* 애니메이션 제목으로 OP/ED 트랙 검색 */
async function searchAnimeSongs(token: string, animeTitle: string): Promise<SpotifyTrack[]> {
  const queries = [
    `${animeTitle} opening anime`,
    `${animeTitle} ending anime`,
  ]

  const results = await Promise.all(
    queries.map(async (q) => {
      const url = `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(q)}&type=track&limit=5&market=JP`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 },
      })
      if (!res.ok) return []
      const data = await res.json()
      return (data.tracks?.items ?? []) as SpotifyTrack[]
    }),
  )

  /* 중복 제거 후 최대 10개 반환 */
  const seen = new Set<string>()
  return results.flat().filter((t) => {
    if (seen.has(t.id)) return false
    seen.add(t.id)
    return true
  }).slice(0, 10)
}

/* GET /api/v1/spotify/anime-songs?title=[애니제목] */
export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get('title')
  if (!title) {
    return NextResponse.json({ error: 'title 파라미터가 필요합니다.' }, { status: 400 })
  }

  try {
    const token = await getSpotifyToken()
    const tracks = await searchAnimeSongs(token, title)
    return NextResponse.json({ tracks })
  } catch (err) {
    const message = err instanceof Error ? err.message : '서버 내부 오류가 발생했습니다.'
    /* 환경변수 미설정 시 빈 배열로 graceful degradation */
    if (message.includes('환경변수')) {
      return NextResponse.json({ tracks: [], unavailable: true })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: { id: string; name: string }[]
  album: {
    id: string
    name: string
    images: { url: string; width: number; height: number }[]
    release_date: string
  }
  duration_ms: number
  preview_url: string | null
  external_urls: { spotify: string }
}
