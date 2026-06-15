import type { AnimeEpisode } from '@/types/api/anime-detail'

interface AnimeEpisodesProps {
  episodes: AnimeEpisode[]
  totalCount: number | null
}

/* 날짜 문자열에서 YYYY.MM.DD 형식으로 변환 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

/* 화수 목록 섹션 */
export default function AnimeEpisodes({ episodes, totalCount }: AnimeEpisodesProps) {
  return (
    <section className='flex flex-col gap-16'>
      {/* 섹션 헤더 */}
      <div className='flex items-baseline gap-8'>
        <h2 className='text-text-primary typography-h3'>화수 목록</h2>
        {totalCount != null && (
          <span className='text-text-muted typography-body-sm'>총 {totalCount}화</span>
        )}
      </div>

      {/* 에피소드 테이블 */}
      <div className='border-border-subtle rounded-8 overflow-hidden border'>
        {/* 테이블 헤더 */}
        <div className='bg-background-elevated border-border-subtle grid grid-cols-[4rem_1fr_auto] gap-x-12 border-b px-16 py-10'>
          <span className='text-text-muted typography-caption text-center'>#</span>
          <span className='text-text-muted typography-caption'>제목</span>
          <span className='text-text-muted typography-caption'>방영일</span>
        </div>

        {/* 에피소드 행 */}
        <div className='divide-border-subtle divide-y'>
          {episodes.map((ep) => (
            <div
              key={ep.mal_id}
              className='hover:bg-background-hover grid grid-cols-[4rem_1fr_auto] gap-x-12 px-16 py-10 transition-colors'>
              {/* 화수 번호 */}
              <span className='text-text-muted typography-body-sm text-center'>{ep.mal_id}</span>

              {/* 에피소드 제목 */}
              <div className='flex min-w-0 flex-col gap-2'>
                <span className='text-text-primary typography-body-sm truncate'>
                  {ep.title ?? `${ep.mal_id}화`}
                </span>
                {ep.title_japanese && (
                  <span className='text-text-muted typography-caption truncate'>
                    {ep.title_japanese}
                  </span>
                )}
                {/* 필러/리캡 배지 */}
                {(ep.filler || ep.recap) && (
                  <div className='flex gap-4'>
                    {ep.filler && (
                      <span className='bg-badge-end-bg text-badge-end-text typography-badge rounded-2 px-4 py-2'>
                        필러
                      </span>
                    )}
                    {ep.recap && (
                      <span className='bg-badge-ongoing-bg text-badge-ongoing-text typography-badge rounded-2 px-4 py-2'>
                        리캡
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 방영일 */}
              <span className='text-text-muted typography-caption shrink-0 self-start'>
                {formatDate(ep.aired)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
