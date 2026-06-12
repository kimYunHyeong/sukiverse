import Image from 'next/image'
import type { Anime, Genre } from '@/types/api/anime'
import { GENRE_LABELS } from '@/types/api/anime'

interface AnimeCardProps {
  anime: Anime
  priority?: boolean // 첫 화면에 보이는 카드만 true — LCP 최적화용 preload
}

export default function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  const genreList = anime.genres
    .split(',')
    .map((g) => g.trim())
    .slice(0, 3)

  return (
    <div className='border-card-border bg-card-bg rounded-4 flex max-w-[32rem] flex-col overflow-hidden border'>
      {/* 썸네일 */}
      <div className='bg-card-thumbnail-bg relative aspect-[2/3] w-full overflow-hidden'>
        {anime.imageUrl ? (
          <Image
            src={anime.imageUrl}
            alt={anime.title}
            fill
            priority={priority}
            className='object-cover'
          />
        ) : (
          <div className='bg-card-thumbnail-empty h-full w-full' />
        )}
        {anime.rank != null && anime.rank <= 3 && (
          <div className='bg-badge-rank-bg border-badge-rank-border text-badge-rank-text typography-badge rounded-4 absolute top-4 left-4 border px-4 py-4'>
            {anime.rank}위
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className='border-card-border flex flex-col gap-6 border-t px-4 py-8'>
        {/* 제목 + 평점 */}
        <div className='flex items-center gap-6'>
          <span className='text-text-primary typography-card-title min-w-0 flex-1 truncate'>
            {anime.title}
          </span>
          {anime.score != null && (
            <div className='flex shrink-0 items-center gap-2'>
              <span className='text-[1rem] leading-none'>★</span>
              <span className='text-text-brand typography-label'>
                {anime.score}
              </span>
            </div>
          )}
        </div>

        {/* 장르 */}
        <div className='flex items-center gap-5'>
          {genreList.map((genre, i) => (
            <span key={genre} className='flex items-center gap-5'>
              {i > 0 && (
                <span className='bg-text-dimmed inline-block h-2 w-2 rounded-full' />
              )}
              <span className='text-text-dimmed typography-label'>
                {GENRE_LABELS[genre as Genre] ?? genre}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
