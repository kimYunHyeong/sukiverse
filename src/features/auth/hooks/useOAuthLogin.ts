'use client'

import { useCallback } from 'react'
import { useAuthStore } from '../store'
import type { OAuthProvider, UserDetails } from '../types'

interface AuthSuccessPayload {
  type: 'AUTH_SUCCESS'
  accessToken: string
  user: {
    userDetails: UserDetails
  }
}

interface AuthErrorPayload {
  type: 'AUTH_ERROR'
  error: string
}

type AuthMessagePayload = AuthSuccessPayload | AuthErrorPayload

const POPUP_WIDTH = 500
const POPUP_HEIGHT = 650

export function useOAuthLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)

  const login = useCallback((provider: OAuthProvider) => {
    const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2
    const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2

    const popup = window.open(
      `/api/auth/${provider}`,
      `${provider}_oauth`,
      `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},toolbar=no,menubar=no`
    )

    if (!popup) return

    const handleMessage = (event: MessageEvent<AuthMessagePayload>) => {
      if (event.origin !== window.location.origin) return

      window.removeEventListener('message', handleMessage)

      if (event.data.type === 'AUTH_SUCCESS') {
        const { accessToken, user } = event.data
        setAuth(accessToken, user.userDetails)
      } else if (event.data.type === 'AUTH_ERROR') {
        console.error('[useOAuthLogin] 로그인 실패', event.data.error)
      }
    }

    window.addEventListener('message', handleMessage)
  }, [setAuth])

  return { login }
}
