# 로그인 기능 설계 문서

> **작성일:** 2026-03-05
> **범위:** 프론트엔드 전용 (백엔드가 JWT 발급·검증·갱신 로직 전체 수행 가정)
> **주요 라이브러리:** next-auth@4, axios

---

## 1. 기능 개요

Google OAuth 2.0을 통한 로그인/신규 가입, httpOnly cookie 기반 JWT 세션 관리, 자동 토큰 갱신, Auth 상태 기반 라우팅 가드를 제공한다.

---

## 2. 구현 전략 — 라이브러리 역할 분리

### next-auth@4
- Google OAuth **팝업 플로우 트리거** 및 **Google id_token 수신** 역할만 담당
- `signIn('google')` 호출로 OAuth 팝업을 시작하고, Google로부터 `id_token`을 수신
- `jwt` 콜백에서 수신한 `id_token`을 백엔드로 전달하여 자체 JWT와 교환
- next-auth 내장 세션은 최소한의 식별 정보만 보관하거나 사용하지 않음
- **요약:** next-auth는 "Google OAuth 어댑터" 역할만 수행. 실제 인증 상태는 백엔드 JWT 기반으로 관리

### axios
- 백엔드 API 통신 전담 (토큰 교환, 갱신, 유저 정보 조회 등)
- **Request interceptor:** `withCredentials: true`로 모든 요청에 cookie 자동 포함
- **Response interceptor:** 401 응답 감지 시 토큰 갱신 자동 재시도, 갱신 실패 시 `/login` 리다이렉트

### Zustand
- 인증 상태(`isAuthenticated`, `user`, `isLoading`) 클라이언트 메모리 보관
- 로그인/로그아웃 액션 제공

### TanStack Query
- `/auth/me` 유저 정보 조회 쿼리 캐싱
- 갱신 후 쿼리 invalidation 처리

### JWT 저장 방식
- 백엔드 서버가 `Set-Cookie` 헤더로 **httpOnly cookie**에 직접 저장
- JavaScript에서 `document.cookie`로 읽기 불가 → XSS 방어
- `withCredentials: true` 설정으로 axios가 cookie를 모든 요청에 자동 포함

---

## 3. 파일/컴포넌트 구조 (FSD 아키텍처)

```
sukiverse/
├── middleware.ts                                          # [신규] Next.js 미들웨어 (루트 레벨, 서버사이드 라우팅 가드)
│
├── app/
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts                              # [신규] next-auth API 라우트 핸들러 진입점
│
└── src/
    ├── app/
    │   └── providers/
    │       ├── index.tsx                                  # [신규] Provider 통합 export
    │       ├── SessionProvider.tsx                        # [신규] next-auth SessionProvider 래핑
    │       ├── QueryProvider.tsx                          # [신규] TanStack Query Provider
    │       └── AuthInitializer.tsx                        # [신규] 앱 진입 시 JWT 검증 + 유저 정보 로드
    │
    ├── pages/
    │   └── login/
    │       └── ui/
    │           └── LoginPage.tsx                          # [수정] 플레이스홀더 → 실제 로그인 UI
    │
    ├── widgets/
    │   └── auth-redirect-guard/
    │       ├── index.ts
    │       └── ui/
    │           └── AuthRedirectGuard.tsx                  # [신규] 클라이언트 레벨 라우팅 가드
    │
    ├── features/
    │   └── google-login/
    │       ├── index.ts
    │       ├── ui/
    │       │   └── GoogleLoginButton.tsx                  # [신규] Google 로그인 버튼 UI
    │       └── model/
    │           └── useGoogleLogin.ts                      # [신규] Google 로그인 로직 훅
    │
    ├── entities/
    │   └── user/
    │       ├── index.ts
    │       ├── model/
    │       │   ├── types.ts                               # [신규] User 타입 정의
    │       │   ├── useUserStore.ts                        # [신규] Zustand 인증 상태 스토어
    │       │   └── useCurrentUser.ts                      # [신규] TanStack Query 유저 조회 훅
    │       └── api/
    │           └── userApi.ts                             # [신규] 유저 관련 API 함수
    │
    └── shared/
        ├── api/
        │   ├── index.ts
        │   ├── axiosInstance.ts                           # [신규] axios 인스턴스 (interceptor 포함)
        │   └── authApi.ts                                 # [신규] 인증 API 함수 (토큰 갱신, 로그아웃)
        │
        ├── lib/
        │   └── auth/
        │       ├── index.ts
        │       └── nextAuthConfig.ts                      # [신규] NextAuth authOptions 전체 설정
        │
        └── ui/
            └── toast/
                ├── index.ts
                └── useToast.ts                            # [신규] 토스트 훅 (shadcn/ui Sonner 래핑)
```

### 기존 파일 수정 목록

| 파일 | 수정 내용 |
|------|-----------|
| `src/app/layouts/index.tsx` | Provider 추가, `<html className="dark">` 적용 |
| `src/pages/login/ui/LoginPage.tsx` | 플레이스홀더 → 실제 로그인 UI 구현 |

---

## 4. Google OAuth 토큰 요청 및 백엔드 전달 로직

### 전체 흐름

```
[사용자] GoogleLoginButton 클릭
    ↓
useGoogleLogin.handleLogin()
    ↓
signIn('google', { redirect: false }) 호출
    ↓
[Google OAuth 팝업 진행]
    ↓
Google → next-auth callback URL로 리다이렉트
    ↓
app/api/auth/[...nextauth]/route.ts (next-auth 핸들러)
    ↓
[jwt 콜백]
account 존재 시 (최초 로그인):
    백엔드 POST /auth/google { idToken: account.id_token } 전송
    백엔드 응답: { accessToken, refreshToken, user }
    백엔드 Set-Cookie: accessToken (httpOnly), refreshToken (httpOnly)
    ↓
[signIn() 완료]
    ↓
useGoogleLogin: result.error 확인
    ↓
에러 없음 → router.push('/')
에러 있음 → 토스트 표시 (팝업 직접 닫음 제외)
```

### `src/shared/lib/auth/nextAuthConfig.ts` 설계

**providers**
```
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  // scope: 기본값 'openid email profile' 사용
})
```

**callbacks.jwt**
```
jwt({ token, account }):
  account가 있을 때 (최초 로그인):
    1. 백엔드 POST /auth/google { idToken: account.id_token } 호출
       - 서버사이드이므로 BACKEND_API_URL (환경변수) 사용
    2. 성공:
       token.userId, token.accessToken, token.refreshToken 저장
    3. 실패:
       token.error = 'BackendAuthError' 설정
  이후 요청: token 그대로 반환
```

**callbacks.session**
```
session({ session, token }):
  session.user.id = token.userId
  token.error 존재 시 session에 전파
  반환 (실제 인증은 httpOnly cookie 기반이므로 세션 의존도 최소화)
```

**pages 설정**
```
signIn: '/login'    // 커스텀 로그인 페이지
error: '/login'     // 에러 발생 시 /login?error=... 으로 이동
```

**session 전략**
```
strategy: 'jwt'    // 데이터베이스 없이 JWT 전략 사용
```

### `app/api/auth/[...nextauth]/route.ts` 설계

```typescript
// next-auth 핸들러 진입점. 로직은 모두 nextAuthConfig.ts에 위치.
import NextAuth from 'next-auth'
import { authOptions } from '@/shared/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### 백엔드 API 계약 (가정)

```
POST /auth/google
Request Body:  { idToken: string }
Response Body: { accessToken: string, refreshToken: string, user: { id, email, name, profileImage? } }
Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Strict; Path=/
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh
```

---

## 5. JWT 저장(cookie) 및 자동 갱신 처리

### `src/shared/api/axiosInstance.ts` 설계

**인스턴스 기본 설정**
```
baseURL:        process.env.NEXT_PUBLIC_API_BASE_URL
withCredentials: true     // 모든 요청에 cookie 자동 포함
timeout:        10000ms
```

**Response Interceptor (401 자동 갱신 로직)**

```
401 응답 수신
    ↓
isRefreshing 플래그 확인
    ↓
isRefreshing === false:
    isRefreshing = true 설정
    POST /auth/refresh 호출 (cookie의 refreshToken 자동 포함)
        ↓
    갱신 성공:
        isRefreshing = false
        failedQueue 전체 resolve (대기 중인 요청 재시도)
        원래 요청 재시도
    갱신 실패:
        isRefreshing = false
        failedQueue 전체 reject
        useUserStore.logout() 호출
        router.push('/login')
        ↓
isRefreshing === true (갱신 진행 중):
    요청을 failedQueue에 Promise로 적재
    갱신 완료 후 일괄 재시도
```

**중복 갱신 방지 패턴**
- 모듈 스코프에서 `isRefreshing: boolean` 플래그와 `failedQueue: Array<{ resolve, reject }>` 관리
- 갱신 중 들어오는 401 요청은 queue에 적재하여 갱신 완료 후 일괄 처리

### `src/shared/api/authApi.ts` 설계

```
refreshToken():
  axiosInstance의 interceptor 무한 루프 방지를 위해
  interceptor가 없는 별도 axios 인스턴스 또는 특정 URL 제외 처리 사용
  POST /auth/refresh 호출

logout():
  POST /auth/logout 호출 (서버측 토큰 무효화 + cookie 삭제)
```

### `src/app/providers/AuthInitializer.tsx` 설계

앱 최초 마운트 시 JWT 유효성 검증을 수행하는 클라이언트 컴포넌트.

**'use client'** 지시자 필요

```
useEffect(() => {
  store.setLoading(true)

  GET /auth/me (withCredentials로 cookie 자동 포함)
      ↓
  성공:
      user 정보를 Zustand store에 저장 (isAuthenticated = true)
  실패 (401):
      axiosInstance interceptor가 토큰 갱신 자동 시도
          갱신 성공 → GET /auth/me 재시도 → 성공 처리
          갱신 실패 → interceptor에서 logout 처리 (store 초기화)
  finally:
      store.setLoading(false)
}, [])
```

**배치 위치:** `src/app/layouts/index.tsx`의 RootLayout 내부
```
RootLayout
└── SessionProvider (next-auth)
    └── QueryProvider (TanStack Query)
        └── AuthInitializer
            └── {children}
```

---

## 6. 로그인 실패 에러 핸들링

### 에러 타입별 처리 방식

| 에러 타입 | 발생 조건 | 토스트 | 처리 방식 |
|-----------|-----------|--------|-----------|
| 팝업 직접 닫음 | `result.error === 'OAuthSignin'` | **미노출** | 로그인 페이지 유지 |
| Google 인증 거부/실패 | `result.error === 'OAuthCallback'` | "인증에 실패했습니다. 다시 시도해주세요." | 로그인 페이지 유지 |
| 백엔드 통신 실패 | `result.error === 'BackendAuthError'` | "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." | 로그인 페이지 유지 |
| 이용 제한 계정 | `result.error === 'AccessDenied'` | "이용 제한된 계정입니다. 고객센터에 문의해주세요." | 로그인 페이지 유지 |
| 네트워크 오류 | axios 요청 실패 | "네트워크 연결을 확인해주세요." | 로그인 페이지 유지 |
| 토큰 갱신 실패 | interceptor 갱신 최종 실패 | 미노출 (자동 처리) | `/login`으로 리다이렉트 |

### `src/features/google-login/model/useGoogleLogin.ts` 에러 처리 로직

```typescript
async function handleGoogleLogin() {
  setIsLoading(true)

  const result = await signIn('google', {
    redirect: false,
    callbackUrl: '/'
  })

  if (!result) {
    setIsLoading(false)
    return
  }

  if (result.error) {
    // 팝업 직접 닫음: 토스트 미노출
    if (result.error !== 'OAuthSignin') {
      showToast({ type: 'error', message: getErrorMessage(result.error) })
    }
    setIsLoading(false)
    return  // 로그인 페이지 유지
  }

  // 성공: 홈으로 이동
  router.push('/')
}

function getErrorMessage(error: string): string {
  const messages: Record<string, string> = {
    OAuthCallback:      '인증에 실패했습니다. 다시 시도해주세요.',
    BackendAuthError:   '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    AccessDenied:       '이용 제한된 계정입니다. 고객센터에 문의해주세요.',
    Default:            '오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  }
  return messages[error] ?? messages['Default']
}
```

### 토스트 구현 방식

shadcn/ui의 `Sonner` 컴포넌트를 `src/shared/ui/toast/useToast.ts`에서 래핑하여 사용.
`toast.error()`, `toast.success()` 편의 함수를 export하고 각 feature에서 import.

---

## 7. Auth 상태 기반 라우팅 가드

### 2계층 가드 전략

**1계층: Next.js Middleware (서버사이드, cookie 기반)**

파일 위치: `middleware.ts` (프로젝트 루트)

- 모든 페이지 요청에서 **cookie 존재 여부**를 즉시 확인
- cookie가 없으면 백엔드 검증 없이 즉시 `/login`으로 리다이렉트 (빠른 응답)
- cookie 유효성 검증은 백엔드에 위임 (middleware는 존재 여부만 확인)

**matcher 설정 (보호 대상 경로)**
```
'/((?!api|_next/static|_next/image|favicon.ico|login).*)'
→ /login, Next.js 내부 경로, API 라우트를 제외한 모든 경로
```

**Middleware 흐름**
```
요청 수신
    ↓
요청 경로가 /login
    cookie 존재 → / 로 리다이렉트 (이미 로그인된 유저)
    cookie 없음 → 통과 (로그인 페이지 표시)
    ↓
그 외 보호 경로
    cookie(accessToken) 존재 → 통과 (실제 유효성은 백엔드가 판단)
    cookie 없음 → /login 으로 리다이렉트
```

**2계층: AuthRedirectGuard 컴포넌트 (클라이언트사이드, Zustand store 기반)**

파일 위치: `src/widgets/auth-redirect-guard/ui/AuthRedirectGuard.tsx`

middleware를 통과했지만 `AuthInitializer`의 JWT 검증이 완료되지 않은 경우를 처리.
Zustand store의 `isAuthenticated` 상태를 확인하여 최종 렌더링 결정.

**Props**
```typescript
interface AuthRedirectGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode  // 로딩 중 표시할 컴포넌트
}
```

**렌더링 로직**
```
isLoading (초기화 중)   → fallback ?? <LoadingSpinner />
!isAuthenticated        → null + useEffect: router.replace('/login')
isAuthenticated         → children 렌더링
```

**적용 위치:** 인증이 필요한 페이지의 레이아웃 또는 개별 페이지에서 래핑

---

## 8. 컴포넌트 상세 설계

### `src/pages/login/ui/LoginPage.tsx`

**역할:** 로그인 페이지 전체 레이아웃. 인증된 유저 접근 시 홈으로 리다이렉트.

**'use client'** 지시자 필요

**UI 구성**
```
LoginPage
└── 풀스크린 배경 (--background: #0d0d0d)
    └── 중앙 또는 우측 정렬 로그인 카드 (--card: #1a1a1a)
        ├── 로고 + 브랜드명 "Sukiverse"
        ├── 서브타이틀 텍스트
        └── GoogleLoginButton
```

**내부 로직**
- `useUserStore`에서 `isAuthenticated`, `isLoading` 구독
- `isAuthenticated === true` 시 `router.replace('/')` 실행 (뒤로 가기로 재접근 방지)
- `isLoading` 중에는 버튼 비활성화

---

### `src/features/google-login/ui/GoogleLoginButton.tsx`

**역할:** Google 로그인을 트리거하는 버튼 컴포넌트.

**'use client'** 지시자 필요

**Props**
```typescript
interface GoogleLoginButtonProps {
  className?: string
  disabled?: boolean
}
```

**UI 구성**
- Google 공식 SVG 아이콘 + "Google로 계속하기" 텍스트
- 로딩 상태: 버튼 내 스피너 표시 + 비활성화 처리
- `motion` (Framer Motion)으로 hover/press 인터랙션 애니메이션 적용

**내부 로직**
- `useGoogleLogin()` 훅에서 `handleLogin`, `isLoading` 가져옴
- 클릭 시 `handleLogin()` 호출

---

### `src/features/google-login/model/useGoogleLogin.ts`

**역할:** Google 로그인 비즈니스 로직 캡슐화.

**반환 타입**
```typescript
interface UseGoogleLoginReturn {
  handleLogin: () => Promise<void>
  isLoading: boolean
}
```

**의존성**
- `signIn` from `next-auth/react`
- `useRouter` from `next/navigation`
- `useToast` from `@/shared/ui/toast`

---

### `src/entities/user/model/useUserStore.ts`

**역할:** 인증 상태 전역 관리 (Zustand).

**스토어 타입**
```typescript
interface User {
  id: string
  email: string
  name: string
  profileImage?: string
}

interface UserState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean          // AuthInitializer 초기화 중 여부

  // Actions
  setUser: (user: User) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}
```

**logout 액션 처리 순서**
1. `authApi.logout()` 호출 (서버측 토큰 무효화 + cookie 삭제)
2. next-auth `signOut({ redirect: false })` 호출
3. store 상태 초기화 (`user: null`, `isAuthenticated: false`)
4. `router.push('/login')`

---

### `src/app/providers/AuthInitializer.tsx`

**역할:** 앱 마운트 시 1회 JWT 유효성 검증 및 유저 정보 로드.

**'use client'** 지시자 필요

**동작 흐름** (위 5번 섹션 참조)

---

## 9. 시나리오별 처리 흐름

### 시나리오 1 — 재방문 유저 (JWT 유효)

```
앱 진입
→ middleware: cookie 존재 확인 → 통과
→ AuthInitializer: GET /auth/me 성공
→ store.setUser(user), isAuthenticated = true
→ 로그인 페이지 접근 시 LoginPage가 router.replace('/') 실행
→ 홈 화면 표시
```

### 시나리오 2 — 재방문 유저 (JWT 만료)

```
앱 진입
→ middleware: cookie 존재 확인 → 통과 (만료 여부는 확인 불가)
→ AuthInitializer: GET /auth/me → 401 응답
→ axiosInstance interceptor: POST /auth/refresh 시도
    갱신 성공:
        새 accessToken cookie Set-Cookie
        GET /auth/me 재시도 → 성공
        isAuthenticated = true → 기존 페이지 정상 표시
    갱신 실패:
        store 초기화 (isAuthenticated = false)
        router.push('/login')
```

### 시나리오 3 — 기존 유저 재로그인

```
/login 접근
→ GoogleLoginButton 클릭
→ signIn('google', { redirect: false }) 호출
→ Google OAuth 팝업 진행
→ next-auth jwt 콜백: 백엔드 POST /auth/google { idToken } 전송
→ 백엔드: 기존 유저 확인 + JWT 발급 + Set-Cookie (httpOnly)
→ signIn() 완료 → result.error 없음
→ router.push('/')
→ AuthInitializer: GET /auth/me 성공 → isAuthenticated = true
→ 홈 화면 표시
```

### 시나리오 4 — 신규 유저 가입

```
시나리오 3과 동일한 OAuth 플로우 진행
→ 백엔드: 신규 유저 생성 + JWT 발급 + Set-Cookie
→ router.push('/')
→ 홈 화면 표시

※ 신규 유저 온보딩 페이지 추가 시:
   백엔드 응답에 isNewUser 플래그 추가 후 별도 협의 필요
```

### 시나리오 5 — Google 인증 실패

```
Google OAuth 팝업에서 인증 실패 또는 에러 발생
→ signIn() → result.error 존재
→ result.error !== 'OAuthSignin' (팝업 직접 닫음 아님) → 에러 토스트 표시
→ router.push 없음 → 로그인 페이지 유지
→ 사용자 재시도 가능
```

---

## 10. 환경변수 목록

```env
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# NextAuth
NEXTAUTH_SECRET=       # openssl rand -base64 32 로 생성
NEXTAUTH_URL=          # ex) http://localhost:3000

# Backend API
BACKEND_API_URL=                # next-auth jwt 콜백 내 서버사이드 호출용 (비공개)
NEXT_PUBLIC_API_BASE_URL=       # 클라이언트 axios 호출용 (공개)
```

---

## 11. 미결정 사항 — 백엔드 협의 필요

| 항목 | 내용 | 우선순위 |
|------|------|----------|
| 탈퇴 계정 처리 | 탈퇴 계정으로 Google 재로그인 시 백엔드 응답 코드 및 메시지 정의 | 높음 |
| 신규 유저 온보딩 | 가입 직후 추가 정보 입력 페이지 필요 여부 (`isNewUser` 플래그 추가 협의) | 중간 |
| accessToken 만료 시간 | 자동 갱신 로직 타이밍에 영향. 권장: 15분~1시간 | 높음 |
| cookie 이름 | 백엔드 `Set-Cookie` 헤더에서 사용하는 cookie 이름 확인 필요 (현재 `accessToken` 가정) | 높음 |
| 크로스 도메인 설정 | 프론트-백엔드가 다른 도메인일 경우 `SameSite=None; Secure` + CORS `credentials: true` 설정 필요 | 배포 시 |
