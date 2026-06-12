import { Suspense } from 'react'
import SukiverseIcon from './icon.svg'
import AnimeCard from '@/features/anime/components/AnimeCard'
import GenreFilter from '@/features/anime/components/GenreFilter'
import SortFilter from '@/features/anime/components/SortFilter'
import { getAnimeList } from '@/services/animeService'
import type { Genre, OrderBy } from '@/types/api/anime'

interface HomeProps {
  searchParams: Promise<{ genre?: string; orderBy?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const { genre, orderBy = 'Popularity' } = await searchParams

  const animes = await getAnimeList({
    genre: genre as Genre | undefined,
    orderBy: orderBy as OrderBy,
  }).catch(() => [])

  return (
    <div className='bg-background-app flex h-full flex-col pb-[6rem]'>
      {/* 헤더 */}
      <header className='flex items-center gap-4 px-5'>
        <SukiverseIcon className='size-[4.5rem] shrink-0' />
        <div className='border-input-border rounded-6 flex flex-1 items-center gap-8 border px-12 py-10'>
          <svg
            width='16'
            height='16'
            viewBox='0 0 16 16'
            fill='none'
            className='text-input-placeholder shrink-0'>
            <circle
              cx='7'
              cy='7'
              r='5.5'
              stroke='currentColor'
              strokeWidth='1.5'
            />
            <path
              d='M11.5 11.5L14 14'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
            />
          </svg>
          <span className='text-input-placeholder typography-placeholder'>
            애니메이션 검색
          </span>
        </div>
      </header>

      {/* 바디 */}
      <div className='flex flex-1 flex-col gap-10 overflow-hidden'>
        {/* 필터 영역 */}
        <div className='flex flex-col gap-5 px-5'>
          <Suspense fallback={<div className='h-[3rem]' />}>
            <GenreFilter />
          </Suspense>
          <Suspense fallback={<div className='h-[2.4rem]' />}>
            <SortFilter />
          </Suspense>
        </div>

        {/* 애니메이션 목록 */}
        <div className='max-w-[32rem] flex-1 [scrollbar-width:none] overflow-y-auto px-12 [&::-webkit-scrollbar]:hidden'>
          {animes.length === 0 ? (
            <div className='text-text-dimmed flex h-full items-center justify-center text-[1.4rem]'>
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-8'>
              {animes.map((anime, i) => (
                <AnimeCard key={anime.malId} anime={anime} priority={i < 2} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
