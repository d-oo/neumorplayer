# Feature 폴더 컨벤션

`src/` 하위는 `features/`, `shared/`, `router/` 세 갈래로 정리합니다. `router/`에는
라우팅 전용 코드만 두고(`AppRoutes.tsx`의 라우트 트리, `RequireAuth`/`GuestOnly` 같은
가드 — `App.tsx`는 그 위에서 `BrowserRouter`로 감싸기만 합니다), 페이지 컴포넌트는 한
곳에 모으지 않고 각 feature의 `pages/` 하위에 둡니다. feature 안에는 필요한 만큼만
`api/`/`components/`/`lib/`/`hooks/`/`pages/`를 만들고, 그 feature가 실제로 쓰지 않는
디렉터리는 만들지 않습니다.

## 현재 feature 목록

- `auth` — 로그인/회원가입
- `player` — 미니 플레이어 + 유튜브 iframe + 재생 상태
- `dashboard` — 사이드바+헤더 셸과 404
- `explore` — YouTube 검색으로 곡 추가
- `library` — 트랙 도메인
- `playlist` — 재생목록 도메인

예: `features/auth/`는 `pages/`(`LoginPage.tsx`/`SignupPage.tsx`), `components/`
(`AuthLayout.tsx`/`AuthForm.tsx`/`icons.tsx`), `hooks/`(`useAuth.ts`/`auth-context.ts`)로
나뉘고, `AuthProvider.tsx`는 앱 루트에 한 번만 마운트되는 provider라 `pages/`·
`components/` 어디에도 안 맞아서 feature 루트에 그대로 둡니다(`features/player/`의
`VideoSlotProvider.tsx`도 같은 이유로 feature 루트에 있음).

## `shared/`로 보내는 기준

**"여러 feature가 쓰는지"가 아니라 "그 도메인을 대표하는 feature가 있는지"입니다.**
예를 들어 대시보드의 로그아웃 버튼이 `useAuth().signOut`을 부른다고 해서 `signOut`을
`shared/`로 옮기지 않는 것처럼(로그아웃은 여전히 auth 도메인이고, 대시보드는 그 공개
API를 쓰는 소비자일 뿐), `features/library/lib/tracks.ts`나
`features/playlist/lib/playlists.ts`도 다른 feature가 import해서 쓰지만 각각
library/playlist가 소유하는 도메인 모듈이라 옮기지 않습니다.

`shared/`는 세 갈래입니다:

- **`shared/lib/`** — 어떤 feature도 도메인으로 소유하지 않는 진짜 인프라/범용 유틸
  (`database.types.ts`, `format-time.ts`, `queryClient.ts`, `supabase.ts`,
  `useDocumentTitle.ts`, `youtube-thumbnail.ts`). 클라이언트 상태 스토어도 그 상태를
  소유하는 feature의 `lib/`에 둡니다(`usePlayerStore.ts`는 `features/player/lib/`) —
  별도 `stores/`는 없습니다.
- **`shared/components/`** — 어떤 feature의 도메인도 대표하지 않는 순수 UI 프리미티브
  (`icons.tsx`, `TrackThumbnail.tsx`, `ThumbBox.tsx`, `RowPlayButton.tsx`,
  `PillButton.tsx`, `InfoBox.tsx`). `auth`엔 `AuthForm.tsx` 전용의 별도
  `features/auth/components/icons.tsx`가 있으니 혼동하지 마세요. 반대로
  `PlaylistCoverGrid.tsx`는 "재생목록 커버"라는 playlist 도메인 개념을 대표하므로
  `features/player/components/`에 그대로 둡니다 — UI가 재사용 가능하다고 전부
  `shared/`로 보내는 게 아니라, 그 컴포넌트가 특정 도메인을 표현하는지를 봅니다.
- **`shared/styles/`** — 호출부의 마크업/요소/동작이 서로 달라서 컴포넌트로 뽑을 수
  없고 계산된 style 값(또는 상수)만 완전히 동일할 때(`segment-tab-style.ts`,
  `sunken-panel-style.ts`, `current-track-row-style.ts`). **판단 기준**: 마크업(태그
  종류, 자식 구조, 동작)까지 동일하면 `shared/components/`의 컴포넌트로, 마크업은
  다르고 계산된 값만 동일하면 `shared/styles/`의 함수/상수로 — 억지로 하나로 합치면
  "버튼도 되고 링크도 되는" 애매한 API가 됩니다.

새 lib/컴포넌트/스타일을 어디 둘지 고민될 땐 "이걸 누가 소유하는 도메인인가"를 먼저
묻고, 다른 feature가 몇 곳에서 import하는지는 근거로 삼지 마세요.

## feature 안의 `api/`

**feature 안의 `api/`는 최상위 `api/`(Vercel Functions)와 별개**입니다 — feature의
`api/`는 그 feature가 `/api/...` 엔드포인트를 호출하는 클라이언트 쪽 fetch 래퍼/쿼리
훅만 모아두는 용도이고, 최상위 `api/` 자체는 Vercel이 프로젝트 루트를 보고 배포하는
파일 기반 컨벤션이라 feature 폴더 밑으로 옮기면 배포가 깨지므로 이동 대상이 아닙니다.
