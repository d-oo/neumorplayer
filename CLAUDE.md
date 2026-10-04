# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 언어

이 저장소에서 작업할 때는 사용자에게 항상 **한국어**로 응답하세요. 코드 식별자, 파일 경로,
기술 용어(예: RLS, Zustand, tsconfig)는 원문 그대로 유지합니다.

## 프로젝트 개요

4년 전에 만든 CRA + IndexedDB 기반 유튜브 음악 앱(`old-src/`)을, 여러 사용자가 각자 계정으로
쓰는 서비스로 다시 만드는 프로젝트입니다 — Vite + TypeScript SPA에 Supabase(Postgres +
Auth)를 백엔드로 붙이고 Vercel에 배포합니다.

`old-src/`는 **참고용 원본**입니다(`react-scripts` 기반 순수 JS, ESLint에서 제외). `src/`나
`api/`의 코드는 여기서 아무것도 import하면 안 됩니다. `README.md`도 old-src의 사용자용
README를 복사해 온 것이라 지금 스택의 개발 문서가 아닙니다.

## 문서

- `docs/product-flow.md` — 제품 흐름(탐색→라이브러리→재생목록→재생)과 접근 권한 정책.
  화면/라우트/권한 관련 작업 전에 먼저 확인하세요.
- `docs/architecture.md` — Next.js 대신 Vite SPA를 고른 이유, `vercel.json` rewrite,
  서버/클라이언트 상태 분리, 인증·라우팅 구조(랜딩 포함)
- `docs/feature-conventions.md` — `src/features/`·`shared/` 폴더 컨벤션과 소유권 판단 기준.
  새 파일을 어디 둘지 고민되면 먼저 확인하세요.
- `docs/styling.md` — Tailwind v4 구성, 디자인 토큰·다크 모드, 임의값 문법 기준
- `docs/db-schema.md` — 테이블/인덱스/RLS, YouTube 데이터 30일 갱신, 타입 생성, 마이그레이션
  운영 방식. 스키마나 쿼리 관련 작업 전에 먼저 확인하세요.
- `docs/note.md` — 로컬 개발 환경 셋업(Supabase 프로젝트, `.env.local`, `vercel dev`)과
  배포 환경변수
- `docs/todos.md` — 아직 진행 전인 예정 작업. 페이지를 고치기 전에 남은 작업이 있는지
  확인하세요.
- `docs/migrations/` — 스키마의 소스 오브 트루스(번호 순서대로 적용)
- `docs/design/` — 디자인 시안 zip(`apply-design` 스킬로 적용)

## 명령어

```
npm install       # 의존성 설치
npm run dev       # vite 개발 서버 (프론트엔드만 — 아래 참고)
npm run build     # tsc -b (project reference로 src/, api/, vite.config.ts 타입체크) + vite build
npm run lint      # eslint .
npm run preview   # 프로덕션 빌드 미리보기
```

테스트 러너는 아직 구성되어 있지 않습니다.

- 화면을 띄워 스크린샷으로 확인할 땐 dev 서버나 브라우저 도구를 직접 짜지 말고
  `run-neumorplayer` 스킬(`.claude/skills/run-neumorplayer/SKILL.md`)을 쓰세요.
- `npm run dev`는 프론트엔드만 서빙합니다. `api/`(Vercel Functions)까지 테스트하려면
  `vercel dev`를 같이 띄우되, **브라우저는 항상 `npm run dev`의 5173번 포트만 여세요** —
  `vercel dev` 포트를 직접 열면 화면이 아예 안 뜹니다(이유는 `docs/architecture.md`,
  절차는 `docs/note.md`).

## 꼭 지킬 규칙

- **Next.js 컨벤션을 들여오지 마세요.** 서버 코드는 최상위 `api/`의 Vercel Functions뿐이고,
  `api/` 안의 `_`로 시작하는 파일/폴더(예: `api/_youtube.ts`)는 라우트로 배포되지 않는
  비공개 헬퍼입니다. (`docs/architecture.md`)
- **`vercel.json`의 SPA rewrite를 지우지 마세요** — 지우면 `/`가 아닌 경로에서 새로고침할
  때마다 404가 납니다. (`docs/architecture.md`)
- **RLS**: 새 테이블이나 쿼리에 대응하는 RLS 정책이 없으면 에러 없이 그냥 0건이
  반환됩니다. (`docs/db-schema.md`)
- **`src/shared/lib/database.types.ts`는 손으로 고치지 마세요** — 스키마가 바뀌면
  `supabase gen types typescript --linked`로 다시 생성합니다. (`docs/db-schema.md`)
- **환경변수**: `VITE_` 접두사가 붙은 변수는 빌드 시 클라이언트 번들에 그대로 박힙니다 —
  Supabase URL/publishable key만 여기 해당합니다(실제 접근 제어는 RLS). secret key·YouTube
  API 키 같은 서버 전용 값은 접두사 없이 `api/`에서만 읽습니다. (`docs/note.md`)
- **새 공개 라우트**는 해당 feature의 `pages/`에 두고 `src/router/AppRoutes.tsx`에서
  `RequireAuth` 밖에 둡니다. 인증 관련 라우트는 `GuestOnly`/`RequireAuth` 중 맞는 가드로
  감싸세요. (`docs/architecture.md`)
- **파일 위치**: `src/`는 `features/`·`shared/`·`router/`로 나누고, 페이지는 각 feature의
  `pages/`에 둡니다. `shared/`로 보내는 기준은 "여러 feature가 쓰는지"가 아니라 "그
  도메인을 대표하는 feature가 있는지"입니다. (`docs/feature-conventions.md`)
- **스타일**: 컴포넌트는 전부 Tailwind 유틸리티 클래스로 작성합니다(CSS Modules 금지). 새
  색/그림자 토큰은 `src/index.css`의 `:root`에 원본을 추가하고 `@theme`에서는 참조만
  추가합니다. 임의값 문법(`rounded-[6px]`)은 표준 표기로 대응이 안 될 때만 쓰고, 시안의
  픽셀 값이 기본 스케일에 없으면 반올림하지 말고 그대로 둡니다. (`docs/styling.md`)
- **경로 별칭**: `@/*` → `./src/*`는 `tsconfig.app.json`의 `paths`와 `vite.config.ts`의
  `resolve.alias` 두 곳에 선언되어 있으니 바꿀 때 같이 고치세요. `paths`는 `baseUrl` 없이
  쓰므로(TS 7을 앞두고 단독 `baseUrl`이 사용 중단됨) 경로 값 앞에 `./`가 필요합니다.
