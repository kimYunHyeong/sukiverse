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
    <div className='grid grid-cols-2 gap-8'>
      {animes.map((anime, i) => (
        <AnimeCard key={anime.aniId} anime={anime} priority={i < 2} />
      ))}
    </div>
  )
}
