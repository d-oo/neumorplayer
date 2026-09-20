# neumorplayer — 개발 노트

`old-src`(4년 전 CRA + IndexedDB 버전)를 Vite + TypeScript + Supabase + Vercel 스택으로
다시 만드는 프로젝트입니다. 지금 상태는 **기능은 비어 있고 배선만 된 스캐폴딩**입니다.

## 스택

- **프론트엔드**: Vite + React 18 + TypeScript
- **DB/Auth**: Supabase (Postgres, Row Level Security, Google OAuth + 이메일/비밀번호)
- **서버 상태**: TanStack Query
- **클라이언트 상태**: Zustand (재생 큐, 볼륨 등 UI 전용 상태만)
- **드래그앤드롭**: dnd-kit (재생목록 순서 변경용, 아직 미사용)
- **호스팅**: Vercel — `/api`는 Vercel Functions(서버리스)로 자동 배포됨, Next.js 아님

## 처음 설정하기

1. 의존성 설치
   ```
   npm install
   ```

2. **Supabase 프로젝트 생성** ([supabase.com](https://supabase.com)) 후:
   - SQL Editor에서 [`docs/migrations/0001_init.sql`](migrations/0001_init.sql) 실행
   - Authentication → Providers에서 Google OAuth 활성화 (Google Cloud Console에서 OAuth 클라이언트 ID 발급 필요)
   - Authentication → Providers에서 Email 활성화 (기본 활성화되어 있음)

3. `.env.example`을 복사해 `.env.local` 생성 후 값 채우기
   ```
   cp .env.example .env.local
   ```
   - `VITE_SUPABASE_URL`: Project Settings → Data API에서 확인
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Project Settings → API Keys의 Publishable key(`sb_publishable_...`)에서 확인 (예전 이름: anon key)
   - `YOUTUBE_API_KEY`: 새로 발급받은 YouTube Data API v3 키 (old-src에 있던 키는 이미 공개 배포되어 노출됐으니 재사용 금지, 새로 발급)

4. 로컬 개발 서버
   ```
   npm run dev
   ```
   `/api` 함수는 `vercel dev`로 실행해야 로컬에서도 동작합니다 (`npm i -g vercel` 후 `vercel dev`).

## Vercel 배포 시 환경변수

Vercel 프로젝트 설정 → Environment Variables에 아래를 등록:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` — 클라이언트 번들에 포함되어도 안전 (RLS가 실제 접근 제어). secret key는 여기 포함하지 마세요.
- `YOUTUBE_API_KEY` — **절대 `VITE_` 접두사를 붙이지 마세요.** `/api` 함수 안에서만 `process.env`로 읽히며 브라우저에 노출되지 않습니다.

## 폴더 구조

```
api/                     Vercel 서버리스 함수 (YouTube API 프록시 — 키를 서버에 숨김)
src/
  lib/                   supabase 클라이언트, DB 타입, react-query 클라이언트
  stores/                zustand 스토어 (재생 상태 등 클라이언트 전용 상태)
  features/auth/         Supabase Auth 연동 (Google + 이메일/비밀번호)
  routes/                페이지 컴포넌트 (아직 뼈대만 있음 — TODO 주석 참고)
docs/
  note.md                이 파일 (개발 노트)
  product-flow.md         탐색/라이브러리/재생목록/재생 권한 등 확정된 제품 흐름
  migrations/            DB 스키마 + RLS 정책 SQL
  design/                Claude 디자인 도구 핸드오프 산출물 (참고용, 코드 아님)
old-src/                 4년 전 원본 프로젝트 (참고용, 새 코드에서 import 금지)
```

## 다음 할 일 (기능 구현 순서 추천)

1. `src/routes/SearchPage.tsx` — 트랙 목록/검색 (`useInfiniteQuery` + Supabase `.range()`)
2. 트랙 추가 폼 (`/api/youtube-search`, `/api/youtube-video` 호출 + react-hook-form)
3. `src/routes/PlaylistInfoPage.tsx` — 재생목록 상세 + dnd-kit 순서 변경
4. 실제 플레이어(`react-youtube`)를 `usePlayerStore`와 연결
