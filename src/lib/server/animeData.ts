import 'server-only'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { Anime, Genre, OrderBy } from '@/types/api/anime'

// mocks/anime.json 경로 (프로젝트 루트 기준)
const DATA_PATH = join(process.cwd(), 'mocks', 'anime.json')

/* JSON 파일에서 전체 애니메이션 데이터를 읽어 파싱 */
function loadAnimeData(): Anime[] {
  const raw = readFileSync(DATA_PATH, 'utf-8')
  return JSON.parse(raw) as Anime[]
}

// orderBy 값에 따른 정렬 함수 맵
const SORTERS: Record<OrderBy, (a: Anime, b: Anime) => number> = {
  Score: (a, b) => (b.score ?? 0) - (a.score ?? 0),
  Popularity: (a, b) => (a.rank ?? 999) - (b.rank ?? 999),
  Latest: (a, b) => (b.year ?? 0) - (a.year ?? 0),
  Comments: (a, b) => b.malId - a.malId,
}

// 띄어쓰기·대소문자를 무시한 검색용 정규화
function normalize(str: string): string {
  return str.replace(/\s+/g, '').toLowerCase()
}

/* 장르 필터 + 제목 검색 + 정렬 조건을 적용한 애니메이션 목록 반환 */
export function getAnimeList(params: {
  genres?: Genre[]
  orderBy?: OrderBy
  aniName?: string
}): Anime[] {
  const { genres, orderBy = 'Popularity', aniName } = params
  let result = loadAnimeData()

  // genres 배열 중 하나라도 포함되면 통과
  if (genres && genres.length > 0) {
    result = result.filter((a) => {
      const animeGenres = a.genres.split(',').map((g) => g.trim())
      return genres.some((g) => animeGenres.includes(g))
    })
  }

  // 한국어·영어·일본어 제목 모두에서 띄어쓰기 무시 부분 일치 검색
  if (aniName && aniName.trim()) {
    const query = normalize(aniName)
    result = result.filter((a) =>
      normalize(a.title).includes(query) ||
      normalize(a.titleEnglish ?? '').includes(query) ||
      normalize(a.titleJapanese ?? '').includes(query)
    )
  }

  result.sort(SORTERS[orderBy] ?? SORTERS.Popularity)
  return result.map((anime, i) => ({ ...anime, rank: i + 1 }))
}

/* aniId로 단일 애니메이션 조회 — 없으면 null 반환 */
export function getAnimeById(aniId: string): Anime | null {
  const all = loadAnimeData()
  return all.find((a) => a.aniId === aniId) ?? null
}
