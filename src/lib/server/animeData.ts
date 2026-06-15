import 'server-only'
import { eq, ilike, inArray, or, asc, desc, and } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { db } from '@/db/index'
import { anime, genres, animeGenres } from '@/db/schema/index'
import type { Genre, OrderBy } from '@/types/api/anime'
import type { Anime } from '@/types/api/anime'

const ORDER_MAP = {
  Score: desc(anime.score),
  Popularity: asc(anime.rank),
  Latest: desc(anime.year),
  Comments: desc(anime.malId),
} satisfies Record<OrderBy, SQL>

/* 장르 필터 + 제목 검색 + 정렬 조건을 적용한 애니메이션 목록 반환 */
export async function getAnimeList(params: {
  genres?: Genre[]
  orderBy?: OrderBy
  aniName?: string
}): Promise<Anime[]> {
  const { genres: genreFilters, orderBy = 'Popularity', aniName } = params

  // 장르 필터 적용 시 해당 장르를 가진 anime ID 먼저 조회
  let filteredIds: string[] | null = null
  if (genreFilters && genreFilters.length > 0) {
    const rows = await db
      .selectDistinct({ animeId: animeGenres.animeId })
      .from(animeGenres)
      .innerJoin(genres, eq(genres.id, animeGenres.genreId))
      .where(inArray(genres.name, genreFilters))
    filteredIds = rows.map((r) => r.animeId)
    if (filteredIds.length === 0) return []
  }

  // 조건 조합
  const conditions: SQL[] = []
  if (filteredIds) conditions.push(inArray(anime.id, filteredIds))
  if (aniName?.trim()) {
    const q = `%${aniName.trim()}%`
    conditions.push(
      or(ilike(anime.titleKo, q), ilike(anime.titleEn, q), ilike(anime.titleJp, q))!,
    )
  }

  const animeRows = await db
    .select()
    .from(anime)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(ORDER_MAP[orderBy] ?? asc(anime.rank))

  if (animeRows.length === 0) return []

  // 장르 목록 일괄 조회 후 animeId로 그룹화
  const genreRows = await db
    .select({ animeId: animeGenres.animeId, name: genres.name })
    .from(animeGenres)
    .innerJoin(genres, eq(genres.id, animeGenres.genreId))
    .where(inArray(animeGenres.animeId, animeRows.map((a) => a.id)))

  const genreMap = new Map<string, string[]>()
  for (const row of genreRows) {
    if (!genreMap.has(row.animeId)) genreMap.set(row.animeId, [])
    genreMap.get(row.animeId)!.push(row.name)
  }

  return animeRows.map((a, i) => ({
    aniId: a.aniId,
    malId: a.malId,
    title: a.titleKo,
    titleEnglish: a.titleEn ?? null,
    titleJapanese: a.titleJp ?? null,
    year: a.year ?? null,
    score: a.score ?? null,
    rank: i + 1,
    imageUrl: a.imageUrl ?? null,
    genres: genreMap.get(a.id)?.join(',') ?? '',
  }))
}

/* aniId로 단일 애니메이션 조회 — 없으면 null 반환 */
export async function getAnimeById(aniId: string): Promise<Anime | null> {
  const rows = await db.select().from(anime).where(eq(anime.aniId, aniId)).limit(1)
  const a = rows[0]
  if (!a) return null

  const genreRows = await db
    .select({ name: genres.name })
    .from(animeGenres)
    .innerJoin(genres, eq(genres.id, animeGenres.genreId))
    .where(eq(animeGenres.animeId, a.id))

  return {
    aniId: a.aniId,
    malId: a.malId,
    title: a.titleKo,
    titleEnglish: a.titleEn ?? null,
    titleJapanese: a.titleJp ?? null,
    year: a.year ?? null,
    score: a.score ?? null,
    rank: a.rank ?? null,
    imageUrl: a.imageUrl ?? null,
    genres: genreRows.map((g) => g.name).join(','),
  }
}
