# TODO

아직 진행 전인, 나중에 처리하기로 한 작업 목록입니다. 처리하면 목록에서 지우세요.

- [ ] **재생목록(Playlist) 기능 실제 연동**: `PlaylistInfoPage`는 여전히 목업(`tracks: []`,
      빈 title/owner)이다. 사이드바에 "Playlists 목록" UI 자체가 없어 재생목록을 만들거나
      진입할 방법도 없다(`HomeLayout`의 `TODO: Playlists 목록` 참고). `playlists` +
      `playlist_tracks`(`position` 순 정렬) 조회, 재생목록 생성/삭제, 트랙 추가/제거,
      dnd-kit 기반 순서 변경까지 필요하다.
- [ ] **`MusicInfoPage` 수정 폼**: 조회/재생/삭제는 구현했지만 제목·아티스트·태그를 고치는
      폼(react-hook-form + zod 추천)은 아직 없다.
- [ ] **비로그인 사용자에게 검색+재생 허용 검토**: 현재는 `/login`, `/signup`을 제외한 모든
      라우트가 `RequireAuth`로 보호되어 있다(`src/router/AppRoutes.tsx`). 게스트에게
      검색+재생 정도를 열어줄지 결정하고, 그렇게 하면 해당 라우트를 `RequireAuth` 밖으로
      옮긴다.
- [ ] **`src/` 폴더를 `features`/`shared`/`router` 컨벤션으로 재편**: 컨벤션 자체는 확정됨
      (CLAUDE.md의 "Feature 폴더 컨벤션" 참고). `features/auth/`는 이미 이 컨벤션대로
      정리했고(`pages/`, `components/`, `hooks/`), `RequireAuth`/`GuestOnly`도
      `src/router/`로 옮기고 `App.tsx`의 라우트 트리도 `src/router/AppRoutes.tsx`로
      분리했다. 남은 건: `player`(경계가 이미 명확하니 지금 정리해도 됨)와, `src/routes/`
      아래 아직 뼈대뿐인 페이지들(탐색/검색/재생목록 정보 등 — 이건 실제로 구현하며
      feature 경계가 확정될 때 옮긴다). `shared/`(`src/lib/`, `src/stores/` 통합)도 아직
      안 함.
