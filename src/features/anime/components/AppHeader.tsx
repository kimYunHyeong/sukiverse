'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Search, CircleX } from 'lucide-react'
import SukiverseIcon from '@/app/icon.svg'
import LockIcon from '@/components/icons/lock.svg'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/nav'

/* 로고 + 검색창 헤더. PC에서는 네비게이션과 로그인 버튼 포함. 검색어는 500ms 디바운스 후 URL aniName 파라미터로 반영 */
export default function AppHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [query, setQuery] = useState(searchParams.get('aniName') ?? '')
  const [focused, setFocused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* 검색어를 URL aniName 파라미터에 반영 */
  const pushSearchRef = useRef((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('aniName', value.trim())
    } else {
      params.delete('aniName')
    }
    router.push(`/?${params}`)
  })

  useEffect(() => {
    pushSearchRef.current = (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value.trim()) {
        params.set('aniName', value.trim())
      } else {
        params.delete('aniName')
      }
      router.push(`/?${params}`)
    }
  })

  /* 입력 변화 후 500ms 뒤에 검색 실행 */
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => pushSearchRef.current(query), 500)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  return (
    <header className='flex flex-col px-5 md:px-10'>
      {/* 모바일: 한 줄 / PC: 1행 — 로고 | 검색창(flex-1) | 로그인 */}
      <div className='flex items-center gap-4 md:gap-8 md:py-4'>
        {/* 로고 */}
        <Link href='/'>
          <SukiverseIcon className='size-[4.5rem] shrink-0' />
        </Link>

        {/* 검색창 */}
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
          {query && (
            <button
              type='button'
              onMouseDown={(e) => {
                e.preventDefault()
                setQuery('')
              }}
              className='shrink-0'>
              <CircleX
                size={16}
                className={cn(
                  'transition-colors',
                  focused ? 'text-input-focus-icon' : 'text-input-placeholder',
                )}
              />
            </button>
          )}
        </label>

        {/* PC 전용 로그인 버튼 */}
        <Link
          href='/login'
          className='hidden shrink-0 items-center justify-center transition-colors md:flex'
          aria-label='로그인'>
          <LockIcon className='fill-navigation-active-icon' />
        </Link>
      </div>

      {/* PC 전용 2행 — 네비게이션 균등 배치 */}
      <nav className='hidden w-full justify-between md:flex'>
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'px-16 py-10 text-[1.4rem] font-medium transition-colors',
                active
                  ? 'text-navigation-active-text'
                  : 'text-navigation-default-text hover:text-text-primary',
              )}>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
