# [Plan] anime-db — 애니메이션 DB 설계 및 구현

**피처 ID**: anime-db
**작성일**: 2026-06-15
**브랜치**: settings
**Phase**: Plan

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 현재 `mocks/anime.json` 파일 기반 가짜 DB로 운영 중 — 유저 데이터 저장 불가, 관계형 쿼리 불가, 확장성 없음 |
| **Solution** | Neon(서버리스 PostgreSQL) + Drizzle ORM으로 실제 관계형 DB 구축 및 기존 목 데이터 마이그레이션 |
| **UX Effect** | 백엔드 코드 변경 없이 기존 API 동작 유지 + 향후 즐겨찾기, 댓글 등 유저 기능 확장 기반 마련 |
| **Core Value** | sukiverse 콘텐츠 데이터(애니·OST·앨범)를 단일 관계형 모델로 통합, 도메인 간 cross-연결 쿼리 가능 |

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 파일 기반 mock에서 벗어나 실제 유저 데이터와 콘텐츠 관계를 영속적으로 관리 |
| **WHO** | 서비스 개발자 (현재 단계) — 유저 facing 기능은 다음 스코프 |
| **RISK** | 기존 `animeData.ts` 인터페이스 변경 시 API 레이어 breaking change 가능 |
| **SUCCESS** | 모든 기존 API가 DB 데이터로 동일하게 동작 + Drizzle Studio에서 테이블 확인 가능 |
| **SCOPE** | DB 스키마 정의 → 마이그레이션 → 시드 데이터 → 기존 server 함수 교체 (유저 favorites 제외) |

---

## 1. 기술 스택

| 항목 | 선택 | 버전 |
|------|------|------|
| DB 호스팅 | Neon (서버리스 PostgreSQL) | — |
| ORM | drizzle-orm | latest |
| DB 드라이버 | @neondatabase/serverless | latest |
| 마이그레이션 | drizzle-kit | latest (dev) |
| DB 뷰어 | Drizzle Studio | drizzle-kit 내장 |

### 외부 준비 사항

1. **Neon 가입**: https://neon.tech (무료, 신용카드 불필요)
2. **프로젝트 생성** → 연결 문자열 복사 (`postgresql://...`)
3. **환경변수 설정**:
   - `.env.local`: `DATABASE_URL=postgresql://...?sslmode=require`
   - Vercel 대시보드: `DATABASE_URL` 동일하게 등록

---

## 2. ERD (Entity Relationship Diagram)

### 2.1 테이블 목록

| 테이블 | 설명 | 주요 외부 ID |
|--------|------|------------|
| `users` | 서비스 유저 (next-auth 호환) | — |
| `anime` | 애니메이션 작품 | `mal_id` (MAL), `ani_id` (레거시 ULID) |
| `genres` | 장르 lookup 테이블 | — |
| `anime_genres` | 애니↔장르 N:N 중간 테이블 | — |
| `albums` | Spotify 앨범 | `spotify_id` |
| `artists` | Spotify 아티스트 | `spotify_id` |
| `songs` | Spotify 트랙 | `spotify_id` |
| `song_artists` | 노래↔아티스트 N:N 중간 테이블 | — |
| `anime_songs` | 애니↔OST 연결 (OP/ED 텍스트 포함) | — |

### 2.2 관계도

```
users ──────────────────────────────────────────────────────
                                                            │
anime ──┬── anime_genres ── genres                          │ (다음 스코프)
        │                                                   │
        └── anime_songs ──── songs ──┬── song_artists ── artists
                                     └── albums
```

### 2.3 스키마 상세

#### `users`
```
id            UUID        PK DEFAULT gen_random_uuid()
name          TEXT
email         TEXT        UNIQUE NOT NULL
email_verified TIMESTAMP
image         TEXT
created_at    TIMESTAMP   DEFAULT now()
```

#### `anime`
```
id            UUID        PK DEFAULT gen_random_uuid()
ani_id        TEXT        UNIQUE NOT NULL  -- 레거시 ULID (mocks에서 이관)
mal_id        INTEGER     UNIQUE NOT NULL  -- MyAnimeList ID
title_ko      TEXT        NOT NULL
title_en      TEXT
title_jp      TEXT
year          INTEGER
score         DECIMAL(4,2)
rank          INTEGER
image_url     TEXT
synopsis      TEXT
status        TEXT        -- 'Finished Airing' | 'Currently Airing' | ...
type          TEXT        -- 'TV' | 'Movie' | 'OVA' | ...
source        TEXT        -- 'Manga' | 'Light novel' | ...
episodes      INTEGER
duration      TEXT
rating        TEXT        -- 'PG-13' | 'R - 17+' | ...
aired_from    DATE
aired_to      DATE
created_at    TIMESTAMP   DEFAULT now()
```

#### `genres`
```
id            SERIAL      PK
name          TEXT        UNIQUE NOT NULL  -- 'Action' | 'Romance' | ...
```

#### `anime_genres`
```
anime_id      UUID        FK → anime.id   ON DELETE CASCADE
genre_id      INTEGER     FK → genres.id  ON DELETE CASCADE
PRIMARY KEY (anime_id, genre_id)
```

#### `albums`
```
id            UUID        PK DEFAULT gen_random_uuid()
spotify_id    TEXT        UNIQUE
name          TEXT        NOT NULL
release_date  TEXT
image_url     TEXT
```

#### `artists`
```
id            UUID        PK DEFAULT gen_random_uuid()
spotify_id    TEXT        UNIQUE
name          TEXT        NOT NULL
```

#### `songs`
```
id            UUID        PK DEFAULT gen_random_uuid()
spotify_id    TEXT        UNIQUE
name          TEXT        NOT NULL
duration_ms   INTEGER
preview_url   TEXT
spotify_url   TEXT
album_id      UUID        FK → albums.id  ON DELETE SET NULL
```

#### `song_artists`
```
song_id       UUID        FK → songs.id   ON DELETE CASCADE
artist_id     UUID        FK → artists.id ON DELETE CASCADE
PRIMARY KEY (song_id, artist_id)
```

#### `anime_songs`
```
id            UUID        PK DEFAULT gen_random_uuid()
anime_id      UUID        FK → anime.id   ON DELETE CASCADE
song_id       UUID        FK → songs.id   ON DELETE SET NULL  -- Spotify 미매칭 가능
theme_type    TEXT        NOT NULL  -- 'opening' | 'ending' | 'insert'
theme_text    TEXT        -- Jikan 원문 e.g. "#1: \"Again\" by YUI"
ep_range      TEXT        -- e.g. "1-25" | "1-13"
sort_order    INTEGER     DEFAULT 0
```

---

## 3. 요구사항

### 3.1 기능 요구사항

| ID | 요구사항 | 우선순위 |
|----|---------|--------|
| FR-01 | Drizzle 스키마 파일 작성 (`src/db/schema/*.ts`) | P0 |
| FR-02 | drizzle-kit으로 마이그레이션 SQL 생성 및 Neon에 적용 | P0 |
| FR-03 | `mocks/anime.json` 데이터를 `anime` + `genres` + `anime_genres` 테이블로 시드 | P0 |
| FR-04 | 기존 `src/lib/server/animeData.ts` 함수를 DB 쿼리로 교체 (`getAnimeList`, `getAnimeById`) | P0 |
| FR-05 | `anime_songs` 시드 — Jikan OP/ED 텍스트 데이터 삽입 스크립트 | P1 |
| FR-06 | Drizzle Studio로 테이블 데이터 확인 가능 | P1 |

### 3.2 비기능 요구사항

| 항목 | 기준 |
|------|------|
| API 하위 호환 | 기존 `/api/v1/anime/jikan/*` 응답 형태 유지 |
| 타입 안전성 | Drizzle 추론 타입으로 `Anime` 인터페이스 대체 가능 |
| 환경 분리 | `DATABASE_URL`만으로 로컬↔Vercel 전환 |

---

## 4. 스코프 밖 (이번 제외)

- `user_anime_favorites` (유저 즐겨찾기)
- `user_song_favorites`
- `studios` / `anime_studios` 테이블
- Spotify API 자동 매칭 후 songs 자동 시드
- `AnimeCharacter`, `AnimeEpisode` DB 저장 (여전히 Jikan API 직접 호출)

---

## 5. 리스크

| 리스크 | 영향도 | 대응 |
|--------|--------|------|
| `mocks/anime.json` 장르가 쉼표 구분 문자열 | 중 | 시드 스크립트에서 파싱 후 `genres` 테이블 분리 삽입 |
| Neon 무료 플랜 연결 제한 (10 concurrent) | 저 | `@neondatabase/serverless` HTTP 방식 사용 → 연결 풀 불필요 |
| `getAnimeList` 정렬을 DB side로 이전 시 쿼리 복잡도 증가 | 저 | Drizzle `orderBy` + 인덱스로 해결 |

---

## 6. 성공 기준

- [ ] `drizzle-kit studio` 실행 시 9개 테이블 모두 표시
- [ ] `mocks/anime.json` 전체 데이터가 `anime` 테이블에 존재
- [ ] 기존 홈 페이지 (`/`) 애니 목록이 DB 데이터로 정상 렌더링
- [ ] 기존 상세 페이지 (`/ani/[aniId]`) 정상 동작
- [ ] `anime_songs` 테이블에 OP/ED 텍스트 샘플 데이터 존재

---

## 7. 구현 순서 (Do 단계 가이드)

```
1. 패키지 설치
   pnpm add drizzle-orm @neondatabase/serverless
   pnpm add -D drizzle-kit

2. Neon 프로젝트 생성 → DATABASE_URL 발급

3. src/db/ 구조 생성
   src/db/
   ├── index.ts          # Neon 연결 클라이언트
   ├── schema/
   │   ├── users.ts
   │   ├── anime.ts
   │   ├── songs.ts
   │   └── index.ts      # 전체 export
   └── migrations/       # drizzle-kit 생성

4. drizzle.config.ts 작성

5. drizzle-kit generate → push (Neon에 테이블 생성)

6. scripts/seed-anime.ts 작성 (mocks/anime.json → DB)

7. src/lib/server/animeData.ts 교체 (파일 읽기 → DB 쿼리)

8. anime_songs 시드 스크립트 (Jikan API 호출 후 OP/ED 텍스트 저장)
```
