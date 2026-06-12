import 'server-only'
import type { Anime, Genre, OrderBy } from '@/types/api/anime'

const API_URL = process.env.API_URL

export async function getAnimeList(params: {
  genre?: Genre
  orderBy?: OrderBy
}): Promise<Anime[]> {
  if (!API_URL) throw new Error('API_URL 환경변수가 설정되지 않았습니다.')

  const searchParams = new URLSearchParams()
  if (params.genre) searchParams.set('genre', params.genre)
  if (params.orderBy) searchParams.set('orderBy', params.orderBy)

  const res = await fetch(`${API_URL}/v1/anime/jikan?${searchParams}`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.detail ?? `애니메이션 목록 조회 실패 (${res.status})`)
  }

  return res.json()
}
