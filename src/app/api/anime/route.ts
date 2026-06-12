import { NextRequest, NextResponse } from 'next/server'
import { getAnimeList } from '@/services/animeService'
import type { Genre, OrderBy } from '@/types/api/anime'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const genre = searchParams.get('genre') as Genre | null
  const orderBy = (searchParams.get('orderBy') ?? 'Popularity') as OrderBy

  try {
    const data = await getAnimeList({ genre: genre ?? undefined, orderBy })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : '서버 내부 오류가 발생했습니다.'
    return NextResponse.json({ title: 'Internal Server Error', status: 500, detail: message }, { status: 500 })
  }
}
