import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

const OAUTH_URLS: Record<string, string> = {
  naver:
    'https://nid.naver.com/oauth2.0/authorize?client_id=meMO3u62cYYK1eLKRNkl&redirect_uri=http://localhost:8080/login/oauth2/code/naver&response_type=code',
  kakao:
    'https://kauth.kakao.com/oauth/authorize?client_id=77c1b42b48d6bdc148413b17dac46c17&redirect_uri=http://localhost:8080/login/oauth2/code/kakao&response_type=code',
  google:
    'https://accounts.google.com/o/oauth2/v2/auth?client_id=881840231634-j35619vnk0hdvfg4fnol2e1c7dmpdsbq.apps.googleusercontent.com&redirect_uri=http://localhost:8080/login/oauth2/code/google&response_type=code&scope=email%20profile',
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const baseUrl = OAUTH_URLS[provider]

  if (!baseUrl) {
    return NextResponse.json({ error: '지원하지 않는 provider입니다.' }, { status: 400 })
  }

  const state = randomBytes(16).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  })

  // naver/kakao는 이미 state 파라미터가 없으므로 추가, google은 state 없이 scope만 있으므로 추가
  const oauthUrl = `${baseUrl}&state=${state}`

  return NextResponse.redirect(oauthUrl)
}
