import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { LoginResponse } from '@/features/auth/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const cookieStore = await cookies()
  const storedState = cookieStore.get('oauth_state')?.value
  cookieStore.delete('oauth_state')

  if (error || !code || !state || state !== storedState) {
    const errorMessage = error || 'OAuth 검증에 실패했습니다.'
    return new NextResponse(buildPostMessageHtml('AUTH_ERROR', { error: errorMessage }), {
      headers: {
        'Content-Type': 'text/html',
        'Cross-Origin-Opener-Policy': 'unsafe-none',
      },
    })
  }

  try {
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: process.env.NEXT_PUBLIC_APP_URL!,
        },
        body: JSON.stringify({ provider, code }),
      }
    )

    if (!backendResponse.ok) {
      const errText = await backendResponse.text()
      throw new Error(`백엔드 ${backendResponse.status}: ${errText}`)
    }

    const data: LoginResponse = await backendResponse.json()

    if (!data.isSuccess) {
      throw new Error('백엔드 인증에 실패했습니다.')
    }

    const { accessToken, userDetails } = data.responseDto

    // 백엔드가 Set-Cookie로 내려주는 refreshToken을 http-only 쿠키로 재설정
    const setCookieHeader = backendResponse.headers.get('set-cookie')
    const refreshTokenMatch = setCookieHeader?.match(/refreshToken=([^;]+)/)
    const refreshToken = refreshTokenMatch?.[1]

    if (refreshToken) {
      cookieStore.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    return new NextResponse(
      buildPostMessageHtml('AUTH_SUCCESS', {
        accessToken,
        user: { userDetails },
      }),
      {
        headers: {
          'Content-Type': 'text/html',
          'Cross-Origin-Opener-Policy': 'unsafe-none',
        },
      }
    )
  } catch (e) {
    console.error(`[auth/${provider}/callback] error:`, e)
    return new NextResponse(
      buildPostMessageHtml('AUTH_ERROR', {
        error: e instanceof Error ? e.message : String(e),
      }),
      {
        headers: {
          'Content-Type': 'text/html',
          'Cross-Origin-Opener-Policy': 'unsafe-none',
        },
      }
    )
  }
}

function buildPostMessageHtml(type: string, payload: Record<string, unknown>) {
  const targetOrigin = process.env.NEXT_PUBLIC_APP_URL!
  const message = JSON.stringify({ type, ...payload })
  return `<!DOCTYPE html>
<html>
<body>
<script>
  window.opener.postMessage(${message}, "${targetOrigin}");
  window.close();
</script>
</body>
</html>`
}
