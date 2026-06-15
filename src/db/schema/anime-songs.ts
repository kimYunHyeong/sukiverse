import { pgTable, uuid, text, integer } from 'drizzle-orm/pg-core'
import { anime } from './anime'
import { songs } from './songs'

export const animeSongs = pgTable('anime_songs', {
  id: uuid('id').primaryKey().defaultRandom(),
  animeId: uuid('anime_id').notNull().references(() => anime.id, { onDelete: 'cascade' }),
  songId: uuid('song_id').references(() => songs.id, { onDelete: 'set null' }),
  themeType: text('theme_type').notNull(), // 'opening' | 'ending' | 'insert'
  themeText: text('theme_text'),           // Jikan 원문 e.g. "#1: \"Again\" by YUI"
  epRange: text('ep_range'),               // e.g. "1-25"
  sortOrder: integer('sort_order').default(0),
})

export type DbAnimeSong = typeof animeSongs.$inferSelect
export type NewAnimeSong = typeof animeSongs.$inferInsert
