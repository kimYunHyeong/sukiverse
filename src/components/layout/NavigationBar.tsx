'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import LockIcon from '@/components/icons/lock.svg'

const NAV_ITEMS = [
  { label: 'J-POP', href: '/jpop' },
  { label: '애니메이션', href: '/' },
  { label: '성우', href: '/actor' },
] as const

export default function NavigationBar() {
  const pathname = usePathname()

  return (
    <nav className='z-sticky border-navigation-border bg-navigation-bg absolute right-0 bottom-0 left-0 flex h-[6rem] items-center justify-between border-t px-[1.5rem]'>
      {/* 공간용 div */}
      <div className='w-[1.6rem] '></div>

      {/* 라우팅 네비게이션 */}
      <div className='flex items-center gap-5 self-stretch'>
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-full items-center justify-center px-2.5 text-[11px] font-medium transition-colors',

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
