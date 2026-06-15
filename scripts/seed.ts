/**
 * DB 시드 스크립트
 * 실행: npm run seed
 *
 * Phase 1 — mocks/anime.json → anime, genres, anime_genres 테이블
 * Phase 2 — Jikan API → anime_songs 테이블 (OP/ED 텍스트)
 */
import { readFileSync } from 'fs'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, inArray } from 'drizzle-orm'
import { anime, genres, animeGenres, animeSongs } from '../src/db/schema/index.js'

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL 환경변수가 설정되지 않았습니다.')
  console.error('   .env.local 파일에 DATABASE_URL을 추가하세요.')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql)

// mocks/anime.json 타입
interface MockAnime {
  aniId: string
  malId: number
  title: string
  titleEnglish: string | null
  titleJapanese: string | null
  year: number | null
  score: number | null
  rank: number | null
  imageUrl: string | null
  genres: string // "Action,Adventure,Drama"
}

/* Jikan rate limit 대비 딜레이 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/* Jikan API /anime/{id}/themes 엔드포인트에서 OP/ED 텍스트 가져오기 */
async function fetchThemes(malId: number): Promise<{ opening: string[]; ending: string[] }> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}/themes`, {
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) return { opening: [], ending: [] }
    const json = await res.json() as { data: { openings?: string[]; endings?: string[] } }
    return {
      opening: json.data.openings ?? [],
      ending: json.data.endings ?? [],
    }
  } catch {
    return { opening: [], ending: [] }
  }
}

/* Phase 1: anime.json → DB */
async function seedAnime() {
  console.log('\n📦 Phase 1: anime + genres 시드 시작...')

  const raw = readFileSync('mocks/anime.json', 'utf-8')
  const mockList = JSON.parse(raw) as MockAnime[]

  // 1. 모든 장르 수집 → genres 테이블 upsert
  const allGenreNames = [...new Set(
    mockList.flatMap((a) => a.genres.split(',').map((g) => g.trim()).filter(Boolean))
  )]

  console.log(`   장르 ${allGenreNames.length}개 삽입 중...`)
  for (const name of allGenreNames) {
    await db.insert(genres).values({ name }).onConflictDoNothing()
  }

  // 2. genres 테이블에서 name→id 맵 구성
  const genreRows = await db.select().from(genres).where(inArray(genres.name, allGenreNames))
  const genreMap = new Map(genreRows.map((g) => [g.name, g.id]))

  // 3. anime 테이블 upsert
  console.log(`   애니메이션 ${mockList.length}개 삽입 중...`)
  for (const mock of mockList) {
    await db
      .insert(anime)
      .values({
        aniId: mock.aniId,
        malId: mock.malId,
        titleKo: mock.title,
        titleEn: mock.titleEnglish,
        titleJp: mock.titleJapanese,
        year: mock.year,
        score: mock.score,
        rank: mock.rank,
        imageUrl: mock.imageUrl,
      })
      .onConflictDoNothing()
  }

  // 4. anime_genres 연결 삽입
  const animeRows = await db.select({ id: anime.id, aniId: anime.aniId }).from(anime)
  const animeIdMap = new Map(animeRows.map((a) => [a.aniId, a.id]))

  console.log('   anime_genres 연결 삽입 중...')
  for (const mock of mockList) {
    const animeId = animeIdMap.get(mock.aniId)
    if (!animeId) continue

    const genreNames = mock.genres.split(',').map((g) => g.trim()).filter(Boolean)
    for (const genreName of genreNames) {
      const genreId = genreMap.get(genreName)
      if (!genreId) continue
      await db.insert(animeGenres).values({ animeId, genreId }).onConflictDoNothing()
    }
  }

  console.log('✅ Phase 1 완료')
  return animeIdMap
}

/* Phase 2: Jikan OP/ED → anime_songs */
async function seedAnimeSongs(animeIdMap: Map<string, string>) {
  console.log('\n🎵 Phase 2: anime_songs (OP/ED) 시드 시작...')
  console.log('   Jikan API 호출 (3초 간격, rate limit 방지)...\n')

  const raw = readFileSync('mocks/anime.json', 'utf-8')
  const mockList = JSON.parse(raw) as MockAnime[]

  let inserted = 0
  for (const mock of mockList) {
    const animeId = animeIdMap.get(mock.aniId)
    if (!animeId) continue

    // 이미 삽입된 경우 스킵
    const existing = await db
      .select({ id: animeSongs.id })
      .from(animeSongs)
      .where(eq(animeSongs.animeId, animeId))
      .limit(1)
    if (existing.length > 0) {
      console.log(`   [SKIP] ${mock.title} — 이미 존재`)
      continue
    }

    const themes = await fetchThemes(mock.malId)
    console.log(`   [${mock.title}] OP:${themes.opening.length} ED:${themes.ending.length}`)

    for (let i = 0; i < themes.opening.length; i++) {
      await db.insert(animeSongs).values({
        animeId,
        themeType: 'opening',
        themeText: themes.opening[i],
        sortOrder: i,
      }).onConflictDoNothing()
      inserted++
    }

    for (let i = 0; i < themes.ending.length; i++) {
      await db.insert(animeSongs).values({
        animeId,
        themeType: 'ending',
        themeText: themes.ending[i],
        sortOrder: i,
      }).onConflictDoNothing()
      inserted++
    }

    // Jikan rate limit: 3 req/s → 350ms 대기
    await delay(350)
  }

  console.log(`\n✅ Phase 2 완료 — anime_songs ${inserted}개 삽입`)
}

/* 메인 */
async function main() {
  console.log('🚀 sukiverse DB 시드 시작\n')
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL!.replace(/:\/\/.*@/, '://**@')}`)

  const animeIdMap = await seedAnime()
  await seedAnimeSongs(animeIdMap)

  console.log('\n🎉 시드 완료! Drizzle Studio로 확인: npx drizzle-kit studio')
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ 시드 실패:', err)
  process.exit(1)
})
