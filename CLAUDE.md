# CLAUDE.md — Sukiverse 프로젝트 개발 가이드

## 기본 지시사항

- **소통 언어**: 모든 설명, 질문, 답변은 한국어로 진행. 코드 식별자(변수명, 함수명 등)는 영어 유지
- **코드 작성 금지**: 별도의 명시적 지시가 있을 때까지 코드를 작성하지 않음
- **CLAUDE.md 우선 참조**: 세션 시작 시 전체 파일을 탐색하지 않고, 이 파일 기반으로 맥락 파악
- **research.md 기록**: Plan Mode 중 발견한 내용·분석·제안은 `research.md`에 상세 기록
- **skills.md 작성**: 기능(feature) 개발 시 구현 전략을 `skills.md`에 문서화 후 진행

---

## 프로젝트 개요

- **project name**: Sukiverse (好き + universe)
- **mission**: "애니메이션, J-POP, 일본 패션 정보를 하나의 연결된 세계관처럼 제공"
- **cross domain**: 일본 문화 콘텐츠 종합 플랫폼
- **scope**: Front End 전용 프로젝트 (Back End 로직은 다루지 않음)
- **deploy**: Vercel

### 타겟 사용자

- **일본 문화 팬**: 애니메이션·J-POP·패션을 한 곳에서 탐색하고 싶은 사용자
- **콘텐츠 연결 탐색자**: 노래 → 애니, 성우 → 작품 등 cross domain 정보를 찾는 사용자

---

## 핵심 기능

| 기능         | 설명                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| Animation    | 순위/장르/시리즈/방영시기, 삽입 음악·성우 연결, 커뮤니티, 유사 애니 추천        |
| J-POP        | 곡 정보(순위/장르/가수/YouTube 링크), 아티스트·앨범, 애니메이션 연결, 커뮤니티  |
| Fashion      | 인플루언서 OOTD(Instagram 연동), 아이템 정보(가격/판매처), 유저 업로드 커뮤니티 |
| cross domain | 애니↔J-POP(삽입곡), J-POP↔성우, 애니메이션↔성우                                 |

---

## 제품 로드맵

- **Phase 1**: 메인 페이지 & 로그인/인증
- **Phase 2**: Animation 기능 (정보 탐색·추천)
- **Phase 3**: J-POP 기능 (곡·아티스트 탐색)
- **Phase 4**: 크로스 도메인 연결 & 커뮤니티
- **Phase 5**: Fashion 기능 (OOTD·아이템 탐색)

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

- **소셜 로그인**: next-auth@4 — Google OAuth + Kakao OAuth (결정 2026-02-28)
- 환경변수: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

### 상태 & 데이터

- **서버 상태**: TanStack Query
- **클라이언트 상태**: Zustand
- **HTTP**: Axios

### 폼 & 유효성 검사

- react-hook-form
- zod

### 차트

- recharts

### 테스트

- **모듈 테스트**: Vitest, @testing-library/react
- **E2E 테스트**: Playwright

---

## FSD 파일 구조

```
sukiverse/
├── app/                    # Next.js App Router (라우팅 re-export 전용)
│   ├── layout.ts           # src/app/layouts/RootLayout re-export
│   ├── page.ts             # src/pages/home/HomePage re-export
│   └── [route]/
│       └── page.ts         # 각 FSD 페이지 컴포넌트 re-export
│
└── src/                    # FSD 소스 코드
    ├── app/                # App Layer: 공유 레이아웃 & 전역 설정
    │   ├── layouts/        # RootLayout 등
    │   └── styles/         # globals.css 등
    ├── pages/              # Page Layer: 페이지 단위 컴포넌트
    │   └── [page-name]/
    │       ├── index.ts    # 공개 API (re-export)
    │       └── ui/         # 페이지 컴포넌트
    ├── widgets/            # Widget Layer: 독립적인 복합 블록
    ├── features/           # Feature Layer: 사용자 인터랙션 기능
    │   └── [feature-name]/
    │       ├── index.ts
    │       └── ui/
    ├── entities/           # Entity Layer: Animation, J-POP, Fashion 등
    └── shared/             # Shared Layer: 공통 유틸/상수/타입
```

### FSD + Next.js App Router 충돌 해결 방식

> FSD 공식 문서 기준 (결정 2026-02-28)

- `app/` 폴더는 라우팅 전용 — FSD 컴포넌트를 직접 작성하지 않음
- `app/[route]/page.ts`에서 `src/pages/[page]/index.ts`를 re-export
- FSD `pages` 레이어명 그대로 유지 (`views`로 변경 안 함)

---

## 제약 사항

- 백엔드 기술 스택 미결정 — 별도 지시 전까지 백엔드 코드 작성 안 함
- 모노레포 도구(pnpm workspaces / Turborepo) 최종 선택 미결정
- `client/` 폴더 분리 — 현재 루트가 Next.js 앱 구성, 별도 지시 후 진행
- 카카오 앱 설정: Redirect URI `{NEXTAUTH_URL}/api/auth/callback/kakao` 등록 필요
- Storybook: Node.js 20.19+ 요구로 설치 보류 (현재 v20.17.0)
- 디자인 레퍼런스: LAFTEL(라프텔) 스타일 다크 테마 — 컬러 변수는 `src/app/styles/globals.css` 참조

---

## 코드 컨벤션

- **Path Alias**: `@/*` → `./src/*`
- **포매팅**: Prettier (semi: false, singleQuote: true, tabWidth: 2)
- **린팅**: ESLint (Next.js Core Web Vitals + TypeScript)
- **컴포넌트 파일**: PascalCase (예: `LoginPage.tsx`)
- **인덱스 파일**: 각 슬라이스의 공개 API는 `index.ts`로 re-export

---

## 절대 하지 말아야 할 것

- 말한 것 이상으로 개발하지 않기
- 기능 추가 시 기존 기능 깨뜨리지 않기
- `.env` 파일에 실제 값 넣지 않기
- 허가 없이 파일을 생성·수정·삭제하지 않기
- 이미 결정난 사안을 재논의하지 않기

---

## 주요 파일 경로

| 역할            | 경로                               |
| --------------- | ---------------------------------- |
| 루트 레이아웃   | `src/app/layouts/index.tsx`        |
| 전역 스타일     | `src/app/styles/globals.css`       |
| 홈 페이지       | `src/pages/home/ui/HomePage.tsx`   |
| 로그인 페이지   | `src/pages/login/ui/LoginPage.tsx` |
| Next.js 설정    | `next.config.ts`                   |
| TypeScript 설정 | `tsconfig.json`                    |
| Prettier 설정   | `.prettierrc`                      |
