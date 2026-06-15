import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import type { AnimeDetail } from '@/types/api/anime-detail'
import type { Anime } from '@/types/api/anime'
import { GENRE_LABELS } from '@/types/api/anime'
import type { Genre } from '@/types/api/anime'

interface AnimeDetailHeroProps {
  detail: AnimeDetail
  localAnime: Anime
}

/* 방영 상태를 한국어로 변환 */
function translateStatus(status: string | null): string {
  if (!status) return '정보 없음'
  const map: Record<string, string> = {
    'Finished Airing': '방영 종료',
    'Currently Airing': '방영 중',
    'Not yet aired': '방영 예정',
  }
  return map[status] ?? status
}

/* 시즌 이름을 한국어로 변환 */
function translateSeason(season: string | null, year: number | null): string {
  if (!season) return year ? `${year}년` : '정보 없음'
  const map: Record<string, string> = { spring: '봄', summer: '여름', fall: '가을', winter: '겨울' }
  return `${year ?? ''} ${map[season] ?? season}`.trim()
}

/* 애니메이션 상세 히어로 — 썸네일, 제목, 기본 메타 정보 */
export default function AnimeDetailHero({ detail, localAnime }: AnimeDetailHeroProps) {
  const imageUrl =
    detail.images?.webp?.large_image_url ??
    detail.images?.jpg?.large_image_url ??
    localAnime.imageUrl

  const genreList = detail.genres.map((g) => g.name)

  return (
    <div className='relative'>
      {/* 블러 배경 */}
      {imageUrl && (
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
          <Image
            src={imageUrl}
            alt=''
            fill
            className='scale-110 object-cover opacity-15 blur-2xl'
            aria-hidden
          />
          <div className='from-background-app absolute inset-0 bg-gradient-to-b via-transparent to-transparent' />
        </div>
      )}

      <div className='relative px-5 pt-12 pb-24 md:px-12'>
        {/* 뒤로가기 */}
        <Link
          href='/'
          className='text-text-secondary hover:text-text-primary mb-16 inline-flex items-center gap-4 text-[1.3rem] transition-colors'>
          <ChevronLeft size={16} />
          목록으로
        </Link>

        {/* 히어로 본문 */}
        <div className='flex flex-col gap-16 md:flex-row md:gap-24'>
          {/* 썸네일 */}
          {imageUrl && (
            <div className='bg-card-thumbnail-bg rounded-8 relative mx-auto aspect-[2/3] w-[14rem] shrink-0 overflow-hidden md:mx-0 md:w-[18rem]'>
              <Image
                src={imageUrl}
                alt={localAnime.title}
                fill
                priority
                className='object-cover'
              />
            </div>
          )}

          {/* 정보 영역 */}
          <div className='flex flex-col gap-12'>
            {/* 상태 배지 */}
            <div className='flex items-center gap-8'>
              <StatusBadge status={detail.status} />
              {detail.type && (
                <span className='text-text-muted typography-label'>{detail.type}</span>
              )}
            </div>

            {/* 제목 */}
            <div className='flex flex-col gap-4'>
              <h1 className='text-text-primary typography-h2'>{localAnime.title}</h1>
              {detail.title_english && detail.title_english !== localAnime.title && (
                <p className='text-text-secondary typography-body-sm'>{detail.title_english}</p>
              )}
              {detail.title_japanese && (
                <p className='text-text-muted typography-caption'>{detail.title_japanese}</p>
              )}
            </div>

            {/* 평점 + 순위 */}
            <div className='flex flex-wrap items-center gap-16'>
              {detail.score != null && (
                <div className='flex items-center gap-4'>
                  <span className='text-[1.6rem]'>★</span>
                  <span className='text-text-brand typography-h3'>{detail.score}</span>
                  {detail.scored_by != null && (
                    <span className='text-text-muted typography-caption'>
                      ({detail.scored_by.toLocaleString()}명)
                    </span>
                  )}
                </div>
              )}
              {detail.rank != null && (
                <span className='text-text-secondary typography-label'>#{detail.rank} 순위</span>
              )}
              {detail.popularity != null && (
                <span className='text-text-secondary typography-label'>
                  인기 #{detail.popularity}
                </span>
              )}
            </div>

            {/* 메타 정보 그리드 */}
            <dl className='grid grid-cols-2 gap-x-16 gap-y-8 md:grid-cols-3'>
              <MetaItem label='방영 시즌' value={translateSeason(detail.season, detail.year)} />
              <MetaItem label='방영 상태' value={translateStatus(detail.status)} />
              <MetaItem label='화수' value={detail.episodes != null ? `${detail.episodes}화` : '미정'} />
              <MetaItem label='방영 기간' value={detail.aired?.string ?? '정보 없음'} />
              <MetaItem label='런타임' value={detail.duration ?? '정보 없음'} />
              <MetaItem label='등급' value={detail.rating ?? '정보 없음'} />
              {detail.studios.length > 0 && (
                <MetaItem label='스튜디오' value={detail.studios.map((s) => s.name).join(', ')} />
              )}
              {detail.source && <MetaItem label='원작' value={detail.source} />}
              {detail.members != null && (
                <MetaItem label='멤버' value={detail.members.toLocaleString()} />
              )}
            </dl>

            {/* 장르 */}
            {genreList.length > 0 && (
              <div className='flex flex-wrap gap-6'>
                {genreList.map((genre) => (
                  <span
                    key={genre}
                    className='bg-background-elevated border-border-default text-text-secondary typography-label rounded-full border px-10 py-4'>
                    {GENRE_LABELS[genre as Genre] ?? genre}
                  </span>
                ))}
                {detail.themes.map((theme) => (
                  <span
                    key={theme.mal_id}
                    className='bg-background-elevated border-border-subtle text-text-muted typography-label rounded-full border px-10 py-4'>
                    {theme.name}
                  </span>
                ))}
              </div>
            )}

            {/* 시놉시스 */}
            {detail.synopsis && (
              <p className='text-text-secondary typography-body-sm line-clamp-4 md:line-clamp-none'>
                {detail.synopsis}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* 방영 상태 배지 */
function StatusBadge({ status }: { status: string | null }) {
  const colorMap: Record<string, string> = {
    'Finished Airing': 'bg-badge-end-bg text-badge-end-text',
    'Currently Airing': 'bg-badge-ongoing-bg text-badge-ongoing-text',
    'Not yet aired': 'bg-badge-new-bg text-badge-new-text',
  }
  const cls = status ? (colorMap[status] ?? 'bg-background-elevated text-text-muted') : 'bg-background-elevated text-text-muted'
  return (
    <span className={`typography-badge rounded-4 px-6 py-4 ${cls}`}>
      {translateStatus(status)}
    </span>
  )
}

/* 라벨 + 값 한 쌍 */
function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col gap-2'>
      <dt className='text-text-muted typography-caption'>{label}</dt>
      <dd className='text-text-primary typography-body-sm'>{value}</dd>
    </div>
  )
}
