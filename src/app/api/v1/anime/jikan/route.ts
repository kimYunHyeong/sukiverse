import { NextRequest, NextResponse } from 'next/server'
import { getAnimeList } from '@/lib/server/animeData'
import type { Genre, OrderBy } from '@/types/api/anime'

/* GET /api/v1/anime/jikan — 브라우저/외부 클라이언트용 애니메이션 목록 엔드포인트 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const genres = searchParams.getAll('genre') as Genre[]
  const orderBy = (searchParams.get('orderBy') ?? 'Popularity') as OrderBy
  const aniName = searchParams.get('aniName') ?? undefined

  try {
    const data = await getAnimeList({ genres: genres.length > 0 ? genres : undefined, orderBy, aniName })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : '서버 내부 오류가 발생했습니다.'
    return NextResponse.json(
      { title: 'Internal Server Error', status: 500, detail: message },
      { status: 500 },
    )
  }
}
