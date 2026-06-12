'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { GENRES } from '@/types/api/anime'
import type { Genre } from '@/types/api/anime'
import { cn } from '@/lib/utils'

const GENRE_LABELS: Record<Genre, string> = {
  Action: '액션',
  Adventure: '모험',
  Comedy: '코미디',
  Drama: '드라마',
  Fantasy: '판타지',
  Horror: '공포',
  Mystery: '미스터리',
  Romance: '로맨스',
  'Sci-Fi': 'SF',
  'Slice of Life': '일상',
  Sports: '스포츠',
  Supernatural: '초자연',
  Historical: '역사',
  Isekai: '이세계',
  'Martial Arts': '무협',
  Mecha: '메카',
  Military: '밀리터리',
  Music: '음악',
  Psychological: '심리',
  School: '학원',
  Space: '우주',
  'Super Power': '초능력',
  'Time Travel': '시간여행',
  Vampire: '뱀파이어',
}

export default function GenreFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeGenre = searchParams.get('genre') as Genre | null

  function handleSelect(genre: Genre) {
    const params = new URLSearchParams(searchParams.toString())
    if (activeGenre === genre) {
      params.delete('genre')
    } else {
      params.set('genre', genre)
    }
    router.push(`/?${params}`)
  }

  return (
    <div className='flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
      {GENRES.map((genre) => {
        const isActive = activeGenre === genre
        return (
          <button
            key={genre}
            onClick={() => handleSelect(genre)}
            className={cn(
              'typography-chip shrink-0 rounded-full border px-12 py-6 transition-colors',
              isActive
                ? 'bg-chip-active-bg border-chip-active-border text-chip-active-text'
                : 'bg-chip-default-bg border-chip-default-border text-chip-default-text hover:bg-chip-hover-bg hover:border-chip-hover-border'
            )}>
            {GENRE_LABELS[genre]}
          </button>
        )
      })}
    </div>
  )
}
