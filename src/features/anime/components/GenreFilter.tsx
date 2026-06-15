'use client'

import { useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CircleX } from 'lucide-react'
import { GENRES, GENRE_LABELS } from '@/types/api/anime'
import type { Genre } from '@/types/api/anime'
import { cn } from '@/lib/utils'

/* 장르 다중 선택 필터 */
export default function GenreFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeGenres = searchParams.getAll('genre') as Genre[]

  const scrollRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false })

  /* 모든 장르 필터 초기화 */
  function handleClear() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('genre')
    router.push(`/?${params}`)
  }

  /* 장르 선택/해제 후 URL에 반영 — 드래그 중이면 무시 */
  function handleSelect(genre: Genre) {
    if (drag.current.moved) return
    const params = new URLSearchParams(searchParams.toString())
    params.delete('genre')
    const next = activeGenres.includes(genre)
      ? activeGenres.filter((g) => g !== genre)
      : [...activeGenres, genre]
    next.forEach((g) => params.append('genre', g))
    router.push(`/?${params}`)
  }

  /* 마우스 드래그 시작점 기록 */
  function onMouseDown(e: React.MouseEvent) {
    const el = scrollRef.current
    if (!el) return
    drag.current = {
      active: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      moved: false,
    }
  }

  /* 드래그 이동량만큼 스크롤 위치 갱신 */
  function onMouseMove(e: React.MouseEvent) {
    const el = scrollRef.current
    if (!drag.current.active || !el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const delta = x - drag.current.startX
    if (Math.abs(delta) > 5) drag.current.moved = true
    el.scrollLeft = drag.current.scrollLeft - delta
  }

  /* 드래그 종료 */
  function onMouseUp() {
    drag.current.active = false
  }

  return (
    <div className='relative'>
      {/* 모바일: 가로 스크롤 드래그 / PC: 여러 줄 wrap */}
      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className='flex cursor-grab [scrollbar-width:none] gap-6 overflow-x-auto scroll-smooth [mask-image:linear-gradient(to_right,transparent_0%,black_5%,black_95%,transparent_100%)] pb-2 active:cursor-grabbing md:cursor-default md:flex-wrap md:overflow-x-visible md:[mask-image:none] [&::-webkit-scrollbar]:hidden'>
        {GENRES.map((genre) => {
          const isActive = activeGenres.includes(genre)
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
        {activeGenres.length > 0 && (
          <button
            onClick={handleClear}
            className='shrink-0 text-chip-default-text hover:text-text-primary transition-colors px-4 py-6'>
            <CircleX size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
