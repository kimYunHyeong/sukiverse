export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import AppHeader from '@/features/anime/components/AppHeader'
import AnimeList from '@/features/anime/components/AnimeList'
import GenreFilter from '@/features/anime/components/GenreFilter'
import SortFilter from '@/features/anime/components/SortFilter'
import { getAnimeList } from '@/lib/server/animeData'
import type { Genre, OrderBy } from '@/types/api/anime'

interface HomeProps {
  searchParams: Promise<{ genre?: string; orderBy?: string; aniName?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const { genre, orderBy = 'Popularity', aniName } = await searchParams
  const genres = genre ? (Array.isArray(genre) ? genre : [genre]) as Genre[] : undefined

  let animes: Awaited<ReturnType<typeof getAnimeList>> = []
  try {
    animes = await getAnimeList({
      genres,
      orderBy: orderBy as OrderBy,
      aniName,
    })
  } catch {
    animes = []
  }

  return (
    <div className='bg-background-app flex h-full w-full flex-col'>
      {/* 헤더 — PC에서는 네비게이션 포함 */}
      <Suspense fallback={<div className='h-[4.5rem]' />}>
        <AppHeader />
      </Suspense>

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
        <div className='flex-1 overflow-y-auto px-5 [scrollbar-width:none] md:px-12 [&::-webkit-scrollbar]:hidden'>
          <AnimeList animes={animes} />
        </div>
      </div>
    </div>
  )
}
