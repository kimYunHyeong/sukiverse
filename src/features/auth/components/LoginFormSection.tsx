'use client'

import LoginButton from './LoginButton'
import { useOAuthLogin } from '../hooks/useOAuthLogin'
import type { OAuthProvider } from '../types'

const PROVIDERS: OAuthProvider[] = ['kakao', 'naver', 'google']

export default function LoginFormSection() {
  const { login } = useOAuthLogin()

  return (
    <div className='flex w-full flex-col gap-10'>
      {PROVIDERS.map((provider) => (
        <LoginButton
          key={provider}
          provider={provider}
          onClick={() => login(provider)}
        />
      ))}
    </div>
  )
}
