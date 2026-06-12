---
name: add-comments
description: >
  코드를 Write 또는 Edit할 때 반드시 적용하는 주석 가이드라인.
  새 파일 생성, 컴포넌트 작성, 함수 구현, 기존 코드 수정 등
  모든 코드 변경 작업(Write/Edit tool 사용 시)에 자동으로 적용됩니다.
  TRIGGER: Write tool 또는 Edit tool을 사용하기 전에 항상 이 스킬을 읽고 주석 규칙을 따릅니다.
---

# add-comments

코드를 이해하기 쉽도록 간결한 한국어 주석을 추가하는 스킬입니다.

## 주석 원칙

**주석을 달 때 반드시 지켜야 할 규칙:**

1. **짧고 명확하게** — 한 줄로 역할만 설명합니다. 동작 방식이나 구현 세부사항은 쓰지 않습니다.
2. **초보자 기준** — 코딩을 막 시작한 사람도 "아, 이건 이런 역할이구나"를 바로 알 수 있어야 합니다.
3. **과하지 않게** — 모든 줄에 주석을 달지 않습니다. 함수, 섹션, 복잡한 로직 단위로만 답니다.
4. **한국어로** — 주석은 항상 한국어로 작성합니다.

## 주석 형식

### 타입 위 주석

각 타입 위에도 주석을 작성합니다.

### 함수 위 주석

함수나 컴포넌트 위에는 `/* */` 형식으로 한 줄 주석을 답니다.

```tsx
/* 유저 정보를 불러오기 위한 API */
async function fetchUser(id: string) { ... }

/* 로그인 상태를 확인하는 훅 */
function useAuthStatus() { ... }

/* 애니메이션 목록 페이지 */
export default function AnimationListPage() { ... }
```

### JSX 섹션 주석

JSX 내 구역 구분은 `{/* */}` 형식을 사용합니다.

```tsx
{/* 헤더 */}
<div>...</div>

{/* 검색 바 */}
<input ... />

{/* 애니메이션 카드 목록 */}
<div>...</div>
```

### 변수/상수 주석 (꼭 필요한 경우만)

역할이 이름만으로 불분명한 경우에만 인라인 주석을 답니다.

```tsx
const LIMIT = 20 // 한 번에 불러올 최대 개수
```

## 주석을 달지 않는 곳

- 이름만으로 역할이 명확한 변수 (`const isLoading`, `const userName` 등)
- import 구문
- 자명한 return 문
- 단순 JSX 래퍼 (`<div className="...">` 단독 줄)

## 작업 방식

1. 대상 파일을 읽고 전체 구조를 파악합니다.
2. 함수/컴포넌트/주요 섹션 단위로 주석이 필요한 위치를 식별합니다.
3. 기존 주석이 있으면 스타일을 맞춰 유지합니다.
4. 주석을 추가한 후 변경된 파일을 보여줍니다.

## 예시

**Before:**

```tsx
export default function LoginPage() {
  return (
    <div className='flex flex-col'>
      <div className='flex h-20 items-center'>
        <BackButton />
      </div>
      <div className='flex flex-1 flex-col items-center'>
        <SukiverseIcon />
        <div className='flex flex-col gap-2'>
          <LoginButton provider='kakao' />
          <LoginButton provider='google' />
        </div>
      </div>
    </div>
  )
}
```

**After:**

```tsx
/* 로그인 페이지 */
export default function LoginPage() {
  return (
    <div className='flex flex-col'>
      {/* 뒤로가기 헤더 */}
      <div className='flex h-20 items-center'>
        <BackButton />
      </div>

      {/* 바디 */}
      <div className='flex flex-1 flex-col items-center'>
        <SukiverseIcon />

        {/* 로그인 버튼 영역 */}
        <div className='flex flex-col gap-2'>
          <LoginButton provider='kakao' />
          <LoginButton provider='google' />
        </div>
      </div>
    </div>
  )
}
```
