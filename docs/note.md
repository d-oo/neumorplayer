# neumorplayer — 개발 노트

`old-src`(4년 전 CRA + IndexedDB 버전)를 Vite + TypeScript + Supabase + Vercel 스택으로
다시 만드는 프로젝트입니다. 이 문서는 로컬 개발 환경 셋업과 배포 환경변수를 다룹니다.

## 스택

- **프론트엔드**: Vite + React 19 + TypeScript
- **DB/Auth**: Supabase (Postgres, Row Level Security, Google OAuth + 이메일/비밀번호)
- **서버 상태**: TanStack Query
- **클라이언트 상태**: Zustand (재생 큐, 볼륨 등 UI 전용 상태만)
- **드래그앤드롭**: dnd-kit (재생목록 상세의 곡 순서 변경)
- **호스팅**: Vercel — `/api`는 Vercel Functions(서버리스)로 자동 배포됨, Next.js 아님

## 처음 설정하기

1. 의존성 설치

   ```
   npm install
   ```

2. **Supabase 프로젝트 생성** ([supabase.com](https://supabase.com)) 후:
   - SQL Editor에서 [`docs/migrations/`](migrations/)의 SQL을 번호 순서대로(`0001_init.sql`부터) 실행
   - Authentication → Providers에서 Google OAuth 활성화 (Google Cloud Console에서 OAuth 클라이언트 ID 발급 필요)
   - Authentication → Providers에서 Email 활성화 (기본 활성화되어 있음)
   - Authentication → Providers → Email의 "Confirm email" 옵션을 꺼두세요 — 회원가입
     화면(`SignupPage.tsx`)이 가입 성공 시 바로 세션이 생긴다고 가정하고 짜여 있어서,
     이 옵션이 켜져 있으면 그 가정이 깨집니다.

3. `.env.example`을 복사해 `.env.local` 생성 후 값 채우기

   ```
   cp .env.example .env.local
   ```

   - `VITE_SUPABASE_URL`: Project Settings → Data API에서 확인
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Project Settings → API Keys의 Publishable key(`sb_publishable_...`)에서 확인 (예전 이름: anon key)
   - `YOUTUBE_API_KEY`: 새로 발급받은 YouTube Data API v3 키 (old-src에 있던 키는 이미 공개 배포되어 노출됐으니 재사용 금지, 새로 발급)
   - `SUPABASE_SECRET_KEY`: Project Settings → API Keys의 secret key(`sb_secret_...`, 예전 이름: service_role key) — 회원탈퇴(`api/account-delete.ts`)와 YouTube 데이터 갱신 cron(`api/cron/refresh-youtube-data.ts`)에서만 쓰는 서버 전용 값
   - `CRON_SECRET`: 임의 문자열(16자 이상, 예: `openssl rand -hex 32`). Vercel Cron이 `api/cron/*` 호출에 `Authorization: Bearer <값>`으로 붙여 보내고, 함수는 이 값이 맞을 때만 실행합니다. 로컬에서 직접 부를 땐 `curl -H "Authorization: Bearer <값>" http://localhost:3000/api/cron/refresh-youtube-data`(`vercel dev` 실행 중)

4. 로컬 개발 서버
   ```
   npm run dev
   ```
   `/api` 함수까지 테스트하려면 터미널을 하나 더 열어 `vercel dev`(`npm i -g vercel` 후
   `vercel dev`, 기본 3000번 포트)를 같이 띄우세요. `vite.config.ts`의 `server.proxy`가
   `/api` 요청을 3000번으로 넘겨주므로, 브라우저는 계속 `npm run dev`의 5173번 포트만
   열면 됩니다 — `vercel dev`가 띄우는 주소를 직접 열면 `vercel.json`의 SPA rewrite가
   Vite 전용 경로(`/@vite/client` 등)까지 가로채 화면이 안 뜹니다(`docs/architecture.md`의
   "`vercel.json`의 SPA rewrite" 참고).

## Vercel 배포 시 환경변수

Vercel 프로젝트 설정 → Environment Variables에 아래를 등록:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` — 클라이언트 번들에 포함되어도 안전 (RLS가 실제 접근 제어). secret key는 여기 포함하지 마세요.
- `YOUTUBE_API_KEY`, `SUPABASE_SECRET_KEY`, `CRON_SECRET` — **절대 `VITE_` 접두사를 붙이지 마세요.** `/api` 함수 안에서만 `process.env`로 읽히며 브라우저에 노출되지 않습니다.

`vercel.json`의 `crons`(매일 `api/cron/refresh-youtube-data` 호출 — `docs/db-schema.md`의
"YouTube API 데이터 30일 갱신" 참고)는 프로덕션 배포에서만 돕니다. 실행 기록은 Vercel
프로젝트 → Settings → Cron Jobs에서 볼 수 있고, 거기서 수동 실행도 됩니다.

`src/` 폴더 구조(feature 컨벤션, `shared/lib`·`shared/components`·`shared/styles` 분류
기준)는 `docs/feature-conventions.md`가 최신 기준입니다 — 여기 따로 옮겨 적지 않습니다.
