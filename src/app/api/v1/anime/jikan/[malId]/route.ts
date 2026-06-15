import { NextRequest, NextResponse } from 'next/server'

const JIKAN_BASE = 'https://api.jikan.moe/v4'

/* Jikan API 호출 시 rate limit(3req/s) 대비 간단한 fetch 래퍼 */
async function jikanFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${JIKAN_BASE}${path}`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Jikan API error: ${res.status}`)
  const json = await res.json()
  return json as T
}

/* GET /api/v1/anime/jikan/[malId] — 애니메이션 상세 정보(기본 정보 + 캐릭터 + 에피소드) */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ malId: string }> },
) {
  const { malId } = await params
  const id = parseInt(malId, 10)

  if (isNaN(id)) {
    return NextResponse.json({ error: '유효하지 않은 malId입니다.' }, { status: 400 })
  }

  try {
    /* 기본 정보 + 캐릭터 + 에피소드를 병렬로 요청 */
    const [detail, characters, episodes] = await Promise.all([
      jikanFetch<JikanAnimeDetailResponse>(`/anime/${id}/full`),
      jikanFetch<JikanCharactersResponse>(`/anime/${id}/characters`),
      jikanFetch<JikanEpisodesResponse>(`/anime/${id}/episodes?limit=100`),
    ])

    return NextResponse.json({
      detail: detail.data,
      characters: characters.data.slice(0, 20),
      episodes: episodes.data,
      episodeCount: episodes.pagination?.items?.total ?? detail.data.episodes,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : '서버 내부 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/* Jikan API 응답 타입 (필요한 필드만) */
interface JikanAnimeDetailResponse {
  data: JikanAnimeDetail
}

interface JikanCharactersResponse {
  data: JikanCharacter[]
}

interface JikanEpisodesResponse {
  data: JikanEpisode[]
  pagination?: { items?: { total?: number } }
}

export interface JikanAnimeDetail {
  mal_id: number
  title: string
  title_english: string | null
  title_japanese: string | null
  synopsis: string | null
  episodes: number | null
  status: string | null
  aired: { from: string | null; to: string | null; string: string | null }
  duration: string | null
  rating: string | null
  score: number | null
  scored_by: number | null
  rank: number | null
  popularity: number | null
  members: number | null
  year: number | null
  season: string | null
  studios: { mal_id: number; name: string }[]
  genres: { mal_id: number; name: string }[]
  themes: { mal_id: number; name: string }[]
  images: { jpg: { large_image_url: string | null }; webp?: { large_image_url: string | null } }
  trailer: { youtube_id: string | null; url: string | null }
  type: string | null
  source: string | null
  opening_themes: string[]
  ending_themes: string[]
}

export interface JikanCharacter {
  character: {
    mal_id: number
    name: string
    images: { jpg: { image_url: string | null } }
  }
  role: string
  voice_actors: {
    person: { mal_id: number; name: string; images: { jpg: { image_url: string | null } } }
    language: string
  }[]
}

export interface JikanEpisode {
  mal_id: number
  title: string | null
  title_japanese: string | null
  aired: string | null
  score: number | null
  filler: boolean
  recap: boolean
}
