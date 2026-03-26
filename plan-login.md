# Plan: 로그인 및 토큰 관리 시스템

---

## 왜 이 구조가 필요한가

현재 코드는 next-auth가 Google 로그인 세션을 쿠키에 저장하는 방식으로 동작한다.
그러나 실제 서비스에서는 백엔드가 인증을 담당하고 자체 발급한 토큰(AT/RT)으로 API를 보호한다.
프론트엔드가 구글 토큰을 저장할 이유가 없으며, 백엔드가 발급한 토큰만 관리하면 된다.

---

## 사용 기술과 이유

### next-auth

**역할:** Google OAuth dance 전용 중간자

OAuth를 직접 구현하면 구글 인증 URL 생성, CSRF 방지용 state 파라미터 처리, 콜백 처리, code → id_token 교환 등을 모두 직접 작성해야 한다. next-auth는 이 복잡한 과정을 자동으로 처리해준다.

이 프로젝트에서 next-auth는 "구글이 이 사람을 인증했다"는 사실을 확인하는 역할만 한다. 세션 저장이나 토큰 관리는 하지 않는다.

---

### Zustand

**역할:** 클라이언트 메모리에 AT(Access Token) 보관

AT는 수명이 짧아(보통 15분~1시간) 잦은 갱신이 필요하다. 빠른 접근이 중요하고, 페이지 새로고침 시 어차피 재발급받으므로 브라우저 저장소(localStorage 등)에 저장할 필요가 없다. Zustand는 자바스크립트 메모리에 상태를 보관하므로 XSS 공격으로 탈취될 위험이 낮다.

---

### httpOnly 쿠키 (`__Host-refresh-token`)

**역할:** RT(Refresh Token) 보관

RT는 수명이 길어(수일~수십일) 탈취되면 장기 세션을 빼앗긴다. localStorage에 저장하면 XSS 공격으로 접근 가능하지만, httpOnly 쿠키는 자바스크립트로 읽을 수 없어 안전하다. 브라우저가 해당 도메인에 요청을 보낼 때 자동으로 쿠키를 포함하므로, 프론트엔드 코드에서 RT를 직접 다룰 필요도 없다.

---

### Axios + Interceptor

**역할:** 모든 API 요청/응답의 공통 처리

fetch를 직접 사용하면 API를 호출하는 모든 곳에서 Authorization 헤더 추가, 401 처리, 토큰 갱신 코드를 반복 작성해야 한다. Axios의 interceptor는 모든 요청이 지나가는 관문 역할을 한다. 한 곳에만 설정하면 이후 모든 API 호출에 자동 적용된다.

또한 fetch는 서버가 401, 500을 반환해도 에러로 처리하지 않지만, Axios는 4xx/5xx를 자동으로 에러로 처리하므로 interceptor에서 401을 감지하기 편리하다.

---

## 파일 구성과 각 파일의 역할

### `src/shared/auth/authOptions.ts`

next-auth 설정 파일이다. Google OAuth가 완료되는 순간 백엔드의 `/auth/google`에 Google id_token을 전달하고, 백엔드가 발급한 RT를 httpOnly 쿠키에 저장하는 로직이 여기에 들어간다.

이 파일이 핵심인 이유는 **Google 인증과 백엔드 인증을 연결하는 유일한 접점**이기 때문이다. 사용자 입장에서는 "구글로 로그인" 한 번이지만, 내부적으로는 구글 인증 → 백엔드 자체 인증의 2단계가 여기서 처리된다.

---

### `src/shared/auth/authStore.ts`

Zustand store로 AT와 유저 정보를 메모리에 보관한다. persist 없이 메모리 전용으로 동작한다.

이 파일이 필요한 이유는 AT를 전역 상태로 관리해야 Axios interceptor에서 꺼내 쓸 수 있기 때문이다. React 훅이 아닌 일반 함수에서도 `useAuthStore.getState()`로 접근할 수 있어 interceptor에서 활용 가능하다.

---

### `src/shared/api/axiosInstance.ts`

Axios 인스턴스와 interceptor를 정의한다. 모든 API 요청의 출발점이 되는 파일이다.

- **Request interceptor:** 요청이 나가기 전에 Zustand에서 AT를 꺼내 Authorization 헤더에 자동 주입한다.
- **Response interceptor:** 응답이 401이면 토큰 갱신 플로우를 실행한다. 이때 여러 요청이 동시에 401을 받는 경우 RT refresh가 중복 호출되지 않도록 대기열(failedQueue)을 관리한다.

---

### `app/api/auth/refresh/route.ts`

Next.js 서버에서 실행되는 토큰 갱신 전용 Route Handler다.

이 파일이 별도로 필요한 이유는 **RT가 httpOnly 쿠키라 자바스크립트에서 직접 읽을 수 없기 때문**이다. 클라이언트는 RT를 모른 채로 이 Route를 호출하고, 서버가 쿠키에서 RT를 꺼내 백엔드에 전달한다. 이렇게 RT는 서버 사이드에서만 다루어진다.

---

### `app/api/auth/logout/route.ts`

로그아웃 시 서버에서 RT 쿠키를 삭제하는 Route Handler다.

httpOnly 쿠키는 자바스크립트로 삭제할 수 없으므로, 서버를 통해야 한다.

FE: 쿠키/스토리지 AT·RT 전부 삭제, 메모리 초기화

### `src/features/auth/model/useAuthInit.ts`

앱이 처음 마운트될 때 AT를 복원하는 훅이다.

AT는 메모리에만 있어 페이지를 새로고침하면 사라진다. RT 쿠키는 남아있으므로 이 훅이 마운트 시 `/api/auth/refresh`를 호출해 새 AT를 발급받아 Zustand에 저장한다. 이 과정 덕분에 사용자가 새로고침해도 로그인 상태가 유지된다.

---

### `src/app/layouts/AuthInitializer.tsx`

`useAuthInit` 훅을 실행하기 위한 클라이언트 컴포넌트다.

Root Layout은 서버 컴포넌트라 훅을 직접 호출할 수 없다. `'use client'` 컴포넌트를 별도로 만들어 Layout에 끼워 넣는 방식으로 해결한다. 화면에는 아무것도 렌더링하지 않고 초기화만 담당한다.

---

### `src/features/auth/model/useAuth.ts`

컴포넌트에서 인증 상태를 사용하는 인터페이스를 제공하는 훅이다.

기존에는 `useSession()`으로 next-auth 세션을 직접 사용했지만, 이제 인증 주체가 백엔드 토큰으로 바뀌므로 Zustand store를 기반으로 동작한다. 컴포넌트는 이 훅만 보면 되고, 내부 구현이 바뀌어도 컴포넌트 코드는 변경하지 않아도 된다.

---

## 전체 플로우

### 최초 로그인

1. 사용자가 "구글로 로그인" 버튼을 클릭한다.
2. next-auth가 구글 로그인 페이지로 리다이렉트한다.
3. 사용자가 구글 계정을 선택하면 구글이 next-auth 콜백 URL로 돌아온다.
4. next-auth의 `signIn` callback이 실행되며, 구글 id_token을 백엔드 `/auth/google`로 전송한다.
5. 백엔드가 id_token을 검증하고 자체 AT + RT를 발급한다.

//백엔드로부터 두 토큰을 받는 로직이 없는 것 같은데?? 제대로 구현된 건지 확인 부탁

6. RT는 서버 사이드에서 httpOnly 쿠키로 저장된다. AT는 아직 클라이언트에 없다.
7. 페이지가 로드되면 `AuthInitializer`가 마운트되며 `useAuthInit`이 실행된다.
8. `useAuthInit`이 `/api/auth/refresh`를 호출하고, 서버가 RT 쿠키로 백엔드에서 AT를 재발급받아 반환한다.
9. AT와 유저 정보가 Zustand에 저장된다. 로그인 완료.

---

### API 요청 (정상)

1. 컴포넌트가 `axiosInstance.get('/anime/list')`를 호출한다.
2. Request interceptor가 Zustand에서 AT를 꺼내 `Authorization: Bearer {AT}` 헤더를 자동 추가한다.
3. 백엔드가 토큰을 검증하고 데이터를 반환한다.
4. 컴포넌트가 데이터를 수신한다.

---

### API 요청 (AT 만료 시)

1. 컴포넌트가 `axiosInstance.get('/anime/list')`를 호출한다.
2. 만료된 AT가 헤더에 포함되어 전송된다.
3. 백엔드가 401을 반환한다.
4. Response interceptor가 401을 감지하고 `/api/auth/refresh`를 호출한다.
5. Next.js 서버가 httpOnly 쿠키에서 RT를 꺼내 백엔드 `/auth/refresh`를 호출한다.
6. 백엔드가 AT + RT를 동시에 새로 발급한다 (Rotation).
7. 새 RT는 쿠키로 교체되고, 새 AT는 response body로 전달된다.
8. Zustand의 AT가 새 AT로 업데이트된다.
9. interceptor가 실패했던 원래 요청을 새 AT로 자동 재시도한다.
10. 컴포넌트는 실패한 사실을 모른 채 데이터를 수신한다.

---

### AT 만료 + 여러 요청 동시 발생 시

여러 요청이 동시에 401을 받으면 RT refresh가 중복 호출될 위험이 있다. 이를 방지하기 위해 첫 번째 401이 refresh를 시작하면 나머지 요청들은 대기열에 쌓인다. refresh가 완료되면 대기 중이던 요청들이 새 AT로 한꺼번에 재시도된다.

---

### 페이지 새로고침

//새로고침할 때마다 토큰 리프레시를 수행하는데 원래 다른 사이트들도 그런 식으로 진행해? 너무 잦지 않아?

1. Zustand 메모리가 초기화되어 AT가 사라진다.
2. `AuthInitializer`가 마운트되며 `useAuthInit`이 실행된다.
3. `/api/auth/refresh` 호출 → RT 쿠키가 살아있으면 새 AT 발급 → Zustand 복원.
4. RT 쿠키가 없거나 만료된 경우 비로그인 상태로 유지된다.

---

### 로그아웃

1. 컴포넌트가 `useAuth`의 `signOut`을 호출한다.
2. Zustand의 AT와 유저 정보가 즉시 초기화된다.
3. `/api/auth/logout`을 호출해 서버에서 RT 쿠키를 삭제한다.
4. next-auth `signOut()`을 호출해 next-auth 세션 쿠키도 정리한다.
5. `/login` 페이지로 이동한다.

---

## 환경 변수

| 변수명                 | 용도                     |
| ---------------------- | ------------------------ |
| `GOOGLE_CLIENT_ID`     | Google OAuth 앱 ID       |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 앱 시크릿   |
| `NEXTAUTH_SECRET`      | next-auth 세션 암호화 키 |
| `NEXTAUTH_URL`         | 서비스 기본 URL          |
| `NEXT_PUBLIC_API_URL`  | 백엔드 API base URL      |
