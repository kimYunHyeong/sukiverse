# CLAUDE.md — Sukiverse 프로젝트 AI 작업 지침서

## 소통 규칙

- 모든 설명, 질문, 답변은 **한국어**로 진행
- 코드 식별자(변수명, 함수명, 컴포넌트명, 라이브러리명 등)는 원어(영어) 그대로 유지
- 기술 용어는 원어를 우선 사용하되, 필요 시 한국어 설명 병기

---

## 작업 규칙

### 코드 작성 금지 원칙

- **별도의 명시적 허가 없이는 절대로 코드를 작성하거나 수정하지 않음**
- 허가 없이 파일을 생성, 수정, 삭제하지 않음
- 코드보다 효율적인 대안이 있다면 코드를 수정하지 말고 `research.md`에 기록

### Plan Mode 규칙

- Plan mode 실행 중 발견한 내용, 분석 결과, 제안 사항은 **`research.md`에 상세하게 기록**
- 탐색 결과는 research.md의 적절한 섹션에 추가하거나 업데이트

### 세션 참조 규칙

- 세션 시작 시 전체 파일을 무분별하게 탐색하지 않음
- **`CLAUDE.md`와 `research.md`를 우선 참조**하여 이미 기록된 내용을 활용
- `research.md`파일에서 변경된 내용은 수정사항이므로 해당 수정 사항을 기반으로 다시 research를 진행할 것
- `research.md`파일에서 변경되지 않은 사안은 수정요구사항이 없는 것이므로 다른 작업을 하지 않기
- `research.md`파일에서 최종적으로 결정난 사안은 claude.md 파일에 변경한 후 `research.md` 파일에서는 삭제하기
- `research.md`은 세션 내에서 판단한 로그를 확인하고 오류를 수정하기 위한 용도로만 활용함. 이미 결정난 사안에 대해서는 논의하지 않음
- 추가 탐색이 필요한 경우에만 지정된 파일을 확인

---

## 프로젝트 개요

**Sukiverse** — 일본 문화 콘텐츠 종합 플랫폼

### 비전

애니메이션, J-POP, 일본 패션 정보를 하나의 연결된 세계관처럼 제공하는 플랫폼

### 핵심 페인 포인트

- 애니메이션 정보, OST, 성우 정보를 한 곳에서 확인 불가능
- 노래에서 애니메이션 연결 정보 찾기 어려움
- 일본 패션 트렌드를 찾기 위해 여러 SNS 순회 필요

### 메인 기능

1. **Animation** — 애니메이션 정보(순위/장르/시리즈/방영시기), 삽입 음악·성우 연결, 커뮤니티, 유사 애니 추천
2. **J-POP** — 곡 정보(순위/장르/가수/YouTube 링크), 아티스트·앨범 정보, 애니메이션 연결, 커뮤니티, 유사 곡 추천
3. **Fashion** — 인플루언서 OOTD(Instagram 연동), 아이템 정보(가격/판매처), 유저 업로드 커뮤니티

### 크로스 도메인 연결

- 애니메이션 ↔ J-POP (삽입곡 연결)
- J-POP ↔ 성우 (성우가 부른 노래)
- 애니메이션 ↔ 성우 (출연 정보)

---

## 기술 스택 (Frontend)

### 코어

| 기술       | 버전 | 비고        |
| ---------- | ---- | ----------- |
| Next.js    | 16+  | App Router  |
| React      | 19   |             |
| TypeScript | 5    | strict 모드 |

### 스타일

| 기술                   | 비고                        |
| ---------------------- | --------------------------- |
| TailwindCSS            | v4                          |
| shadcn/ui              | 다크 테마 커스터마이징 필요 |
| Motion (Framer Motion) | `motion` 패키지명 사용      |

### 상태 & 데이터

| 기술           | 용도                 |
| -------------- | -------------------- |
| TanStack Query | 서버 상태 관리       |
| Zustand        | 클라이언트 상태 관리 |
| Axios          | HTTP 클라이언트      |

### 폼 & 유효성

| 기술            |
| --------------- |
| react-hook-form |
| zod             |

### 인증

| 기술        | 비고                     |
| ----------- | ------------------------ |
| next-auth@4 | Google + Kakao 우선 구현 |

### 소셜 로그인 결정 (2026-02-28)

- **Google OAuth** + **Kakao OAuth** 우선 구현
- 환경변수: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- 카카오 앱 설정: Redirect URI `{NEXTAUTH_URL}/api/auth/callback/kakao` 등록 필요

### 차트

| 기술     |
| -------- |
| recharts |

### 테스트

| 기술                   | 용도                  |
| ---------------------- | --------------------- |
| Vitest                 | Unit/Module 테스트    |
| @testing-library/react | React 컴포넌트 테스트 |
| Playwright             | E2E 테스트            |

> **Storybook:** Node.js 20.19+ 요구로 설치 보류. 현재 환경 Node.js v20.17.0.

### 배포

- **Vercel** (Frontend)

---

## 아키텍처

### 폴더 구조 (모노레포 — 결정 완료)

```
sukiverse/
├── client/          # Next.js 프론트엔드 앱 (현재 루트 내용 이동 예정)
├── server/          # 백엔드 (미결정 - research.md 참조)
├── CLAUDE.md        # AI 작업 지침서 (이 파일)
└── research.md      # 리서치 및 발견 내용
```

> **현재 상태:** 루트가 Next.js 앱으로 구성됨. `client/` 폴더 분리 작업은 별도 지시 후 진행.
> server에는 아직 내용 없음. 모노레포 도구(pnpm workspaces / Turborepo) 최종 선택은 미결정.

### FSD (Feature-Sliced Design) 아키텍처

```
src/
├── app/             # 앱 전역 (레이아웃, 스타일, Provider)
├── pages/           # 페이지 컴포넌트 (FSD 공식 문서 기준 pages 레이어 그대로 유지)
├── widgets/         # 독립적인 복합 UI 블록
├── features/        # 비즈니스 기능 단위
├── entities/        # 비즈니스 엔티티 (Animation, J-POP, Fashion 등)
└── shared/          # 공유 유틸리티, 컴포넌트, 훅
```

### FSD pages 레이어 네이밍 결정

> **결정 (2026-02-28):** FSD 공식 문서 기준으로 `pages` 레이어를 `views`로 변경하지 않고 **그대로 유지**.
> FSD 공식 문서(https://feature-sliced.design/kr/docs/get-started/overview) 에서 pages 방식으로 작동함을 확인.
> `app/` 폴더의 각 라우트 파일은 `src/pages/`의 컴포넌트를 re-export하는 방식으로 운영.

```
app/
├── page.ts          → src/pages/home/index.ts re-export
├── login/page.ts    → src/pages/login/index.ts re-export
└── anime/page.ts    → src/pages/animation/index.ts re-export

src/pages/
├── home/
│   └── ui/HomePage.tsx
├── login/
│   └── ui/LoginPage.tsx
└── animation/
    └── ui/AnimationPage.tsx
```

---

## 디자인 원칙

### 레퍼런스

- LAFTEL(라프텔) 스타일의 다크 테마 UI

### 컬러 팔레트

CSS 변수는 [src/app/styles/globals.css](./src/app/styles/globals.css)의 `.dark` 클래스에 정의됨.

| 그룹       | 변수명                                    | 값        | 용도                      |
| ---------- | ----------------------------------------- | --------- | ------------------------- |
| Background | `--background`                            | `#0d0d0d` | 메인 배경                 |
| Background | `--surface` / `--card`                    | `#1a1a1a` | 카드, 패널 배경           |
| Background | `--elevated` / `--popover`                | `#242424` | 모달, 드롭다운            |
| Text       | `--text-primary` / `--foreground`         | `#ffffff` | 기본 텍스트               |
| Text       | `--text-secondary` / `--muted-foreground` | `#a0a0a0` | 보조 텍스트               |
| Text       | `--text-muted`                            | `#6b6b6b` | 비활성 텍스트             |
| Brand      | `--brand` / `--primary`                   | `#eab308` | 브랜드 강조색 (노란/골드) |
| Semantic   | `--semantic-danger` / `--destructive`     | `#ef4444` | 오류, 삭제                |
| Semantic   | `--semantic-success`                      | `#22c55e` | 성공                      |
| Semantic   | `--semantic-warning`                      | `#f59e0b` | 경고                      |

### 주요 UI 패턴

- 히어로 배너 Carousel (풀와이드)
- 수평 스크롤 콘텐츠 그리드
- 썸네일 카드 + 배지 오버레이
- 글로벌 네비게이션 바 (반투명)

---

## 백엔드

> **미결정** — 기술 방향은 `research.md`의 "백엔드 방향 제안" 섹션 참조.
> 별도 지시가 있을 때까지 백엔드 관련 코드는 작성하지 않음.

---

## 참조 파일

- [README.md](./README.md) — 프로젝트 비전, 기능 정의
- [research.md](./research.md) — 리서치 및 기술 제안 상세 기록
