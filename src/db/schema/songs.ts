import { pgTable, uuid, text, integer, primaryKey } from 'drizzle-orm/pg-core'

export const albums = pgTable('albums', {
  id: uuid('id').primaryKey().defaultRandom(),
  spotifyId: text('spotify_id').unique(),
  name: text('name').notNull(),
  releaseDate: text('release_date'),
  imageUrl: text('image_url'),
})

export const artists = pgTable('artists', {
  id: uuid('id').primaryKey().defaultRandom(),
  spotifyId: text('spotify_id').unique(),
  name: text('name').notNull(),
})

export const songs = pgTable('songs', {
  id: uuid('id').primaryKey().defaultRandom(),
  spotifyId: text('spotify_id').unique(),
  name: text('name').notNull(),
  durationMs: integer('duration_ms'),
  previewUrl: text('preview_url'),
  spotifyUrl: text('spotify_url'),
  albumId: uuid('album_id').references(() => albums.id, { onDelete: 'set null' }),
})

export const songArtists = pgTable('song_artists', {
  songId: uuid('song_id').notNull().references(() => songs.id, { onDelete: 'cascade' }),
  artistId: uuid('artist_id').notNull().references(() => artists.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.songId, t.artistId] })])

export type DbAlbum = typeof albums.$inferSelect
export type DbSong = typeof songs.$inferSelect
export type DbArtist = typeof artists.$inferSelect
