import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import AppHeader from '@/features/anime/components/AppHeader'
import AnimeDetailHero from '@/features/anime/components/AnimeDetailHero'
import AnimeCharacters from '@/features/anime/components/AnimeCharacters'
import AnimeEpisodes from '@/features/anime/components/AnimeEpisodes'
import AnimeSongs from '@/features/anime/components/AnimeSongs'
import { getAnimeById } from '@/lib/server/animeData'
import { fetchAnimeDetail, fetchAnimeSongs } from '@/lib/server/animeDetail'

interface AniDetailPageProps {
  params: Promise<{ aniId: string }>
}

/* 애니메이션 상세 페이지 */
export default async function AniDetailPage({ params }: AniDetailPageProps) {
  const { aniId } = await params

  /* 로컬 데이터에서 malId 조회 */
  const localAnime = await getAnimeById(aniId)
  if (!localAnime) notFound()

  /* Jikan + Spotify 데이터를 병렬로 fetch */
  const [detailData, songs] = await Promise.all([
    fetchAnimeDetail(localAnime.malId),
    fetchAnimeSongs(localAnime.titleEnglish ?? localAnime.title),
  ])

  const { detail, characters, episodes, episodeCount } = detailData

  return (
    <div className='bg-background-app flex h-full w-full flex-col'>
      {/* 헤더 */}
      <Suspense fallback={<div className='h-[5rem]' />}>
        <AppHeader />
      </Suspense>

      {/* 본문 — 스크롤 */}
      <div className='flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
        {/* 히어로 섹션 — 썸네일 + 기본 정보 */}
        <AnimeDetailHero detail={detail} localAnime={localAnime} />

        <div className='flex flex-col gap-32 px-5 py-32 md:px-12'>
          {/* 출연 성우 */}
          {characters.length > 0 && <AnimeCharacters characters={characters} />}

          {/* 화수 목록 */}
          {episodes.length > 0 && (
            <AnimeEpisodes episodes={episodes} totalCount={episodeCount} />
          )}

          {/* OST */}
          <AnimeSongs songs={songs} themes={detail.opening_themes ?? []} endingThemes={detail.ending_themes ?? []} />
        </div>
      </div>
    </div>
  )
}
