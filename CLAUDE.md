# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 언어

이 저장소에서 작업할 때는 사용자에게 항상 **한국어**로 응답하세요. 코드 식별자, 파일 경로,
기술 용어(예: RLS, Zustand, tsconfig)는 원문 그대로 유지합니다.

## 프로젝트 개요

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
- *서버 상태*(트랙, 재생목록)는 Supabase Postgres가 소유하며, `src/lib/supabase.ts`의
  클라이언트를 통해 TanStack Query(`src/lib/queryClient.ts`)로 가져옵니다. 접근 제어는
  전부 Postgres **Row Level Security**가 담당하며, `docs/migrations/0001_init.sql`에
  정의되어 있습니다 — 모든 테이블의 정책이 `auth.uid() = user_id`로 행을 제한합니다
  (`playlist_tracks`는 소유 playlist의 `user_id`를 확인하는 `EXISTS` 절). 새 테이블이나
  쿼리를 추가할 때 대응하는 RLS 정책이 없으면 에러 없이 그냥 0건이 반환되니 주의하세요.
- *클라이언트 전용 상태*(현재 재생 큐/인덱스, 재생 중인 재생목록 id, 반복/셔플, 볼륨,
  음소거, `isPlaying`)는 `src/stores/usePlayerStore.ts`(Zustand)에 있습니다. 새로고침 후에도
  유지되는 건 `volume`/`muted`뿐이고(zustand `persist` + `partialize`), 큐와 재생 위치는
  의도적으로 유지하지 않습니다.

**인증이 앱 전체를 게이트합니다.** `src/features/auth/AuthProvider.tsx`가 `supabase.auth`
(세션 상태, Google OAuth, 이메일/비밀번호 로그인/회원가입/로그아웃)를 context로 감쌉니다.
context 객체와 `useAuth()` 훅은 `react-refresh/only-export-components`를 만족시키기 위해
`auth-context.ts` / `useAuth.ts` / `AuthProvider.tsx`로 일부러 나눠져 있으니, 인증 코드를
건드릴 때 이 구조를 유지하세요. `RequireAuth.tsx`가 `App.tsx`의 라우트 트리 전체를 감싸고
로그아웃 상태면 `LoginPage`를 렌더링합니다 — 공개/비로그인 라우트는 없습니다.

**라우팅**(`src/App.tsx`): 모든 라우트가 `RequireAuth` → `HomeLayout`(사이드바 +
`<Outlet/>`) 아래에 중첩되며, 이는 old-src의 `Home.js` 셸에 대응합니다. `src/routes/`
아래의 페이지 컴포넌트는 현재 뼈대 상태이고, 각각 old-src의 어떤 컴포넌트를 대체하는지와
구현 방향을 코멘트로 달아뒀습니다(예: `SearchPage.tsx`는 old-src의 수동 IndexedDB 커서
페이지네이션을 `useInfiniteQuery` + Supabase `.range()`로 대체해야 함). 페이지를 처음부터
구현하기 전에 그 코멘트를 먼저 확인하세요.

**YouTube Data API 키는 절대 클라이언트 코드에 닿으면 안 됩니다.** `api/_youtube.ts`가
`process.env.YOUTUBE_API_KEY` 읽기를 한 곳에 모아두고 있고, `api/youtube-search.ts`와
`api/youtube-video.ts`만이 이를 호출합니다(둘 다 Vercel Functions로 배포됨). YouTube Data
API를 새로 써야 하면 `api/` 아래에 새 파일을 추가하고 프론트에서는 `fetch("/api/...")`로
호출하세요 — `src/`에서 `googleapis.com`을 직접 호출하지 마세요. 환경변수 규칙은 이 저장소
전체에서 하나입니다: `VITE_` 접두사가 붙은 변수는 빌드 시 클라이언트 번들에 그대로
박히고(Supabase URL/anon key는 이래도 안전한데, 실제 접근 제어는 RLS가 하기 때문),
접두사가 없는 변수는 서버 전용으로 `api/`에서만 읽을 수 있습니다.

**DB 스키마**(`docs/migrations/0001_init.sql`): `tracks`, `playlists`, 그리고 순서
관리를 위한 `position` 컬럼을 가진 join 테이블 `playlist_tracks`(재생목록 row에 순서
배열을 두는 대신, `position`을 batch update하는 dnd-kit 재정렬 로직과 짝을 이루도록 설계).
`tracks.artist`와 `tracks.tags`는 GIN 인덱스가 걸린 Postgres 배열 컬럼이고, `tracks.title`은
부분 검색을 위한 trigram 인덱스(`pg_trgm`)를 가집니다. 이는 old-src의 수동 IndexedDB
`multiEntry` 인덱스와 커서 기반 검색 루프를 대체합니다. `src/lib/database.types.ts`는
현재 이 마이그레이션에 맞춰 손으로 작성되어 있으니, 스키마를 바꾸면 손으로 고치지 말고
`supabase gen types typescript --linked`로 재생성하세요(파일 상단 코멘트 참고). 이 SQL은
Supabase CLI가 기본으로 인식하는 `supabase/migrations/` 위치가 아니라 `docs/migrations/`에
있으므로, `supabase db push` 같은 CLI 마이그레이션 명령은 이 파일을 자동으로 집어가지
못합니다 — 지금은 Supabase 대시보드 SQL Editor에 수동으로 붙여넣는 워크플로를 전제로 합니다.

**TypeScript 프로젝트 구조**: 루트 `tsconfig.json`이 세 개의 설정을 참조합니다 —
`tsconfig.app.json`(`src/`, DOM 라이브러리, bundler 모듈 해석), `tsconfig.node.json`
(`vite.config.ts`), `tsconfig.api.json`(`api/`, Node 타입). `npm run build`(`tsc -b`)가
이 세 개를 모두 타입체크합니다. `@/*` → `./src/*` 경로 별칭은 `tsconfig.app.json`의
`paths`와 `vite.config.ts`의 `resolve.alias` 양쪽에 선언되어 있으니, 바꿀 때 둘 다
동기화하세요. `paths`는 `baseUrl` 없이 쓰고 있는데(TypeScript가 TS 7을 앞두고 단독
`baseUrl`을 사용 중단 처리했기 때문), 그래서 경로 값 앞에 `./`가 필요합니다.
