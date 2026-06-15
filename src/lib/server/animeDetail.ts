import 'server-only'
import type { AnimeDetailResponse, SpotifyTrack } from '@/types/api/anime-detail'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

/* Jikan API에서 애니메이션 상세 정보 조회 */
export async function fetchAnimeDetail(malId: number): Promise<AnimeDetailResponse> {
  const res = await fetch(`${APP_URL}/api/v1/anime/jikan/${malId}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`애니메이션 상세 정보 조회 실패: ${res.status}`)
  return res.json() as Promise<AnimeDetailResponse>
}

/* Spotify에서 애니메이션 OST 검색 */
export async function fetchAnimeSongs(title: string): Promise<SpotifyTrack[]> {
  const res = await fetch(
    `${APP_URL}/api/v1/spotify/anime-songs?title=${encodeURIComponent(title)}`,
    { next: { revalidate: 3600 } },
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.tracks ?? []) as SpotifyTrack[]
}
