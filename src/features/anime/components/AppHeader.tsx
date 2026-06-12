'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search } from 'lucide-react'
import SukiverseIcon from '@/app/icon.svg'
import { cn } from '@/lib/utils'

/* 로고 + 검색창 헤더. 검색어는 500ms 디바운스 후 URL aniName 파라미터로 반영 */
export default function AppHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('aniName') ?? '')
  const [focused, setFocused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* 검색어를 URL aniName 파라미터에 반영 */
  const pushSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) {
        params.set('aniName', value.trim())
      } else {
        params.delete('aniName')
      }
      router.push(`/?${params}`)
    },
    [router, searchParams],
  )

  /* 입력 변화 후 500ms 뒤에 검색 실행 */
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => pushSearch(query), 500)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query]) // pushSearch는 searchParams 변화마다 바뀌므로 의도적으로 제외

  return (
    <header className='flex items-center gap-4 px-5'>
      <Link href='/'>
        <SukiverseIcon className='size-[4.5rem] shrink-0' />
      </Link>
      <label
        className={cn(
          'border-input-border rounded-6 flex flex-1 cursor-text items-center gap-8 border px-12 py-10 transition-colors',
          focused && 'border-input-focus-border bg-input-focus-bg',
        )}>
        <Search
          size={16}
          className={cn(
            'shrink-0 transition-colors',
            focused ? 'text-input-focus-icon' : 'text-input-placeholder',
          )}
        />
        <input
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder='애니메이션 검색'
          className={cn(
            'typography-placeholder w-full bg-transparent outline-none transition-colors',
            focused ? 'text-text-primary placeholder:text-input-placeholder' : 'text-input-placeholder',
          )}
        />
      </label>
    </header>
  )
}
