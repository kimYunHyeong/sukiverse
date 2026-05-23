# CLAUDE.md — sukiverse 프로젝트 개발 가이드

## 기본 지시사항

- **소통 언어**: 모든 설명, 질문, 답변은 한국어로 진행. 코드 식별자(변수명, 함수명 등)는 영어 유지
- **코드 작성 금지**: 별도의 명시적 지시가 있을 때까지 코드를 작성하지 않음
- **CLAUDE.md 우선 참조**: 세션 시작 시 전체 파일을 탐색하지 않고, 이 파일 기반으로 맥락 파악

---

## 프로젝트 개요

- **project name**: sukiverse (好き + universe)
- **mission**: "애니메이션, J-POP, 성우 정보를 하나의 연결된 세계관처럼 제공"
- **cross domain**: 일본 문화 콘텐츠 종합 플랫폼
- **scope**: Front End 전용 프로젝트 (Back End 로직은 직접 작성하지 않음)
- **deploy**: Vercel

### 타겟 사용자

- **일본 문화 팬**: 애니메이션·J-POP·패션을 한 곳에서 탐색하고 싶은 사용자
- **콘텐츠 연결 탐색자**: 노래 → 애니, 성우 → 작품 등 cross domain 정보를 찾는 사용자

---

## 핵심 기능

| 기능         | 설명                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| Animation    | 순위/장르/시리즈/방영시기, 삽입 음악·성우 연결, 커뮤니티, 유사 애니 추천       |
| J-POP        | 곡 정보(순위/장르/가수/YouTube 링크), 아티스트·앨범, 애니메이션 연결, 커뮤니티 |
| 성우         | 성우가 연기한 캐릭터, 애니메이션 정보를 제공                                   |
| cross domain | 애니↔J-POP(삽입곡), J-POP↔성우, 애니메이션↔성우                                |

---

## 제품 로드맵

- **Phase 1**: 메인 페이지 & 로그인/인증
- **Phase 2**: Animation 기능 (정보 탐색·추천)
- **Phase 3**: J-POP 기능 (곡·아티스트 탐색)
- **Phase 4**: 크로스 도메인 연결 & 커뮤니티

---

## 기술 스택

### 코어

- **프레임워크**: Next.js 16+ (App Router)
- **UI**: React 19
- **타입**: TypeScript 5 (strict 모드)

### 스타일

- **CSS**: TailwindCSS v4
- **컴포넌트**: shadcn/ui (다크 테마 커스터마이징)
- **애니메이션**: motion (framer-motion)

### 인증

- **소셜 로그인**: next-auth@4 — Google OAuth + Kakao OAuth + Naver OAuth

### 상태 & 데이터

- **서버 상태**: TanStack Query
- **클라이언트 상태**: Zustand
- **HTTP**: Axios

### 폼 & 유효성 검사

- react-hook-form
- zod

### 테스트

- **모듈 테스트**: Vitest, @testing-library/react
- **E2E 테스트**: Playwright

---

## 디자인

- 레퍼런스: LAFTEL(라프텔) 스타일 다크 테마
- 다크 테마 + 노란색 계열의 primary color 사용
- 반응형 웹 디자인
- 모바일 베이스로 우선 개발 진행 => 데스크톱 => 테블릿 순으로 진행

---

## 백엔드 스펙 (프론트 참조용)

> 백엔드 코드는 직접 작성하지 않음. API 연동·인증 흐름 설계 시 참조.

### API 서버

- **언어·프레임워크**: Kotlin + Spring Boot
- **인증·인가**: Spring Security + JWT (Bearer 토큰)
- **소셜 로그인**: OAuth2 Client — Google, Kakao
- **인증 흐름**: 백엔드가 OAuth2 처리 후 JWT 발급 → 프론트는 JWT를 `Authorization: Bearer <token>` 헤더로 전송

### 데이터베이스

- **PostgreSQL**: 회원 정보(즐겨찾기·리뷰·좋아요), 애니메이션(제목·장르·성우·OST·줄거리), J-POP(제목·가수·가사·카테고리)
- **Redis**: 세션·토큰 임시 저장, 인기 추천 결과, 랭킹 목록 캐싱

### 인프라

- **AWS**: EC2(서버), S3(스토리지), CloudFront(CDN), ElastiCache(Redis), CloudWatch(모니터링)
- **배포**: Docker 기반

---

## 제약 사항

- 백엔드 코드 직접 작성 안 함 (API 연동 코드만 작성)
- Storybook: v10.4.0 설치 완료 (`npm run storybook` → localhost:6006)

---

## 폴더 구조

```
src/
├── app/                        # Next.js App Router (라우팅 전용)
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── animation/page.tsx
│   ├── jpop/page.tsx
│   ├── actor/page.tsx
│   └── api/auth/[...nextauth]/route.ts
│
├── features/                   # 도메인별 기능 묶음 (핵심)
│   ├── auth/
│   │   ├── components/         # LoginButton, AuthGuard 등
│   │   ├── hooks/              # useAuth
│   │   └── types.ts
│   ├── animation/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types.ts
│   ├── jpop/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types.ts
│   └── actor/
│       ├── components/
│       ├── hooks/
│       └── types.ts
│
├── components/                 # 전역 공통 컴포넌트
│   ├── ui/                     # shadcn/ui (수정 금지)
│   └── layout/                 # Header, Footer, MobileNav
│
├── lib/                        # 외부 라이브러리 초기화 & 설정
│   ├── auth.ts                 # NextAuth authOptions
│   ├── axios.ts
│   └── query-client.ts
│
├── hooks/                      # 전역 공통 커스텀 훅
└── types/                      # 전역 공유 타입
```

### 폴더 구조 원칙

| 원칙             | 설명                                                             |
| ---------------- | ---------------------------------------------------------------- |
| **도메인 응집**  | animation 관련 컴포넌트·훅·타입은 `features/animation/` 안에서만 |
| **공통의 기준**  | 2개 이상 도메인에서 쓰이면 `components/` 또는 `hooks/`로 올림    |
| **app/ 는 얇게** | 라우팅과 레이아웃만. 비즈니스 로직은 features/로                 |

---

- **page.tsx는 Server Component 유지** — SEO를 위해 `'use client'`를 page 파일에 붙이지 않는다.

---

## 코드 컨벤션

- **Path Alias**: `@/*` → `./src/*`
- **포매팅**: Prettier (semi: false, singleQuote: true, tabWidth: 2)
- **린팅**: ESLint (Next.js Core Web Vitals + TypeScript)
- **컴포넌트 파일**: PascalCase (예: `LoginPage.tsx`)
- **인덱스 파일**: 각 feature의 공개 API는 `index.ts`로 re-export

---

## 스타일링 규칙 (TailwindCSS v4)

### 디자인 토큰 사용 원칙

`style={{ color: 'var(--token-...)' }}` 인라인 스타일 **금지**.
반드시 Tailwind 유틸리티 클래스로 작성한다.

```tsx
// 금지
style={{ backgroundColor: 'var(--token-semantic-color-background-app)' }}

// 권장
className="bg-background-app"
```

### 토큰 → Tailwind 클래스 매핑 구조

시맨틱 컬러 토큰은 `src/app/globals.css`의 `@theme inline` 블록에 **실제 hex 값**으로 직접 등록되어 있다.
Tailwind v4는 `--color-*` 변수를 자동으로 `bg-*` / `text-*` / `border-*` 유틸리티로 노출한다.

| `@theme inline` 변수 (`--color-`) | Tailwind 클래스 예시                               |
| --------------------------------- | -------------------------------------------------- |
| `navigation-bg`                   | `bg-navigation-bg`                                 |
| `navigation-border`               | `border-navigation-border`                         |
| `navigation-active-text`          | `text-navigation-active-text`                      |
| `navigation-default-text`         | `text-navigation-default-text`                     |
| `background-app`                  | `bg-background-app`                                |
| `background-surface`              | `bg-background-surface`                            |
| `border-default`                  | `border-border-default`                            |
| `text-primary`                    | `text-text-primary`                                |
| `text-brand`                      | `text-text-brand`                                  |
| `icon-brand`                      | `text-icon-brand` (fill="currentColor" SVG에 적용) |

### 새 토큰 추가 시

`globals.css`의 `@theme inline` 블록에 `--color-*: #hex값` 형태로 직접 추가한다. (`src/styles/tokens.css`는 primitive 팔레트 참조 전용이며, globals.css에서 import하지 않는다.)

---

## 절대 하지 말아야 할 것

- 말한 것 이상으로 개발하지 않기(허가 없이 파일을 생성·수정·삭제하지 않기)
- 기능 추가 시 기존 기능 깨뜨리지 않기
- `.env` 파일에 실제 값 넣지 않기
