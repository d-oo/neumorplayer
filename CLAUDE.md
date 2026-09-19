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
띄우고 브라우저 도구를 짜지 말고 `.claude/skills/run-ytmusic-remaster/SKILL.md`를
따르세요 — `node .claude/skills/run-ytmusic-remaster/driver.mjs <route> ...` 한 줄로
서버 기동/스크린샷/정리까지 다 해줍니다(Git Bash에서 경로 인자에 슬래시를 붙이면 안 되는
등 이미 겪은 함정들이 그 파일에 정리되어 있습니다).

`npm run dev`는 프론트엔드만 서빙합니다. `api/` 아래의 라우트는 Vercel Functions이라
일반 `vite dev`로는 동작하지 않습니다 — `/api/youtube-search`, `/api/youtube-video`를
로컬에서 테스트하려면 `vercel dev`(`npm i -g vercel` 후 `vercel dev`)를 사용하세요.

로컬 개발을 시작하려면 Supabase 프로젝트가 필요합니다(`docs/migrations/0001_init.sql`을
해당 프로젝트에 적용). `.env.example`을 복사해 `.env.local`도 만들어야 합니다. 전체 절차는
`docs/note.md`를 참고하세요. (`README.md`는 old-src의 사용자용 README를 그대로 복사해온
것으로, 지금 스택의 개발 문서가 아닙니다.)

## 아키텍처

**Next.js가 아니라 Vite SPA로 의도적으로 구성했습니다.** 서버 코드는 오직 `api/` 아래의
Vercel Functions로만 존재합니다(특정 프레임워크와 무관한 Vercel의 범용 서버리스 함수
컨벤션). 이 앱은 인증 뒤에 숨겨져 있고 공개/SEO 대상 페이지가 없으며 얇은 프록시 엔드포인트
몇 개만 필요하기 때문에 Next.js보다 이 방식을 의도적으로 선택했습니다 — `pages/`나 `app/`
아래에 파일 기반 API 라우트를 두는 등 Next.js 컨벤션을 여기에 다시 들여오지 마세요.

**서버 상태와 클라이언트 상태를 엄격히 분리합니다:**

- _서버 상태_(트랙, 재생목록)는 Supabase Postgres가 소유하며, `src/lib/supabase.ts`의
  클라이언트를 통해 TanStack Query(`src/lib/queryClient.ts`)로 가져옵니다. 접근 제어는
  전부 Postgres **Row Level Security**가 담당하며, `docs/migrations/0001_init.sql`에
  정의되어 있습니다 — 모든 테이블의 정책이 `auth.uid() = user_id`로 행을 제한합니다
  (`playlist_tracks`는 소유 playlist의 `user_id`를 확인하는 `EXISTS` 절). 새 테이블이나
  쿼리를 추가할 때 대응하는 RLS 정책이 없으면 에러 없이 그냥 0건이 반환되니 주의하세요.
- _클라이언트 전용 상태_(현재 재생 큐/인덱스, 재생 중인 재생목록 id, 반복/셔플, 볼륨,
  음소거, `isPlaying`)는 `src/stores/usePlayerStore.ts`(Zustand)에 있습니다. 새로고침 후에도
  유지되는 건 `volume`/`muted`뿐이고(zustand `persist` + `partialize`), 큐와 재생 위치는
  의도적으로 유지하지 않습니다.

**인증**: `src/features/auth/AuthProvider.tsx`가 `supabase.auth`(세션 상태, Google OAuth,
이메일/비밀번호 로그인/회원가입/로그아웃)를 context로 감쌉니다. context 객체와 `useAuth()`
훅은 `react-refresh/only-export-components`를 만족시키기 위해
`hooks/auth-context.ts` / `hooks/useAuth.ts`로 나눠져 있고, `AuthProvider.tsx`는 앱 루트에
한 번만 마운트되는 provider라 `pages/`·`components/` 어디에도 안 맞아서 feature 루트에
그대로 둡니다 — 인증 코드를 건드릴 때 이 구조를 유지하세요. `/login`, `/signup`은 실제
라우트로 존재하는 공개 페이지입니다 — 공개 라우트가 앞으로 더 늘어날 수 있으니
(`docs/todos.md` 참고) `src/routes/*`에 새 공개 라우트를 추가할 땐
`src/router/AppRoutes.tsx`에서 `RequireAuth` 밖에 둬야 합니다. `src/router/RequireAuth.tsx`는
로그아웃 상태면 `<Navigate to="/login" />`으로 리다이렉트하고, 반대로
`src/router/GuestOnly.tsx`는 로그인된 사용자가 `/login`·`/signup`에 들어오면 `/`로
돌려보냅니다 — 새 인증 관련 라우트를 추가할 때 이 두 가드 중 맞는 쪽으로 감싸세요.

**라우팅**(`src/router/AppRoutes.tsx`): `/login`·`/signup`은 `GuestOnly`로 감싼 독립
라우트이고, `/`(및 그 하위 전부)는 `RequireAuth`로 감싼 `HomeLayout`(사이드바 +
`<Outlet/>`) 아래에 중첩됩니다 — 이는 old-src의 `Home.js` 셸에 대응합니다. `src/App.tsx`는
이 라우트 트리를 `<BrowserRouter>`로 감싸 마운트하기만 하는 얇은 진입점입니다(라우트 코드
자체는 여기 두지 않음). `src/routes/` 아래의 페이지 컴포넌트는 현재 뼈대 상태이고, 각각
old-src의 어떤 컴포넌트를 대체하는지와 구현 방향을 코멘트로 달아뒀습니다(예:
`SearchPage.tsx`는 old-src의 수동 IndexedDB 커서 페이지네이션을 `useInfiniteQuery` +
Supabase `.range()`로 대체해야 함). 페이지를 처음부터 구현하기 전에 그 코멘트를 먼저
확인하세요.

**Feature 폴더 컨벤션**: `src/` 하위는 `features/`, `shared/`, `router/` 세 갈래로
정리합니다. `router/`에는 라우팅 전용 코드만 두고(`AppRoutes.tsx`의 라우트 트리,
`RequireAuth`/`GuestOnly` 같은 가드 — `App.tsx`는 그 위에서 `BrowserRouter`로 감싸기만
합니다), 페이지 컴포넌트는 한 곳에 모으지 않고 각 feature의 `pages/` 하위에 둡니다.
feature 안에는 필요한 만큼만 `api/`/`components/`/`lib/`/`hooks/`/`pages/`를 만들고, 그
feature가 실제로 쓰지 않는 디렉터리는 만들지 않습니다 — `features/auth/`가 적용 예시입니다
(`pages/`에 `LoginPage.tsx`/`SignupPage.tsx`, `components/`에 `AuthLayout.tsx`/
`AuthForm.tsx`/`GoogleIcon.tsx`/`icons.tsx`, `hooks/`에 `useAuth.ts`/`auth-context.ts`;
`api/`나 `lib/`는 auth엔 필요 없어서 안 만들었고, `AuthProvider.tsx`는 위에서 설명한
이유로 feature 루트에 그대로 둠). 여러 feature가 공유하는 코드(`src/lib/`, `src/stores/`)는
`shared/`로 묶습니다. **feature 안의 `api/`는 아래에서 설명하는 최상위 `api/`(Vercel
Functions)와 별개**입니다 — feature의 `api/`는 그 feature가 `/api/...` 엔드포인트를
호출하는 클라이언트 쪽 fetch 래퍼/쿼리 훅만 모아두는 용도이고, 최상위 `api/` 자체는
Vercel이 프로젝트 루트를 보고 배포하는 파일 기반 컨벤션이라 feature 폴더 밑으로 옮기면
배포가 깨지므로 이동 대상이 아닙니다(하위 디렉터리로 나누는 것 자체는 가능 — 아래
YouTube API 항목 참고). 나머지 코드(`player`, `src/routes/`의 페이지들)를 이 컨벤션으로
옮기는 작업은 `docs/todos.md`에 정리되어 있습니다 — 한 번에 다 옮기지 않고 단계적으로
진행합니다.

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
새 컴포넌트도 항상 Tailwind로). 정확한 픽셀 값(라운드 10px/16px, 패딩 11px 등)이 Tailwind
기본 스케일과 안 맞는 곳은 임의값 문법(`rounded-[10px]`처럼)을 그대로 씁니다 — 어색해
보여도 의도한 것이니 기본 스케일 값으로 반올림하지 마세요. 폰트는 Pretendard를 jsDelivr
CDN에서 불러옵니다(`index.html`).

**로그인/회원가입 화면**(`src/features/auth/pages/LoginPage.tsx`, `SignupPage.tsx`): 다른
화면과 같은 라이트 뉴모피즘 톤(`docs/design/데스크탑 로그인 및 회원가입 화면.zip` 시안
그대로, `--neu-*` 토큰)이고, 브랜드 패널(로고 자리·헤드라인·`Youtube Music Player`
워드마크) + 폼 패널로 나뉜 2단 카드 구조입니다. `src/features/auth/components/`의
`AuthLayout.tsx`가 이 카드 껍데기(`title`/`subtitle`은 왼쪽 브랜드 패널, `heading`은
오른쪽 폼 위 소제목)를, 같은 디렉터리의 `AuthForm.tsx`가 `Field`/`PasswordField`(눈
아이콘으로 표시/숨김 토글)/`AgreeCheckbox`/`PrimaryButton`/`GoogleButton`/`Divider`/
`FormError` 같은 공유 폼 조각들을 내보냅니다 — 인증 관련 화면을 더 추가할 땐 이 두 파일과
`icons.tsx`(이메일/자물쇠/눈/체크 아이콘, 같은 디렉터리)를 재사용하세요. 시안과
의도적으로 다른 점: "로그인 상태 유지" 체크박스와 "비밀번호 찾기" 링크는 만들지 않았고,
회원가입 화면은 시안의 이름 필드 대신 기존 "비밀번호 확인" 필드를 유지하며, Google
버튼이 없는 것은 시안 그대로 의도한 것입니다. Supabase 프로젝트의 "가입 확인 이메일" 옵션이
꺼져 있다는 전제로, 회원가입 성공 시 바로 세션이 생긴다고 가정하고 짜여 있습니다(별도의
"이메일 확인" 안내 화면 없음).

**YouTube Data API 키는 절대 클라이언트 코드에 닿으면 안 됩니다.** `api/_youtube.ts`가
`process.env.YOUTUBE_API_KEY` 읽기를 한 곳에 모아두고 있고, `api/youtube-search.ts`와
`api/youtube-video.ts`만이 이를 호출합니다(둘 다 Vercel Functions로 배포됨). YouTube Data
API를 새로 써야 하면 `api/` 아래에 새 파일을 추가하고 프론트에서는 `fetch("/api/...")`로
호출하세요 — `src/`에서 `googleapis.com`을 직접 호출하지 마세요. `api/` 아래를 하위
디렉터리로 나누는 것 자체는 가능합니다(Vercel은 파일 경로를 그대로 라우트 경로로 매핑하므로
`api/youtube/search.ts` → `/api/youtube/search`처럼 임의 depth의 중첩을 지원) — 나눌
때는 프론트의 `fetch("/api/...")` 호출 경로도 함께 바꾸고, `api/_youtube.ts`처럼 `_`로
시작하는 파일/폴더는 Vercel이 라우트로 배포하지 않는 비공개 헬퍼 컨벤션이니 재배치 후에도
그대로 유지하세요. 환경변수 규칙은 이 저장소
전체에서 하나입니다: `VITE_` 접두사가 붙은 변수는 빌드 시 클라이언트 번들에 그대로
박히고(Supabase URL/publishable key는 이래도 안전한데, 실제 접근 제어는 RLS가 하기 때문;
secret key는 RLS를 우회하므로 여기 해당하지 않음),
접두사가 없는 변수는 서버 전용으로 `api/`에서만 읽을 수 있습니다.

**DB 스키마**: 테이블 구조, 인덱스 설계, RLS 정책, 마이그레이션 운영 방식은
`docs/db-schema.md`에 정리되어 있습니다 — 스키마나 쿼리 관련 작업 전에 먼저 확인하세요.
꼭 기억할 두 가지만 요약하면: 새 테이블/쿼리를 추가할 때 대응하는 RLS 정책이 없으면 에러
없이 그냥 0건이 반환되고, `src/lib/database.types.ts`는 스키마가 바뀌면 손으로 고치지 말고
`supabase gen types typescript --linked`로 재생성해야 합니다.

**TypeScript 프로젝트 구조**: 루트 `tsconfig.json`이 세 개의 설정을 참조합니다 —
`tsconfig.app.json`(`src/`, DOM 라이브러리, bundler 모듈 해석), `tsconfig.node.json`
(`vite.config.ts`), `tsconfig.api.json`(`api/`, Node 타입). `npm run build`(`tsc -b`)가
이 세 개를 모두 타입체크합니다. `@/*` → `./src/*` 경로 별칭은 `tsconfig.app.json`의
`paths`와 `vite.config.ts`의 `resolve.alias` 양쪽에 선언되어 있으니, 바꿀 때 둘 다
동기화하세요. `paths`는 `baseUrl` 없이 쓰고 있는데(TypeScript가 TS 7을 앞두고 단독
`baseUrl`을 사용 중단 처리했기 때문), 그래서 경로 값 앞에 `./`가 필요합니다.
