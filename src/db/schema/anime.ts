import { pgTable, uuid, text, integer, real, date, timestamp, serial, primaryKey } from 'drizzle-orm/pg-core'

export const anime = pgTable('anime', {
  id: uuid('id').primaryKey().defaultRandom(),
  aniId: text('ani_id').unique().notNull(),
  malId: integer('mal_id').unique().notNull(),
  titleKo: text('title_ko').notNull(),
  titleEn: text('title_en'),
  titleJp: text('title_jp'),
  year: integer('year'),
  score: real('score'),
  rank: integer('rank'),
  imageUrl: text('image_url'),
  synopsis: text('synopsis'),
  status: text('status'),
  type: text('type'),
  source: text('source'),
  episodes: integer('episodes'),
  duration: text('duration'),
  rating: text('rating'),
  airedFrom: date('aired_from'),
  airedTo: date('aired_to'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const genres = pgTable('genres', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
})

export const animeGenres = pgTable('anime_genres', {
  animeId: uuid('anime_id').notNull().references(() => anime.id, { onDelete: 'cascade' }),
  genreId: integer('genre_id').notNull().references(() => genres.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.animeId, t.genreId] })])

export type DbAnime = typeof anime.$inferSelect
export type NewAnime = typeof anime.$inferInsert
export type DbGenre = typeof genres.$inferSelect
