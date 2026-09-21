# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 언어

이 저장소에서 작업할 때는 사용자에게 항상 **한국어**로 응답하세요. 코드 식별자, 파일 경로,
기술 용어(예: RLS, Zustand, tsconfig)는 원문 그대로 유지합니다.

## 프로젝트 개요

탐색(YouTube 검색으로 곡 추가) → 라이브러리(추가된 곡 검색/목록) → 재생목록 → 재생(단일 곡
또는 재생목록)으로 이어지는 제품 흐름과 접근 권한 정책은 `docs/product-flow.md`에 정리되어
있습니다 — 화면/라우트/권한 관련 작업 전에 먼저 확인하세요.

## 관련 문서

- `docs/product-flow.md` — 제품 흐름(탐색→라이브러리→재생목록→재생)과 접근 권한 정책
- `docs/feature-conventions.md` — `src/features/`·`shared/` 폴더 컨벤션과 소유권 판단 기준
- `docs/note.md` — 로컬 개발 환경(Supabase 프로젝트, `.env.local`) 셋업 절차
- `docs/db-schema.md` — DB 테이블/인덱스/RLS 설계와 마이그레이션 운영 방식
- `docs/todos.md` — 아직 진행 전인 예정 작업 목록
- `docs/migrations/0001_init.sql` — 스키마 소스 오브 트루스(Supabase 대시보드 SQL Editor에
  수동 적용)

4년 전에 만든 CRA + IndexedDB 기반 유튜브 음악 앱을 다시 만드는 프로젝트입니다. `old-src/`는
**참고용 원본**으로만 남겨둔 것입니다 — `react-scripts` 기반의 순수 JS이고, 이 프로젝트의
ESLint 설정(`eslint.config.js`)에서 명시적으로 제외되어 있으며, `src/`나 `api/`의 코드는
여기서 아무것도 import하면 안 됩니다. 새 버전은 여러 사용자가 각자 계정으로 쓰는 서비스이며,
Vite + TypeScript SPA에 Supabase(Postgres + Auth)를 백엔드로 붙이고 Vercel에 배포합니다.

## 명령어

```
npm install       # 의존성 설치
npm run dev       # vite 개발 서버 (프론트엔드만 — 아래 주의사항 참고)
npm run build     # tsc -b (project reference로 src/, api/, vite.config.ts 타입체크) + vite build
npm run lint      # eslint .
npm run preview   # 프로덕션 빌드 미리보기
```

테스트 러너는 아직 구성되어 있지 않습니다.

화면을 실제로 띄워서 스크린샷으로 확인하려면(`/login`, `/signup` 등) 직접 dev 서버를
띄우고 브라우저 도구를 짜지 말고 `.claude/skills/run-neumorplayer/SKILL.md`를
따르세요 — `node .claude/skills/run-neumorplayer/driver.mjs <route> ...` 한 줄로
서버 기동/스크린샷/정리까지 다 해줍니다(Git Bash에서 경로 인자에 슬래시를 붙이면 안 되는
등 이미 겪은 함정들이 그 파일에 정리되어 있습니다).

`npm run dev`는 프론트엔드만 서빙합니다. `api/` 아래의 라우트는 Vercel Functions이라
일반 `vite dev`로는 동작하지 않습니다 — `/api/youtube-search`, `/api/youtube-video`를
로컬에서 테스트하려면 터미널을 하나 더 열어 `vercel dev`(`npm i -g vercel` 후 `vercel dev`,
기본 3000번 포트)를 띄우세요. **브라우저로는 계속 `npm run dev`의 5173번 포트를 열어야
합니다 — `vercel dev`가 띄우는 포트를 직접 열지 마세요.** `vite.config.ts`의
`server.proxy`가 `/api`를 3000번으로 넘겨주므로 5173에서 API 호출까지 그대로 됩니다.
`vercel dev` 포트를 직접 열면 `vercel.json`의 SPA rewrite(아키텍처 문단 참고)가 Vite
개발 서버의 가상 asset 경로(`/@vite/client` 등)까지 가로채 화면이 아예 안 뜹니다(실제로
겪음) — `vercel dev`는 항상 API 전용으로만 쓰세요.

로컬 환경 셋업(Supabase 프로젝트, `.env.local`)은 `docs/note.md`를 참고하세요.
(`README.md`는 old-src의 사용자용 README를 그대로 복사해온 것으로, 지금 스택의 개발
문서가 아닙니다.)

## 아키텍처

**Next.js가 아니라 Vite SPA로 의도적으로 구성했습니다.** 서버 코드는 오직 `api/` 아래의
Vercel Functions로만 존재합니다(특정 프레임워크와 무관한 Vercel의 범용 서버리스 함수
컨벤션). 이 앱은 인증 뒤에 숨겨져 있고 공개/SEO 대상 페이지가 없으며 얇은 프록시 엔드포인트
몇 개만 필요하기 때문에 Next.js보다 이 방식을 의도적으로 선택했습니다 — `pages/`나 `app/`
아래에 파일 기반 API 라우트를 두는 등 Next.js 컨벤션을 여기에 다시 들여오지 마세요.
Vite SPA는 실제 정적 파일이 `index.html` 하나뿐이고 `/login`·`/explore` 같은 나머지 경로는
전부 React Router가 브라우저에서 해석하는 가짜 경로라, 그 경로로 직접 들어가거나
새로고침하면 서버가 진짜 404를 돌려줍니다 — 그래서 `vercel.json`에 `/api/*`를 제외한
모든 경로를 `index.html`로 돌려보내는 rewrite가 있어야 합니다(Vercel은 실제 파일/함수가
있으면 rewrite보다 그걸 먼저 매칭하므로 `/api/*` 서버리스 함수와 안 부딪힙니다). 이
rewrite를 건드리거나 지우면 루트(`/`) 말고 다른 경로에서 새로고침할 때마다 404가 납니다.
이 rewrite는 프로덕션(정적 배포) 전용이고, 로컬 `vercel dev`와 충돌하지 않게 쓰는 법은
위 "명령어" 절을 참고하세요.

**서버 상태와 클라이언트 상태를 엄격히 분리합니다:**

- _서버 상태_(트랙, 재생목록)는 Supabase Postgres가 소유하며, `src/shared/lib/supabase.ts`의
  클라이언트를 통해 TanStack Query(`src/shared/lib/queryClient.ts`)로 가져옵니다. 접근 제어는
  전부 Postgres **Row Level Security**가 담당하며, `docs/migrations/0001_init.sql`에
  정의되어 있습니다 — 모든 테이블의 정책이 `auth.uid() = user_id`로 행을 제한합니다
  (`playlist_tracks`는 소유 playlist의 `user_id`를 확인하는 `EXISTS` 절). 새 테이블이나
  쿼리를 추가할 때 대응하는 RLS 정책이 없으면 에러 없이 그냥 0건이 반환되니 주의하세요.
- _클라이언트 전용 상태_(현재 재생 큐/인덱스, 재생 중인 재생목록 id, 반복/셔플, 볼륨,
  음소거, `isPlaying`)는 `src/features/player/lib/usePlayerStore.ts`(Zustand)에 있습니다. 새로고침 후에도
  유지되는 건 `volume`/`muted`뿐이고(zustand `persist` + `partialize`), 큐와 재생 위치는
  의도적으로 유지하지 않습니다.

**인증**: `src/features/auth/AuthProvider.tsx`가 `supabase.auth`(세션 상태, Google OAuth,
이메일/비밀번호 로그인/회원가입/로그아웃)를 context로 감쌉니다. context 객체와 `useAuth()`
훅은 `react-refresh/only-export-components`를 만족시키기 위해
`hooks/auth-context.ts` / `hooks/useAuth.ts`로 나눠져 있고, `AuthProvider.tsx`는 앱 루트에
한 번만 마운트되는 provider라 `pages/`·`components/` 어디에도 안 맞아서 feature 루트에
그대로 둡니다 — 인증 코드를 건드릴 때 이 구조를 유지하세요. `/login`, `/signup`은 실제
라우트로 존재하는 공개 페이지입니다 — 공개 라우트가 앞으로 더 늘어날 수 있으니
(`docs/todos.md` 참고) 새 공개 라우트를 추가할 땐 그 페이지를 해당 feature의 `pages/`
아래에 두고, `src/router/AppRoutes.tsx`에서 `RequireAuth` 밖에 둬야 합니다.
`src/router/RequireAuth.tsx`는
로그아웃 상태면 `<Navigate to="/login" />`으로 리다이렉트하고, 반대로
`src/router/GuestOnly.tsx`는 로그인된 사용자가 `/login`·`/signup`에 들어오면 `/`로
돌려보냅니다 — 새 인증 관련 라우트를 추가할 때 이 두 가드 중 맞는 쪽으로 감싸세요.

**라우팅**(`src/router/AppRoutes.tsx`): `/login`·`/signup`은 `GuestOnly`로 감싼 독립
라우트이고, `/`(및 그 하위 전부)는 `RequireAuth`로 감싼 `HomeLayout`(`features/dashboard/pages/HomeLayout.tsx`
— 사이드바 + `<Outlet/>`) 아래에 중첩됩니다 — 이는 old-src의 `Home.js` 셸에 대응합니다.
`src/App.tsx`는 이 라우트 트리를 `<BrowserRouter>`로 감싸 마운트하기만 하는 얇은
진입점입니다(라우트 코드 자체는 여기 두지 않음). 각 라우트가 렌더링하는 페이지는 해당
feature의 `pages/` 아래에 있습니다 — `explore` → `ExplorePage.tsx`, `library` →
`LibraryPage.tsx`/`MusicInfoPage.tsx`, `playlist` → `PlaylistInfoPage.tsx`, `dashboard` →
`HomeLayout.tsx`. 404는 어떤 feature 도메인도 대표하지 않아 `shared/pages/NotFoundPage.tsx`에
있습니다. `docs/todos.md`에 아직 안 끝난 부분(예: `MusicInfoPage`의 수정 폼)이 남아
있으니 페이지를 고치기 전에 먼저 확인하세요.

**Feature 폴더 컨벤션**: `src/` 하위는 `features/`, `shared/`, `router/` 세 갈래로
정리합니다 — 각 feature는 필요한 만큼만 `api/`/`components/`/`lib/`/`hooks/`/`pages/`를
두고, 페이지는 한 곳에 모으지 않고 각 feature의 `pages/`에 둡니다. **`shared/`로 보내는
기준은 "여러 feature가 쓰는지"가 아니라 "그 도메인을 대표하는 feature가 있는지"입니다**
(예: 로그아웃 버튼이 여러 화면에서 `useAuth().signOut`을 불러도 `signOut`은 여전히 auth
소유이지 `shared/`로 안 감) — `shared/lib`(인프라/범용 유틸), `shared/components`(도메인
없는 UI 프리미티브), `shared/styles`(마크업은 다르고 계산된 style 값만 같은 경우) 세 갈래로
나뉩니다. 현재 feature 목록, 각 feature 예시, `shared/` 세 갈래에 뭐가 있는지, feature
안의 `api/`가 최상위 `api/`(Vercel Functions)와 왜 다른지는 `docs/feature-conventions.md`
에 정리되어 있습니다 — 새 파일을 어디 둘지 고민되면 먼저 확인하세요.

**스타일링**: Tailwind CSS v4를 `@tailwindcss/vite` 플러그인으로 씁니다 — v4는 CSS-first라
`tailwind.config.js`/`postcss.config.js`가 없습니다. `src/index.css` 맨 위 `@import
"tailwindcss";`가 전부이고, 색상 디자인 토큰(`--bg`, `--surface`, `--accent` 등)은 그
아래 `:root`에 원본으로 정의된 뒤 `@theme` 블록에서 `--color-*` 네임스페이스로 다시
노출됩니다(`var()` 참조라 라이트/다크 전환 시 같이 따라감) — 그래서 `bg-accent`,
`text-muted`, `border-border` 같은 유틸리티 클래스가 우리 브랜드 색을 그대로 씁니다. 새
색상을 추가할 땐 `@theme` 안에서 직접 정의하지 말고 `:root`의 원본 토큰을 늘린 뒤
`@theme`에서 참조만 추가하세요. box-sizing 리셋, 폼 요소 font-family 상속 등은 Tailwind
preflight가 처리하므로 `index.css`에 따로 두지 않습니다. 컴포넌트는 전부 Tailwind 유틸리티
클래스로 작성하고 CSS Modules는 이 프로젝트에서 더 이상 쓰지 않습니다(있던 것도 삭제함 —
새 컴포넌트도 항상 Tailwind로). **임의값 문법(`rounded-[6px]`처럼)은 표준 표기로 대응이
안 될 때만 씁니다** — 예를 들어 `rounded-[6px]`는 `rounded-md`와 정확히 같은 값이니
`rounded-md`로 쓰세요. 정확한 픽셀 값(라운드 10px/16px, 패딩 11px 등)이 Tailwind 기본
스케일과 안 맞는 곳(표준 표기로 쓸 수 없는 불가피한 경우)만 임의값 문법을 그대로
씁니다 — 어색해 보여도 의도한 것이니 기본 스케일 값으로 반올림하지 마세요. 폰트는
Pretendard를 jsDelivr CDN에서 불러옵니다(`index.html`).

**로그인/회원가입 화면**(`src/features/auth/pages/LoginPage.tsx`, `SignupPage.tsx`,
공유 조각은 `src/features/auth/components/`의 `AuthLayout.tsx`/`AuthForm.tsx`): 카드는
로그인/회원가입 모두 같은 722px 폭 그리드(240px 브랜드 패널 + 폼 패널, `docs/design/
수정본2.zip` 기준)이고, 브랜드 패널엔 로고 아래 "NEUMORPLAYER" 워드마크(Space Grotesk
폰트, `index.html`에서 로드)와 화면별 `title`/`subtitle`, 맨 아래 YouTube의 공식
"Developed with YouTube" 배지 이미지(`public/developed-with-youtube.png`)가 있습니다.
`AuthLayout`은 예전엔 폼 패널 위에 작은 라벨을 보여주는 `heading` prop도 받았는데,
그 라벨 역할을 이제 브랜드 패널의 `title`이 대신해서 prop 자체를 없앴습니다 — 인증
화면을 더 추가할 때 `heading`을 다시 들여오지 마세요. 시안과 의도적으로 다른 점 —
"로그인 상태 유지" 체크박스와 "비밀번호 찾기" 링크는 만들지 않았습니다(디자인 초안에
실수로 들어갔던 항목이라 최신 시안에도 이미 빠져 있음). Google 로그인은 `LoginPage`에만
있고 `SignupPage`엔 없습니다 — OAuth는 별도 회원가입 절차 없이 바로 로그인되기
때문입니다. **Supabase 프로젝트의 "가입 확인 이메일" 옵션이 꺼져 있다는
전제로, 회원가입 성공 시 바로 세션이 생긴다고 가정하고 짜여 있습니다**(별도의 "이메일
확인" 안내 화면 없음) — 이 옵션이 켜지면 이 가정이 깨지니 회원가입 플로우를 다시
확인하세요.

**환경변수**: `VITE_` 접두사가 붙은 변수는 빌드 시 클라이언트 번들에 그대로 박히고
(Supabase URL/publishable key는 이래도 안전한데, 실제 접근 제어는 RLS가 하기 때문;
secret key는 RLS를 우회하므로 여기 해당하지 않음), 접두사가 없는 변수는 서버 전용으로
`api/`에서만 읽을 수 있습니다. `api/` 아래는 하위 디렉터리로 자유롭게 나눌 수 있고
(Vercel이 파일 경로를 그대로 라우트 경로로 매핑), `_`로 시작하는 파일/폴더(예:
`api/_youtube.ts`)는 Vercel이 라우트로 배포하지 않는 비공개 헬퍼 컨벤션입니다.

**DB 스키마**: 테이블 구조, 인덱스 설계, RLS 정책, 마이그레이션 운영 방식은
`docs/db-schema.md`에 정리되어 있습니다 — 스키마나 쿼리 관련 작업 전에 먼저 확인하세요.
꼭 기억할 두 가지만 요약하면: 새 테이블/쿼리를 추가할 때 대응하는 RLS 정책이 없으면 에러
없이 그냥 0건이 반환되고, `src/shared/lib/database.types.ts`는 스키마가 바뀌면 손으로 고치지 말고
`supabase gen types typescript --linked`로 재생성해야 합니다.

**TypeScript 프로젝트 구조**: 루트 `tsconfig.json`이 세 개의 설정을 참조합니다 —
`tsconfig.app.json`(`src/`, DOM 라이브러리, bundler 모듈 해석), `tsconfig.node.json`
(`vite.config.ts`), `tsconfig.api.json`(`api/`, Node 타입). `npm run build`(`tsc -b`)가
이 세 개를 모두 타입체크합니다. `@/*` → `./src/*` 경로 별칭은 `tsconfig.app.json`의
`paths`와 `vite.config.ts`의 `resolve.alias` 양쪽에 선언되어 있으니, 바꿀 때 둘 다
동기화하세요. `paths`는 `baseUrl` 없이 쓰고 있는데(TypeScript가 TS 7을 앞두고 단독
`baseUrl`을 사용 중단 처리했기 때문), 그래서 경로 값 앞에 `./`가 필요합니다.
