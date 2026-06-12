export const GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Historical',
  'Isekai',
  'Martial Arts',
  'Mecha',
  'Military',
  'Music',
  'Psychological',
  'School',
  'Space',
  'Super Power',
  'Time Travel',
  'Vampire',
] as const

export type Genre = (typeof GENRES)[number]

export const GENRE_LABELS: Record<Genre, string> = {
  Action: '액션',
  Adventure: '모험',
  Comedy: '코미디',
  Drama: '드라마',
  Fantasy: '판타지',
  Horror: '공포',
  Mystery: '미스터리',
  Romance: '로맨스',
  'Sci-Fi': 'SF',
  'Slice of Life': '일상',
  Sports: '스포츠',
  Supernatural: '초자연',
  Historical: '역사',
  Isekai: '이세계',
  'Martial Arts': '무협',
  Mecha: '메카',
  Military: '밀리터리',
  Music: '음악',
  Psychological: '심리',
  School: '학원',
  Space: '우주',
  'Super Power': '초능력',
  'Time Travel': '타임슬립',
  Vampire: '뱀파이어',
}

export const ORDER_BY_OPTIONS = ['Popularity', 'Latest', 'Score', 'Comments'] as const

export type OrderBy = (typeof ORDER_BY_OPTIONS)[number]

export interface Anime {
  aniId: string
  malId: number
  title: string
  titleEnglish: string | null
  titleJapanese: string | null
  year: number | null
  score: number | null
  rank: number | null
  imageUrl: string | null
  genres: string
}
