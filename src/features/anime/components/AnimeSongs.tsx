import Image from 'next/image'
import { Music, ExternalLink } from 'lucide-react'
import type { SpotifyTrack } from '@/types/api/anime-detail'

interface AnimeSongsProps {
  songs: SpotifyTrack[]
  themes: string[]          // Jikan opening_themes
  endingThemes: string[]    // Jikan ending_themes
}

/* 밀리초를 mm:ss 형식으로 변환 */
function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${String(sec).padStart(2, '0')}`
}

/* OST 섹션 — Spotify 검색 결과와 Jikan OP/ED 텍스트 목록 표시 */
export default function AnimeSongs({ songs, themes = [], endingThemes = [] }: AnimeSongsProps) {
  const hasSpotify = songs.length > 0
  const hasThemes = themes.length > 0 || endingThemes.length > 0

  if (!hasSpotify && !hasThemes) return null

  return (
    <section className='flex flex-col gap-24'>
      <h2 className='text-text-primary typography-h3'>OST / 음악</h2>

      {/* OP / ED 텍스트 목록 (Jikan 데이터) */}
      {hasThemes && (
        <div className='grid grid-cols-1 gap-16 md:grid-cols-2'>
          {themes.length > 0 && (
            <ThemeList label='오프닝' items={themes} />
          )}
          {endingThemes.length > 0 && (
            <ThemeList label='엔딩' items={endingThemes} />
          )}
        </div>
      )}

      {/* Spotify 검색 결과 */}
      {hasSpotify && (
        <div className='flex flex-col gap-8'>
          <div className='flex items-center gap-8'>
            <span className='text-text-secondary typography-label'>Spotify 검색 결과</span>
          </div>

          <div className='flex flex-col gap-4'>
            {songs.map((track, idx) => (
              <SpotifyTrackRow key={track.id} track={track} index={idx + 1} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

/* OP 또는 ED 텍스트 목록 블록 */
function ThemeList({ label, items }: { label: string; items: string[] }) {
  return (
    <div className='bg-background-elevated border-border-subtle rounded-8 flex flex-col gap-10 border p-16'>
      <span className='text-text-brand typography-label'>{label}</span>
      <ul className='flex flex-col gap-8'>
        {items.map((theme, i) => (
          <li key={i} className='text-text-secondary typography-body-sm'>
            {theme}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* Spotify 트랙 한 행 */
function SpotifyTrackRow({ track, index }: { track: SpotifyTrack; index: number }) {
  const albumCover = track.album.images[0]?.url
  const artistNames = track.artists.map((a) => a.name).join(', ')

  return (
    <a
      href={track.external_urls.spotify}
      target='_blank'
      rel='noopener noreferrer'
      className='hover:bg-background-hover border-border-subtle rounded-8 group flex items-center gap-12 border px-12 py-10 transition-colors'>
      {/* 인덱스 번호 */}
      <span className='text-text-muted typography-body-sm w-[2rem] shrink-0 text-center'>
        {index}
      </span>

      {/* 앨범 커버 */}
      <div className='bg-card-thumbnail-bg rounded-4 relative size-[4rem] shrink-0 overflow-hidden'>
        {albumCover ? (
          <Image src={albumCover} alt={track.album.name} fill className='object-cover' />
        ) : (
          <div className='flex h-full w-full items-center justify-center'>
            <Music size={16} className='text-text-muted' />
          </div>
        )}
      </div>

      {/* 트랙 정보 */}
      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        <span className='text-text-primary typography-label truncate'>{track.name}</span>
        <span className='text-text-muted typography-caption truncate'>{artistNames}</span>
      </div>

      {/* 재생 시간 + 외부 링크 아이콘 */}
      <div className='flex shrink-0 items-center gap-10'>
        <span className='text-text-muted typography-caption'>
          {formatDuration(track.duration_ms)}
        </span>
        <ExternalLink
          size={14}
          className='text-text-muted opacity-0 transition-opacity group-hover:opacity-100'
        />
      </div>
    </a>
  )
}
