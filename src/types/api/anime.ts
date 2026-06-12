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

export const ORDER_BY_OPTIONS = ['Popularity', 'Latest', 'Score', 'Comments'] as const

export type OrderBy = (typeof ORDER_BY_OPTIONS)[number]

export interface Anime {
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
