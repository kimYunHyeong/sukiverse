import type { Anime } from '@/types/api/anime'
import AnimeCard from './AnimeCard'

interface AnimeListProps {
  animes: Anime[]
}

export default function AnimeList({ animes }: AnimeListProps) {
  if (animes.length === 0) {
    return (
      <div className='text-text-dimmed flex h-full items-center justify-center text-[1.4rem]'>
        검색 결과가 없습니다.
      </div>
    )
  }

  return (
    /* 모바일 2열 → PC 4~6열 반응형 그리드 */
    <div className='grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
      {animes.map((anime, i) => (
        <AnimeCard key={anime.aniId} anime={anime} priority={i < 6} />
      ))}
    </div>
  )
}
