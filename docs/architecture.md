# 아키텍처

`CLAUDE.md`에는 지켜야 할 규칙만 짧게 두고, 그 규칙의 배경과 구조 설명은 여기 둡니다.
파일 위치 규칙(feature/shared)은 `docs/feature-conventions.md`, DB/RLS는
`docs/db-schema.md`, 로컬 환경 셋업은 `docs/note.md`를 보세요.

## Next.js가 아니라 Vite SPA

이 앱은 Next.js가 아니라 Vite + React SPA로 의도적으로 구성했습니다. 서버 코드는 오직
최상위 `api/` 아래의 Vercel Functions로만 존재합니다(특정 프레임워크와 무관한 Vercel의
범용 서버리스 함수 컨벤션 — 파일 경로가 그대로 라우트 경로가 되고, `_`로 시작하는
파일/폴더는 라우트로 배포되지 않는 비공개 헬퍼입니다).

처음 설계할 때 이 앱은 인증 뒤에 숨겨져 있고 SEO가 필요한 공개 페이지가 없으며 얇은
프록시 엔드포인트 몇 개만 필요해서 이 방식을 골랐습니다(이후 비로그인용 랜딩 페이지가
생겼지만 SPA 안의 화면 하나입니다). `pages/`나 `app/` 아래에 파일 기반 API 라우트를 두는
등 Next.js 컨벤션을 들여오지 마세요.

## `vercel.json`의 SPA rewrite

Vite SPA는 실제 정적 파일이 `index.html` 하나뿐이고 `/login`·`/explore` 같은 나머지
경로는 전부 React Router가 브라우저에서 해석하는 가짜 경로입니다. 그래서 그 경로로 직접
들어가거나 새로고침하면 서버가 진짜 404를 돌려줍니다. `vercel.json`의 rewrite가 모든
경로를 `index.html`로 돌려보내서 이를 막습니다 — Vercel은 실제 파일/함수가 있으면
rewrite보다 그걸 먼저 매칭하므로 `/api/*` 서버리스 함수와 부딪히지 않습니다. 이 rewrite를
지우면 `/`가 아닌 경로에서 새로고침할 때마다 404가 납니다.

이 rewrite는 프로덕션(정적 배포)용입니다. 로컬에서 `vercel dev`(API 테스트용, 기본
3000번 포트)가 띄운 주소를 브라우저로 직접 열면, 이 rewrite가 Vite 개발 서버의 가상
경로(`/@vite/client` 등)까지 `index.html`로 가로채 화면이 아예 안 뜹니다(실제로 겪음).
그래서 브라우저는 항상 `npm run dev`의 5173번 포트만 열고, `vercel dev`는 API 전용으로만
씁니다 — `vite.config.ts`의 `server.proxy`가 `/api` 요청을 3000번으로 넘겨줍니다.
실행 절차는 `docs/note.md`의 "로컬 개발 서버"를 보세요.

## 서버 상태와 클라이언트 상태의 분리

- **서버 상태**(트랙, 재생목록, 사용자 설정)는 Supabase Postgres가 소유하고,
  `src/shared/lib/supabase.ts`의 클라이언트로 읽고 쓰며 TanStack Query
  (`src/shared/lib/queryClient.ts`)로 캐시합니다. 접근 제어는 전부 Postgres Row Level
  Security가 담당합니다(`docs/db-schema.md`의 "Row Level Security").
- **클라이언트 전용 상태**(재생 큐와 위치, 재생 중인 재생목록, 반복/셔플, 볼륨 등)는
  Zustand 스토어에 둡니다 — 대시보드의 재생 상태는
  `src/features/player/lib/usePlayerStore.ts`.

## 인증과 라우팅

- `src/main.tsx`가 앱 전체를 `QueryClientProvider`와 `AuthProvider`
  (`src/features/auth/AuthProvider.tsx` — `supabase.auth` 세션, Google OAuth, 이메일/
  비밀번호 로그인·회원가입·로그아웃)로 감싸고, `src/App.tsx`는 `<BrowserRouter>` 안에
  라우트 트리(`src/router/AppRoutes.tsx`)를 마운트하기만 합니다.
- 라우트 트리(`src/router/AppRoutes.tsx`):
  - `/login`, `/signup` — `GuestOnly`로 감싼 공개 페이지. 로그인된 사용자는 `/`로 돌려보냅니다.
  - `/`와 그 하위 — `HomeAccessGate`가 감쌉니다. 비로그인 사용자가 **정확히 `/`** 로 오면
    랜딩 페이지(`src/features/landing/pages/LandingPage.tsx`)를 그 자리에서 보여주고,
    그 외에는 `RequireAuth`를 거쳐 대시보드 셸 `HomeLayout`
    (`src/features/dashboard/pages/HomeLayout.tsx` — 사이드바·헤더 + `<Outlet/>`, old-src의
    `Home.js`에 대응)을 보여줍니다. 그 아래에 라이브러리(index), `explore`,
    `music/:musicId`, `playlist/:playlistId`, 404가 중첩됩니다.
  - 가드별 리다이렉트 규칙(로그아웃 직후엔 랜딩으로, 처음부터 비로그인이면 `/login`으로
    등)은 `src/router/` 각 파일의 주석에 있습니다.
- 랜딩 페이지는 게스트 검색·재생을 자체 상태(`src/features/landing/lib/useGuestPlayer.ts`)로
  처리하고 `usePlayerStore`를 쓰지 않습니다 — 랜딩에서 무엇을 재생해도 로그인 사용자의
  재생 상태를 건드리지 않게 하기 위해서입니다. YouTube 제어 로직과 CD 플레이어 조각은
  대시보드와 공유합니다(`src/features/player/`).
