'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { OAuthProvider } from '../types'
import kakaoIcon from '../assets/kakao-icon.png'
import naverIcon from '../assets/naver-icon.png'
import googleIcon from '../assets/google-icon.png'

interface LoginButtonProps {
  provider: OAuthProvider
  onClick?: () => void
  className?: string
}

const PROVIDER_CONFIG = {
  kakao: {
    label: '카카오 로그인',
    icon: kakaoIcon,
    iconAlt: '카카오 로고',
    className: 'bg-[#FEE500] text-[#000000]',
  },
  naver: {
    label: '네이버 로그인',
    icon: naverIcon,
    iconAlt: '네이버 로고',
    className: 'bg-[#03A94D] text-white',
  },
  google: {
    label: '구글 로그인',
    icon: googleIcon,
    iconAlt: 'Google 로고',
    className: 'bg-white text-[#1f1f1f] border border-[#dadce0]',
  },
} as const

export default function LoginButton({
  provider,
  onClick,
  className,
}: LoginButtonProps) {
  const {
    label,
    icon,
    iconAlt,
    className: providerClass,
  } = PROVIDER_CONFIG[provider]

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'rounded-8 flex h-[5.2rem] w-full cursor-pointer items-center gap-10 px-20 transition-opacity active:opacity-80',
        providerClass,
        className
      )}>
      <Image
        src={icon}
        alt={iconAlt}
        className='flex size-32 shrink-0 items-center justify-center'
      />
      <span className='flex-1 text-center text-lg leading-normal font-bold'>
        {label}
      </span>
    </button>
  )
}
