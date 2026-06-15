/* Jikan API /anime/{id}/full 응답 */
export interface AnimeDetail {
  mal_id: number
  title: string
  title_english: string | null
  title_japanese: string | null
  synopsis: string | null
  episodes: number | null
  status: string | null
  aired: { from: string | null; to: string | null; string: string | null }
  duration: string | null
  rating: string | null
  score: number | null
  scored_by: number | null
  rank: number | null
  popularity: number | null
  members: number | null
  year: number | null
  season: string | null
  studios: { mal_id: number; name: string }[]
  genres: { mal_id: number; name: string }[]
  themes: { mal_id: number; name: string }[]
  images: { jpg: { large_image_url: string | null }; webp?: { large_image_url: string | null } }
  trailer: { youtube_id: string | null; url: string | null }
  type: string | null
  source: string | null
  opening_themes: string[]
  ending_themes: string[]
}

/* Jikan API /anime/{id}/characters 응답 항목 */
export interface AnimeCharacter {
  character: {
    mal_id: number
    name: string
    images: { jpg: { image_url: string | null } }
  }
  role: string
  voice_actors: {
    person: { mal_id: number; name: string; images: { jpg: { image_url: string | null } } }
    language: string
  }[]
}

/* Jikan API /anime/{id}/episodes 응답 항목 */
export interface AnimeEpisode {
  mal_id: number
  title: string | null
  title_japanese: string | null
  aired: string | null
  score: number | null
  filler: boolean
  recap: boolean
}

/* /api/v1/anime/jikan/[malId] 응답 전체 */
export interface AnimeDetailResponse {
  detail: AnimeDetail
  characters: AnimeCharacter[]
  episodes: AnimeEpisode[]
  episodeCount: number | null
}

/* Spotify 트랙 정보 */
export interface SpotifyTrack {
  id: string
  name: string
  artists: { id: string; name: string }[]
  album: {
    id: string
    name: string
    images: { url: string; width: number; height: number }[]
    release_date: string
  }
  duration_ms: number
  preview_url: string | null
  external_urls: { spotify: string }
}
