'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import LockIcon from '@/components/icons/lock.svg'
import { NAV_ITEMS } from '@/lib/nav'

export default function NavigationBar() {
  const pathname = usePathname()

  /* 로그인 페이지에서는 랜더링되지 않음 */
  if (pathname === '/login') return null

  return (
    /* 모바일 전용 하단 내비게이션 — PC에서는 AppHeader 내부에서 렌더링 */
    <nav className='z-sticky border-navigation-border bg-navigation-bg border-t px-16 flex h-[6rem] items-center justify-between md:hidden'>
      {/* 공간용 div */}
      <div className='w-16'></div>

      {/* 라우팅 네비게이션 */}
      <div className='flex items-center gap-5 self-stretch'>
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
                'flex h-full items-center justify-center px-10 text-lg font-medium transition-colors',

                /* 현재 라우팅에 따라 색 변경 */
                active
                  ? 'text-navigation-active-text'
                  : 'text-navigation-default-text'
              )}>
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* 로그인 버튼 */}
      <Link
        href='/login'
        className='flex shrink-0 items-center justify-center transition-colors'
        aria-label='로그인'>
        <LockIcon className='fill-navigation-active-icon' />
      </Link>
    </nav>
  )
}
